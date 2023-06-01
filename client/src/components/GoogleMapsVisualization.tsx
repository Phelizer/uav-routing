import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { Point } from "../models";
import { useCallback, useEffect, useState } from "react";
import { Observer } from "mobx-react-lite";

interface MapProps {
  route: Point[];
  delay: number;
}

// TODO: think if it is needed to refactor this component to use BLoC
export function GoogleMapsVisualization({ route, delay }: MapProps) {
  const { isLoaded } = useLoadScript({
    // TODO: extract to the env
    googleMapsApiKey: "AIzaSyBac5fMOsuUMUEoE_7Sq1CgRyh5xsbzKE4",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!map) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    route.forEach(({ lat, lng }) => {
      bounds.extend({ lat, lng });
    });

    map.fitBounds(bounds);

    const timeouts: NodeJS.Timeout[] = [];
    const paths = createPaths(route);
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const timeout = setTimeout(() => {
        path.setMap(map);
      }, i * delay);

      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [delay, map, route]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  return (
    <Observer>
      {() => (
        <div className="App">
          {!isLoaded ? (
            <h1>Map is loading...</h1>
          ) : (
            <div
              style={{
                backgroundColor: "lightgrey",
                width: "400px",
                height: "400px",
                borderWidth: "5px",
                borderColor: "black",
              }}
            >
              <div
                style={{
                  backgroundColor: "lightblue",
                  width: "350px",
                  height: "350",
                  borderWidth: "5px",
                  borderColor: "black",
                  borderRadius: "50px",
                }}
              >
                <GoogleMap
                  mapContainerClassName="map-container"
                  mapContainerStyle={{
                    height: "80vh",
                    width: "52vw",
                  }}
                  onLoad={onLoad}
                >
                  {route.map((point, i) => (
                    <MarkerF
                      position={point}
                      icon={getMarkerIconUrl(point)}
                      key={i}
                    />
                  ))}
                </GoogleMap>
              </div>
            </div>
          )}
        </div>
      )}
    </Observer>
  );
}

function createPaths(route: Point[]) {
  const polylines: google.maps.Polyline[] = [];
  for (let i = 1; i < route.length; i++) {
    const previousPoint = route[i - 1];
    const currentPoint = route[i];
    polylines.push(createArrow(previousPoint, currentPoint));
  }

  return polylines;
}

function createArrow(point1: Point, point2: Point) {
  const arrowIconData = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
  };

  const path = new google.maps.Polyline({
    path: [point1, point2],
    icons: [
      {
        icon: arrowIconData,
        offset: "100%",
      },
    ],
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });

  return path;
}

function getMarkerIconUrl(point: Point): string {
  if (point.isStartBase) {
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  }

  if (point.isBase) {
    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }

  return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
}
