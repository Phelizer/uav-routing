import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { useMemo } from "react";
import { ExperimentScreenBLoC } from "./experiment-screen.bloc";
import "./experiment-screen.css";
import { Dropdown } from "../components/dropdown";
import { ALGORITHMS } from "../models";
import { isNumber } from "../utils/utils";

export const ExperimentScreen = observer(() => {
  const bloc = useMemo(() => new ExperimentScreenBLoC(), []);

  return (
    <div>
      <div className="row withLeftMargin withBottomMargin">
        <Input
          className="withRightMargin"
          label="Number of points:"
          onChange={bloc.setNumberOfPoints}
          value={bloc.formData.numberOfPoints}
        />

        <Input
          className="withRightMargin"
          label="Number of runs:"
          onChange={bloc.setNumberOfRuns}
          value={bloc.formData.numberOfRuns}
        />

        <Dropdown
          onChange={bloc.setAlgorithm}
          options={ALGORITHMS}
          value={bloc.formData.algorithm}
          label="Algorithm:"
        />

        <button onClick={bloc.submit}>Submit</button>
      </div>

      <div>Total time (min):</div>
      <div>
        {bloc.fitnesses.map((fitness, i) => (
          <>
            <span>{`Run №${i + 1}: `}</span>
            <span>{fitness}</span>
            <br />
          </>
        ))}

        <div className="withTopMargin">Mean time:</div>
        <div>{bloc.meanFitness}</div>

        <div className="withTopMargin">{`Time median${
          isNumber(bloc.madianFitness) ? "" : "s"
        }:`}</div>
        <div>{bloc.medianFitnessString}</div>

        <div className="withTopMargin">Standart deviation:</div>
        <div>{bloc.standardDeviation}</div>
      </div>
    </div>
  );
});
