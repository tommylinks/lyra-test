import { BigNumber } from '@ethersproject/bignumber'
import CardSection from '@lyra/ui/components/Card/CardSection'
import CardSeparator from '@lyra/ui/components/Card/CardSeparator'
import Center from '@lyra/ui/components/Center'
import Spinner from '@lyra/ui/components/Spinner'
import Text from '@lyra/ui/components/Text'
import formatBalance from '@lyra/ui/utils/formatBalance'
import formatUSD from '@lyra/ui/utils/formatUSD'
import { Market, Option, Position } from '@lyrafinance/lyra-js'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import AmountUpdateText from '@/app/components/common/AmountUpdateText'
import RowItem from '@/app/components/common/RowItem'
import { ZERO_ADDRESS, ZERO_BN } from '@/app/constants/bn'
import { SLIPPAGE } from '@/app/constants/contracts'
import { TRADE_CARD_MIN_HEIGHT } from '@/app/constants/layout'
import TradeFormSizeInput from '@/app/containers/trade/TradeForm/TradeFormSizeInput'
import useAccountBalances from '@/app/hooks/account/useAccountBalances'
import useWalletAccount from '@/app/hooks/account/useWalletAccount'
import withSuspense from '@/app/hooks/data/withSuspense'
import useTradeSync from '@/app/hooks/market/useTradeSync'
import useReferrerAttribution from '@/app/hooks/referrals/useReferrerAttribution'
import formatTokenName from '@/app/utils/formatTokenName'
import fromBigNumber from '@/app/utils/fromBigNumber'
import getDefaultQuoteSize from '@/app/utils/getDefaultQuoteSize'

import TradeFormButton from './TradeFormButton'
import TradeFormCollateralSection from './TradeFormCollateralSection'
import TradeFormPayoffSection from './TradeFormPayoffSection'

type Props = {
  isBuy: boolean
  option: Option
  position?: Position | null
  hideTitle?: boolean
  onTrade?: (market: Market, positionId: number) => void
}

