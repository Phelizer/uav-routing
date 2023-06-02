import { Observer } from "mobx-react-lite";
import { Input } from "../../components/input";
import { BeesAlgorithmParameters } from "../../models";
import { AlgorithmParamsFormProps } from "./AlgorithmParamsFormProps.model";

export const BeesParamsForm = ({
  value,
  setters,
  errors,
}: AlgorithmParamsFormProps<BeesAlgorithmParameters>) => {
  return (
    <Observer>
      {() => (
        <div>
          <Input
            className="withBottomMargin"
            label="Solution population size:"
            onChange={setters.solutionPopulationSize}
            value={value.solutionPopulationSize}
            error={errors?.solutionPopulationSize?.[0]}
          />

          <Input
            className="withBottomMargin"
            label="Number of best solutions:"
            onChange={setters.numberOfBestSolutions}
            value={value.numberOfBestSolutions}
            error={errors?.numberOfBestSolutions?.[0]}
          />

          <Input
            label="Max iterations without improvement:"
            onChange={setters.maxOfIterWithoutImpr}
            value={value.maxOfIterWithoutImpr}
            error={errors?.maxOfIterWithoutImpr?.[0]}
          />
        </div>
      )}
    </Observer>
  );
};
