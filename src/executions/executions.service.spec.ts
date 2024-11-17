import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionsService } from '@executions/executions.service';
import { Language } from '@definitions/types/language';
import {
  ExecutionResultDto,
  ExecutionStatus,
} from '@executions/dtos/execution-result.dto';
import { RequestTimeoutException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('ExecutionsService Integration Test', () => {
  let service: ExecutionsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutionsService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExecutionsService>(ExecutionsService);
  });

  it('should execute Java code successfully in Docker container', async () => {
    const mockSourceCode = {
      fieldname: 'file',
      originalname: 'HelloWorld.java',
      encoding: '7bit',
      mimetype: 'text/x-java-source',
      size: 40,
      filename: 'HelloWorld.java',
      path: '/tmp/HelloWorld.java',
      buffer: Buffer.from(
        'class HelloWorld {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}',
      ),
    } as Express.Multer.File;

    const result: ExecutionResultDto = await service.executionSourceCode(
      'testuser',
      mockSourceCode,
      Language.JAVA,
    );

    expect(result.contents).toContain('Hello, World!');
    expect(result.status).toBe(ExecutionStatus.SUCCESS);
  });

  it('should handle Docker container timeout', async () => {
    const mockSourceCode = {
      fieldname: 'file',
      originalname: 'HelloWorld.java',
      encoding: '7bit',
      mimetype: 'text/x-java-source',
      size: 40,
      filename: 'HelloWorld.java',
      path: '/tmp/HelloWorld.java',
      buffer: Buffer.from(
        'class HelloWorld {\n  public static void main(String[] args) {\n    while (true) {}\n  }\n}',
      ),
    } as Express.Multer.File;

    await expect(
      service.executionSourceCode('testuser', mockSourceCode, Language.JAVA),
    ).rejects.toThrow(RequestTimeoutException);
  }, 6000);

  it('should handle Docker execution errors', async () => {
    const mockSourceCode = {
      fieldname: 'file',
      originalname: 'HelloWorld.java',
      encoding: '7bit',
      mimetype: 'text/x-java-source',
      size: 40,
      filename: 'HelloWorld.java',
      path: '/tmp/HelloWorld.java',
      buffer: Buffer.from(
        'cdfsaflass HelloWorld {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}',
      ),
    } as Express.Multer.File;

    const result = await service.executionSourceCode(
      'testuser',
      mockSourceCode,
      Language.JAVA,
    );

    expect(result.status).toBe(ExecutionStatus.ERROR);
    expect(result.contents).toContain('error');
  });
});
