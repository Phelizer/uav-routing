import { Observer } from "mobx-react-lite";
import { Input } from "../../components/input";
import { TabuParameters } from "../../models";
import { AlgorithmParamsFormProps } from "./AlgorithmParamsFormProps.model";

export const TabuParamsForm = ({
  value,
  setters,
  errors,
}: AlgorithmParamsFormProps<TabuParameters>) => {
  return (
    <Observer>
      {() => (
        <div>
          <Input
            className="withBottomMargin"
            label="Number of tabu searches:"
            onChange={setters.numOfRuns}
            value={value.numOfRuns}
            error={errors?.numOfRuns?.[0]}
          />

          <Input
            className="withBottomMargin"
            label="Tabu Tenure:"
            onChange={setters.tabuTenure}
            value={value.tabuTenure}
            error={errors?.tabuTenure?.[0]}
          />

          <Input
            label="Max iterations without improvement:"
            onChange={setters.maxIterationsWithoutImprovement}
            value={value.maxIterationsWithoutImprovement}
            error={errors?.maxIterationsWithoutImprovement?.[0]}
          />
        </div>
      )}
    </Observer>
  );
};
