import { Market } from '@lyrafinance/lyra-js'

import getAssetSrc from '@/app/utils/getAssetSrc'

export default function getMarketLogoURI(market: Market): string {
  switch (market.baseToken.symbol.toLowerCase()) {
    case 'seth':
    case 'eth':
    case 'weth':
      return getAssetSrc('/options/images/ethereum-logo.png')
    case 'btc':
    case 'sbtc':
    case 'wbtc':
      return getAssetSrc('/options/images/bitcoin-logo.png')
    case 'sol':
    case 'ssol':
      return getAssetSrc('/options/images/solana-logo.png')
    case 'op':
      return getAssetSrc('/options/images/op-logo.svg')
    case 'lyarb':
    case 'arb':
      return getAssetSrc('/options/images/arbitrum-logo.svg')
    default:
      return ''
  }
}
