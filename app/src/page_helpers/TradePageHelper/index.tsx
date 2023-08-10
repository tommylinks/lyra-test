import Box from '@lyra/ui/components/Box'
import Button from '@lyra/ui/components/Button'
import Card from '@lyra/ui/components/Card'
import CardBody from '@lyra/ui/components/Card/CardBody'
import CardSeparator from '@lyra/ui/components/Card/CardSeparator'
import Center from '@lyra/ui/components/Center'
import Flex from '@lyra/ui/components/Flex'
import Icon, { IconType } from '@lyra/ui/components/Icon'
import Text from '@lyra/ui/components/Text'
import useIsMobile from '@lyra/ui/hooks/useIsMobile'
import { Market, Option, Position } from '@lyrafinance/lyra-js'
import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DESKTOP_HEADER_NAV_HEIGHT, TRADE_CARD_MIN_HEIGHT, TRADE_CARD_MIN_WIDTH } from '@/app/constants/layout'
import { PageId } from '@/app/constants/pages'
import TradeAdvancedBoardCard from '@/app/containers/trade/TradeAdvancedBoardCard'
import TradeAnnouncementHeaderCard from '@/app/containers/trade/TradeAnnouncementHeaderCard'
import TradeForm from '@/app/containers/trade/TradeForm'
import TradeFormModal from '@/app/containers/trade/TradeFormModal'
import TradeMarketDropdown from '@/app/containers/trade/TradeMarketDropdown'
import TradePositionsCard from '@/app/containers/trade/TradePositionsCard'
import TradePriceCard from '@/app/containers/trade/TradePriceCard'
import TradeSimpleBoardCard from '@/app/containers/trade/TradeSimpleBoardCard'
import useAnnouncements from '@/app/hooks/local_storage/useAnnouncements'
import useTraderSettings from '@/app/hooks/local_storage/useTraderSettings'
import useSelectedBoardSync from '@/app/hooks/market/useSelectedBoardSync'
import getPagePath from '@/app/utils/getPagePath'

import Page from '../common/Page'
import PageGrid from '../common/Page/PageGrid'

type Props = {
  markets: Market[]
  selectedMarket: Market
  openPositions: Position[]
}

