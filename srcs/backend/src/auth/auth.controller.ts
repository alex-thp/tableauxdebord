import { Controller, Post, Body, UnauthorizedException, ForbiddenException, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UserPermissionsInterceptor } from '../interceptors/user-permissions.interceptor';
import { RolesAndPermissionsGuard } from '../guards/roles-and-permissions.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}

  /*@Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    const user = await this.authService.register(dto);
    return {
      message: 'User created successfully',
      user,
    };
  }*/