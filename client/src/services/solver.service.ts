import { runInAction } from "mobx";
import {
  CalculateRouteData,
  calculateRouteAPI,
} from "../api/solver/calculateRouteAPI";
import { solutionsStoreInstance } from "../stores/solutions.store";
import {
  performExperimentAPI,
  PerformExperimentData,
} from "../api/solver/performExperimentAPI";
import { downloadLastResultAPI } from "../api/solver/downloadLastResultAPI";

export class SolverService {
  private solutionsStore = solutionsStoreInstance;

  async calculateRoute(data: CalculateRouteData) {
    const solution = await calculateRouteAPI(data);
    runInAction(() => {
      this.solutionsStore.lastSolution = solution;
    });
  }

  async performExperiment(data: PerformExperimentData) {
    const result = await performExperimentAPI(data);
    runInAction(() => {
      this.solutionsStore.lastExperimentSolutions = result;
    });
  }

  async downloadLastResult() {
    return await downloadLastResultAPI();
  }
}
