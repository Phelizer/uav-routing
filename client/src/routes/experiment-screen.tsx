import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { useMemo } from "react";
import { ExperimentScreenBLoC } from "./experiment-screen.bloc";
import "./experiment-screen.css";
import { Dropdown } from "../components/dropdown";
import { ALGORITHMS } from "../models";
import { isNumber } from "../utils/utils";
import { researcherOnly } from "../researcherOnly";
import { TabuParamsForm } from "./algoParamsForms/tabuParamsForm";
import { AntsParamsForm } from "./algoParamsForms/antsParamsForm";
import { BeesParamsForm } from "./algoParamsForms/beesParamsForm";

const ExperimentScreen_ = observer(() => {
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

        {bloc.formData.algorithm === "tabu" && (
          <TabuParamsForm
            value={bloc.algoParamsFormData.tabu}
            setters={bloc.tabuParamsSetters}
          />
        )}

        {bloc.formData.algorithm === "ants" && (
          <AntsParamsForm
            value={bloc.algoParamsFormData.ants}
            setters={bloc.antsParamsSetters}
          />
        )}

        {bloc.formData.algorithm === "bees" && (
          <BeesParamsForm
            value={bloc.algoParamsFormData.bees}
            setters={bloc.beesParamsSetters}
          />
        )}

        <button
          className="withLeftMargin"
          onClick={bloc.downloadLastExperimentResult}
        >
          Download last experiment result
        </button>

        {bloc.experimentResultsPrematureDownloadTry && (
          <div className="errorMsg withLeftMargin withBottomMargin">
            {bloc.PREMATURE_DOWNLOAD_ERROR}
          </div>
        )}

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

        <div className="withTopMargin">Best time:</div>
        <div>{bloc.bestFitness}</div>

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

export const ExperimentScreen = researcherOnly(ExperimentScreen_);
