import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
}
