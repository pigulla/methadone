import { type Channel, type Quality } from '../domain/audio-addict'

export abstract class IStreamUrlService {
    public abstract getChannelFromStreamUrl(url: string): Channel

    public abstract getStreamUrl(
        channel: Channel,
        quality: Quality,
    ): Promise<string>
}
