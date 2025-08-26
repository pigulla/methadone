/** biome-ignore-all lint/suspicious/noConsole: testing */
import { AudioAddictAPI } from 'infrastructure/audio-addict/api/audio-addict-api.js'

async function main(): Promise<void> {
  const api = new AudioAddictAPI()
  const networks = await api.getNetworks()

  for (const network of networks) {
    console.warn(network.name)
    const filters = await api.getChannelFilters(network.key)
    console.dir(filters)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
