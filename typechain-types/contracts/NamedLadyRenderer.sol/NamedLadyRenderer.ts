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
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface NamedLadyRendererInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "ban"
      | "cancelOwnershipHandover"
      | "completeOwnershipHandover"
      | "currentNonce"
      | "grantRoles"
      | "hasAllRoles"
      | "hasAnyRole"
      | "hashUpdateRequest"
      | "metadataEmit"
      | "metadataRole"
      | "owner"
      | "ownershipHandoverExpiresAt"
      | "renounceOwnership"
      | "renounceRoles"
      | "requestOwnershipHandover"
      | "revokeRoles"
      | "rolesOf"
      | "setBaseURI"
      | "setSigner"
      | "setTokenUri"
      | "signerRole"
      | "tokenURI"
      | "transferOwnership"
      | "trustRole"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "OwnershipHandoverCanceled"
      | "OwnershipHandoverRequested"
      | "OwnershipTransferred"
      | "RolesUpdated"
  ): EventFragment;

  encodeFunctionData(functionFragment: "ban", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "cancelOwnershipHandover",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "completeOwnershipHandover",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "currentNonce",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "grantRoles",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "hasAllRoles",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "hasAnyRole",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "hashUpdateRequest",
    values: [BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "metadataEmit",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "metadataRole",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "ownershipHandoverExpiresAt",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceRoles",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "requestOwnershipHandover",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "revokeRoles",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "rolesOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "setBaseURI", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setSigner",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setTokenUri",
    values: [BigNumberish, string, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "signerRole",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "tokenURI",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "trustRole", values?: undefined): string;

  decodeFunctionResult(functionFragment: "ban", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "cancelOwnershipHandover",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "completeOwnershipHandover",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "currentNonce",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRoles", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "hasAllRoles",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "hasAnyRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "hashUpdateRequest",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "metadataEmit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "metadataRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "ownershipHandoverExpiresAt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceRoles",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "requestOwnershipHandover",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "revokeRoles",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "rolesOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setBaseURI", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setSigner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setTokenUri",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "signerRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tokenURI", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "trustRole", data: BytesLike): Result;
}

export namespace OwnershipHandoverCanceledEvent {
  export type InputTuple = [pendingOwner: AddressLike];
  export type OutputTuple = [pendingOwner: string];
  export interface OutputObject {
    pendingOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipHandoverRequestedEvent {
  export type InputTuple = [pendingOwner: AddressLike];
  export type OutputTuple = [pendingOwner: string];
  export interface OutputObject {
    pendingOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [oldOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [oldOwner: string, newOwner: string];
  export interface OutputObject {
    oldOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RolesUpdatedEvent {
  export type InputTuple = [user: AddressLike, roles: BigNumberish];
  export type OutputTuple = [user: string, roles: bigint];
  export interface OutputObject {
    user: string;
    roles: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface NamedLadyRenderer extends BaseContract {
  connect(runner?: ContractRunner | null): NamedLadyRenderer;
  waitForDeployment(): Promise<this>;

  interface: NamedLadyRendererInterface;

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

  ban: TypedContractMethod<[tokenId: BigNumberish], [void], "nonpayable">;

  cancelOwnershipHandover: TypedContractMethod<[], [void], "payable">;

  completeOwnershipHandover: TypedContractMethod<
    [pendingOwner: AddressLike],
    [void],
    "payable"
  >;

  currentNonce: TypedContractMethod<[sender: AddressLike], [bigint], "view">;

  grantRoles: TypedContractMethod<
    [user: AddressLike, roles: BigNumberish],
    [void],
    "payable"
  >;

  hasAllRoles: TypedContractMethod<
    [user: AddressLike, roles: BigNumberish],
    [boolean],
    "view"
  >;

  hasAnyRole: TypedContractMethod<
    [user: AddressLike, roles: BigNumberish],
    [boolean],
    "view"
  >;

  hashUpdateRequest: TypedContractMethod<
    [tokenId: BigNumberish, uri: string, nonce: BigNumberish],
    [string],
    "view"
  >;

  metadataEmit: TypedContractMethod<[], [string], "view">;

  metadataRole: TypedContractMethod<[], [bigint], "view">;

  owner: TypedContractMethod<[], [string], "view">;

  ownershipHandoverExpiresAt: TypedContractMethod<
    [pendingOwner: AddressLike],
    [bigint],
    "view"
  >;

  renounceOwnership: TypedContractMethod<[], [void], "payable">;

  renounceRoles: TypedContractMethod<[roles: BigNumberish], [void], "payable">;

  requestOwnershipHandover: TypedContractMethod<[], [void], "payable">;

  revokeRoles: TypedContractMethod<
    [user: AddressLike, roles: BigNumberish],
    [void],
    "payable"
  >;

  rolesOf: TypedContractMethod<[user: AddressLike], [bigint], "view">;

  setBaseURI: TypedContractMethod<[_baseURI: string], [void], "nonpayable">;

  setSigner: TypedContractMethod<[_signer: AddressLike], [void], "nonpayable">;

  setTokenUri: TypedContractMethod<
    [tokenId: BigNumberish, uri: string, signature: BytesLike],
    [void],
    "nonpayable"
  >;

  signerRole: TypedContractMethod<[], [bigint], "view">;

  tokenURI: TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "payable"
  >;

  trustRole: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "ban"
  ): TypedContractMethod<[tokenId: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "cancelOwnershipHandover"
  ): TypedContractMethod<[], [void], "payable">;
  getFunction(
    nameOrSignature: "completeOwnershipHandover"
  ): TypedContractMethod<[pendingOwner: AddressLike], [void], "payable">;
  getFunction(
    nameOrSignature: "currentNonce"
  ): TypedContractMethod<[sender: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "grantRoles"
  ): TypedContractMethod<
    [user: AddressLike, roles: BigNumberish],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "hasAllRoles"
  ): TypedContractMethod<
    [user: AddressLike, roles: BigNumberish],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "hasAnyRole"
  ): TypedContractMethod<
    [user: AddressLike, roles: BigNumberish],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "hashUpdateRequest"
  ): TypedContractMethod<
    [tokenId: BigNumberish, uri: string, nonce: BigNumberish],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "metadataEmit"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "metadataRole"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "ownershipHandoverExpiresAt"
  ): TypedContractMethod<[pendingOwner: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "payable">;
  getFunction(
    nameOrSignature: "renounceRoles"
  ): TypedContractMethod<[roles: BigNumberish], [void], "payable">;
  getFunction(
    nameOrSignature: "requestOwnershipHandover"
  ): TypedContractMethod<[], [void], "payable">;
  getFunction(
    nameOrSignature: "revokeRoles"
  ): TypedContractMethod<
    [user: AddressLike, roles: BigNumberish],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "rolesOf"
  ): TypedContractMethod<[user: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "setBaseURI"
  ): TypedContractMethod<[_baseURI: string], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setSigner"
  ): TypedContractMethod<[_signer: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setTokenUri"
  ): TypedContractMethod<
    [tokenId: BigNumberish, uri: string, signature: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "signerRole"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "tokenURI"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "payable">;
  getFunction(
    nameOrSignature: "trustRole"
  ): TypedContractMethod<[], [bigint], "view">;

  getEvent(
    key: "OwnershipHandoverCanceled"
  ): TypedContractEvent<
    OwnershipHandoverCanceledEvent.InputTuple,
    OwnershipHandoverCanceledEvent.OutputTuple,
    OwnershipHandoverCanceledEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipHandoverRequested"
  ): TypedContractEvent<
    OwnershipHandoverRequestedEvent.InputTuple,
    OwnershipHandoverRequestedEvent.OutputTuple,
    OwnershipHandoverRequestedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "RolesUpdated"
  ): TypedContractEvent<
    RolesUpdatedEvent.InputTuple,
    RolesUpdatedEvent.OutputTuple,
    RolesUpdatedEvent.OutputObject
  >;

  filters: {
    "OwnershipHandoverCanceled(address)": TypedContractEvent<
      OwnershipHandoverCanceledEvent.InputTuple,
      OwnershipHandoverCanceledEvent.OutputTuple,
      OwnershipHandoverCanceledEvent.OutputObject
    >;
    OwnershipHandoverCanceled: TypedContractEvent<
      OwnershipHandoverCanceledEvent.InputTuple,
      OwnershipHandoverCanceledEvent.OutputTuple,
      OwnershipHandoverCanceledEvent.OutputObject
    >;

    "OwnershipHandoverRequested(address)": TypedContractEvent<
      OwnershipHandoverRequestedEvent.InputTuple,
      OwnershipHandoverRequestedEvent.OutputTuple,
      OwnershipHandoverRequestedEvent.OutputObject
    >;
    OwnershipHandoverRequested: TypedContractEvent<
      OwnershipHandoverRequestedEvent.InputTuple,
      OwnershipHandoverRequestedEvent.OutputTuple,
      OwnershipHandoverRequestedEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "RolesUpdated(address,uint256)": TypedContractEvent<
      RolesUpdatedEvent.InputTuple,
      RolesUpdatedEvent.OutputTuple,
      RolesUpdatedEvent.OutputObject
    >;
    RolesUpdated: TypedContractEvent<
      RolesUpdatedEvent.InputTuple,
      RolesUpdatedEvent.OutputTuple,
      RolesUpdatedEvent.OutputObject
    >;
  };
}