import { observer } from "mobx-react-lite";
import { Input } from "../components/input";
import { SolverScreenBLoC } from "./solver-screen.bloc";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import "./solver-screen.css";
import * as d3 from "d3";

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

      {!!bloc.stringifiedResult && (
        <>
          <div className="withLeftMargin withTopMargin">RESULT:</div>
          <div className="withLeftMargin withTopMargin withBottomMargin">
            <b>{bloc.stringifiedResult}</b>
          </div>
        </>
      )}

      {bloc.arrows.length !== 0 && bloc.coords.length !== 0 && (
        <div className="canvContainer">
          <PointComponent
            className="canv"
            coordinates={bloc.coords}
            arrowPairs={bloc.arrows}
            coloredPoints={bloc.colors}
            delay={500}
          />
        </div>
      )}
    </div>
  );
});

interface PointComponentProps {
  coordinates: [number, number][];
  arrowPairs: [number, number][];
  coloredPoints: string[];
  delay: number;
  className?: string;
}

const PointComponent = ({
  coordinates,
  arrowPairs,
  coloredPoints,
  delay,
  className,
}: PointComponentProps) => {
  const d3Container = useRef(null);
  const [width, setWidth] = useState(window.innerWidth * 0.8);
  const [height, setHeight] = useState(window.innerHeight * 0.8);

  const handleResize = () => {
    setWidth(window.innerWidth * 0.8);
    setHeight(window.innerHeight * 0.8);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // @ts-ignore
    const timeouts = [];

    if (coordinates && d3Container.current) {
      const svg = d3.select(d3Container.current);

      // Clear previous rendering
      svg.selectAll("*").remove();

      // Define the arrow marker
      svg
        .append("svg:defs")
        .selectAll("marker")
        .data(["arrow"])
        .join("marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

      // Setup the scales
      const xScale = d3
        .scaleLinear()
        //@ts-ignore
        .domain([
          d3.min(coordinates, (d) => d[0]),
          d3.max(coordinates, (d) => d[0]),
        ])
        .range([0, width]);

      const yScale = d3
        .scaleLinear()
        //@ts-ignore
        .domain([
          d3.min(coordinates, (d) => d[1]),
          d3.max(coordinates, (d) => d[1]),
        ])
        .range([height, 0]);

      // Draw the points
      svg
        .selectAll("circle")
        .data(coordinates)
        .join("circle")
        .attr("cx", (d, i) => xScale(d[0]))
        .attr("cy", (d, i) => yScale(d[1]))
        .attr("r", 5)
        .style("fill", (d, i) =>
          coloredPoints && coloredPoints[i] ? coloredPoints[i] : "steelblue"
        );

      // Draw the lines and arrowheads
      if (arrowPairs) {
        arrowPairs.forEach(([i, j], index) => {
          const timeout = setTimeout(() => {
            svg
              .append("svg:line")
              .attr("x1", xScale(coordinates[i][0]))
              .attr("y1", yScale(coordinates[i][1]))
              .attr("x2", xScale(coordinates[j][0]))
              .attr("y2", yScale(coordinates[j][1]))
              .attr("marker-end", "url(#arrow)")
              .style("stroke", "black");
          }, index * delay); // delay of 1 second per arrow
          timeouts.push(timeout);
        });
      }
    }

    return () => {
      //@ts-ignore
      timeouts.forEach(clearTimeout);
    };
  }, [coordinates, width, height, arrowPairs, coloredPoints]);

  return (
    <svg
      className={className}
      width={width}
      height={height}
      ref={d3Container}
    />
  );
};

export default PointComponent;
