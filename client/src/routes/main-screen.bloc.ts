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

export class MainScreenBLoC {
  @observable
  formData: InputDataForm = {
    points: [this.createEmptyPoint()],
    startBase: this.createEmptyBase(),
    anotherBase: this.createEmptyBase(),
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

  constructor() {
    makeObservable(this);
  }

  private createEmptyCoords(): Coords {
    return {
      lat: "",
      lng: "",
    };
  }

  private setPointType(type: "base" | "point") {
    return function (coords: Coords) {
      return { ...coords, isBase: type === "base" };
    };
  }

  private createEmptyBase() {
    return this.setPointType("base")(this.createEmptyCoords());
  }

  private createEmptyPoint() {
    return this.setPointType("point")(this.createEmptyCoords());
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
    };
  };
}