export default function TradePageHelper({ markets, selectedMarket, openPositions }: Props): JSX.Element {
  const isMobile = useIsMobile()
  const [selectedStrikeId, setSelectedStrikeId] = useState<number | null>(null)
  const [selectedBoard, setSelectedBoard] = useSelectedBoardSync(selectedMarket) // sync hook
  const [isCall, setIsCall] = useState(true)
  const [isBuy, setIsBuy] = useState(true)
  const [traderSettings, setTraderSettings] = useTraderSettings()
  const selectedOption = selectedStrikeId !== null ? selectedMarket.liveOption(selectedStrikeId, isCall) : null

  const { isAdvancedMode, advancedHideChart } = traderSettings

  const navigate = useNavigate()

  const handleTrade = useCallback(
    (market: Market, positionId: number) => {
      setSelectedStrikeId(null)
      if (isAdvancedMode) {
        window.scrollBy({ top: document.body.scrollHeight })
      } else {
        navigate(
          getPagePath({
            page: PageId.Position,
            network: market.lyra.network,
            marketAddressOrName: market.name,
            positionId,
          })
        )
      }
    },
    [navigate, setSelectedStrikeId, isAdvancedMode]
  )

  const handleChangeMarket = useCallback(
    (newMarket: Market) => {
      if (newMarket.address !== selectedMarket.address) {
        // Reset selected board + option when market changes
        setSelectedBoard(null)
        setSelectedStrikeId(null)
        navigate(
          getPagePath({
            page: PageId.Trade,
            network: newMarket.lyra.network,
            marketAddressOrName: newMarket.name,
          })
        )
      }
    },
    [navigate, selectedMarket, setSelectedBoard]
  )

  const handleSelectOption = useCallback(
    (newOption: Option) => {
      const isSelect = selectedStrikeId !== newOption?.strike().id
      if (isSelect && newOption) {
        setSelectedStrikeId(newOption.strike().id)
      } else {
        setSelectedStrikeId(null)
      }
    },
    [selectedStrikeId]
  )

  const handleSelectChainOption = useCallback(
    (newOption: Option, newIsBuy: boolean, newIsCall: boolean) => {
      const isSelect = selectedStrikeId !== newOption.strike().id || newIsBuy !== isBuy || newIsCall !== isCall
      setIsBuy(newIsBuy)
      setIsCall(newIsCall)
      if (isSelect) {
        setSelectedStrikeId(newOption.strike().id)
      } else {
        setSelectedStrikeId(null)
      }
    },
    [isCall, isBuy, selectedStrikeId]
  )

  const handleToggleBuy = useCallback((newIsBuy: boolean) => {
    setIsBuy(newIsBuy)
  }, [])

  const handleChangeAdvancedMode = useCallback(
    (newIsAdvancedMode: boolean) => {
      setTraderSettings({
        isAdvancedMode: newIsAdvancedMode,
      })
    },
    [setTraderSettings]
  )

  const selectedPosition = useMemo(() => {
    if (selectedOption) {
      return openPositions.find(
        p =>
          p.marketAddress === selectedMarket.address &&
          p.strikeId === selectedStrikeId &&
          p.isCall === selectedOption.isCall
      )
    }
  }, [openPositions, selectedMarket.address, selectedOption, selectedStrikeId])

  const { announcements } = useAnnouncements(selectedMarket.block.timestamp)

  return (
    <Page
      headerCard={
        announcements.length > 0 && isMobile ? (
          <TradeAnnouncementHeaderCard blockTimestamp={selectedMarket.block.timestamp} />
        ) : undefined
      }
      isFullWidth={isAdvancedMode}
    >
      <PageGrid
        rightColumn={
          <Box minWidth={TRADE_CARD_MIN_WIDTH} maxWidth={TRADE_CARD_MIN_WIDTH}>
            <Box
              minWidth={TRADE_CARD_MIN_WIDTH}
              maxWidth={TRADE_CARD_MIN_WIDTH}
              sx={{ position: 'sticky', top: DESKTOP_HEADER_NAV_HEIGHT }}
              pb={12}
            >
              {selectedOption ? (
                <Card width="100%">
                  <TradeForm isBuy={isBuy} option={selectedOption} onTrade={handleTrade} position={selectedPosition} />
                </Card>
              ) : (
                <>
                  <Card mb={6} width="100%" minHeight={TRADE_CARD_MIN_HEIGHT}>
                    <CardBody flexGrow={1}>
                      <Text variant="cardHeading">Select Option</Text>
                      <Center flexGrow={1} flexDirection="column">
                        <Icon icon={IconType.PlusCircle} color="disabledText" size={64} strokeWidth={0.5} />
                        <Text mt={4} color="secondaryText">
                          Select an option
                        </Text>
                      </Center>
                    </CardBody>
                  </Card>
                  <TradeAnnouncementHeaderCard blockTimestamp={selectedMarket.block.timestamp} />
                </>
              )}
            </Box>
          </Box>
        }
      >
        <Flex>
          <TradeMarketDropdown markets={markets} onChangeMarket={handleChangeMarket} selectedMarket={selectedMarket} />
          {!isMobile ? (
            <Flex ml="auto" alignItems="center">
              <Button
                isTransparent={isAdvancedMode}
                label="Simple"
                variant={isAdvancedMode ? 'light' : 'default'}
                onClick={() => handleChangeAdvancedMode(false)}
              />
              <Button
                ml={2}
                isTransparent={!isAdvancedMode}
                label="Advanced"
                variant={isAdvancedMode ? 'default' : 'light'}
                onClick={() => handleChangeAdvancedMode(true)}
              />
              {isAdvancedMode ? (
                <Button
                  ml={4}
                  label={advancedHideChart ? 'View chart' : 'Hide chart'}
                  rightIcon={advancedHideChart ? IconType.Maximize2 : IconType.Minimize2}
                  width={115}
                  rightIconSpacing={1}
                  onClick={() => setTraderSettings({ advancedHideChart: !advancedHideChart })}
                />
              ) : null}
            </Flex>
          ) : null}
        </Flex>
        <Card>
          <TradePriceCard market={selectedMarket} />
          <CardSeparator />
          <TradePositionsCard openPositions={openPositions} />
          <CardSeparator />
          {!isAdvancedMode || isMobile ? (
            <TradeSimpleBoardCard
              isCall={isCall}
              onToggleCall={newIsCall => {
                if (newIsCall !== isCall) {
                  // Reset selected option
                  setSelectedStrikeId(null)
                }
                setIsCall(newIsCall)
              }}
              isBuy={isBuy}
              onToggleBuy={handleToggleBuy}
              market={selectedMarket}
              selectedBoard={selectedBoard}
              onSelectBoard={newBoard => {
                if (newBoard.id !== selectedBoard?.id) {
                  // Reset selected option
                  setSelectedStrikeId(null)
                }
                setSelectedBoard(newBoard)
              }}
              selectedOption={selectedOption}
              onSelectOption={handleSelectOption}
            />
          ) : (
            <TradeAdvancedBoardCard
              market={selectedMarket}
              selectedOption={selectedOption}
              onSelectOption={handleSelectChainOption}
              isBuy={isBuy}
            />
          )}
        </Card>
        {selectedOption && isMobile ? (
          <TradeFormModal
            isOpen
            onClose={() => setSelectedStrikeId(null)}
            onTrade={() => setSelectedStrikeId(null)}
            option={selectedOption}
            position={selectedPosition}
            isBuy={isBuy}
          />
        ) : null}
      </PageGrid>
    </Page>
  )
}
