import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthDto, VerifyDto } from './auth.dto';
import { AuthService } from './auth.service';

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
}
