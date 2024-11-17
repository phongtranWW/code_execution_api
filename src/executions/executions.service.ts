import { Inject, Injectable, RequestTimeoutException } from '@nestjs/common';
import { Language } from '@definitions/types/language';
import {
  ExecutionResultDto,
  ExecutionStatus,
} from '@executions/dtos/execution-result.dto';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { ExtensionFileName } from '@executions/constants/extension-file-name';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { IMAGE } from '@executions/constants/image';
import { Directory } from './constants/directory';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ExecutionsService {
  private static execution = promisify(exec);
  private static DEFAULT_TIMEOUT = 5000;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  public async executionSourceCode(
    username: string,
    sourceCode: Express.Multer.File,
    language: Language,
  ): Promise<ExecutionResultDto> {
    const id = randomUUID();
    const fileName = `${id}.${ExtensionFileName[language]}`;
    const sourceCodePath = join(
      resolve(__dirname, '..', '..', 'environments'),
      Directory[language],
      fileName,
    );

    try {
      writeFileSync(sourceCodePath, sourceCode.buffer);
      const { stdout } = await ExecutionsService.execution(
        `docker run --rm ` +
          `--name ${id} ` +
          `--memory 128m ` +
          `-v ${sourceCodePath}:/tmp/${Directory[language]}/${fileName} ` +
          `-e FILE=${fileName} ` +
          `${IMAGE[language]}`,
        { timeout: ExecutionsService.DEFAULT_TIMEOUT },
      );

      return new ExecutionResultDto(stdout, ExecutionStatus.SUCCESS);
    } catch (error) {
      if (error.killed) {
        await ExecutionsService.execution(`docker rm -f ${id}`);
        throw new RequestTimeoutException('Timeout exceeded');
      }
      return new ExecutionResultDto(error.stderr, ExecutionStatus.ERROR);
    } finally {
      await this.cacheManager.set(
        `${username}:${language}`,
        sourceCode.buffer.toString('utf-8'),
      );
      if (existsSync(sourceCodePath)) {
        unlinkSync(sourceCodePath);
      }
    }
  }
}
