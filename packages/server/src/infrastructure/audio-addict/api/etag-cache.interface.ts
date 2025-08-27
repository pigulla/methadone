import type { JsonValue } from 'type-fest'

export abstract class IETagCache {
  public abstract get<T extends JsonValue>(key: string): Promise<{ etag: string; value: T } | null>
  public abstract set<T extends JsonValue>(
    key: string,
    data: { etag: string; value: T },
  ): Promise<void>
}
