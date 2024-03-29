import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { Point } from "../models";
import { SolverService } from "../services/solver.service";
import { solutionsStoreInstance } from "../stores/solutions.store";
import { saveAs } from "file-saver";
import * as R from "ramda";
import spected, { SpecObject } from "spected";
import {
  isFormValid,
  isPresent,
  isRequiredErrorMsg,
  isStringifiedFloat,
  replaceXWithYARecursively,
  shouldBeNumberErrorMsg,
} from "../utils/utils";

interface Coords {
  lat: string;
  lng: string;
}

interface PointData extends Coords {
  isBase: boolean;
  isStartBase: boolean;
  label: string;
  id: number;
}

type StrMinutes = string;
type StrKilometersPerHour = string;

interface InputDataForm {
  points: PointData[];
  startBase: PointData;
  anotherBase: PointData;
  chargeTime: StrMinutes;
  maxFlightTime: StrMinutes;
  speed: StrKilometersPerHour;
}

type StringFieldsOfInputDataForm = {
  [Key in keyof InputDataForm]: InputDataForm[Key] extends string ? Key : never;
}[keyof InputDataForm];

type VisualizationType = "googlemaps" | "d3";

export class SolverScreenBLoC {
  private readonly pointValidationRules: SpecObject<Coords> = {
    lat: [
      [isPresent, isRequiredErrorMsg("Latitude")],
      [isStringifiedFloat, shouldBeNumberErrorMsg("Latitude")],
    ],
    lng: [
      [isPresent, isRequiredErrorMsg("Longitude")],
      [isStringifiedFloat, shouldBeNumberErrorMsg("Longitude")],
    ],
  };

  private validationRules: SpecObject<InputDataForm> = {
    points: R.map(() => this.pointValidationRules) as any,
    startBase: this.pointValidationRules,
    anotherBase: this.pointValidationRules,
    chargeTime: [
      [isPresent, isRequiredErrorMsg("Charge time")],
      [isStringifiedFloat, shouldBeNumberErrorMsg("Charge time")],
    ],
    maxFlightTime: [
      [isPresent, isRequiredErrorMsg("Max flight time")],
      [isStringifiedFloat, shouldBeNumberErrorMsg("Max flight time")],
    ],
    speed: [
      [isPresent, isRequiredErrorMsg("Speed")],
      [isStringifiedFloat, shouldBeNumberErrorMsg("Speed")],
    ],
  };

  @computed
  get errors() {
    const errors = replaceXWithYARecursively(
      (v: unknown): v is true => v === true,
      []
    )(this.lastValidationResult);

    return errors;
  }

  @observable
  formData: InputDataForm = {
    points: [this.createEmptyPoint()],
    startBase: this.createEmptyStartBase(),
    anotherBase: this.createEmptyNormalBase(),
    chargeTime: "",
    maxFlightTime: "",
    speed: "",
  };

  private solverService = new SolverService();

  @observable
  visualizationType: VisualizationType = "googlemaps";

  @action
  toggleVisualizationType = () => {
    if (this.visualizationType === "googlemaps") {
      this.visualizationType = "d3";
    } else {
      this.visualizationType = "googlemaps";
    }
  };

  @observable
  fileErrorMsg = "";

  @action
  private setError = () => {
    this.fileErrorMsg =
      "Wrong file data. File should contain a valid json of specified format";
  };

  @action
  private clearError() {
    this.fileErrorMsg = "";
  }

  @observable
  triedToDownloadFileBeforeFirstSolution = false;

  readonly EARLY_FILE_DOWNLOAD_ERROR_TEXT = "You must solve a problem first";

  @computed
  get route() {
    return solutionsStoreInstance.lastSolution?.route ?? [];
  }

  @computed
  get points() {
    return this.route.filter((p) => !p.isBase);
  }

  // TODO: refactor:
  @computed
  get bases() {
    const bases = this.route.filter((p) => p.isBase);
    const base1 = bases[0];
    const base2 = bases.find((b) => b.lat !== base1.lat || b.lng !== base1.lng);
    if (!base1 || !base2) {
      return [];
    }

    const uniqueBases = [base1, base2];
    return uniqueBases;
  }

  @computed
  private get xDiff() {
    const maxLng = this.route.reduce(
      (max, p) => (p.lng > max ? p.lng : max),
      -180
    );

    const minLng = this.route.reduce(
      (min, p) => (p.lng < min ? p.lng : min),
      180
    );

    return Math.abs(maxLng - minLng);
  }

