import { Account, Network } from '@lyrafinance/lyra-js'

import getLyraSDK from '@/app/utils/getLyraSDK'

import useWalletAccount from './useWalletAccount'

export default function useAccount(network: Network): Account | null {
  const address = useWalletAccount()
  return address ? getLyraSDK(network).account(address) : null
}
