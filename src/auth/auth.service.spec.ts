import { AuthService } from '@auth/auth.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@users/user.entity';
import { genSaltSync, hashSync } from 'bcrypt';
import { Test } from '@nestjs/testing';

describe('AuthService Testing', () => {
  let authService: AuthService;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository<User>,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('validateUser', () => {
    it('should validate a user with correct credentials', async () => {
      const salt = genSaltSync(10);
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue({
        id: 1,
        username: 'testuser',
        salt,
        hash: hashSync('testpassword', salt),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await authService.validateUser('testuser', 'testpassword');
      expect(user).not.toBeNull();
      expect(user.username).toBe('testuser');
    });

    it('should return null for invalid credentials', async () => {
      const salt = genSaltSync(10);
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue({
        id: 1,
        username: 'testuser',
        salt,
        hash: hashSync('testpassword', salt),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await authService.validateUser('testuser', 'testpasswordd');
      expect(user).toBeNull();
    });
  });
});
