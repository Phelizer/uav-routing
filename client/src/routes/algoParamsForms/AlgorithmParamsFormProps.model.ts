import {
  AntColonyParameters,
  BeesAlgorithmParameters,
  SettersOf,
  TabuParameters,
} from "../../models";

export interface AlgorithmParamsFormProps<
  T extends TabuParameters | BeesAlgorithmParameters | AntColonyParameters
> {
  value: T;
  setters: SettersOf<T>;
  errors?: Record<keyof T, string[]>;
}
