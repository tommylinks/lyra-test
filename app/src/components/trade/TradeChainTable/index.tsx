import Box from '@lyra/ui/components/Box'
import Flex from '@lyra/ui/components/Flex'
import Table, { TableCellProps, TableColumn } from '@lyra/ui/components/Table'
import Text from '@lyra/ui/components/Text'
import formatNumber from '@lyra/ui/utils/formatNumber'
import formatPercentage from '@lyra/ui/utils/formatPercentage'
import formatTruncatedUSD from '@lyra/ui/utils/formatTruncatedUSD'
import formatUSD from '@lyra/ui/utils/formatUSD'
import { Board, Option, Strike } from '@lyrafinance/lyra-js'
import React, { useMemo } from 'react'

import { UNIT } from '@/app/constants/bn'
import {
  TRADE_CHAIN_PRICE_COL_WIDTH,
  TRADE_CHAIN_STAT_COL_WIDTH,
  TRADE_CHAIN_STRIKE_COL_WIDTH,
} from '@/app/constants/layout'
import { OptionChainTableData } from '@/app/containers/trade/TradeAdvancedBoardCard'
import { CustomColumnOption } from '@/app/hooks/local_storage/useTraderSettings'
import useBoardQuotesSync from '@/app/hooks/market/useBoardQuotesSync'
import filterNulls from '@/app/utils/filterNulls'
import formatTokenName from '@/app/utils/formatTokenName'
import fromBigNumber from '@/app/utils/fromBigNumber'
import getDefaultQuoteSize from '@/app/utils/getDefaultQuoteSize'

import TradeBoardNoticeSection from '../TradeBoardNoticeSection'
import TradeChainPriceButton from './TradeChainPriceButton'

const renderCustomColumn = (strike: Strike | null, customCol: CustomColumnOption, isCall: boolean) => {
  if (!strike) {
    return '0'
  }
  switch (customCol) {
    case CustomColumnOption.IV:
      return formatPercentage(fromBigNumber(strike.iv), true)
    case CustomColumnOption.Gamma:
    case CustomColumnOption.Vega:
      return formatNumber(strike[customCol])
    case CustomColumnOption.Delta:
    case CustomColumnOption.Theta:
      return formatNumber(isCall ? strike.call()[customCol] : strike.put()[customCol])
    case CustomColumnOption.OI: {
      const option = isCall ? strike.call() : strike.put()
      return formatTruncatedUSD(
        option.longOpenInterest.add(option.shortOpenInterest).mul(option.market().spotPrice).div(UNIT)
      )
    }
  }
}

type Props = {
  board: Board
  selectedOption: Option | null
  isBuy: boolean
  customCol1: CustomColumnOption
  customCol2: CustomColumnOption
  onSelectOption: (option: Option, isBuy: boolean, isCall: boolean) => void
}

type OptionData = Omit<OptionChainTableData, 'isExpanded'>

