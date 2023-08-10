import { Network, Position } from '@lyrafinance/lyra-js'

import { FetchId } from '@/app/constants/fetch'
import getLyraSDK from '@/app/utils/getLyraSDK'
import { lyraArbitrum, lyraOptimism } from '@/app/utils/lyra'

import useWalletAccount from '../account/useWalletAccount'
import useFetch from '../data/useFetch'

const fetcher = async (owner: string, includeOpen: boolean, network?: Network): Promise<Position[]> => {
  let positions: Position[] = []
  if (network) {
    positions = await getLyraSDK(network).positions(owner)
  } else {
    const [opPositions, arbPositions] = await Promise.all([
      lyraOptimism.positions(owner),
      lyraArbitrum.positions(owner),
    ])
    positions = [...opPositions, ...arbPositions]
  }
  return positions
    .filter(p => includeOpen || !p.isOpen)
    .sort((a, b) => {
      const at = a.isSettled ? a.expiryTimestamp : a.lastTrade()?.timestamp ?? 0
      const bt = b.isSettled ? b.expiryTimestamp : b.lastTrade()?.timestamp ?? 0
      return bt - at
    })
}

const EMPTY: Position[] = []

export default function usePositionHistory(includeOpen = false, network?: Network): Position[] {
  const owner = useWalletAccount()
  const [positions] = useFetch(FetchId.PositionHistory, owner ? [owner, includeOpen, network] : null, fetcher)
  return positions ?? EMPTY
}
