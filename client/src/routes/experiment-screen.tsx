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
import { Button } from "../components/Button";

const ExperimentScreen_ = observer(() => {
  const bloc = useMemo(() => new ExperimentScreenBLoC(), []);

  return (
    <div className="nonCenteredRow">
      <div>
        <div className="row withLeftMargin withBottomMargin">
          <Input
            className="withRightMargin"
            label="Number of points:"
            onChange={bloc.setNumberOfPoints}
            value={bloc.formData.numberOfPoints}
            error={(bloc.errors?.numberOfPoints as any)?.[0]}
          />

          <Input
            className="withRightMargin"
            label="Number of runs:"
            onChange={bloc.setNumberOfRuns}
            value={bloc.formData.numberOfRuns}
            error={(bloc.errors?.numberOfRuns as any)?.[0]}
          />

          <Dropdown
            onChange={bloc.setAlgorithm}
            options={ALGORITHMS}
            value={bloc.formData.algorithm}
            label="Algorithm:"
          />
        </div>

        <div className="withLeftMargin">
          {bloc.formData.algorithm === "tabu" && (
            <TabuParamsForm
              value={bloc.algoParamsFormData.tabu}
              setters={bloc.tabuParamsSetters}
              errors={bloc.paramErrors as any}
            />
          )}

          {bloc.formData.algorithm === "ants" && (
            <AntsParamsForm
              value={bloc.algoParamsFormData.ants}
              setters={bloc.antsParamsSetters}
              errors={bloc.paramErrors as any}
            />
          )}

          {bloc.formData.algorithm === "bees" && (
            <BeesParamsForm
              value={bloc.algoParamsFormData.bees}
              setters={bloc.beesParamsSetters}
              errors={bloc.paramErrors as any}
            />
          )}

          <Button className="withTopMargin" onClick={bloc.submit}>
            Submit
          </Button>

          <Button
            className="withTopMargin"
            onClick={bloc.downloadLastExperimentResult}
          >
            ⇩ Download last experiment result
          </Button>

          {bloc.experimentResultsPrematureDownloadTry && (
            <div className="errorMsg withLeftMargin withTopMargin">
              {bloc.PREMATURE_DOWNLOAD_ERROR}
            </div>
          )}
        </div>
      </div>

      <div className="nonCenteredRow withTopMargin allExperimentResultsContainer">
        <div className="experimentResultsContainer fitContent">
          <div className="withBottomMargin">RESULTS:</div>

          <div>Best time:</div>
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

        <div className="withLeftMargin">
          <div>Total time (min):</div>
          {bloc.fitnesses.map((fitness, i) => (
            <>
              <span>{`Run №${i + 1}: `}</span>
              <span>{fitness}</span>
              <br />
            </>
          ))}
        </div>
      </div>
    </div>
  );
});

export const ExperimentScreen = researcherOnly(ExperimentScreen_);
