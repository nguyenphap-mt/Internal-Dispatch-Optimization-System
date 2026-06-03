import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser, Public } from '../common/decorators';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  logout() {
    // Stateless JWT: client simply discards the token.
    return { success: true };
  }

  @Get('me')
  @ApiBearerAuth()
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
