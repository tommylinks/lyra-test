import Box from '@lyra/ui/components/Box'
import List, { ListElement } from '@lyra/ui/components/List'
import ListItem from '@lyra/ui/components/List/ListItem'
import Text from '@lyra/ui/components/Text'
import formatBalance from '@lyra/ui/utils/formatBalance'
import formatDuration from '@lyra/ui/utils/formatDuration'
import React from 'react'

import MarketLabelProgress from '../MarketLabelProgress'
import VaultsCircuitBreakerToken from '../VaultsCircuitBreakerToken'
import { VaultsPendingWithdrawalsTableOrListProps } from '.'

const VaultsPendingWithdrawalsListMobile = ({
  withdrawals,
  onClick,
  ...styleProps
}: VaultsPendingWithdrawalsTableOrListProps): ListElement => {
  return (
    <List {...styleProps}>
      {withdrawals.map(withdrawal => {
        const market = withdrawal.market()
        const currentTimestamp = market.block.timestamp
        const duration = market.params.withdrawalDelay
        const startTimestamp = withdrawal.withdrawalRequestedTimestamp
        const progressDuration = Math.min(Math.max(currentTimestamp - startTimestamp, 0), duration)
        const progressPct = duration > 0 ? progressDuration / duration : 0
        const delayReason = withdrawal.delayReason
        return (
          <ListItem
            key={`${withdrawal.queueId}-${market.address}`}
            label={<MarketLabelProgress market={market} progress={progressPct} color="secondary" />}
            onClick={onClick ? () => onClick(withdrawal) : undefined}
            rightContent={
              <Box textAlign="right">
                <Text>{formatBalance({ amount: withdrawal.balance, ...market.liquidityToken })}</Text>
                {!delayReason ? (
                  <Text variant="small" color="secondaryText">
                    in {formatDuration(Math.max(0, withdrawal.withdrawalTimestamp - market.block.timestamp))}
                  </Text>
                ) : (
                  <VaultsCircuitBreakerToken delayReason={delayReason} />
                )}
              </Box>
            }
          />
        )
      })}
    </List>
  )
}

export default VaultsPendingWithdrawalsListMobile
