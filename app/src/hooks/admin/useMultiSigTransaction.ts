import { BigNumber } from '@ethersproject/bignumber'
import { LyraContractId, Network } from '@lyrafinance/lyra-js'
import { hexlify } from 'ethers/lib/utils'
import { useCallback } from 'react'

import { FetchId } from '@/app/constants/fetch'
import getLyraSDK from '@/app/utils/getLyraSDK'
import getMultiSigWalletContract from '@/app/utils/getMultiSigWalletContract'

import useFetch, { useMutate } from '../data/useFetch'

export type MultiSigTransaction = {
  destination: string
  value: BigNumber
  data: string
  executed: boolean
  methodName?: string
  decodedData?: Record<string, BigNumber>
  contractId?: string | null
}

export type CreateOptionBoardTransaction = MultiSigTransaction & {
  methodName: 'createOptionBoard'
  decodedData: {
    expiry: BigNumber
    baseIV: BigNumber
    strikePrices: BigNumber[]
    skews: BigNumber[]
    frozen: boolean
  }
}

export type AddStrikeToBoardTransaction = MultiSigTransaction & {
  methodName: 'addStrikeToBoard'
  decodedData: {
    boardId: BigNumber
    strikePrice: BigNumber
    skew: BigNumber
  }
}

const fetcher = async (network: Network, owner: string, transactionId: number) => {
  const lyra = getLyraSDK(network)
  const admin = lyra.admin()
  const multiSigWallet = getMultiSigWalletContract(lyra.network, owner)
  const [markets, transaction] = await Promise.all([lyra.markets(), multiSigWallet.transactions(transactionId)])
  const method = hexlify(transaction.data.slice(0, 10))

  // Check if transaction was a market contract call
  const marketAndContract = markets
    .map(market => {
      const contractAndId = admin.getMarketContractForAddress(
        market.contractAddresses,
        lyra.version,
        transaction.destination
      )
      return {
        market,
        contract: contractAndId ? contractAndId.contract : null,
        contractId: contractAndId ? contractAndId.contractId : null,
      }
    })
    .find(marketAndContract => marketAndContract.contract)

  if (marketAndContract && marketAndContract.contract) {
    const { market, contract, contractId } = marketAndContract
    const fragment = contract.interface.getFunction(method as unknown as never)
    const decodedData = contract.interface.decodeFunctionData(method, transaction.data)
    return {
      ...transaction,
      methodName: `${fragment.name} ${market.name}`,
      decodedData,
      contractId,
    }
  }
  // Check if transaction was any other known contract call
  const contractIdAndAddress = Object.values(LyraContractId)
    .filter(c => c !== LyraContractId.TestFaucet)
    .map(contractId => ({
      contractId,
      address: admin.contract(lyra.version, contractId).address,
    }))
    .find(contractIdAndAddress => contractIdAndAddress.address === transaction.destination)

  if (contractIdAndAddress) {
    const { contractId } = contractIdAndAddress
    const contract = admin.contract(lyra.version, contractId)
    // Hack to allow typesafety
    const fragment = contract.interface.getFunction(method as unknown as never)
    const decodedData = contract.interface.decodeFunctionData(method, transaction.data)
    return {
      ...transaction,
      methodName: fragment.name,
      decodedData,
      contractId,
    }
  }
  return transaction
}

export default function useMultiSigTransaction(
  network: Network,
  owner: string | null,
  transactionId: BigNumber
): MultiSigTransaction | CreateOptionBoardTransaction | AddStrikeToBoardTransaction | null {
  const [transaction] = useFetch(
    FetchId.AdminMultiSigTransaction,
    owner ? [network, owner, transactionId.toNumber()] : null,
    fetcher
  )
  return transaction
}

export function useMutateMultiSigTransaction(network: Network, owner: string | null, transactionId: BigNumber) {
  const mutate = useMutate(FetchId.AdminMultiSigTransaction, fetcher)
  return useCallback(
    async () => (owner ? await mutate(network, owner, transactionId.toNumber()) : null),
    [mutate, network, owner, transactionId]
  )
}
