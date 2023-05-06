import { makeObservable, observable } from "mobx";
import { Point } from "../models";

class SolutionsStore {
  @observable
  lastSolution: { route: Point[]; fitness: number } | null = null;

  constructor() {
    makeObservable(this);
  }
}

export const solutionsStoreInstance = new SolutionsStore();
