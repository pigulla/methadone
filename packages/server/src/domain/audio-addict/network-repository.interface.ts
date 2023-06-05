import { type Network, type NetworkID, type NetworkKey } from './network'

export abstract class INetworkRepository {
    public abstract insertNetwork(network: Network): void

    public abstract getNetworks(): Network[]

    public abstract getNetwork(networkId: NetworkID): Network
    public abstract getNetwork(networkKey: NetworkKey): Network
}
