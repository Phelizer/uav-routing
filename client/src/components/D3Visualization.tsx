import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Observer } from "mobx-react-lite";

interface PointComponentProps {
  coordinates: [number, number][];
  arrowPairs: [number, number][];
  coloredPoints: string[];
  delay: number;
  className?: string;
  xOffsetInCoordinates?: number;
  yOffsetInCoordinates?: number;
}

export function D3Visualization({
  coordinates,
  arrowPairs,
  coloredPoints,
  delay,
  className,
  xOffsetInCoordinates = 0,
  yOffsetInCoordinates = 0,
}: PointComponentProps) {
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
    const timeouts: NodeJS.Timeout[] = [];

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
          //@ts-ignore
          d3.min(coordinates, (d) => d[0] - xOffsetInCoordinates),
          d3.max(coordinates, (d) => d[0] + xOffsetInCoordinates),
        ])
        .range([0, width]);

      const yScale = d3
        .scaleLinear()
        //@ts-ignore
        .domain([
          d3.min(coordinates, (d) => d[1] - yOffsetInCoordinates),
          d3.max(coordinates, (d) => d[1] + yOffsetInCoordinates),
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
      timeouts.forEach(clearTimeout);
    };
  }, [coordinates, width, height, arrowPairs, coloredPoints]);

  return (
    <Observer>
      {() => (
        <svg
          className={className}
          width={width}
          height={height}
          ref={d3Container}
        />
      )}
    </Observer>
  );
}
