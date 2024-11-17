export class ExecutionResultDto {
  constructor(
    public readonly contents: string,
    public readonly status: ExecutionStatus,
  ) {}
}

export enum ExecutionStatus {
  SUCCESS,
  ERROR,
}
