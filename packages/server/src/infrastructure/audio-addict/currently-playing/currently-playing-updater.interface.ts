export abstract class ICurrentlyPlayingUpdater {
  public abstract update(): Promise<void>
}
