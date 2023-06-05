import { type PlayerStatus } from '../../domain/vlc'

export abstract class IVlcRemote {
    public abstract stop(): Promise<PlayerStatus>

    public abstract play(url: string): Promise<PlayerStatus>

    public abstract clearPlaylist(): Promise<PlayerStatus>

    public abstract getStatus(): Promise<PlayerStatus>
}
