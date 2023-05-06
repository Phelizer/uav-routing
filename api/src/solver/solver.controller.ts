import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { KilometersPeHour, Milliseconds, Point } from './models';
import { SolverService } from './solver.service';
import { Roles } from 'src/users/roles.decorator';
import { Role } from 'src/users/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { generateRandomPoint } from './generateRandomPoint';

interface RequestBody {
  pointsToObserve: Point[];
  startBase: Point;
  anotherBase: Point;
  chargeTime: Milliseconds;
  maxFlightTime: Milliseconds;
  speed: KilometersPeHour;
}

@Controller('solver')
export class SolverController {
  constructor(readonly solverService: SolverService) {}

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard)
  @Post('solve')
  calculateRoute(@Body() body: RequestBody): any {
    return this.solverService.calculateRoute(body);
  }
}
