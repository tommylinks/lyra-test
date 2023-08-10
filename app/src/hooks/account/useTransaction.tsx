import { JsonRpcProvider, TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { IconType } from '@lyra/ui/components/Icon'
import Spinner from '@lyra/ui/components/Spinner'
import { closeToast, createToast, updateToast } from '@lyra/ui/components/Toast'
import { BigNumber, Contract, ContractReceipt, PopulatedTransaction } from 'ethers'
import React, { useCallback } from 'react'

import { AppNetwork, Network } from '@/app/constants/networks'
import { TransactionType } from '@/app/constants/screen'
import { TransactionError, TransactionErrorReason, TransactionErrorStage } from '@/app/constants/transactionErrors'
import extractError, { TransactionErrorHandler } from '@/app/utils/common/extractError'
import getExplorerUrl from '@/app/utils/getExplorerUrl'
import getNetworkConfig from '@/app/utils/getNetworkConfig'
import getProvider from '@/app/utils/getProvider'
import postTransactionError from '@/app/utils/postTransactionError'
import postTransactionSuccess from '@/app/utils/postTransactionSuccess'
import resolveNetwork from '@/app/utils/resolveNetwork'

import useWallet from './useWallet'

const DEFAULT_TOAST_INFO_TIMEOUT = 1000 * 5 // 5 seconds
const DEFAULT_TOAST_ERROR_TIMEOUT = 1000 * 10 // 10 seconds
const POLL_INTERVAL = 250 // 0.25 seconds

// https://docs.ethers.io/v5/single-page/#/v5/api/providers/types/-%23-providers-TransactionReceipt
enum TransactionStatus {
  Failure = 0,
  Success = 1,
}

const USER_ERRORS = [
  TransactionErrorReason.UserDenied,
  TransactionErrorReason.NetworkChanged,
  TransactionErrorReason.NotEnoughFunds,
  TransactionErrorReason.WalletSetup,
]

type Value = string | number | boolean

export type TransactionMetadata = Record<string, Value | Record<string, Value> | Array<Record<string, Value>>>

export type TransactionSuccessOptions = {
  network: Network
  toastId: string
  txName: TransactionType
  signer: string
  metadata?: TransactionMetadata
}

export type TransactionErrorOptions = {
  network: Network
  stage: TransactionErrorStage
  toastId: string
  txName: TransactionType
  signer: string
  wallet: string
  receipt?: ContractReceipt
  handler?: TransactionErrorHandler
  contract?: Contract
  metadata?: TransactionMetadata
}

export type Transaction<
  C extends Contract = Contract,
  M extends keyof Contract['functions'] & string = string,
  P extends Parameters<C['functions'][M]> = any
> =
  | PopulatedTransaction
  | {
      tx: PopulatedTransaction
      contract?: C
      metadata?: TransactionMetadata
    }
  | {
      contract: C
      method: M
      params: P
      options?: { gasLimit?: BigNumber }
      metadata?: TransactionMetadata
    }

export type TransactionOptions = {
  onComplete?: (receipt: ContractReceipt) => any
  onError?: TransactionErrorHandler
  metadata?: TransactionMetadata
}

const ToastSpinner = () => <Spinner size={20} />

const formatErrorReasonMessage = (
  errorReason: TransactionErrorReason,
  options: TransactionErrorOptions
): string | null => {
  switch (errorReason) {
    case TransactionErrorReason.TradeSlippage:
      return 'The quoted option price is now out of bounds, try again'
    case TransactionErrorReason.NetworkChanged:
      return 'Your network unexpectedly changed, try again'
    case TransactionErrorReason.RpcError:
      return 'An RPC error occurred, try again'
    case TransactionErrorReason.NotEnoughFunds:
      return `Your account on ${getNetworkConfig(options.network).displayName} doesn\'t have enough gas`
    case TransactionErrorReason.WalletSetup:
      // Null error reason messages will default to error.message
      // Use this case when error.message is more informative / specific
      return null
    case TransactionErrorReason.UserDenied:
      // User denied reason never needs a message
      return null
  }
}

// Render custom errors
const formatErrorMessage = (error: TransactionError, options: TransactionErrorOptions): string => {
  const errorReasonMessage = error.reason ? formatErrorReasonMessage(error.reason, options) : null
  if (errorReasonMessage) {
    return errorReasonMessage
  } else if (error.message) {
    return error.message
  } else {
    return options.stage === TransactionErrorStage.Reverted ? 'Transaction reverted' : 'Failed to send transaction'
  }
}

const handleError = (rawError: any, options: TransactionErrorOptions) => {
  const { handler, network, toastId, receipt } = options

  const error = extractError(rawError, options)

  if (error.reason === TransactionErrorReason.UserDenied) {
    // Ignore user denied reason
    closeToast(toastId)
    return
  }

  console.error(rawError)

  // Post transaction error to db, ignore user errors
  if (!error.reason || !(error.reason && USER_ERRORS.includes(error.reason))) {
    postTransactionError(error, options)
  }

  const txHash = receipt?.transactionHash

  updateToast(toastId, {
    variant: 'error',
    description: formatErrorMessage(error, options),
    icon: IconType.AlertTriangle,
    href: txHash ? getExplorerUrl(network, txHash) : undefined,
    hrefLabel: txHash ? 'View on etherscan' : undefined,
    target: '_blank',
    autoClose: DEFAULT_TOAST_ERROR_TIMEOUT,
  })

  if (handler) {
    handler(error, rawError, receipt)
  }
}

const getTimeout = (network: Network): number => {
  switch (resolveNetwork(network)) {
    case AppNetwork.Arbitrum:
    case AppNetwork.Optimism:
      return 10 * 1000
    case AppNetwork.Ethereum:
      return 60 * 1000
  }
}

async function getRawTxGasLimit(
  network: Network,
  provider: JsonRpcProvider,
  tx: PopulatedTransaction
): Promise<BigNumber> {
  const config = getNetworkConfig(network)
  const gasLimit = tx.gasLimit ?? (await provider.estimateGas(tx)).mul(10000 * Math.max(1, config.gasBuffer)).div(10000)
  if (gasLimit.lt(config.minGas)) {
    return config.minGas
  }
  if (gasLimit.gt(config.maxGas)) {
    return config.maxGas
  }
  return gasLimit
}

async function getContractTxGasLimit(
  network: Network,
  contract: Contract,
  method: string,
  params: any,
  options?: { gasLimit?: BigNumber }
): Promise<BigNumber> {
  const config = getNetworkConfig(network)
  const gasLimit =
    options?.gasLimit ??
    (await contract.estimateGas[method](...params)).mul(10000 * Math.max(1, config.gasBuffer)).div(10000)
  if (gasLimit.lt(config.minGas)) {
    return config.minGas
  }
  if (gasLimit.gt(config.maxGas)) {
    return config.maxGas
  }
  return gasLimit
}

export default function useTransaction(network: Network) {
  const { account, signer, connector } = useWallet()
  return useCallback(
    async <
      C extends Contract = Contract,
      M extends keyof Contract['functions'] & string = string,
      P extends Parameters<C['functions'][M]> = any
    >(
      txInputs: Transaction<C, M, P>,
      txName: TransactionType,
      options?: TransactionOptions
    ): Promise<ContractReceipt | null> => {
      const provider = getProvider(network)

      const onComplete = options?.onComplete
      const onError = options?.onError

      if (!signer || !account || !connector) {
        console.warn('No signer')
        return null
      }

      const toastId = createToast({
        variant: 'info',
        icon: <ToastSpinner />,
        description: 'Confirm your transaction',
        autoClose: false,
      })

      const successOrErrorOptions = {
        network,
        toastId,
        txName,
        metadata: options?.metadata,
        signer: account,
        handler: onError,
        wallet: connector.name,
      }

      let response: TransactionResponse
      let contract: Contract | undefined
      let metadata: TransactionMetadata | undefined

      if ('method' in txInputs) {
        const method = txInputs['method']
        const params = txInputs['params']

        const options = txInputs['options']
        contract = txInputs['contract'].connect(signer)
        metadata = txInputs['metadata']

        let gasLimit: BigNumber
        try {
          gasLimit = await getContractTxGasLimit(network, contract, method, params, options)
        } catch (rawError) {
          handleError(rawError, {
            ...successOrErrorOptions,
            metadata,
            contract,
            stage: TransactionErrorStage.GasEstimate,
          })
          return null
        }

        try {
          response = await contract[method](...params, { gasLimit })
        } catch (rawError) {
          handleError(rawError, {
            ...successOrErrorOptions,
            metadata,
            contract,
            stage: TransactionErrorStage.Wallet,
          })
          return null
        }
      } else {
        let tx: PopulatedTransaction
        if ('tx' in txInputs) {
          tx = txInputs['tx']
          metadata = txInputs['metadata']
          contract = txInputs['contract']?.connect(signer)
        } else {
          tx = txInputs
        }

        try {
          tx.gasLimit = await getRawTxGasLimit(network, provider, tx)
        } catch (rawError) {
          handleError(rawError, {
            ...successOrErrorOptions,
            metadata,
            contract,
            stage: TransactionErrorStage.GasEstimate,
          })
          return null
        }

        try {
          response = await signer.sendTransaction(tx)
        } catch (rawError) {
          handleError(rawError, {
            ...successOrErrorOptions,
            metadata,
            contract,
            stage: TransactionErrorStage.Wallet,
          })
          return null
        }
      }

      const transactionTimeout = getTimeout(network)
      const autoClose = transactionTimeout + POLL_INTERVAL // add buffer
      const txHref = getExplorerUrl(network, response.hash)

      updateToast(toastId, {
        variant: 'info',
        icon: <ToastSpinner />,
        description: 'Your transaction is pending.',
        href: txHref,
        hrefLabel: 'View on etherscan',
        target: '_blank',
        autoClose,
      })

      console.debug('response', response)
      console.time('waitForTransaction')
      // Poll for transaction receipt (can lead to faster results than .wait())
      const receipt = await new Promise<TransactionReceipt | null>(resolve => {
        let n = 0
        const pollReceipt = async () => {
          const receipt = await provider.getTransactionReceipt(response.hash)
          if (receipt) {
            resolve(receipt)
          } else if (n < 100) {
            n++
            setTimeout(pollReceipt, POLL_INTERVAL)
          } else {
            console.warn('Max retries exceeded')
            resolve(null)
          }
        }
        setTimeout(pollReceipt, POLL_INTERVAL)
      })
      console.debug('receipt', receipt)
      console.timeEnd('waitForTransaction')

      if (receipt) {
        if (receipt.status === TransactionStatus.Failure) {
          // ethers.js can't fetch revert data from reverted transactions
          handleError(new Error('Transaction reverted'), {
            ...successOrErrorOptions,
            contract,
            metadata,
            receipt,
            stage: TransactionErrorStage.Reverted,
          })
          return null
        } else {
          if (onComplete) {
            console.time('onComplete')
            await onComplete(receipt)
            console.timeEnd('onComplete')
          }

          postTransactionSuccess(receipt, successOrErrorOptions)

          updateToast(toastId, {
            variant: 'success',
            description: 'Your transaction was successful.',
            href: txHref,
            hrefLabel: 'View on etherscan',
            target: '_blank',
            autoClose: DEFAULT_TOAST_INFO_TIMEOUT,
            icon: IconType.Check,
          })
          return receipt
        }
      } else {
        // Transaction timed out
        updateToast(toastId, {
          variant: 'warning',
          description: 'Your transaction is taking longer than expected.',
          href: txHref,
          hrefLabel: 'View on etherscan',
          target: '_blank',
          autoClose: DEFAULT_TOAST_INFO_TIMEOUT,
          icon: IconType.AlertTriangle,
        })
        return null
      }
    },
    [network, signer, account]
  )
}
