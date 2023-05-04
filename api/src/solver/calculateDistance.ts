import { Degrees, Kilometers, KilometersPeHour, Point } from './models';

export function calculateTimeBetweenTwoPoints(
  point1: Point,
  point2: Point,
  speed: KilometersPeHour,
) {
  const millisenondsInHour = 3600000;
  const distance = calculateDistance(point1, point2);
  const flightTime = (distance / speed) * millisenondsInHour;
  return flightTime;
}

// calculates the distance between two points in kilometers
export function calculateDistance(point1: Point, point2: Point): Kilometers {
  const earthRadiusInKM = 6371;
  const deltaLat = degreeToRadians(point2.lat - point1.lat);
  const deltaLng = degreeToRadians(point2.lng - point1.lng);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(degreeToRadians(point1.lat)) *
      Math.cos(degreeToRadians(point2.lat)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = earthRadiusInKM * c;
  return d;
}

function degreeToRadians(degree: Degrees) {
  return degree * (Math.PI / 180);
}
