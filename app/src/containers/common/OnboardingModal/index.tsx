import Box from '@lyra/ui/components/Box'
import Button from '@lyra/ui/components/Button'
import Center from '@lyra/ui/components/Center'
import Flex from '@lyra/ui/components/Flex'
import Modal from '@lyra/ui/components/Modal'
import ModalBody from '@lyra/ui/components/Modal/ModalBody'
import Spinner from '@lyra/ui/components/Spinner'
import Text from '@lyra/ui/components/Text'
import { Network } from '@lyrafinance/lyra-js'
import { BigNumber } from 'ethers'
import React, { useState } from 'react'
import { useEffect } from 'react'

import SocketBridge from '@/app/components/common/SocketBridge'
import { LogEvent } from '@/app/constants/logEvents'
import useEthBalance from '@/app/hooks/account/useEthBalance'
import useWallet from '@/app/hooks/account/useWallet'
import withSuspense from '@/app/hooks/data/withSuspense'
import { getChainIdForNetwork } from '@/app/utils/getChainIdForNetwork'
import getNetworkDisplayName from '@/app/utils/getNetworkDisplayName'
import logEvent from '@/app/utils/logEvent'

const SOCKET_NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export type ToToken = { address: string; balance: BigNumber; symbol: string; network: Network }

type Props = {
  isOpen: boolean
  onClose: () => void
  toToken: ToToken
  context: string
}

const OnboardingModalBody = withSuspense(
  ({
    toToken,
    onClose,
    isGetETHStep,
    onChangeStep,
    context,
  }: Props & { isGetETHStep: boolean; onChangeStep: (isGetETHStep: boolean) => void }) => {
    const ethBalance = useEthBalance(toToken.network)
    useEffect(() => {
      if (ethBalance.isZero()) {
        onChangeStep(true)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const toTokenBalance = toToken.balance
    const { chainId } = useWallet()
    const toChainId = getChainIdForNetwork(toToken.network)
    return (
      <ModalBody height={660}>
        <Text variant="small" mb={6} color="secondaryText">
          {isGetETHStep
            ? `You need ETH to transact on ${getNetworkDisplayName(
                toToken.network
              )}. You can deposit ETH from another network, or from an exchange.`
            : `You need ${toToken.symbol} to ${context}. Bridge and swap your tokens to ${toToken.symbol} via Socket to continue.`}
        </Text>
        <Box mb={6} width="100%" height={460}>
          {isGetETHStep ? (
            <SocketBridge
              key="bridge"
              title="Bridge"
              defaultSourceNetwork={1}
              destNetworks={[toChainId]}
              defaultDestToken={SOCKET_NATIVE_TOKEN_ADDRESS}
            />
          ) : (
            <SocketBridge
              key="swap"
              title="Swap"
              defaultSourceNetwork={chainId}
              destNetworks={[toChainId]}
              defaultDestToken={toToken.address}
            />
          )}
        </Box>
        <Flex mt="auto">
          <Button
            width="100%"
            size="lg"
            label={isGetETHStep ? 'Cancel' : 'Previous Step'}
            onClick={() => {
              if (isGetETHStep) {
                logEvent(LogEvent.OnboardingModalStepOneCancelClick)
                onClose()
              } else {
                logEvent(LogEvent.OnboardingModalStepTwoCancelClick)
                onChangeStep(true)
              }
            }}
            variant="default"
          />
          <Button
            ml={4}
            width="100%"
            size="lg"
            label={isGetETHStep ? 'Next Step' : 'Done'}
            onClick={() => {
              if (isGetETHStep) {
                logEvent(LogEvent.OnboardingModalStepOneSuccessClick)
                onChangeStep(false)
              } else {
                logEvent(LogEvent.OnboardingModalStepTwoSuccessClick)
                onClose()
              }
            }}
            variant="primary"
            isDisabled={isGetETHStep ? ethBalance.isZero() : toTokenBalance.isZero()}
          />
        </Flex>
      </ModalBody>
    )
  },
  () => (
    <ModalBody height={660}>
      <Center height="100%" width="100%">
        <Spinner />
      </Center>
    </ModalBody>
  )
)

export default function OnboardingModal(props: Props): JSX.Element {
  const { isOpen, onClose, toToken } = props
  const [isGetETHStep, setIsGetETHStep] = useState(false)
  const { network } = toToken
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <Box>
          <Text variant="small" color="secondaryText">
            Step {isGetETHStep ? '1' : '2'} of 2
          </Text>
          <Text variant="cardHeading">
            {isGetETHStep ? `Bridge ETH to ${getNetworkDisplayName(network)}` : `Swap to ${toToken.symbol}`}
          </Text>
        </Box>
      }
    >
      <OnboardingModalBody isGetETHStep={isGetETHStep} onChangeStep={setIsGetETHStep} {...props} />
    </Modal>
  )
}
