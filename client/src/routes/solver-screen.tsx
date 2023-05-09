import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { SolverScreenBLoC } from "./solver-screen.bloc";
import { Fragment, useMemo } from "react";
import "./solver-screen.css";
import { Direction } from "../components/Direction";

export const SolverScreen = observer(() => {
  const bloc = useMemo(() => new SolverScreenBLoC(), []);

  return (
    <div>
      {bloc.formData.points.map((_, i, { length }) => (
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

      <button className="withLeftMargin" onClick={bloc.submitForm}>
        Submit
      </button>

      {bloc.route.length !== 0 && (
        <svg
          width="60%"
          height="60%"
          viewBox={`${bloc.boundaries.minLng} ${bloc.boundaries.minLat} ${
            bloc.boundaries.maxLng - bloc.boundaries.minLng
          } ${bloc.boundaries.maxLat - bloc.boundaries.minLat}`}
          style={{ backgroundColor: "grey", display: "block" }}
        >
          {bloc.points.map((p) => (
            <circle
              cx={p.lng}
              cy={p.lat}
              r="0.0002"
              stroke="green"
              strokeWidth="0"
              fill="yellow"
            />
          ))}

          {bloc.bases.map((p) => (
            <circle
              cx={p.lng}
              cy={p.lat}
              r="0.0002"
              stroke="greeb"
              strokeWidth="0.0001"
              fill={p.isStartBase ? "green" : "red"}
            />
          ))}

          {bloc.lineData.map(({ source, destination }, i) => (
            <Direction
              className="direction"
              key={i}
              point1={source}
              point2={destination}
            />
          ))}
        </svg>
      )}
    </div>
  );
});
