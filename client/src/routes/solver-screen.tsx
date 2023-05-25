import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { SolverScreenBLoC } from "./solver-screen.bloc";
import { ChangeEvent, Fragment, useCallback, useMemo } from "react";
import "./solver-screen.css";
import { GoogleMapsVisualization } from "../components/GoogleMapsVisualization";
import Switch from "react-switch";
import { D3Visualization } from "../components/D3Visualization";

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
            />

            <Input
              className="withRightMargin"
              label="Longitude"
              onChange={bloc.createPointSetter(i, "lng")}
              value={bloc.formData.points[i].lng.toString()}
            />

            <div>Label: {pointData.label}</div>
          </div>
        </Fragment>
      ))}
      <button
        className="withLeftMargin withBottomMargin"
        onClick={bloc.addPoint}
      >
        Add point
      </button>
      <div className="withLeftMargin">Start base:</div>
      <div className="row withLeftMargin withBottomMargin">
        <Input
          className="withRightMargin"
          label="Latitude"
          onChange={bloc.setStartBaseLat}
          value={bloc.formData.startBase.lat}
        />

        <Input
          className="withRightMargin"
          label="Longitude"
          onChange={bloc.setStartBaseLng}
          value={bloc.formData.startBase.lng}
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
        />

        <Input
          className="withRightMargin"
          label="Longitude"
          onChange={bloc.setAnotherBaseLng}
          value={bloc.formData.anotherBase.lng}
        />

        <div>Label: Base 2</div>
      </div>
      <div className="row withLeftMargin withBottomMargin">
        <Input
          className="withRightMargin"
          label="Charge time (min):"
          onChange={bloc.setChargeTime}
          value={bloc.formData.chargeTime}
        />
        <Input
          className="withRightMargin"
          label="Maximal flight time (min):"
          onChange={bloc.setMaxFlightTime}
          value={bloc.formData.maxFlightTime}
        />
        <Input
          className="withRightMargin"
          label="Speed (km/h):"
          onChange={bloc.setSpeed}
          value={bloc.formData.speed}
        />
      </div>

      <input className="withLeftMargin" type="file" onChange={fileHandler} />
      <div className="errorMsg withLeftMargin withBottomMargin">
        {bloc.fileErrorMsg}
      </div>

      <button className="withLeftMargin" onClick={bloc.downloadLastResult}>
        Download last result
      </button>

      {bloc.triedToDownloadFileBeforeFirstSolution && (
        <div className="errorMsg withLeftMargin withBottomMargin">
          {bloc.EARLY_FILE_DOWNLOAD_ERROR_TEXT}
        </div>
      )}

      <button className="withLeftMargin" onClick={bloc.submitForm}>
        Submit
      </button>

      {bloc.stringifiedSubroutes.length > 0 && (
        <div className="withLeftMargin withTopMargin">RESULT:</div>
      )}

      {bloc.stringifiedSubroutes.map((subrouteStr) => (
        <div className="withLeftMargin withTopMargin withBottomMargin">
          <b>{subrouteStr}</b>
        </div>
      ))}

      <div className="row withBottomMargin">
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
  );
});
