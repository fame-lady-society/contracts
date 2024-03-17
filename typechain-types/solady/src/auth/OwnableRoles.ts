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
} from "../../../common";

export interface OwnableRolesInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "cancelOwnershipHandover"
      | "completeOwnershipHandover"
      | "grantRoles"
      | "hasAllRoles"
      | "hasAnyRole"
      | "owner"
      | "ownershipHandoverExpiresAt"
      | "renounceOwnership"
      | "renounceRoles"
      | "requestOwnershipHandover"
      | "revokeRoles"
      | "rolesOf"
      | "transferOwnership"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "OwnershipHandoverCanceled"
      | "OwnershipHandoverRequested"
      | "OwnershipTransferred"
      | "RolesUpdated"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "cancelOwnershipHandover",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "completeOwnershipHandover",
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
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "cancelOwnershipHandover",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "completeOwnershipHandover",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRoles", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "hasAllRoles",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "hasAnyRole", data: BytesLike): Result;
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
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
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

export interface OwnableRoles extends BaseContract {
  connect(runner?: ContractRunner | null): OwnableRoles;
  waitForDeployment(): Promise<this>;

  interface: OwnableRolesInterface;

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

  cancelOwnershipHandover: TypedContractMethod<[], [void], "payable">;

  completeOwnershipHandover: TypedContractMethod<
    [pendingOwner: AddressLike],
    [void],
    "payable"
  >;

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

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "payable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "cancelOwnershipHandover"
  ): TypedContractMethod<[], [void], "payable">;
  getFunction(
    nameOrSignature: "completeOwnershipHandover"
  ): TypedContractMethod<[pendingOwner: AddressLike], [void], "payable">;
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
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "payable">;

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