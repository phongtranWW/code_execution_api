import { Test } from '@nestjs/testing';
import { UsersService } from '@users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('UsersService Integration', () => {
  let userService: UsersService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository<User>,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  describe('login', () => {
    it('should return login result', async () => {
      const result = await userService.login({ username: 'testuser', id: 1 });
      expect(result.accessToken).toBeDefined();
    });
  });
});
