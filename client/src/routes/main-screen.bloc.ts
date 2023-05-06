import { action, makeObservable, observable } from "mobx";

interface Coords {
  lat: string;
  lng: string;
}

interface PointData extends Coords {
  isBase: boolean;
}

interface InputDataForm {
  points: PointData[];
  startBase: PointData;
  anotherBase: PointData;
}

export class MainScreenBLoC {
  @observable
  formData: InputDataForm = {
    points: [this.createEmptyPoint()],
    startBase: this.createEmptyBase(),
    anotherBase: this.createEmptyBase(),
  };

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
}
