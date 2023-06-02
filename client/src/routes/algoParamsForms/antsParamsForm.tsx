import { Observer } from "mobx-react-lite";
import { Input } from "../../components/input";
import { AntColonyParameters } from "../../models";
import { AlgorithmParamsFormProps } from "./AlgorithmParamsFormProps.model";

export const AntsParamsForm = ({
  value,
  setters,
  errors,
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
            error={errors?.antsNumber?.[0]}
          />

          <Input
            className="withBottomMargin"
            label="Evaporations rate:"
            onChange={setters.evaporationRate}
            value={value.evaporationRate}
            error={errors?.evaporationRate?.[0]}
          />

          <Input
            className="withBottomMargin"
            label="Heuristic information importance:"
            onChange={setters.heurInfoImportance}
            value={value.heurInfoImportance}
            error={errors?.heurInfoImportance?.[0]}
          />

          <Input
            className="withBottomMargin"
            label="Pheromone importance:"
            onChange={setters.pheromoneImportance}
            value={value.pheromoneImportance}
            error={errors?.pheromoneImportance?.[0]}
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
