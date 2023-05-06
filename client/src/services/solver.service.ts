import { runInAction } from "mobx";
import {
  CalculateRouteData,
  calculateRouteAPI,
} from "../api/solver/calculateRouteAPI";
import { solutionsStoreInstance } from "../stores/solutions.store";

export class SolverService {
  private solutionsStore = solutionsStoreInstance;

  async calculateRoute(data: CalculateRouteData) {
    const solution = await calculateRouteAPI(data);
    runInAction(() => {
      this.solutionsStore.lastSolution = solution;
    });
  }
}
