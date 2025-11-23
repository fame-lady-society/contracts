import type { ArtifactMap } from "hardhat/types/artifacts";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SEAPORT_ADDRESS = "0x0000000000000068F116a894984e2DB1123eB395" as const;

export type SeaportInterfaceAbi = ArtifactMap["SeaportInterface"]["abi"];

export default buildModule("SeaportModule", (m) => {
  const seaport = m.contractAt("SeaportInterface", SEAPORT_ADDRESS);
  return { seaport };
});