  @computed
  private get yDiff() {
    const minLat = this.route.reduce(
      (min, p) => (p.lat < min ? p.lat : min),
      180
    );

    const maxLat = this.route.reduce(
      (max, p) => (p.lat > max ? p.lat : max),
      -180
    );

    return Math.abs(maxLat - minLat);
  }

  @computed
  get boundaries() {
    const minLng = this.route.reduce(
      (min, p) => (p.lng < min ? p.lng : min),
      180
    );

    const minLat = this.route.reduce(
      (min, p) => (p.lat < min ? p.lat : min),
      180
    );

    const maxLng = this.route.reduce(
      (max, p) => (p.lng > max ? p.lng : max),
      -180
    );

    const maxLat = this.route.reduce(
      (max, p) => (p.lat > max ? p.lat : max),
      -180
    );

    return { minLat, minLng, maxLat, maxLng };
  }

  @computed
  get lineData() {
    const lineData: { source: Point; destination: Point }[] = [];
    for (let i = 1; i < this.route.length; i++) {
      const source = this.route[i - 1];
      const destination = this.route[i];
      lineData.push({ source, destination });
    }

    return lineData;
  }

  constructor() {
    makeObservable(this);
  }

  private createEmptyCoords(): Coords {
    return {
      lat: "",
      lng: "",
    };
  }

  private counter = 0;

  private createEmptyStartBase(): PointData {
    return {
      ...this.createEmptyCoords(),
      isBase: true,
      isStartBase: true,
      label: "Base 1",
      id: this.counter++,
    };
  }

  private createEmptyNormalBase(): PointData {
    return {
      ...this.createEmptyCoords(),
      isBase: true,
      isStartBase: false,
      label: "Base 2",
      id: this.counter++,
    };
  }

  private createEmptyPoint(): PointData {
    return {
      ...this.createEmptyCoords(),
      isBase: false,
      isStartBase: false,
      label: `Point ${(this.formData?.points?.length ?? 0) + 1}`,
      id: this.counter++,
    };
  }

  createPointSetter = (index: number, fieldName: "lat" | "lng") =>
    action((value: string) => {
      this.formData.points[index][fieldName] = value;
    });

  @action
  addPoint = () => {
    this.formData.points.push(this.createEmptyPoint());
  };

  @computed
  get shouldRemovePointButtonBeVisible() {
    return this.formData.points.length > 1;
  }

  @action
  createRemovePointHandler = (index: number) => () => {
    this.formData.points.splice(index, 1);
  };

  private createBaseSetter =
    (type: "startBase" | "anotherBase") => (fieldName: "lat" | "lng") =>
      action((value: string) => {
        this.formData[type][fieldName] = value;
      });

  setStartBaseLat = this.createBaseSetter("startBase")("lat");
  setStartBaseLng = this.createBaseSetter("startBase")("lng");
  setAnotherBaseLat = this.createBaseSetter("anotherBase")("lat");
  setAnotherBaseLng = this.createBaseSetter("anotherBase")("lng");

  private createFormFieldSetter = (fieldName: StringFieldsOfInputDataForm) =>
    action((value: string) => {
      this.formData[fieldName] = value;
    });

  setChargeTime = this.createFormFieldSetter("chargeTime");
  setMaxFlightTime = this.createFormFieldSetter("maxFlightTime");
  setSpeed = this.createFormFieldSetter("speed");

  @observable
  private lastValidationResult: Record<string, unknown> = {};

  @action
  private validate(data: InputDataForm) {
    const res = spected(this.validationRules, data);
    this.lastValidationResult = res;
    return isFormValid(res as any);
  }

  submitForm = async () => {
    const valid = this.validate(this.formData);
    if (!valid) {
      return;
    }

    const data = this.prepareFormData();
    await this.solverService.calculateRoute(data);
  };

  private readonly MIN_TO_MILLISEC = 60000;

  private prepareFormData() {
    const pointsToObserve = this.formData.points
      .filter((point) => !this.isEmptyPoint(point))
      .map(this.parsePointData);

    const startBase = this.parsePointData(this.formData.startBase);
    const anotherBase = this.parsePointData(this.formData.anotherBase);
    const chargeTime =
      parseFloat(this.formData.chargeTime) * this.MIN_TO_MILLISEC;

    const speed = parseFloat(this.formData.speed);
    const maxFlightTime =
      parseFloat(this.formData.maxFlightTime) * this.MIN_TO_MILLISEC;

    return {
      pointsToObserve,
      startBase,
      anotherBase,
      chargeTime,
      maxFlightTime,
      speed,
    };
  }

