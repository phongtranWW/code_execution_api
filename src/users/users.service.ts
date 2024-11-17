import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResultDto } from '@users/dtos/login-result.dto';
import { JwtPayload } from '@auth/jwt.payload';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { genSaltSync, hashSync } from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Language } from '@definitions/types/language';
import { Cache } from 'cache-manager';
import { CodeDto } from './dtos/code.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  public async login(user: any): Promise<LoginResultDto> {
    const payload: JwtPayload = { username: user.username, sub: user.userId };
    return new LoginResultDto(this.jwtService.sign(payload));
  }

  public async register(username: string, password: string) {
    if (await this.usersRepository.findOneBy({ username })) {
      throw new ConflictException('Username already exists');
    }
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    const user = this.usersRepository.create({ username, hash, salt });
    await this.usersRepository.save(user);
  }

  public async getCodes(
    username: string,
    language: Language,
  ): Promise<CodeDto> {
    const code = await this.cacheManager.get<string>(`${username}:${language}`);
    if (!code) {
      throw new NotFoundException('Code not found');
    }
    return new CodeDto(code);
  }
}
