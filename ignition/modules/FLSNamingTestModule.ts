import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FLSNamingTestModule = buildModule("FLSNamingTestModule", (m) => {
  // Gate NFT address - the NFT contract used to gate identity claiming
  // const gateNft = m.getParameter(
  //   "gateNft",
  //   "0x9EFf37047657a0f50b989165b48012834eDB2212" // Default to test society on sepolia
  // );

  const gateNft = m.contract("BulkMinter", [
    "Test NFT",
    "TEST",
    "https://example.com/",
  ]);
  const flsNamingTest = m.contract("FLSNaming", [gateNft]);

  return { flsNamingTest, gateNft };
});

export default FLSNamingTestModule;
