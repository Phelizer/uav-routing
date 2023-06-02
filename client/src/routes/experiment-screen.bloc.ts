import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import {
  Algo,
  AlgoritmParameters,
  AntColonyParameters,
  BeesAlgorithmParameters,
  SettersOf,
  TabuParameters,
} from "../models";
import { SolverService } from "../services/solver.service";
import { PerformExperimentData } from "../api/solver/performExperimentAPI";
import { solutionsStoreInstance } from "../stores/solutions.store";
import {
  isFormValid,
  isNumber,
  isPresent,
  isRequiredErrorMsg,
  isStringifiedFloat,
  isStringifiedInt,
  replaceXWithYARecursively,
  shouldBeNaturalNumberErrorMsg,
  shouldBeNumberErrorMsg,
} from "../utils/utils";
import { saveAs } from "file-saver";
import * as R from "ramda";
import spected, { SpecObject } from "spected";

interface AlgoParamsFormData {
  tabu: TabuParameters;
  bees: BeesAlgorithmParameters;
  ants: AntColonyParameters;
}

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

  @computed
  get errors() {
    const errors = replaceXWithYARecursively(
      (v: unknown): v is true => v === true,
      []
    )(this.lastValidationResult);

    return errors;
  }

  @computed
  get paramErrors() {
    const errors = replaceXWithYARecursively(
      (v: unknown): v is true => v === true,
      []
    )(this.lastParamValidationResult);

    return errors;
  }

  private readonly INITIAL_TABU_PARAMS = {
    tabuTenure: "100",
    numOfRuns: "30",
    maxIterationsWithoutImprovement: "10",
  };

  private readonly INITIAL_ANTS_PARAMS = {
    antsNumber: "15",
    pheromoneImportance: "5",
    heurInfoImportance: "0.5",
    maxIterationsWithoutImprovement: "30",
    evaporationRate: "0.1",
  };

  private readonly INITIAL_BEES_PARAMS = {
    solutionPopulationSize: "20",
    numberOfBestSolutions: "10",
    maxOfIterWithoutImpr: "30",
  };

  @observable
  algoParamsFormData: AlgoParamsFormData = {
    tabu: R.clone(this.INITIAL_TABU_PARAMS),
    bees: R.clone(this.INITIAL_BEES_PARAMS),
    ants: R.clone(this.INITIAL_ANTS_PARAMS),
  };

  private createSettersOf<T>(algoName: Algo, state: T) {
    const setters: SettersOf<T> = {} as SettersOf<T>;
    for (const key in state) {
      setters[key] = action((value: string) => {
        (this.algoParamsFormData[algoName] as any)[key] = value;
      });
    }

    return setters;
  }

  tabuParamsSetters = this.createSettersOf(
    "tabu",
    this.algoParamsFormData.tabu
  );

  antsParamsSetters = this.createSettersOf(
    "ants",
    this.algoParamsFormData.ants
  );

  beesParamsSetters = this.createSettersOf(
    "bees",
    this.algoParamsFormData.bees
  );

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

  private objOfStrToObjOfNum<T extends Record<string, string>>(obj: T) {
    const objOfNum: Record<keyof T, number> = {} as Record<keyof T, number>;
    for (const key in obj) {
      objOfNum[key] = parseFloat(obj[key]);
    }

    return objOfNum;
  }

  private formSpec: SpecObject<ExperimentForm> = {
    numberOfPoints: [
      [isPresent, isRequiredErrorMsg("Number of points")],
      [isStringifiedInt, shouldBeNaturalNumberErrorMsg("Number of points")],
    ],
    numberOfRuns: [
      [isPresent, isRequiredErrorMsg("Number of runs")],
      [isStringifiedInt, shouldBeNaturalNumberErrorMsg("Number of runs")],
    ],
  };

  // eslint-disable-next-line getter-return
  @computed
  private get paramSpec() {
    switch (this.formData.algorithm) {
      case "tabu":
        return this.tabuParamsSpec;
      case "bees":
        return this.beesParamsSpec;
      case "ants":
        return this.antParamsSpec;
    }
  }

  private antParamsSpec: SpecObject<AntColonyParameters> = {
    antsNumber: [
      [isPresent, isRequiredErrorMsg("Number of ants")],
      [isStringifiedInt, shouldBeNaturalNumberErrorMsg("Number of ants")],
    ],
    evaporationRate: [
      [isPresent, isRequiredErrorMsg("Evaporation rate")],
      [isStringifiedFloat, shouldBeNumberErrorMsg("Evaporation rate")],
    ],
    heurInfoImportance: [
      [isPresent, isRequiredErrorMsg("Heur. info importance")],
      [isStringifiedFloat, shouldBeNumberErrorMsg("Heur. info importance")],
    ],
    pheromoneImportance: [
      [isPresent, isRequiredErrorMsg("Pheromone importance")],
      [isStringifiedFloat, shouldBeNumberErrorMsg("Pheromone importance")],
    ],
    maxIterationsWithoutImprovement: [
      [isPresent, isRequiredErrorMsg("Max iter. w/o improvement")],
      [
        isStringifiedInt,
        shouldBeNaturalNumberErrorMsg("Max iter. w/o improvement"),
      ],
    ],
  };

  private tabuParamsSpec: SpecObject<TabuParameters> = {
    tabuTenure: [
      [isPresent, isRequiredErrorMsg("Tabu tenure")],
      [isStringifiedInt, shouldBeNaturalNumberErrorMsg("Tabu tenure")],
    ],
    numOfRuns: [
      [isPresent, isRequiredErrorMsg("Num. of tabu searches")],
      [
        isStringifiedInt,
        shouldBeNaturalNumberErrorMsg("Num. of tabu searches"),
      ],
    ],
    maxIterationsWithoutImprovement: [
      [isPresent, isRequiredErrorMsg("Max iter. w/o improvement")],
      [
        isStringifiedInt,
        shouldBeNaturalNumberErrorMsg("Max iter. w/o improvement"),
      ],
    ],
  };

  private beesParamsSpec: SpecObject<BeesAlgorithmParameters> = {
    maxOfIterWithoutImpr: [
      [isPresent, isRequiredErrorMsg("Max iter. w/o improvement")],
      [
        isStringifiedInt,
        shouldBeNaturalNumberErrorMsg("Max iter. w/o improvement"),
      ],
    ],
    numberOfBestSolutions: [
      [isPresent, isRequiredErrorMsg("Num. of best solutions")],
      [
        isStringifiedInt,
        shouldBeNaturalNumberErrorMsg("Num. of best solutions"),
      ],
    ],
    solutionPopulationSize: [
      [isPresent, isRequiredErrorMsg("Population size")],
      [isStringifiedInt, shouldBeNaturalNumberErrorMsg("Population size")],
    ],
  };

  @observable
  private lastParamValidationResult: Record<string, unknown> = {};

  @observable
  private lastValidationResult: Record<string, unknown> = {};

  @action
  private validate() {
    const res = spected(this.formSpec, this.formData);
    const paramRes = spected(
      this.paramSpec,
      this.algoParamsFormData[this.formData.algorithm]
    );

    console.log({ res });
    console.log({ paramRes });

    this.lastValidationResult = res;
    this.lastParamValidationResult = paramRes;
    return isFormValid(res as any) && isFormValid(paramRes as any);
  }

  submit = async () => {
    if (!this.validate()) {
      return;
    }

    const data: PerformExperimentData = {
      algorithm: this.formData.algorithm,
      numberOfPoints: parseInt(this.formData.numberOfPoints),
      numberOfRuns: parseInt(this.formData.numberOfRuns),
      params: this.objOfStrToObjOfNum(
        this.algoParamsFormData[this.formData.algorithm] as unknown as Record<
          string,
          string
        >
      ) as unknown as AlgoritmParameters,
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

  @computed
  get bestFitness() {
    if (this.fitnesses.length === 0) {
      return 0;
    }

    return this.fitnesses.reduce((best, x) => (x < best ? x : best), Infinity);
  }

  readonly PREMATURE_DOWNLOAD_ERROR = "You need to perform an experiment first";

  @observable
  experimentResultsPrematureDownloadTry = false;

  // TODO: describe
  downloadLastExperimentResult = async () => {
    try {
      const blobData = await this.solverService.downloadLastExperimentResult();
      saveAs(blobData, "experimentResult.json");

      runInAction(() => {
        this.experimentResultsPrematureDownloadTry = false;
      });
    } catch (error: any) {
      // TODO: poor code, need to refactor:
      if (error?.message?.includes("403")) {
        runInAction(() => {
          this.experimentResultsPrematureDownloadTry = true;
        });
      }
    }
  };
}
