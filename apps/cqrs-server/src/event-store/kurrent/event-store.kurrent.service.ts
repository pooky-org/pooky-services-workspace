import {
  jsonEvent,
  KurrentDBClient,
  type JSONType,
} from '@kurrent/kurrentdb-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventStoreKurrentService {
  readonly store: KurrentDBClient;

  constructor(baseUrl: string) {
    this.store = KurrentDBClient.connectionString(baseUrl);
  }

  async appendEvent(
    streamId: string,
    event: JSONType,
    type: string,
  ): Promise<void> {
    const evt = jsonEvent({ type, data: event });
    await this.store.appendToStream(streamId, [evt]);
  }

  async readStream<T = unknown>(streamId: string): Promise<T[]> {
    const events = this.store.readStream(streamId, { direction: 'forwards' });
    const result: T[] = [];
    for await (const resolved of events) {
      if (resolved.event?.data) {
        result.push(resolved.event.data as T);
      }
    }
    return result;
  }
}
