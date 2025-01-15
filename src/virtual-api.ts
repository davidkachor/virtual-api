import { ApiError, type ApiErrorBody } from './api-error';
import { delay, getRandomIndex } from './utils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiConfig<T = unknown> {
  useResponseIdx?: number;
  useErrorIdx?: number;
  requestTimeout?: number;
  body?: T;
}

interface ApiSchema {
  [url: string]: {
    [method: string]: {
      responses: unknown[];
      body?: unknown;
      errors?: ApiErrorBody[];
    };
  };
}

type GetMethodForUrl<
  Schema extends ApiSchema,
  Url extends keyof Schema
> = keyof Schema[Url];

type GetUrlByMethods<
  Schema extends ApiSchema,
  Method extends HttpMethod
> = keyof {
  [Url in keyof Schema as Extract<
    Method,
    GetMethodForUrl<Schema, Url>
  > extends never
    ? never
    : Url]: unknown;
};

type ExtractResponseType<
  Schema extends ApiSchema,
  Url extends keyof Schema,
  Method extends HttpMethod
> = Schema[Url][Method]['responses'][number];

type ExtractBodyType<
  Schema extends ApiSchema,
  Url extends keyof Schema,
  Method extends HttpMethod
> = Schema[Url][Method]['body'];

export class VirtualApi<Schema extends ApiSchema> {
  constructor(schema: Schema) {
    this.schema = schema;
  }

  private schema: Schema;

  private async handleRequest<
    Url extends keyof Schema,
    Method extends HttpMethod
  >(url: Url, method: Method, config: ApiConfig = {}) {
    await delay(config.requestTimeout ?? 1500);

    const { errors, responses } = this.schema[url][method];

    if (config.useErrorIdx !== undefined) {
      const error = errors?.[config.useErrorIdx];
      if (error) throw new ApiError(error);
    }

    const index =
      config.useResponseIdx !== undefined &&
      config.useResponseIdx < responses.length
        ? config.useResponseIdx
        : getRandomIndex(responses.length);

    return {
      data: responses[index] as ExtractResponseType<Schema, Url, Method>,
    };
  }

  get<Url extends GetUrlByMethods<Schema, 'GET'>>(
    url: Url,
    config?: ApiConfig<ExtractBodyType<Schema, Url, 'GET'>>
  ) {
    return this.handleRequest(url, 'GET', config);
  }

  post<Url extends GetUrlByMethods<Schema, 'POST'>>(
    url: Url,
    config?: ApiConfig<ExtractBodyType<Schema, Url, 'POST'>>
  ) {
    return this.handleRequest(url, 'POST', config);
  }

  put<Url extends GetUrlByMethods<Schema, 'PUT'>>(
    url: Url,
    config?: ApiConfig<ExtractBodyType<Schema, Url, 'PUT'>>
  ) {
    return this.handleRequest(url, 'PUT', config);
  }

  patch<Url extends GetUrlByMethods<Schema, 'PATCH'>>(
    url: Url,
    config?: ApiConfig<ExtractBodyType<Schema, Url, 'PATCH'>>
  ) {
    return this.handleRequest(url, 'PATCH', config);
  }

  delete<Url extends GetUrlByMethods<Schema, 'DELETE'>>(
    url: Url,
    config?: ApiConfig<ExtractBodyType<Schema, Url, 'DELETE'>>
  ) {
    return this.handleRequest(url, 'DELETE', config);
  }
}
