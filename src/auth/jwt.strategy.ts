import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      // --- THIS IS THE KEY CHANGE ---
      // We are now telling Passport to look for the JWT in the Authorization header
      // with a "Bearer " prefix.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-key-for-dev',
    });
  }

  // The validate method remains the same.
  async validate(payload: { sub: string; username: string }) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action.',
      );
    }
    return user;
  }
}
