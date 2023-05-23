import { Observer } from "mobx-react-lite";
import { Input } from "../../components/input";
import { AntColonyParameters } from "../../models";
import { AlgorithmParamsFormProps } from "./AlgorithmParamsFormProps.model";

export const AntsParamsForm = ({
  value,
  setters,
}: AlgorithmParamsFormProps<AntColonyParameters>) => {
  return (
    <Observer>
      {() => (
        <div>
          <Input
            className="withRightMargin"
            label="Number of ants:"
            onChange={setters.antsNumber}
            value={value.antsNumber}
          />

          <Input
            className="withRightMargin"
            label="Evaporations rate:"
            onChange={setters.evaporationRate}
            value={value.evaporationRate}
          />

          <Input
            className="withRightMargin"
            label="Heuristic information importance:"
            onChange={setters.heurInfoImportance}
            value={value.heurInfoImportance}
          />

          <Input
            className="withRightMargin"
            label="Pheromone importance:"
            onChange={setters.pheromoneImportance}
            value={value.pheromoneImportance}
          />

          <Input
            className="withRightMargin"
            label="Max iterations without improvement:"
            onChange={setters.maxIterationsWithoutImprovement}
            value={value.maxIterationsWithoutImprovement}
          />
        </div>
      )}
    </Observer>
  );
};
