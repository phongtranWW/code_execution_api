import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { LoginDto } from '@users/dtos/login.dto';
import { LoginResultDto } from '@users/dtos/login-result.dto';
import { AuthGuard } from '@nestjs/passport';
import { RegistrationDto } from './dtos/registration.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '@definitions/guards/api-key.guard';
import { CodeDto } from './dtos/code.dto';
import { Language } from '@definitions/types/language';
import { MatchingUsernameGuard } from '@definitions/guards/matching-username.guard';

@Controller('users')
@ApiTags('users')
@ApiSecurity('x-api-key')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('local'))
  @UseGuards(ApiKeyGuard)
  @Post('auth/login')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: LoginDto })
  public async login(
    @Body() loginDto: LoginDto,
    @Request() request,
  ): Promise<LoginResultDto> {
    return await this.usersService.login(request.user);
  }

  @Post('auth/register')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegistrationDto })
  public async register(
    @Body() registrationDto: RegistrationDto,
  ): Promise<void> {
    await this.usersService.register(
      registrationDto.username,
      registrationDto.password,
    );
  }

  @Get(':username/codes')
  @UseGuards(MatchingUsernameGuard)
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'language', enum: Language })
  @ApiBearerAuth()
  public async getCodes(
    @Param('username') username: string,
    @Query('language') language: Language,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Request() request,
  ): Promise<CodeDto> {
    return await this.usersService.getCodes(username, language);
  }
}
