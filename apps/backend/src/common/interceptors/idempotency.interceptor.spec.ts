import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../../cache/cache.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  let cacheService: CacheService;

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyInterceptor,
        { provide: CacheService, useValue: mockCacheService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    interceptor = module.get<IdempotencyInterceptor>(IdempotencyInterceptor);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should return cached result if key and body hash match', async () => {
    const body = { amount: 100 };
    const context = createMockContext('POST', { 'idempotency-key': 'test-key' }, body);
    const next: CallHandler = { handle: jest.fn() };
    
    // @ts-ignore
    const bodyHash = interceptor.calculateHash(body);
    const cachedResponse = { statusCode: 201, body: { success: true }, bodyHash };

    mockCacheService.get.mockResolvedValue(cachedResponse);

    const result = await (await interceptor.intercept(context, next)).toPromise();
    expect(result).toEqual(cachedResponse.body);
  });

  it('should throw UnprocessableEntity if body hash mismatch', async () => {
    const body = { amount: 100 };
    const context = createMockContext('POST', { 'idempotency-key': 'test-key' }, body);
    const next: CallHandler = { handle: jest.fn() };
    
    const cachedResponse = { statusCode: 201, body: { success: true }, bodyHash: 'different-hash' };

    mockCacheService.get.mockResolvedValue(cachedResponse);

    await expect(interceptor.intercept(context, next)).rejects.toThrow(
      'Idempotency key was used with a different request body.',
    );
  });

  it('should clear lock on error', async () => {
    const context = createMockContext('POST', { 'idempotency-key': 'test-key' }, {});
    const next: CallHandler = { handle: () => throwError(() => new Error('Failed')) };

    mockCacheService.get.mockResolvedValue(null);

    try {
      const obs = await interceptor.intercept(context, next);
      await obs.toPromise();
    } catch (e) {
      // Expected
    }

    expect(mockCacheService.del).toHaveBeenCalled();
  });

  function createMockContext(method: string, headers: any, body: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          headers,
          body,
          path: '/test',
        }),
        getResponse: () => ({
          status: jest.fn(),
          statusCode: 200,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }
});
