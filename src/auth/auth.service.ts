import * as argon from 'argon2';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, VerifyDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register({ email, password }: AuthDto) {
    if (this.config.get('NODE_ENV') === 'production') {
      throw new ForbiddenException({
        success: false,
        message: 'Resource forbidden to access!',
        data: null,
      });
    }

    const hashedPassword = await argon.hash(password);

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      throw new BadRequestException({
        success: false,
        message: 'User already registered!',
        data: null,
      });
    }

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Registered successfully!',
      data: {
        id: createdUser.id,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
        email: createdUser.email,
      },
    };
  }

  async login({ email, password }: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException({
        success: false,
        message: 'Email/password incorrect!',
        data: null,
      });
    }

    const isPasswordMatches = await argon.verify(user.password, password);

    if (!isPasswordMatches) {
      throw new BadRequestException({
        success: false,
        message: 'Email/password incorrect!',
        data: null,
      });
    }

    const token = await this.signToken(user.id, user.email);

    return {
      success: true,
      message: 'Logged in successfully!',
      data: token,
    };
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }

  async verify({ token }: VerifyDto) {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${this.config.get(
        'GOOGLE_SECRET_KEY',
      )}&response=${token}`,
      {
        method: 'POST',
      },
    );
    const { success } = await response.json();

    if (!success) {
      throw new BadRequestException({
        success: false,
        message: 'User is not a human!',
        data: {
          success,
        },
      });
    }

    return {
      success: true,
      message: 'User verified successfully!',
      data: {
        success,
      },
    };
  }
}
