import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { KilometersPeHour, Milliseconds, Point } from './models';
import { SolverService } from './solver.service';
import { AuthGuard } from '../auth/auth.guard';

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

  @UseGuards(AuthGuard)
  @Get('solve')
  calculateRoute(@Body() body: RequestBody): Point[] {
    return this.solverService.calculateRoute(body);
  }
}
