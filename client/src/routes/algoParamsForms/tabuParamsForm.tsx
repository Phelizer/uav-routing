import { Observer } from "mobx-react-lite";
import { Input } from "../../components/input";
import { TabuParameters } from "../../models";
import { AlgorithmParamsFormProps } from "./AlgorithmParamsFormProps.model";

export const TabuParamsForm = ({
  value,
  setters,
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
          />

          <Input
            className="withBottomMargin"
            label="Tabu Tenure:"
            onChange={setters.tabuTenure}
            value={value.tabuTenure}
          />

          <Input
            label="Max iterations without improvement:"
            onChange={setters.maxIterationsWithoutImprovement}
            value={value.maxIterationsWithoutImprovement}
          />
        </div>
      )}
    </Observer>
  );
};
