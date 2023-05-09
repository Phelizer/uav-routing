import { action, computed, makeObservable, observable } from "mobx";
import { Point } from "../models";
import { SolverService } from "../services/solver.service";
import { solutionsStoreInstance } from "../stores/solutions.store";

interface Coords {
  lat: string;
  lng: string;
}

interface PointData extends Coords {
  isBase: boolean;
  isStartBase: boolean;
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

export class SolverScreenBLoC {
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

  readonly offset = 0.08;

  @computed
  get xOffset() {
    return this.xDiff * this.offset;
  }

  @computed
  get yOffset() {
    return this.yDiff * this.offset;
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

  private createEmptyStartBase(): PointData {
    return {
      ...this.createEmptyCoords(),
      isBase: true,
      isStartBase: true,
    };
  }

  private createEmptyNormalBase(): PointData {
    return {
      ...this.createEmptyCoords(),
      isBase: true,
      isStartBase: false,
    };
  }

  private createEmptyPoint(): PointData {
    return { ...this.createEmptyCoords(), isBase: false, isStartBase: false };
  }

  createPointSetter = (index: number, fieldName: "lat" | "lng") =>
    action((value: string) => {
      this.formData.points[index][fieldName] = value;
    });

  @action
  addPoint = () => {
    this.formData.points.push(this.createEmptyPoint());
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

  submitForm = async () => {
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
    const chargeTime = parseFloat(this.formData.chargeTime);
    const speed = parseFloat(this.formData.speed) * this.MIN_TO_MILLISEC;
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
    // const allPoints = [...this.points, ...this.bases];
    const allPoints = this.route;
    return allPoints.map(({ lng, lat }) => [lng, lat]);
  }

  @computed
  get arrows(): [number, number][] {
    const lineData: [number, number][] = [];
    for (let i = 1; i < this.route.length; i++) {
      const sourceIndex = i - 1;
      const destinationIndex = i;
      lineData.push([sourceIndex, destinationIndex]);
    }

    console.log("SUCCESS", lineData.length);

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
}
