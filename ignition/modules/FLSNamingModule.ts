import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FLSNamingModule = buildModule("FLSNamingModule", (m) => {
  // Gate NFT address - the NFT contract used to gate identity claiming
  const gateNft = m.getParameter(
    "gateNft",
    "0x6cF4328f1Ea83B5d592474F9fCDC714FAAfd1574" // Default to FLS Society on mainnet
  );

  const flsNaming = m.contract("FLSNaming", [gateNft]);
  const renderer = m.contract("TestRenderer");

  m.call(renderer, "setBaseUri", [
    "https://fameladysociety.com/profile/metadata/",
  ]);
  m.call(renderer, "setEmittableMetadata", [flsNaming]);
  m.call(flsNaming, "setRenderer", [renderer]);

  return { flsNaming, renderer };
});

export default FLSNamingModule;
