/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface TestRendererInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "emitMetadata"
      | "setBaseUri"
      | "setEmittableMetadata"
      | "tokenURI"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "emitMetadata",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "setBaseUri", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setEmittableMetadata",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenURI",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "emitMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setBaseUri", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setEmittableMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tokenURI", data: BytesLike): Result;
}

export interface TestRenderer extends BaseContract {
  connect(runner?: ContractRunner | null): TestRenderer;
  waitForDeployment(): Promise<this>;

  interface: TestRendererInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  emitMetadata: TypedContractMethod<
    [tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;

  setBaseUri: TypedContractMethod<[_baseUri: string], [void], "nonpayable">;

  setEmittableMetadata: TypedContractMethod<
    [_emitableMetadata: AddressLike],
    [void],
    "nonpayable"
  >;

  tokenURI: TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "emitMetadata"
  ): TypedContractMethod<[tokenId: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setBaseUri"
  ): TypedContractMethod<[_baseUri: string], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setEmittableMetadata"
  ): TypedContractMethod<
    [_emitableMetadata: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "tokenURI"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  filters: {};
}