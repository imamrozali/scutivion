import { IncomingMessage, ServerResponse } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { Socket } from "net";
import { EventEmitter } from "events";

export interface Context {
  req?: IncomingMessage | Http2ServerRequest;
  res?: ServerResponse | Http2ServerResponse;
  params: string[];
  query: Record<string, string>;
  body?: any;
  socket?: Socket;
  protocol?: string;
  method?: string;
  url?: string;
  headers: Record<string, string>;
  statusCode: number;
  responseHeaders: Record<string, string>;
  responseBody?: string | Buffer;
  error?: Error;
  custom: Record<string, any>;
}

export interface Service {
  [key: string]: any;
}

export type HookFunction = (ctx: Context) => void;
export type HandlerFunction = (ctx: Context) => void;

export class ContextObjectPool {
  constructor(size?: number);
  acquire(): Context;
  release(ctx: Context): void;
}

export class LifecycleHookSystem {
  onRequest: HookFunction[];
  onResponse: HookFunction[];
  onError: HookFunction[];
  register(
    hookName: "onRequest" | "onResponse" | "onError",
    fn: HookFunction
  ): void;
  execute(hookName: "onRequest" | "onResponse" | "onError", ctx: Context): void;
}

export class UnifiedEngineCore extends EventEmitter {
  constructor(options?: { poolSize?: number });
  registerService(name: string, service: Service): void;
  route(method: string, path: string, handler: HandlerFunction): void;
  hook(
    hookName: "onRequest" | "onResponse" | "onError",
    fn: HookFunction
  ): void;
  handleRequest(
    protocol: string,
    rawReq: any,
    rawRes: any,
    socket?: Socket
  ): void;
  listen(protocol: string, port: number, options?: any): void;
  registerProtocol(name: string, adapter: any): void;
}

export class HTTPProtocolAdapter {
  constructor(options?: any);
  listen(core: UnifiedEngineCore, port: number, opts?: any): void;
  close(): void;
}

export class TCPProtocolAdapter {
  constructor(options?: any);
  listen(core: UnifiedEngineCore, port: number): void;
  close(): void;
}

export class WebSocketProtocolAdapter {
  constructor(options?: any);
  listen(core: UnifiedEngineCore, port: number): void;
  close(): void;
}

export class HTTP2ProtocolAdapter {
  constructor(options?: any);
  listen(core: UnifiedEngineCore, port: number): void;
  close(): void;
}

export class UDPProtocolAdapter {
  constructor(options?: any);
  listen(core: UnifiedEngineCore, port: number): void;
  close(): void;
}

export class FrameworkPlugin {
  constructor(name: string);
  registerService(name: string, service: Service): void;
  registerHook(
    hookName: "onRequest" | "onResponse" | "onError",
    fn: HookFunction
  ): void;
  apply(core: UnifiedEngineCore): void;
}

export class StructuredLoggingPlugin extends FrameworkPlugin {
  constructor();
}

export class SecurityPlugin extends FrameworkPlugin {
  constructor(options?: { rateLimit?: number });
}

export class ResponseCompressionPlugin extends FrameworkPlugin {
  constructor();
}

export class FileStreamingPlugin extends FrameworkPlugin {
  constructor();
}

export class ObservabilityPlugin extends FrameworkPlugin {
  constructor();
}

// Aliases for backward compatibility
export { UnifiedEngineCore as CoreEngine };
export { HTTPProtocolAdapter as HTTPAdapter };
export { TCPProtocolAdapter as TCPAdapter };
export { WebSocketProtocolAdapter as WSAdapter };
export { FrameworkPlugin as Plugin };
export { StructuredLoggingPlugin as LoggingPlugin };
export { ResponseCompressionPlugin as CompressionPlugin };
export { FileStreamingPlugin as StreamingPlugin };
