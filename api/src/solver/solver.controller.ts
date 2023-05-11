import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CalculateRouteInputData, PerformExperimentInputData } from './models';
import { SolverService } from './solver.service';
import { Roles } from 'src/users/roles.decorator';
import { Role } from 'src/users/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('solver')
export class SolverController {
  constructor(readonly solverService: SolverService) {}

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard)
  @Post('solve')
  calculateRoute(@Body() body: CalculateRouteInputData) {
    return this.solverService.calculateRoute(body);
  }

  @Roles(Role.Researcher)
  @UseGuards(JwtAuthGuard)
  @Post('experiment')
  performExperiment(@Body() body: PerformExperimentInputData) {
    return this.solverService.performExperiment(body);
  }
}
