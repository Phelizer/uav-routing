import { action, computed, makeObservable, observable } from "mobx";
import { Algo } from "../models";
import { SolverService } from "../services/solver.service";
import { PerformExperimentData } from "../api/solver/performExperimentAPI";
import { solutionsStoreInstance } from "../stores/solutions.store";
import { isNumber } from "../utils/utils";

interface ExperimentForm {
  numberOfPoints: string;
  numberOfRuns: string;
  algorithm: Algo;
}

export class ExperimentScreenBLoC {
  solverService = new SolverService();

  constructor() {
    makeObservable(this);
  }

  @observable
  formData: ExperimentForm = {
    algorithm: "tabu",
    numberOfPoints: "10",
    numberOfRuns: "1",
  };

  @action
  setNumberOfPoints = (value: string) => {
    this.formData.numberOfPoints = value;
  };

  @action
  setNumberOfRuns = (value: string) => {
    this.formData.numberOfRuns = value;
  };

  @action
  setAlgorithm = (value: Algo) => {
    this.formData.algorithm = value;
  };

  submit = async () => {
    const data: PerformExperimentData = {
      algorithm: this.formData.algorithm,
      numberOfPoints: parseInt(this.formData.numberOfPoints),
      numberOfRuns: parseInt(this.formData.numberOfRuns),
    };

    await this.solverService.performExperiment(data);
  };

  @computed
  get fitnessesInMilliseconds() {
    return solutionsStoreInstance.lastExperimentSolutions.map(
      ({ fitness }) => fitness
    );
  }

  private millisecToMin = (timeInMillisec: number) => {
    return timeInMillisec / 60000;
  };

  private round = (num: number) => Math.round(num * 100) / 100;

  @computed
  get fitnesses() {
    return this.fitnessesInMilliseconds.map(this.millisecToMin).map(this.round);
  }

  @computed
  get meanFitness() {
    const elemNumber = solutionsStoreInstance.lastExperimentSolutions.length;
    if (elemNumber === 0) {
      return 0;
    }

    const sum = this.fitnesses.reduce((acc, curr) => acc + curr, 0);
    return this.round(sum / elemNumber);
  }

  @computed
  get madianFitness(): number | [number, number] {
    const elemNumber = solutionsStoreInstance.lastExperimentSolutions.length;
    if (elemNumber === 0) {
      return 0;
    }

    const sorted = [...this.fitnesses].sort((x, y) => x - y);
    if (sorted.length % 2 === 0) {
      const secondMedianIndex = sorted.length / 2;
      const firstMedian = sorted[secondMedianIndex - 1];
      const secondMedian = sorted[secondMedianIndex];
      return [firstMedian, secondMedian];
    }

    const medianIndex = Math.floor(sorted.length / 2);
    return sorted[medianIndex];
  }

  @computed
  get medianFitnessString() {
    return isNumber(this.madianFitness)
      ? `${this.madianFitness}`
      : `${this.madianFitness[0]} ${this.madianFitness[1]}`;
  }

  @computed
  get standardDeviation() {
    if (this.fitnesses.length === 0) {
      return 0;
    }

    const stDev = Math.sqrt(
      this.fitnesses
        .map((x) => Math.pow(x - this.meanFitness, 2))
        .reduce((a, b) => a + b) / this.fitnesses.length
    );

    return this.round(stDev);
  }
}
