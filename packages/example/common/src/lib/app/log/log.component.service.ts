import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HttpVisibilityInterceptorError,
  HttpVisibilityInterceptorHttpEvent,
  isHttpVisibilityInterceptorError,
  isHttpVisibilityInterceptorHttpEvent,
} from 'ngx-http-resilience';
import { BehaviorSubject, Observable, map } from 'rxjs';

export const LogEventType = {
  sent: 'Sent',
  uploadProgress: 'Upload Progress',
  downloadProgress: 'Download Progress',
  responseHeader: 'Response Header',
  response: 'Response',
  user: 'User',
  error: 'Error',
  unknown: 'Unknown',
};
type LogEventType = (typeof LogEventType)[keyof typeof LogEventType];

const httpEventTypeMap = {
  [HttpEventType.Sent]: LogEventType.sent,
  [HttpEventType.UploadProgress]: LogEventType.uploadProgress,
  [HttpEventType.DownloadProgress]: LogEventType.downloadProgress,
  [HttpEventType.ResponseHeader]: LogEventType.responseHeader,
  [HttpEventType.Response]: LogEventType.response,
  [HttpEventType.User]: LogEventType.user,
} as const satisfies Record<HttpEventType, LogEventType>;

const Color = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};
type Color = (typeof Color)[keyof typeof Color];

const typeColorMap = {
  [LogEventType.sent]: Color.info,
  [LogEventType.uploadProgress]: Color.info,
  [LogEventType.downloadProgress]: Color.info,
  [LogEventType.responseHeader]: Color.info,
  [LogEventType.response]: Color.success,
  [LogEventType.user]: Color.warning,
  [LogEventType.error]: Color.error,
  [LogEventType.unknown]: Color.error,
} as const satisfies Record<LogEventType, Color>;

interface LogEvent {
  method: string;
  url: string;
  // duration: number;
  type: LogEventType;
  status?: string;
}

export interface DecoratedLogEvent extends LogEvent {
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class LogComponentService {
  private _events$ = new BehaviorSubject<LogEvent[]>([]);
  private _buffer = 10;

  public set buffer(buffer: number) {
    this._buffer = buffer;
    this._events$.next(this.truncateLogEvents(this._events$.value));
  }

  public setSource(
    source$: Observable<
      | HttpVisibilityInterceptorHttpEvent<unknown>
      | HttpVisibilityInterceptorError
    >
  ): void {
    source$.subscribe((event) => {
      if (isHttpVisibilityInterceptorHttpEvent(event)) {
        this.handleHttpEvent(event);
      } else if (isHttpVisibilityInterceptorError(event)) {
        this.handleHttpError(event);
      }
    });
  }

  public observeEvents(): Observable<DecoratedLogEvent[]> {
    return this._events$.pipe(
      map((events) => events.map((event) => this.decorateEvent(event)))
    );
  }

  private decorateEvent(event: LogEvent): DecoratedLogEvent {
    const color = this.getColorForLogEvent(event);
    return { ...event, color };
  }

  private getColorForLogEvent(event: LogEvent): string {
    return typeColorMap[event.type];
  }

  private addLogEvent(logEvent: LogEvent): void {
    this._events$.next(
      this.truncateLogEvents([logEvent, ...this._events$.value])
    );
  }

  private truncateLogEvents(logEvents: LogEvent[]): LogEvent[] {
    return logEvents.slice(0, this._buffer);
  }

  private handleHttpEvent(
    event: HttpVisibilityInterceptorHttpEvent<unknown>
  ): void {
    const logEvent = this.transformHttpVisibilityInterceptorHttpEvent(event);
    this.addLogEvent(logEvent);
  }

  private transformHttpVisibilityInterceptorHttpEvent(
    event: HttpVisibilityInterceptorHttpEvent<unknown>
  ): LogEvent {
    const { event: httpEvent, req } = event;
    const { method, url } = req;

    const type = this.getTypeForHttEvent(httpEvent);
    const status = this.getHttpEventStatus(httpEvent);
    return { method, url, type, status };
  }

  private getTypeForHttEvent(httpEvent: HttpEvent<unknown>): LogEventType {
    return httpEventTypeMap[httpEvent.type] ?? LogEventType.unknown;
  }

  private getHttpEventStatus(
    httpEvent: HttpEvent<unknown>
  ): string | undefined {
    return httpEvent.type === HttpEventType.Response
      ? `${httpEvent.status} ${httpEvent.statusText}`
      : undefined;
  }

  private handleHttpError(event: HttpVisibilityInterceptorError): void {
    const logEvent = this.transformHttpVisibilityInterceptorError(event);
    this.addLogEvent(logEvent);
  }

  private transformHttpVisibilityInterceptorError(
    event: HttpVisibilityInterceptorError
  ): LogEvent {
    const { err, req } = event;
    const { method, url } = req;
    const type = LogEventType.error;
    const status = this.getErrorStatus(err);
    return { method, url, type, status };
  }

  private getErrorStatus(err: unknown): string | undefined {
    return err instanceof HttpErrorResponse
      ? `${err.status} ${err.statusText}`
      : undefined;
  }
}
