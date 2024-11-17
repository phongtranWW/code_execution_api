import { ApiProperty } from '@nestjs/swagger';

export class RegistrationDto {
  @ApiProperty({ required: true })
  username: string;

  @ApiProperty({ required: true })
  password: string;
}
