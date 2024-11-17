import { Module } from '@nestjs/common';
import { ExecutionsService } from '@executions/executions.service';
import { ExecutionsController } from '@executions/executions.controller';

@Module({
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
})
export class ExecutionsModule {}