const TradeForm = withSuspense(
  ({ isBuy, option, position, onTrade, hideTitle }: Props) => {
    const account = useWalletAccount()
    const market = option.market()

    // TODO: @dappbeast parallelize requests
    const balances = useAccountBalances(market)
    const referrerAddress = useReferrerAttribution(account ?? ZERO_ADDRESS)

    const isLong = position ? position.isLong : isBuy

    const [isCoveredCall, setIsCoveredCall] = useState(position ? !!position.collateral?.isBase : false)

    const quoteBalance = balances.quoteAsset
    const baseBalance = balances.baseAsset
    const isBaseCollateral = isCoveredCall
    const showBaseBalance = isBaseCollateral && !isLong && option.isCall

    const [size, setSize] = useState<BigNumber>(ZERO_BN)

    // Default to 1.0 contracts for new position, 0.0 for modifying a position
    const sizeWithDefaults = size.gt(0) ? size : !position ? getDefaultQuoteSize(market.name) : ZERO_BN

    const [collateralAmount, setCollateralAmount] = useState<BigNumber>(ZERO_BN)

    // Reset to default collateral
    const resetCollateralAmount = useCallback(() => {
      setCollateralAmount(ZERO_BN) // Triggers default fallback
    }, [])

    // Reset size + collateral inputs when option changes
    const strikeId = option.strike().id
    const marketAddress = option.market().address
    const isCall = option.isCall
    const positionId = position?.id
    useEffect(() => {
      setSize(ZERO_BN)
      resetCollateralAmount()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [strikeId, marketAddress, isBuy, isCall, isCoveredCall, positionId])

    const handleTrade = useCallback(
      (market: Market, positionId: number) => {
        setSize(ZERO_BN)
        resetCollateralAmount()
        if (onTrade) {
          onTrade(market, positionId)
        }
      },
      [onTrade, resetCollateralAmount]
    )

    // Trade with placeholder size, collateral
    const trade = useTradeSync({
      option,
      position,
      balances,
      isBuy,
      size: sizeWithDefaults,
      setToCollateral: collateralAmount,
      isBaseCollateral,
      // TODO: @dappbeast make slippage configurable
      slippage: SLIPPAGE,
      referrer: !!referrerAddress ? referrerAddress : undefined,
    })

    const pnl = useMemo(() => trade.pnl(), [trade])

    return (
      <>
        <CardSection>
          {!hideTitle ? (
            <Text mb={6} variant="cardHeading">
              {isBuy ? 'Buy' : 'Sell'} {formatTokenName(option.market().baseToken)}{' '}
              {formatUSD(option.strike().strikePrice)} {option.isCall ? 'Call' : 'Put'}
            </Text>
          ) : null}
          {position ? (
            <RowItem
              label="Position"
              value={
                <AmountUpdateText
                  color={position.isLong ? 'primaryText' : 'errorText'}
                  prefix={position.isLong ? 'Long' : 'Short'}
                  prevAmount={position.size}
                  newAmount={trade.newSize}
                />
              }
              mb={6}
            />
          ) : null}
          <RowItem
            label="Contracts"
            value={<TradeFormSizeInput width="60%" trade={trade} size={size} onChangeSize={setSize} />}
            mb={5}
          />
          <RowItem
            label="Price Per Option"
            value={trade.pricePerOption.isZero() && trade.isDisabled ? '-' : formatUSD(trade.pricePerOption)}
            valueColor={trade.pricePerOption.isZero() && trade.isDisabled ? 'secondaryText' : 'text'}
          />
        </CardSection>
        <CardSeparator />
        {!isLong && trade.collateral ? (
          <>
            <TradeFormCollateralSection
              key={fromBigNumber(collateralAmount)}
              trade={trade}
              collateral={trade.collateral}
              collateralAmount={collateralAmount}
              onChangeCollateralAmount={setCollateralAmount}
              onToggleCoveredCall={setIsCoveredCall}
            />
            <CardSeparator />
          </>
        ) : null}
        <CardSection>
          <RowItem
            mb={5}
            label={trade.isBuy ? 'Max Cost' : 'Min Received'}
            valueColor={trade.premium.gt(0) || !trade.isDisabled ? 'text' : 'secondaryText'}
            value={
              trade.premium.gt(0) || !trade.isDisabled
                ? formatBalance(
                    { amount: trade.premium, symbol: trade.quoteToken.symbol, decimals: 18 },
                    { showDollars: true }
                  )
                : '-'
            }
          />
          {trade.forceClosePenalty.gt(0) ? (
            <RowItem
              label="Force Close Penalty"
              valueColor="warningText"
              value={formatUSD(trade.forceClosePenalty)}
              mb={5}
            />
          ) : null}
          <RowItem
            mb={5}
            label="Balance"
            value={
              <AmountUpdateText
                textAlign="right"
                prevAmount={
                  showBaseBalance
                    ? fromBigNumber(baseBalance.balance, baseBalance.decimals)
                    : fromBigNumber(quoteBalance.balance, quoteBalance.decimals)
                }
                newAmount={
                  showBaseBalance
                    ? fromBigNumber(
                        baseBalance.balance.sub(trade.baseToken.transfer).add(trade.baseToken.receive),
                        baseBalance.decimals
                      )
                    : fromBigNumber(
                        quoteBalance.balance.sub(trade.quoteToken.transfer).add(trade.quoteToken.receive),
                        quoteBalance.decimals
                      )
                }
                isUSDFormat={!showBaseBalance}
                symbol={showBaseBalance ? trade.baseToken.symbol : trade.quoteToken.symbol}
              />
            }
          />
          {!trade.isOpen ? (
            <RowItem
              mb={5}
              label="Profit / Loss"
              value={pnl.isZero() ? '-' : formatUSD(pnl, { showSign: true })}
              valueColor={pnl.isZero() ? 'secondaryText' : pnl.gt(0) ? 'primaryText' : 'errorText'}
            />
          ) : null}
          <TradeFormButton mt={3} width="100%" trade={trade} onTrade={handleTrade} />
        </CardSection>
        {!position && (
          <>
            <CardSeparator />
            <TradeFormPayoffSection trade={trade} />
          </>
        )}
      </>
    )
  },
  () => (
    <CardSection height={TRADE_CARD_MIN_HEIGHT}>
      <Center width="100%" flexGrow={1}>
        <Spinner />
      </Center>
    </CardSection>
  )
)

export default TradeForm
