import { Option, Quote, Strike } from '@lyrafinance/lyra-js'

import {
  ArrakisPoolL1,
  ArrakisPoolL2,
  ArrakisStakingRewards,
  CamelotNitroPool,
  CamelotPool,
  LongExecutor,
  LyraGovernanceStrategy,
  LyraGovernanceV2,
  Multicall3,
  ShortExecutor,
  TransferEth,
  VelodromePool,
  VelodromeStaking,
  VestingEscrow,
  VestingEscrowFactory,
} from '../contracts/typechain'
import { LyraStaking } from '../contracts/typechain/LyraStaking'
import { ONE_BN } from './bn'

export const MIN_COLLATERAL_BUFFER = 1.05 // 5% buffer
export const CASH_SECURED_CALL_MAX_COLLATERAL_BUFFER = 2.5 // 250% of default for cash-secured calls
export const MAX_IV = ONE_BN.mul(5) // 500%
export const MIN_DIST_TO_LIQUIDATION_PRICE = 0.01
export const ERROR_DIST_TO_LIQUIDATION_PRICE = 0.015
export const WARNING_DIST_TO_LIQUIDATION_PRICE = 0.025
export const MAX_UTILIZATION = 0.975

export const ITERATIONS = 3
export const SLIPPAGE = 1.5 / 100 // 1.5%

export type StrikeQuotesNullable = {
  callBid: Quote | null
  callAsk: Quote | null
  putBid: Quote | null
  putAsk: Quote | null
  strike: Strike
}

export type OptionQuotesNullable = {
  bid: Quote | null
  ask: Quote | null
  option: Option
}

export enum ContractId {
  ArrakisPoolL1 = 'ArrakisPoolL1',
  ArrakisPoolL2 = 'ArrakisPoolL2',
  ArrakisStakingRewards = 'ArrakisStakingRewards',
  ArrakisOpStakingRewards = 'ArrakisOpStakingRewards',
  CamelotPool = 'CamelotPool',
  CamelotNitroPool = 'CamelotNitroPool',
  Multicall3 = 'Multicall3',
  VelodromePool = 'VelodromePool',
  VelodromeStaking = 'VelodromeStaking',
  VestingEscrowFactory1 = 'VestingEscrowFactory1',
  VestingEscrowFactory2 = 'VestingEscrowFactory2',
  VestingEscrow = 'VestingEscrow',
  ShortExecutor = 'ShortExecutor',
  LongExecutor = 'LongExecutor',
  LyraGovernanceStrategy = 'LyraGovernanceStrategy',
  LyraGovernanceV2 = 'LyraGovernanceV2',
  TransferEth = 'TransferEth',
  LyraStaking = 'LyraStaking',
}

export type ContractMap = {
  [ContractId.ArrakisPoolL1]: ArrakisPoolL1
  [ContractId.ArrakisPoolL2]: ArrakisPoolL2
  [ContractId.ArrakisStakingRewards]: ArrakisStakingRewards
  [ContractId.ArrakisOpStakingRewards]: ArrakisStakingRewards
  [ContractId.CamelotPool]: CamelotPool
  [ContractId.CamelotNitroPool]: CamelotNitroPool
  [ContractId.Multicall3]: Multicall3
  [ContractId.VelodromePool]: VelodromePool
  [ContractId.VelodromeStaking]: VelodromeStaking
  [ContractId.VestingEscrowFactory1]: VestingEscrowFactory
  [ContractId.VestingEscrowFactory2]: VestingEscrowFactory
  [ContractId.VestingEscrow]: VestingEscrow
  [ContractId.ShortExecutor]: ShortExecutor
  [ContractId.LongExecutor]: LongExecutor
  [ContractId.LyraGovernanceStrategy]: LyraGovernanceStrategy
  [ContractId.LyraGovernanceV2]: LyraGovernanceV2
  [ContractId.TransferEth]: TransferEth
  [ContractId.LyraStaking]: LyraStaking
}
