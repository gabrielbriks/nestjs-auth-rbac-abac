import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './login.dtio';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = bcrypt.compareSync(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.jwtService.sign({
      name: user.name,
      email: user.email,
    });

    return {
      access_token: token,
    };
  }
}
