import { BigNumber } from '@ethersproject/bignumber'
import Box from '@lyra/ui/components/Box'
import Flex from '@lyra/ui/components/Flex'
import Text from '@lyra/ui/components/Text'
import formatNumber from '@lyra/ui/utils/formatNumber'
import React from 'react'

import fromBigNumber from '@/app/utils/fromBigNumber'

type Props = {
  boardId: BigNumber
  strikePrice: BigNumber
  skew: BigNumber
}

const AdminAddStrikeToBoardTransactionListItem = ({ boardId, strikePrice, skew }: Props) => {
  return (
    <Box>
      <Flex>
        <Text color="secondaryText">Board ID:</Text>
        <Text ml={1} color="secondaryText">
          {boardId.toNumber()}
        </Text>
      </Flex>
      <Flex>
        <Text color="secondaryText">Strike:</Text>
        <Text ml={1} color="secondaryText">
          {fromBigNumber(strikePrice)}
        </Text>
      </Flex>
      <Flex>
        <Text color="secondaryText">Skew:</Text>
        <Text ml={1} color="secondaryText">
          {formatNumber(skew)}
        </Text>
      </Flex>
    </Box>
  )
}

export default AdminAddStrikeToBoardTransactionListItem
