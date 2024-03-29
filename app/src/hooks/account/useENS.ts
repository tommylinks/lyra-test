import { FetchId } from '@/app/constants/fetch'
import mainnetProvider from '@/app/utils/mainnetProvider'

import useFetch from '../data/useFetch'
import useWalletAccount from './useWalletAccount'

type ENS = {
  name: string
  avatarURL: string | null
}

const AVATAR_URL = 'https://metadata.ens.domains/mainnet/avatar'

const fetcher = async (address: string): Promise<ENS | null> => {
  // ENS not supported on Kovan
  const name = await mainnetProvider.lookupAddress(address)
  if (!name) {
    return null
  }
  const resolver = await mainnetProvider.getResolver(name)
  const avatar = resolver ? await resolver.getText('avatar') : null
  if (!avatar) {
    return {
      name,
      avatarURL: null,
    }
  }
  // fetch from ens metadata cache
  const res = await fetch(`${AVATAR_URL}/${name}`)
  const avatarURL = res?.url ?? null
  return { avatarURL, name }
}

export default function useENS(): ENS | null {
  const account = useWalletAccount()
  const [data] = useFetch(FetchId.AccountENS, account != null ? [account] : null, fetcher)
  return data
}
