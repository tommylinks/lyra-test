import getAssetSrc from '@/app/utils/getAssetSrc'

import { AppNetwork, Network } from '../constants/networks'
import resolveNetwork from './resolveNetwork'

export default function getNetworkLogoURI(network: Network): string {
  switch (resolveNetwork(network)) {
    case AppNetwork.Arbitrum:
      return getAssetSrc('/options/images/arbitrum.svg')
    case AppNetwork.Optimism:
      return getAssetSrc('/options/images/op-logo.svg')
    case AppNetwork.Ethereum:
      return getAssetSrc('/options/images/ethereum-logo.png')
  }
}
