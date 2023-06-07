import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { SolverScreenBLoC } from "./solver-screen.bloc";
import { ChangeEvent, Fragment, useCallback, useMemo } from "react";
import "./solver-screen.css";
import { GoogleMapsVisualization } from "../components/GoogleMapsVisualization";
import Switch from "react-switch";
import { D3Visualization } from "../components/D3Visualization";
import { Button } from "../components/Button";

export const SolverScreen = observer(() => {
  const bloc = useMemo(() => new SolverScreenBLoC(), []);

  const fileHandler = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.[0]) {
        bloc.setInputFromFile(event.target.files?.[0]);
      }
    },
    [bloc]
  );

  return (
    <div className="nonCenteredRow">
      <div>
        {bloc.formData.points.map((pointData, i, { length }) => (
          <Fragment key={i}>
            <div className="withLeftMargin">{`Point ${i + 1}:`}</div>
            <div
              className={`row withLeftMargin${
                i !== length - 1 ? " withBottomMargin" : ""
              }`}
            >
              <Input
                className="withRightMargin"
                label="Latitude"
                onChange={bloc.createPointSetter(i, "lat")}
                value={bloc.formData.points[i].lat.toString()}
                error={(bloc.errors?.points as any)?.[`${i}`]?.lat?.[0]}
              />

              <Input
                className="withRightMargin"
                label="Longitude"
                onChange={bloc.createPointSetter(i, "lng")}
                value={bloc.formData.points[i].lng.toString()}
                error={(bloc.errors?.points as any)?.[`${i}`]?.lng?.[0]}
              />

              <div>Label: {pointData.label}</div>
            </div>
          </Fragment>
        ))}
        <Button
          className="shrinkCustomButtonAmendments withLeftMargin withBottomMargin withTinyTopMargin"
          onClick={bloc.addPoint}
        >
          + Add point
        </Button>
        <div className="withLeftMargin">Start base:</div>
        <div className="row withLeftMargin withBottomMargin">
          <Input
            className="withRightMargin"
            label="Latitude"
            onChange={bloc.setStartBaseLat}
            value={bloc.formData.startBase.lat}
            error={(bloc.errors?.startBase as any)?.lat?.[0]}
          />

          <Input
            className="withRightMargin"
            label="Longitude"
            onChange={bloc.setStartBaseLng}
            value={bloc.formData.startBase.lng}
            error={(bloc.errors?.startBase as any)?.lng?.[0]}
          />

          <div>Label: Base 1</div>
        </div>
        <div className="withLeftMargin">Another base:</div>
        <div className="row withLeftMargin withBottomMargin">
          <Input
            className="withRightMargin"
            label="Latitude"
            onChange={bloc.setAnotherBaseLat}
            value={bloc.formData.anotherBase.lat}
            error={(bloc.errors?.anotherBase as any)?.lat?.[0]}
          />

          <Input
            className="withRightMargin"
            label="Longitude"
            onChange={bloc.setAnotherBaseLng}
            value={bloc.formData.anotherBase.lng}
            error={(bloc.errors?.anotherBase as any)?.lng?.[0]}
          />

          <div>Label: Base 2</div>
        </div>
        <div className="row withLeftMargin withBottomMargin">
          <Input
            className="withRightMargin"
            label="Charge time (min):"
            onChange={bloc.setChargeTime}
            value={bloc.formData.chargeTime}
            error={(bloc.errors?.chargeTime as any)?.[0]}
          />
          <Input
            className="withRightMargin"
            label="Max flight time (min):"
            onChange={bloc.setMaxFlightTime}
            value={bloc.formData.maxFlightTime}
            error={(bloc.errors?.maxFlightTime as any)?.[0]}
          />
          <Input
            className="withRightMargin"
            label="Speed (km/h):"
            onChange={bloc.setSpeed}
            value={bloc.formData.speed}
            error={(bloc.errors?.speed as any)?.[0]}
          />
        </div>

        <input className="withLeftMargin" type="file" onChange={fileHandler} />
        <div className="errorMsg withLeftMargin withBottomMargin">
          {bloc.fileErrorMsg}
        </div>

        <Button className="withLeftMargin" onClick={bloc.submitForm}>
          Submit
        </Button>

        <Button className="withLeftMargin" onClick={bloc.downloadLastResult}>
          ⇩ Download last result
        </Button>

        {bloc.triedToDownloadFileBeforeFirstSolution && (
          <div className="errorMsg withLeftMargin withBottomMargin">
            {bloc.EARLY_FILE_DOWNLOAD_ERROR_TEXT}
          </div>
        )}

        {bloc.stringifiedSubroutes.length > 0 && (
          <div className="resultsContainer withLeftMargin withTopMargin withBottomMargin">
            <div className="withTopMargin ">{`ROUTE DISTANCE: ${bloc.routeDistance} m`}</div>
            <div className="withTopMargin ">{`ROUTE TIME: ${bloc.routeTime} min`}</div>
            <div className="withTopMargin ">ROUTE:</div>

            {bloc.stringifiedSubroutes.map((subrouteStr) => (
              <div className="withTopMargin withBottomMargin">
                <b>{subrouteStr}</b>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="row withBottomMargin withTopMargin">
          <span className="withLeftMargin">D3</span>

          <Switch
            className="withLeftMargin"
            checked={bloc.visualizationType === "googlemaps"}
            onChange={bloc.toggleVisualizationType}
            checkedIcon={false}
            uncheckedIcon={false}
          />

          <span className="withLeftMargin">Google Maps</span>
        </div>

        {bloc.visualizationType === "googlemaps" && bloc.route.length !== 0 && (
          <GoogleMapsVisualization route={bloc.route} delay={300} />
        )}

        {bloc.visualizationType === "d3" &&
          bloc.arrows.length !== 0 &&
          bloc.coords.length !== 0 && (
            <div className="canvContainer">
              <D3Visualization
                className="canv"
                coordinates={bloc.coords}
                arrowPairs={bloc.arrows}
                coloredPoints={bloc.colors}
                delay={300}
                xOffsetInCoordinates={bloc.xOffsetInCoordinates}
                yOffsetInCoordinates={bloc.yOffsetInCoordinates}
              />
            </div>
          )}
      </div>
    </div>
  );
});
