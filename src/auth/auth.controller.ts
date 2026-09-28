import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../generated/prisma/client';
import { AuthDto, VerifyDto } from './auth.dto';
import { AuthService } from './auth.service';
import { GetUser } from './decorator';
import { JwtGuard } from './guard';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiBadRequestResponse({
    description: 'User already registered!',
  })
  @ApiForbiddenResponse({
    description: 'Resource forbidden to access!',
  })
  @ApiCreatedResponse({
    description: 'Registered successfully!',
  })
  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.auth.register(dto);
  }

  @ApiOperation({
    summary: 'Log in to the application',
  })
  @ApiBadRequestResponse({
    description: 'Email/password incorrect!',
  })
  @ApiOkResponse({
    description: 'Logged in successfully!',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.auth.login(dto);
  }

  @ApiOperation({
    summary: 'Verify whether user is a bot or human',
  })
  @ApiBadRequestResponse({
    description: 'User is not a human!',
  })
  @ApiOkResponse({
    description: 'User verified successfully!',
  })
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(@Body() dto: VerifyDto) {
    return this.auth.verify(dto);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: 'Get the currently logged in user',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized!',
  })
  @ApiOkResponse({
    description: 'Get current user successfully!',
  })
  @Get('me')
  me(@GetUser() user: User) {
    return {
      success: true,
      message: 'Get current user successfully!',
      data: user,
    };
  }
}
