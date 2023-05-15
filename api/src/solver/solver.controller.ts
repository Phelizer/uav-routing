import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CalculateRouteInputData, PerformExperimentInputData } from './models';
import { NoLastSolutionYetError, SolverService } from './solver.service';
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
  calculateRoute(
    @Req() { user }: Request & { user: User },
    @Body() body: CalculateRouteInputData,
  ) {
    return this.solverService.calculateRoute(body, user);
  }

  @Roles(Role.Researcher)
  @UseGuards(JwtAuthGuard)
  @Post('experiment')
  performExperiment(@Body() body: PerformExperimentInputData) {
    return this.solverService.performExperiment(body);
  }

  @Roles(Role.User, Role.Researcher)
  @UseGuards(JwtAuthGuard)
  @Get('download-last-result')
  async downloadLastResult(@Req() { user }: Request & { user: User }) {
    const resultOrError = await this.solverService.downloadLastResult(user);
    if (resultOrError instanceof NoLastSolutionYetError) {
      throw resultOrError;
    }

    return resultOrError;
  }
}
