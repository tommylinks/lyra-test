import CardBody from '@lyra/ui/components/Card/CardBody'
import Center from '@lyra/ui/components/Center'
import Spinner from '@lyra/ui/components/Spinner'
import Text from '@lyra/ui/components/Text'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import PositionHistoryTable from '@/app/components/common/PositionHistoryTable'
import { PageId } from '@/app/constants/pages'
import withSuspense from '@/app/hooks/data/withSuspense'
import usePositionHistory from '@/app/hooks/position/usePositionHistory'
import getPagePath from '@/app/utils/getPagePath'

const TradePositionHistoryTable = withSuspense(
  () => {
    const positions = usePositionHistory()
    const navigate = useNavigate()
    if (!positions.length) {
      return (
        <CardBody>
          <Text variant="small" color="secondaryText">
            You have no closed positions.
          </Text>
        </CardBody>
      )
    }
    return (
      <PositionHistoryTable
        positions={positions}
        onClick={position =>
          navigate(
            getPagePath({
              page: PageId.Position,
              network: position.lyra.network,
              positionId: position.id,
              marketAddressOrName: position.marketName,
            })
          )
        }
        pageSize={5}
      />
    )
  },
  () => (
    <CardBody flexGrow={1} height={450}>
      <Center width="100%" height="100%">
        <Spinner />
      </Center>
    </CardBody>
  )
)

export default TradePositionHistoryTable
