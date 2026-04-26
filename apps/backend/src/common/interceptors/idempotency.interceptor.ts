import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as crypto from 'crypto';
import { CacheService } from '../../cache/cache.service';
import {
  IDEMPOTENT_OPTIONS_KEY,
  IdempotentOptions,
} from '../decorators/idempotent.decorator';

interface IdempotencyResult {
  statusCode: number;
  body: any;
  bodyHash: string;
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const options = this.reflector.getAllAndOverride<IdempotentOptions>(
      IDEMPOTENT_OPTIONS_KEY,
      [context.getHandler(), context.getClass()],
    ) || {};

    const methods = options.methods || ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (!methods.includes(request.method)) {
      return next.handle();
    }

    const headerName = options.header || 'idempotency-key';
    const idempotencyKey = request.headers[headerName.toLowerCase()];

    if (!idempotencyKey) {
      return next.handle();
    }

    // Hash the body to ensure the key is only valid for the same payload
    const bodyHash = this.calculateHash(request.body);
    const cacheKey = `idempotency:${request.path}:${idempotencyKey}`;
    
    const cachedResult = await this.cacheService.get<IdempotencyResult | string>(
      cacheKey,
    );

    if (cachedResult) {
      if (cachedResult === 'IN_PROGRESS') {
        throw new HttpException(
          'Request with this idempotency key is already in progress.',
          HttpStatus.CONFLICT,
        );
      }

      const result = cachedResult as IdempotencyResult;
      
      // Verify that the body hash matches
      if (result.bodyHash !== bodyHash) {
        throw new HttpException(
          'Idempotency key was used with a different request body.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      this.logger.debug(`Returning cached result for key: ${idempotencyKey}`);
      const response = context.switchToHttp().getResponse();
      response.status(result.statusCode);
      return of(result.body);
    }

    // Mark as in progress to prevent concurrent duplicate requests
    await this.cacheService.set(cacheKey, 'IN_PROGRESS', 60000); // 1 minute lock

    return next.handle().pipe(
      tap({
        next: async (body) => {
          const response = context.switchToHttp().getResponse();
          const result: IdempotencyResult = {
            statusCode: response.statusCode,
            body,
            bodyHash,
          };
          const ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
          await this.cacheService.set(cacheKey, result, ttl);
        },
        error: async () => {
          // Remove the lock on error so the client can retry
          await this.cacheService.del(cacheKey);
        }
      })
    );
  }

  private calculateHash(body: any): string {
    const data = body ? JSON.stringify(body) : '';
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
