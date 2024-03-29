/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export interface LyraGovernanceStrategyInterface extends utils.Interface {
  functions: {
    "LYRA()": FunctionFragment;
    "STK_LYRA()": FunctionFragment;
    "getPropositionPowerAt(address,uint256)": FunctionFragment;
    "getTotalPropositionSupplyAt(uint256)": FunctionFragment;
    "getTotalVotingSupplyAt(uint256)": FunctionFragment;
    "getVotingPowerAt(address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "LYRA"
      | "STK_LYRA"
      | "getPropositionPowerAt"
      | "getTotalPropositionSupplyAt"
      | "getTotalVotingSupplyAt"
      | "getVotingPowerAt"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "LYRA", values?: undefined): string;
  encodeFunctionData(functionFragment: "STK_LYRA", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getPropositionPowerAt",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getTotalPropositionSupplyAt",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getTotalVotingSupplyAt",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getVotingPowerAt",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "LYRA", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "STK_LYRA", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPropositionPowerAt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTotalPropositionSupplyAt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTotalVotingSupplyAt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getVotingPowerAt",
    data: BytesLike
  ): Result;

  events: {};
}

export interface LyraGovernanceStrategy extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: LyraGovernanceStrategyInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    LYRA(overrides?: CallOverrides): Promise<[string]>;

    STK_LYRA(overrides?: CallOverrides): Promise<[string]>;

    getPropositionPowerAt(
      user: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getTotalPropositionSupplyAt(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getTotalVotingSupplyAt(
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getVotingPowerAt(
      user: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  LYRA(overrides?: CallOverrides): Promise<string>;

  STK_LYRA(overrides?: CallOverrides): Promise<string>;

  getPropositionPowerAt(
    user: PromiseOrValue<string>,
    blockNumber: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getTotalPropositionSupplyAt(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getTotalVotingSupplyAt(
    blockNumber: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getVotingPowerAt(
    user: PromiseOrValue<string>,
    blockNumber: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    LYRA(overrides?: CallOverrides): Promise<string>;

    STK_LYRA(overrides?: CallOverrides): Promise<string>;

    getPropositionPowerAt(
      user: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTotalPropositionSupplyAt(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTotalVotingSupplyAt(
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getVotingPowerAt(
      user: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    LYRA(overrides?: CallOverrides): Promise<BigNumber>;

    STK_LYRA(overrides?: CallOverrides): Promise<BigNumber>;

    getPropositionPowerAt(
      user: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTotalPropositionSupplyAt(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTotalVotingSupplyAt(
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getVotingPowerAt(
      user: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    LYRA(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    STK_LYRA(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getPropositionPowerAt(
      user: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTotalPropositionSupplyAt(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTotalVotingSupplyAt(
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getVotingPowerAt(
      user: PromiseOrValue<string>,
      blockNumber: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
