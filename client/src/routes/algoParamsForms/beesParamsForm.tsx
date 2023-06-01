import { Observer } from "mobx-react-lite";
import { Input } from "../../components/input";
import { BeesAlgorithmParameters } from "../../models";
import { AlgorithmParamsFormProps } from "./AlgorithmParamsFormProps.model";

export const BeesParamsForm = ({
  value,
  setters,
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
          />

          <Input
            className="withBottomMargin"
            label="Number of best solutions:"
            onChange={setters.numberOfBestSolutions}
            value={value.numberOfBestSolutions}
          />

          <Input
            label="Max iterations without improvement:"
            onChange={setters.maxOfIterWithoutImpr}
            value={value.maxOfIterWithoutImpr}
          />
        </div>
      )}
    </Observer>
  );
};
