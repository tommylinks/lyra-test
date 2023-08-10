import Button from '@lyra/ui/components/Button'
import Flex from '@lyra/ui/components/Flex'
import ButtonShimmer from '@lyra/ui/components/Shimmer/ButtonShimmer'
import useIsDarkMode from '@lyra/ui/hooks/useIsDarkMode'
import { Network } from '@lyrafinance/lyra-js'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import React, { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutProps, MarginProps } from 'styled-system'

import Avatar from '@/app/components/common/Avatar'
import NetworkDropdownButton from '@/app/components/common/NetworkDropdownButton/NetworkDropdownButton'
import { LOCAL_STORAGE_DEFAULT_NETWORK_KEY } from '@/app/constants/localStorage'
import { PageId } from '@/app/constants/pages'
import useENS from '@/app/hooks/account/useENS'
import useNetwork from '@/app/hooks/account/useNetwork'
import useWallet from '@/app/hooks/account/useWallet'
import withSuspense from '@/app/hooks/data/withSuspense'
import useLocalStorage from '@/app/hooks/local_storage/useLocalStorage'
import formatTruncatedAddress from '@/app/utils/formatTruncatedAddress'
import { getChainIdForNetwork } from '@/app/utils/getChainIdForNetwork'
import { getDefaultMarket } from '@/app/utils/getDefaultMarket'
import { getNavPageFromPath } from '@/app/utils/getNavPageFromPath'
import getPagePath from '@/app/utils/getPagePath'

import ConnectWalletButton from '../ConnectWalletButton'

type Props = Omit<LayoutProps, 'size'> & MarginProps

const AccountButton = withSuspense(
  ({ ...styleProps }: Props) => {
    const [isDarkMode] = useIsDarkMode()
    const { chainId, account, isLoading, isConnected, isOverride, removeSeeAddress, switchNetwork } = useWallet()
    const ens = useENS()
    const network = useNetwork()
    const [_1, setDefaultNetwork] = useLocalStorage(LOCAL_STORAGE_DEFAULT_NETWORK_KEY)

    const getButtonLabel = useCallback(() => {
      const accountStr = account ? formatTruncatedAddress(account) : ''
      if (isOverride && account) {
        return formatTruncatedAddress(account)
      } else {
        return ens?.name ?? accountStr
      }
    }, [account, isOverride, ens])

    const { pathname } = useLocation()
    const navigate = useNavigate()

    const rootPage = getNavPageFromPath(pathname)

    const handleSelectNetwork = useCallback(
      async (newNetwork: Network) => {
        const newChainId = getChainIdForNetwork(newNetwork)
        if (newChainId !== chainId) {
          if (isConnected && !isOverride) {
            await switchNetwork(newChainId)
          } else {
            setDefaultNetwork(newNetwork)
          }
          if (rootPage === PageId.Trade) {
            navigate(
              getPagePath({
                page: PageId.Trade,
                network: newNetwork,
                marketAddressOrName: getDefaultMarket(newNetwork),
              })
            )
          } else if (rootPage === PageId.Leaderboard) {
            navigate(getPagePath({ page: PageId.Leaderboard, network: newNetwork }))
          }
        }
      },
      [chainId, isConnected, isOverride, navigate, rootPage, setDefaultNetwork, switchNetwork]
    )

    return (
      <Flex {...styleProps}>
        <NetworkDropdownButton selectedNetwork={network} onSelectNetwork={handleSelectNetwork} mr={2} />
        {account ? (
          <ConnectButton.Custom>
            {({ openAccountModal }) => {
              const variant = isOverride ? 'warning' : isDarkMode ? 'static' : 'white'
              const onClick = async () => {
                if (isOverride) {
                  // Unset override
                  removeSeeAddress()
                } else if (account) {
                  openAccountModal()
                }
              }
              return (
                <Button
                  rightIconSpacing={1}
                  rightIcon={<Avatar size={18} ensImage={ens?.avatarURL} address={account} />}
                  isLoading={isLoading}
                  variant={variant}
                  label={getButtonLabel()}
                  onClick={onClick}
                />
              )
            }}
          </ConnectButton.Custom>
        ) : (
          <ConnectWalletButton network={network} {...styleProps} />
        )}
      </Flex>
    )
  },
  ({ ...styleProps }: Props) => (
    <Flex {...styleProps}>
      <ButtonShimmer width={[62, 136.37]} mr={2} />
      <ButtonShimmer width={138.84} />
    </Flex>
  )
)

export default AccountButton
