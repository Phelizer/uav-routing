import { Body, Controller, Get } from '@nestjs/common';
import { KilometersPeHour, Milliseconds, Point } from './models';
import { SolverService } from './solver.service';

interface RequestBody {
  pointsToObserve: Point[];
  startBase: Point;
  restOfBases: Point[];
  chargeTime: Milliseconds;
  maxFlightTime: Milliseconds;
  speed: KilometersPeHour;
}

@Controller('solver')
export class SolverController {
  constructor(readonly solverService: SolverService) {}

  @Get()
  calculateRoute(@Body() body: RequestBody): Point[] {
    return this.solverService.calculateRoute(body);
  }
}
