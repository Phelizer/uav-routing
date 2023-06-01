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
            className="withBottomMargin"
            label="Number of ants:"
            onChange={setters.antsNumber}
            value={value.antsNumber}
          />

          <Input
            className="withBottomMargin"
            label="Evaporations rate:"
            onChange={setters.evaporationRate}
            value={value.evaporationRate}
          />

          <Input
            className="withBottomMargin"
            label="Heuristic information importance:"
            onChange={setters.heurInfoImportance}
            value={value.heurInfoImportance}
          />

          <Input
            className="withBottomMargin"
            label="Pheromone importance:"
            onChange={setters.pheromoneImportance}
            value={value.pheromoneImportance}
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
