import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcrypt';
import { User } from '@users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  public async validateUser(username: string, password: string) {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user || user.hash !== hashSync(password, user.salt)) {
      return null;
    }
    return user;
  }
}
