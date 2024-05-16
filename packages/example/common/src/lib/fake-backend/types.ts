import { HttpStatusCode } from '@angular/common/http';

export interface FakeBackend {
  updateConfig: (config: Partial<FakeBackendConfig>) => void;
  activeConfig: () => FakeBackendConfig;
}

export interface FakeBackendConfig {
  /** The minimum delay in milliseconds before the response is returned. */
  minDelay: number;
  /** The maximum delay in milliseconds before the response is returned. */
  maxDelay: number;

  /** The error rate is a number between 0 and 1. */
  errorRate: number;

  /** The error codes to be returned. */
  errorCodes: Map<HttpStatusCode, boolean>;
}
