import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SolverModule } from './solver/solver.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [SolverModule, AuthModule, UsersModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
