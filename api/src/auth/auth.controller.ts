import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService, UsernameIsTakenError } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: User }) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signup(@Body() body: Exclude<User, 'id'>) {
    const resultOrError = this.authService.signup(body);
    if (resultOrError instanceof UsernameIsTakenError) {
      throw resultOrError;
    }

    return resultOrError;
  }
}
