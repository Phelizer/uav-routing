import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CalculateRouteInputData, PerformExperimentInputData } from './models';
import { NoLastEntityYetError, SolverService } from './solver.service';
import { Roles } from 'src/users/roles.decorator';
import { Role } from 'src/users/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/users/users.service';

@Controller('solver')
export class SolverController {
  constructor(readonly solverService: SolverService) {}

  @Roles(Role.User, Role.Researcher)
  @UseGuards(JwtAuthGuard)
  @Post('solve')
  async calculateRoute(
    @Req() { user }: Request & { user: User },
    @Body() body: CalculateRouteInputData,
  ) {
    return await this.solverService.calculateRoute(body, user);
  }

  @Roles(Role.Researcher)
  @UseGuards(JwtAuthGuard)
  @Post('experiment')
  async performExperiment(
    @Req() { user }: Request & { user: User },
    @Body() body: PerformExperimentInputData,
  ) {
    return await this.solverService.performExperiment(body, user);
  }

  @Roles(Role.User, Role.Researcher)
  @UseGuards(JwtAuthGuard)
  @Get('download-last-result')
  async downloadLastResult(@Req() { user }: Request & { user: User }) {
    const resultOrError = await this.solverService.downloadLastResult(user);
    if (resultOrError instanceof NoLastEntityYetError) {
      throw resultOrError;
    }

    return resultOrError;
  }

  @Roles(Role.Researcher)
  @UseGuards(JwtAuthGuard)
  @Get('download-last-experiment-result')
  async downloadLastExperimentResult(
    @Req() { user }: Request & { user: User },
  ) {
    const resultOrError = await this.solverService.downloadLastExperiment(user);
    if (resultOrError instanceof NoLastEntityYetError) {
      throw resultOrError;
    }

    return resultOrError;
  }
}
