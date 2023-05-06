import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { MainScreenBLoC } from "./main-screen.bloc";
import { useMemo } from "react";
import "./main-screen.css";

export const MainScreen = observer(() => {
  const bloc = useMemo(() => new MainScreenBLoC(), []);

  return (
    <div>
      {bloc.formData.points.map((_, i, { length }) => (
        <>
          <div className="withLeftMargin">{`Point ${i + 1}:`}</div>
          <div
            className={`coordinateContainer withLeftMargin${
              i !== length - 1 ? " withBottomMargin" : ""
            }`}
          >
            <Input
              className="coordInput"
              label="Latitude"
              onChange={bloc.createPointSetter(i, "lat")}
              value={bloc.formData.points[i].lat.toString()}
            />

            <Input
              className="coordInput"
              label="Longitude"
              onChange={bloc.createPointSetter(i, "lng")}
              value={bloc.formData.points[i].lng.toString()}
            />
          </div>
        </>
      ))}

      <button
        className="withLeftMargin withBottomMargin"
        onClick={bloc.addPoint}
      >
        Add point
      </button>

      <div className="withLeftMargin">Start base:</div>
      <div className="coordinateContainer withLeftMargin withBottomMargin">
        <Input
          className="coordInput"
          label="Latitude"
          onChange={bloc.setStartBaseLat}
          value={bloc.formData.startBase.lat}
        />
        <Input
          className="coordInput"
          label="Longitude"
          onChange={bloc.setStartBaseLng}
          value={bloc.formData.startBase.lng}
        />
      </div>

      <div className="withLeftMargin">Another base:</div>
      <div className="coordinateContainer withLeftMargin withBottomMargin">
        <Input
          className="coordInput"
          label="Latitude"
          onChange={bloc.setAnotherBaseLat}
          value={bloc.formData.anotherBase.lat}
        />
        <Input
          className="coordInput"
          label="Longitude"
          onChange={bloc.setAnotherBaseLng}
          value={bloc.formData.anotherBase.lng}
        />
      </div>
    </div>
  );
});
