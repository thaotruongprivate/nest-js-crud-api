import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Wrong email or password');
    }
    // verify password
    const isPasswordValid = await argon.verify(user.hash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Wrong email or password');
    }
    return {
      access_token: await this.signToken(user),
    };
  }
  async signup(dto: AuthDto) {
    // generate password hash
    const passwordHash = await argon.hash(dto.password);
    // save user in db
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash: passwordHash,
      },
    });
    delete user.hash;
    return user;
  }

  private signToken(user: { email: string; id: number }): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
