import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FLSNamingTestModule = buildModule("FLSNamingTestModule", (m) => {
  // Gate NFT address - the NFT contract used to gate identity claiming
  const gateNft = m.getParameter(
    "gateNft",
    "0x4E6bB6d251db23dc0855D53B09da0d4E7049B354" // Default to test society on sepolia
  );

  // const gateNft = m.contract("BulkMinter", [
  //   "Test NFT",
  //   "TEST",
  //   "https://example.com/",
  // ]);
  const flsNamingTest = m.contract("FLSNaming", [gateNft]);
  const renderer = m.contract("TestRenderer");

  m.call(renderer, "setBaseUri", [
    "https://fameladysociety.com/profile/metadata/",
  ]);
  m.call(renderer, "setEmittableMetadata", [flsNamingTest]);
  m.call(flsNamingTest, "setRenderer", [renderer]);

  return { flsNamingTest, renderer };
});

export default FLSNamingTestModule;
