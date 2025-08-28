import type { JsonObject, JsonValue } from 'type-fest'

// A *very* simple cache interface. We only require something super basic so no need for the big guns like
// cache-manager (https://www.npmjs.com/package/cache-manager).

export abstract class ICache<M extends JsonObject> {
  public abstract get<T extends JsonValue>(key: string): Promise<{ meta: M; value: T } | null>
  public abstract set<T extends JsonValue>(key: string, value: T, meta: M): Promise<void>
}
