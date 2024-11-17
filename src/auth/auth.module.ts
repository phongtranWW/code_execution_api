import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@users/user.entity';
import { AuthService } from '@auth/auth.service';
import { LocalStrategy } from '@auth/local.strategy';
import { JwtStrategy } from '@auth/jwt.strategy';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([User])],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
