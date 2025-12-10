import type { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { extractSetCookies } from './cookie.utils';
import { parseJson } from './parse-json.util';

export class ProxyHelper {
  private readonly authServiceUrl: string;

  constructor(config: ConfigService) {
    this.authServiceUrl = config.get<string>('AUTH_SERVICE_URL')!;
  }

  async forward(
    req: FastifyRequest,
    path: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<Response> {
    const url = new URL(path, this.authServiceUrl);

    const headers = new Headers();
    headers.set('content-type', 'application/json');

    if (req.headers.authorization)
      headers.set('authorization', req.headers.authorization);

    if (req.headers.cookie) headers.set('cookie', req.headers.cookie);

    return fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  }

  //Универсальный helper: проксируем, пробрасываем куки и статус, возвращаем JSON
  async forwardJson<T = unknown>(
    req: FastifyRequest,
    res: FastifyReply,
    path: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<T> {
    const response = await this.forward(req, path, options);

    const setCookies = extractSetCookies(response);
    if (setCookies) {
      for (const cookie of setCookies) {
        res.header('set-cookie', cookie);
      }
    }

    const data = await parseJson<T>(response);
    res.status(response.status);
    return data;
  }

  //Вариант без тела (204, logout и т.п.)
  async forwardNoBody(
    req: FastifyRequest,
    res: FastifyReply,
    path: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<void> {
    const response = await this.forward(req, path, options);

    const setCookies = extractSetCookies(response);
    if (setCookies) {
      for (const cookie of setCookies) {
        res.header('set-cookie', cookie);
      }
    }

    res.status(response.status);
  }
}
