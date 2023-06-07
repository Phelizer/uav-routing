import { makeObservable, observable } from "mobx";
import { Solution } from "../models";

class SolutionsStore {
  @observable
  lastSolution: (Solution & { distance: number }) | null = null;

  @observable
  lastExperimentSolutions: Solution[] = [];

  constructor() {
    makeObservable(this);
  }
}

export const solutionsStoreInstance = new SolutionsStore();
