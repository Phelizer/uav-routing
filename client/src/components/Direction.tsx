import { LegacyRef } from "react";
import { Point } from "../models";

interface DirectionProps {
  point1: Point;
  point2: Point;
  className?: string;
  ref?: LegacyRef<SVGLineElement>;
}

export function Direction({ point1, point2, className, ref }: DirectionProps) {
  const { lng: x1, lat: y1 } = point1;
  const { lng: x2, lat: y2 } = point2;

  return (
    <>
      <defs>
        <marker
          id="triangle"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerUnits="strokeWidth"
          markerWidth="3"
          markerHeight="3"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
        </marker>
      </defs>

      <line
        ref={ref}
        className={className}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="black"
        stroke-width="0.00005"
        marker-end="url(#triangle)"
      />
    </>
  );
}
