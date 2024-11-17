import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ExecutionsService } from '@executions/executions.service';
import { ExecutionResultDto } from '@executions/dtos/execution-result.dto';
import { Language } from '@definitions/types/language';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '@definitions/guards/api-key.guard';

@Controller('executions')
@ApiTags('executions')
@ApiSecurity('x-api-key')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @UseGuards(ApiKeyGuard)
  @Post()
  @UseInterceptors(FileInterceptor('sourceCode'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sourceCode: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['sourceCode'],
    },
  })
  @ApiQuery({ enum: Language, name: 'language', required: true })
  public async executionSourceCode(
    @UploadedFile() sourceCode: Express.Multer.File,
    @Query('language') language: Language,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Request() request,
  ): Promise<ExecutionResultDto> {
    return await this.executionsService.executionSourceCode(
      request.user.username,
      sourceCode,
      language,
    );
  }
}
