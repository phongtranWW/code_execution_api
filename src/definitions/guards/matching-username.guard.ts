import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class MatchingUsernameGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const usernameFromToken = user.username;
    const usernameFromParams = request.params.username;

    if (usernameFromToken !== usernameFromParams) {
      throw new ForbiddenException(
        'You are not allowed to access this resource.',
      );
    }

    return true;
  }
}