const TradeChainTable = ({ board, selectedOption, onSelectOption, isBuy, customCol1, customCol2 }: Props) => {
  const size = getDefaultQuoteSize(board.market().name ?? '') // defaults to one
  const isCall = selectedOption?.isCall ?? true
  const market = board.market()
  const spotPrice = fromBigNumber(market.spotPrice)
  const columns = useMemo<TableColumn<OptionData>[]>(
    () => [
      {
        accessor: 'strike',
        id: `custom-col-1-left`,
        width: TRADE_CHAIN_STAT_COL_WIDTH,
        Cell: (props: TableCellProps<OptionData>) => {
          const { strike } = props.row.original
          return <Text>{renderCustomColumn(strike, customCol1, true)}</Text>
        },
      },
      {
        accessor: 'strike',
        id: `custom-col-2-left`,
        width: TRADE_CHAIN_STAT_COL_WIDTH,
        Cell: (props: TableCellProps<OptionData>) => {
          const { strike } = props.row.original
          return <Text>{renderCustomColumn(strike, customCol2, true)}</Text>
        },
      },
      {
        accessor: 'callBid',
        Header: 'Bid',
        disableSortBy: true,
        width: TRADE_CHAIN_PRICE_COL_WIDTH,
        Cell: (props: TableCellProps<OptionData>) => {
          const { callBid } = props.row.original
          const isSelected = selectedOption?.strike().id === callBid?.strikeId && isCall && !isBuy
          return (
            <TradeChainPriceButton
              quote={callBid}
              isSelected={isSelected}
              onSelected={() => {
                if (callBid) {
                  onSelectOption(callBid.option(), false, callBid.option().isCall)
                }
              }}
            />
          )
        },
      },
      {
        accessor: 'callAsk',
        Header: 'Ask',
        disableSortBy: true,
        width: TRADE_CHAIN_PRICE_COL_WIDTH,
        Cell: (props: TableCellProps<OptionData>) => {
          const { callAsk } = props.row.original
          const isSelected = selectedOption?.strike().id === callAsk?.strikeId && isCall && isBuy
          return (
            <TradeChainPriceButton
              quote={callAsk}
              isSelected={isSelected}
              onSelected={() => {
                if (callAsk) {
                  onSelectOption(callAsk.option(), true, callAsk.option().isCall)
                }
              }}
            />
          )
        },
      },
      {
        accessor: 'strikePrice',
        Header: 'Expiry / Strike',
        headerAlign: 'center',
        width: TRADE_CHAIN_STRIKE_COL_WIDTH,
        disableSortBy: true,
        Cell: (props: TableCellProps<OptionData>) => (
          <Flex width="100%" justifyContent="center">
            <Text>{props.cell.value > 0 ? formatUSD(props.cell.value, { dps: 2 }) : '-'}</Text>
          </Flex>
        ),
      },
      {
        accessor: 'putBid',
        Header: 'Bid',
        disableSortBy: true,
        width: TRADE_CHAIN_PRICE_COL_WIDTH,
        Cell: (props: TableCellProps<OptionData>) => {
          const { putBid } = props.row.original
          const isSelected = selectedOption?.strike().id === putBid?.strikeId && !isCall && !isBuy
          return (
            <TradeChainPriceButton
              quote={putBid}
              isSelected={isSelected}
              onSelected={() => {
                if (putBid) {
                  onSelectOption(putBid.option(), false, false)
                }
              }}
            />
          )
        },
      },
      {
        accessor: 'putAsk',
        Header: 'Ask',
        disableSortBy: true,
        width: TRADE_CHAIN_PRICE_COL_WIDTH,
        Cell: (props: TableCellProps<OptionData>) => {
          const { putAsk } = props.row.original
          const isSelected = selectedOption?.strike().id === putAsk?.strikeId && !isCall && isBuy
          return (
            <TradeChainPriceButton
              quote={putAsk}
              isSelected={isSelected}
              onSelected={() => {
                if (putAsk) {
                  onSelectOption(putAsk.option(), true, false)
                }
              }}
            />
          )
        },
      },
      {
        accessor: 'strike',
        id: 'custom-col-2-right',
        width: TRADE_CHAIN_STAT_COL_WIDTH,
        Cell: (props: TableCellProps<OptionData>) => {
          const { strike } = props.row.original
          return <Text>{renderCustomColumn(strike, customCol2, false)}</Text>
        },
      },
      {
        accessor: 'strike',
        id: `custom-col-1-right`,
        width: TRADE_CHAIN_STAT_COL_WIDTH,
        Cell: (props: TableCellProps<OptionData>) => {
          const { strike } = props.row.original
          return <Text>{renderCustomColumn(strike, customCol1, false)}</Text>
        },
      },
    ],
    [customCol1, customCol2, selectedOption, isCall, isBuy, onSelectOption]
  )

  const quotes = useBoardQuotesSync(board, size)

  const filteredQuotes = useMemo(() => {
    return filterNulls(
      quotes.filter(({ callBid, callAsk, putBid, putAsk }) => !!callBid || !!callAsk || !!putBid || !!putAsk)
    )
  }, [quotes])

  const rows: OptionData[] = useMemo(
    () =>
      filterNulls(
        filteredQuotes.map(({ callBid, callAsk, putBid, putAsk, strike }) => ({
          callBid,
          callAsk,
          putBid,
          putAsk,
          strikePrice: fromBigNumber(strike.strikePrice),
          strike: strike,
          expiry: board.expiryTimestamp,
          noExpandedPadding: true,
        }))
      ).sort((a, b) => a.strikePrice - b.strikePrice),
    [board.expiryTimestamp, filteredQuotes]
  )

  const spotPriceMarker = useMemo(() => {
    const spotPriceRowIdx = rows.reduce(
      (markerIdx, row) => (row.strikePrice && spotPrice < row.strikePrice ? markerIdx : markerIdx + 1),
      0
    )
    return {
      rowIdx: spotPriceRowIdx,
      content: (
        <Flex sx={{ position: 'relative' }} alignItems="center" justifyContent="center" width="100%">
          <Box sx={{ position: 'absolute', right: 0, left: 0, top: '18px', height: '4px', bg: 'cardHoverBg' }} />
          <Flex
            mx={[2, 3]}
            px={[1, 3]}
            my={1}
            py={1}
            bg="cardHoverBg"
            sx={{ borderRadius: 'list', position: 'relative', zIndex: 1 }}
          >
            <Text variant="small">
              {formatTokenName(board.market().baseToken)} Price:{' '}
              <Text as="span" color="primaryText">
                {formatUSD(spotPrice)}
              </Text>
            </Text>
          </Flex>
        </Flex>
      ),
    }
  }, [board, rows, spotPrice])

  return (
    <>
      <TradeBoardNoticeSection m={6} board={board} quotes={filteredQuotes} />
      <Table hideHeader columns={columns} data={rows} tableRowMarker={spotPriceMarker} />
    </>
  )
}

export default TradeChainTable