  private isEmptyPoint = (pointData: PointData) =>
    !pointData.lat && !pointData.lng;

  private parsePointData = (pointData: PointData): Point => {
    return {
      lat: parseFloat(pointData.lat),
      lng: parseFloat(pointData.lng),
      isBase: pointData.isBase,
      isStartBase: pointData.isStartBase,
      label: pointData.label,
      id: pointData.id,
    };
  };

  @computed
  get circleRadius() {
    return `${this.yDiff * 0.01}`;
  }

  @computed
  get lineThickness() {
    return `${this.yDiff * 0.002}`;
  }

  @computed
  get markerThickness() {
    return `${this.yDiff * 100}`;
  }

  @computed
  get coords(): [number, number][] {
    const allPoints = this.route;
    const res = allPoints.map(({ lng, lat }): [number, number] => [lng, lat]);
    return res;
  }

  @computed
  get arrows(): [number, number][] {
    const lineData: [number, number][] = [];
    for (let i = 1; i < this.route.length; i++) {
      const sourceIndex = i - 1;
      const destinationIndex = i;
      lineData.push([sourceIndex, destinationIndex]);
    }

    return lineData;
  }

  @computed
  get colors() {
    return this.route.map(({ isBase, isStartBase }) => {
      if (isStartBase) {
        return "green";
      }

      if (isBase) {
        return "red";
      }

      return "steelblue";
    });
  }

  private readonly SEPARATOR = " ➔ ";

  private stringifySubroute = (subroute: Point[]) => {
    return subroute.reduce(
      (acc, { label }, i) => acc + (i !== 0 ? this.SEPARATOR : "") + label,
      ""
    );
  };

  @computed
  private get subroutes() {
    const subroutes: Point[][] = [];
    if (this.route.length > 0) {
      subroutes[0] = [this.route[0]];
    }

    let currentSubrouteIndex = 0;
    for (let i = 1; i < this.route.length; i++) {
      const currPoint = this.route[i];
      if (!subroutes[currentSubrouteIndex]) {
        subroutes[currentSubrouteIndex] = [];
      }

      subroutes[currentSubrouteIndex].push(currPoint);
      if (currPoint.isBase) {
        currentSubrouteIndex++;
      }
    }

    return subroutes;
  }

  @computed
  get stringifiedSubroutes() {
    return this.subroutes.map(this.stringifySubroute);
  }

  // in meters
  @computed
  get routeDistance() {
    const meters = (solutionsStoreInstance.lastSolution?.distance ?? 0) * 1000;
    return meters.toFixed();
  }

  // in minutes
  @computed
  get routeTime() {
    const minutes =
      (solutionsStoreInstance.lastSolution?.fitness ?? 0) /
      this.MIN_TO_MILLISEC;

    return minutes.toFixed();
  }

  readonly offset = 0.05;

  @computed
  get xOffsetInCoordinates() {
    return this.xDiff * this.offset;
  }

  @computed
  get yOffsetInCoordinates() {
    return this.yDiff * this.offset;
  }

  private pointToFormDataPoint = (
    point: Omit<PointData, keyof Coords> & { lat: number; lng: number }
  ): PointData => {
    return { ...point, lat: point.lat.toString(), lng: point.lng.toString() };
  };

  // not described yet
  // TODO: describe
  setInputFromFile = async (file: File) => {
    try {
      const json = JSON.parse(await file.text());
      const points = json.points.map(this.pointToFormDataPoint);
      const startBase = this.pointToFormDataPoint(json.startBase);
      const anotherBase = this.pointToFormDataPoint(json.anotherBase);
      runInAction(() => {
        this.formData = {
          points,
          startBase,
          anotherBase,
          chargeTime: json.chargeTime.toString(),
          maxFlightTime: json.maxFlightTime.toString(),
          speed: json.speed.toString(),
        };
      });

      this.clearError();
    } catch (e) {
      this.setError();
    }
  };

  downloadLastResult = async () => {
    try {
      const blob = await this.solverService.downloadLastResult();
      saveAs(blob, "result.json");

      runInAction(() => {
        this.triedToDownloadFileBeforeFirstSolution = false;
      });
    } catch (e: any) {
      // TODO: bad code, refactor:
      if (e?.message?.includes("403")) {
        runInAction(() => {
          this.triedToDownloadFileBeforeFirstSolution = true;
        });
      }
    }
  };
}
