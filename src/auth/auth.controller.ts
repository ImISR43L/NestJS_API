import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
  // We no longer need @Res or Response
} from '@nestjs/common';
// import { Response } from 'express'; // No longer needed
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists.',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in a user and receive a token' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns user and accessToken.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    if (!result) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // --- THIS IS THE CRUCIAL FIX ---
    // Instead of setting a cookie and returning a message,
    // we now return the entire result object from the service,
    // which contains both the user and the accessToken.
    return result;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out a user (client-side responsibility)' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful.',
  })
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Logout successful' };
  }
}
