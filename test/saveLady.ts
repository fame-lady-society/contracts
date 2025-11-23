import hre from "hardhat";
import { ArtifactMap } from "hardhat/types/artifacts";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Hex } from "viem";

import SaveLadyModule from "../ignition/modules/SaveLadyModule.js";
import SeaportModule from "../ignition/modules/SeaportModule.js";

type SeaportInterfaceAbi = ArtifactMap["SeaportInterface"]["abi"];

const SEAPORT_ADDRESS = "0x0000000000000068F116a894984e2DB1123eB395" as const;
const FLS_SQUAD = "0xf3E6DbBE461C6fa492CeA7Cb1f5C5eA660EB1B47" as const;
const FLS_SOCIETY = "0x6cF4328f1Ea83B5d592474F9fCDC714FAAfd1574" as const;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

const { ignition, viem } = await hre.network.connect();
const publicClient = await viem.getPublicClient();
const [deployer, buyer, seller] = await viem.getWalletClients();
async function etchContract(
  contractName: string,
  target: `0x${string}`,
  args: readonly unknown[] = [],
  wallet = deployer,
) {
  const deployed = await viem.deployContract(contractName, [...args], {
    client: { wallet, public: publicClient },
  });

  const testClient = await viem.getTestClient();
  const runtimeCode = await publicClient.getBytecode({
    address: deployed.address,
  });

  assert(runtimeCode, `Missing runtime bytecode for ${contractName}`);

  await testClient.setCode({
    address: target,
    bytecode: runtimeCode as Hex,
  });

  return viem.getContractAt(contractName, target, {
    client: { wallet, public: publicClient },
  });
}

// Build two mock AdvancedOrder objects that match the provided OpenSea API sample.
// These replicate full Seaport AdvancedOrder (numerator=1, denominator=1, extraData empty, signature empty)
// including two consideration items (seller proceeds + protocol fee) and the specified salts & times.
function buildMockAdvancedOrders() {
  return [
    buildFixedPriceOrder({
      tokenId: 3397n,
      proceeds: 9701010000000000n,
      fee: 97990000000000n,
      offerer: "0x805963efd6879d60dec77225e5d1550290807b74" as const,
      salt: BigInt(
        "0x72db8c0b0000000000000000000000000000000000000000da942b6a862ac627",
      ),
      startTime: 1763883026n,
      endTime: 1763886626n,
    }),
    buildFixedPriceOrder({
      tokenId: 887n,
      proceeds: 9702000000000000n,
      fee: 98000000000000n,
      offerer: "0xcfd84fd5854c9eb9d43f87bc043b55219c5fb36d" as const,
      startTime: 1763878624n,
      endTime: 1766470623n,
      orderType: 1,
    }),
  ];
}

/* example batch of 2
{"advancedOrders":[{"parameters":{"offerer":"0x805963efd6879d60dec77225e5d1550290807b74","zone":"0x0000000000000000000000000000000000000000","offer":[{"itemType":2,"token":"0xf3e6dbbe461c6fa492cea7cb1f5c5ea660eb1b47","identifierOrCriteria":"3397","startAmount":"bigint:1","endAmount":"bigint:1"}],"consideration":[{"itemType":0,"token":"0x0000000000000000000000000000000000000000","identifierOrCriteria":"0","startAmount":"bigint:9701010000000000","endAmount":"bigint:9701010000000000","recipient":"0x805963efd6879d60dec77225e5d1550290807b74"},{"itemType":0,"token":"0x0000000000000000000000000000000000000000","identifierOrCriteria":"0","startAmount":"bigint:97990000000000","endAmount":"bigint:97990000000000","recipient":"0x0000a26b00c1f0df003000390027140000faa719"}],"orderType":0,"startTime":1763876301,"endTime":1763879901,"zoneHash":"0x0000000000000000000000000000000000000000000000000000000000000000","salt":"0x72db8c0b0000000000000000000000000000000000000000197b4656362d529d","conduitKey":"0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000","totalOriginalConsiderationItems":2},"numerator":1,"denominator":1,"signature":null,"extraData":"0x"},{"parameters":{"offerer":"0x2ef50c0e4e32737c2514b59ecc8f3c511368b609","zone":"0x0000000000000000000000000000000000000000","offer":[{"itemType":2,"token":"0xf3e6dbbe461c6fa492cea7cb1f5c5ea660eb1b47","identifierOrCriteria":"1661","startAmount":"bigint:1","endAmount":"bigint:1"}],"consideration":[{"itemType":0,"token":"0x0000000000000000000000000000000000000000","identifierOrCriteria":"0","startAmount":"bigint:9702000000000000","endAmount":"bigint:9702000000000000","recipient":"0x2ef50c0e4e32737c2514b59ecc8f3c511368b609"},{"itemType":0,"token":"0x0000000000000000000000000000000000000000","identifierOrCriteria":"0","startAmount":"bigint:98000000000000","endAmount":"bigint:98000000000000","recipient":"0x0000a26b00c1f0df003000390027140000faa719"}],"orderType":0,"startTime":1763808047,"endTime":1764412847,"zoneHash":"0x0000000000000000000000000000000000000000000000000000000000000000","salt":"0x3d958fe20000000000000000000000000000000000000000fe66de5738a3de50","conduitKey":"0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000","totalOriginalConsiderationItems":2},"numerator":1,"denominator":1,"signature":null,"extraData":"0x"}],"tokenIds":["bigint:3397","bigint:1661"],"ethAmounts":["bigint:9799000000000000","bigint:9800000000000000"],"fulfillerConduitKey":"0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000","totalPrice":"bigint:19599000000000000"}
*/
// (Legacy helper left commented for reference)
// function buildFixedPriceOrderBatch() { ... }
// Helper used by sweep test below (single consideration item version)
function buildFixedPriceOrder({
  tokenId,
  proceeds,
  fee,
  offerer,
  startTime,
  endTime,
  orderType,
  salt,
}: {
  tokenId: bigint;
  proceeds: bigint;
  fee: bigint;
  offerer: `0x${string}`;
  startTime?: bigint;
  endTime?: bigint;
  orderType?: number;
  salt?: bigint;
}) {
  return {
    parameters: {
      offerer,
      zone: ZERO_ADDRESS,
      offer: [
        {
          itemType: 2,
          token: FLS_SQUAD,
          identifierOrCriteria: tokenId,
          startAmount: 1n,
          endAmount: 1n,
        },
      ],
      consideration: [
        {
          itemType: 0,
          token: ZERO_ADDRESS,
          identifierOrCriteria: 0n,
          startAmount: proceeds,
          endAmount: proceeds,
          recipient: offerer,
        },
        {
          itemType: 0,
          token: ZERO_ADDRESS,
          identifierOrCriteria: 0n,
          startAmount: fee,
          endAmount: fee,
          recipient: "0x0000a26b00c1f0df003000390027140000faa719" as const,
        },
      ],
      startTime: startTime ?? 1763878624n,
      endTime: endTime ?? 1766470623n,
      orderType: orderType ?? 0,
      zoneHash: ZERO_BYTES32,
      salt: salt ?? 0n,
      conduitKey:
        "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000" as const,
      totalOriginalConsiderationItems: 2n,
      counter: 0n,
    },
    numerator: 1n,
    denominator: 1n,
    signature: "0x",
    extraData: "0x",
  } as const;
}

describe("SaveLady", async function () {
  it("Should be usable via proxy", async function () {
    const { saveLady } = await ignition.deploy(SaveLadyModule);

    assert.equal(await saveLady.read.FEE_BPS(), 250n);
  });

  it("computes expected order hashes for mock OpenSea orders", async function () {
    const { ignition, viem } = await hre.network.connect();
    // const { seaport } = await ignition.deploy(SeaportModule);
    const seaport = await viem.getContractAt<"SeaportInterface">(
      "SeaportInterface",
      SEAPORT_ADDRESS,
    );

    const mockOrders = buildMockAdvancedOrders();

    // Expected hashes from sample JSON
    const expectedHashes = [
      "0x97e47f1566e738bd74b0db84302a9bceaebc714f76710d608fb981865e9be886",
      "0xc3f1c369096b94af40338be4e0f3dc9342f4cd26ff031fc2743b2861d5649d23",
    ] as const;

    const orderHash = await seaport.read.getOrderHash([
      mockOrders[1].parameters,
    ]);
    assert.equal(
      orderHash,
      expectedHashes[1],
      `order hash mismatch for index 1`,
    );

    for (let i = 0; i < mockOrders.length; i++) {
      const p = mockOrders[i].parameters;
      // Seaport getOrderHash expects OrderComponents (parameters + counter)
      // const orderHash = await seaport.read.getOrderHash([
      //   {
      //     offerer: p.offerer,
      //     zone: p.zone,
      //     offer: p.offer,
      //     consideration: p.consideration,
      //     orderType: p.orderType,
      //     startTime: p.startTime,
      //     endTime: p.endTime,
      //     zoneHash: p.zoneHash,
      //     salt: p.salt,
      //     conduitKey: p.conduitKey,
      //     counter: 0n, // From sample JSON
      //   },
      // ]);
      const [isValidated, isCancelled, totalFilled, totalSize] =
        await seaport.read.getOrderStatus([expectedHashes[i]]);
      const orderHash = await seaport.read.getOrderHash([p]);
      assert.equal(
        orderHash,
        expectedHashes[i],
        `order hash mismatch for index ${i}`,
      );

      assert.equal(isValidated, false, `isValidated mismatch for index ${i}`);
      assert.equal(isCancelled, false, `isCancelled mismatch for index ${i}`);
      assert.equal(totalFilled, 0n, `totalFilled mismatch for index ${i}`);
      assert.equal(totalSize, 1n, `totalSize mismatch for index ${i}`);
    }
  });

  it("sweeps multiple orders and forwards full wrap cost", async function () {
    const seaport = await etchContract("MockSeaport", SEAPORT_ADDRESS);
    const squad = await etchContract("MockFameLadySquad", FLS_SQUAD);
    const society = await etchContract("MockFameLadySociety", FLS_SOCIETY, [
      FLS_SQUAD,
    ]);

    const wrapCost = 1_000_000_000_000_000n; // 0.001 ETH
    await society.write.setWrapCost([wrapCost]);

    const tokenIds = [50001n, 50002n] as const;
    const salePrices = [
      7_500_000_000_000_000n,
      6_000_000_000_000_000n,
    ] as const;

    const sellerClientContract = await viem.getContractAt(
      "MockFameLadySquad",
      FLS_SQUAD,
      { client: { wallet: seller, public: publicClient } },
    );

    await sellerClientContract.write.mint([
      seller.account.address,
      tokenIds[0],
    ]);
    await sellerClientContract.write.mint([
      seller.account.address,
      tokenIds[1],
    ]);
    await sellerClientContract.write.setApprovalForAll([SEAPORT_ADDRESS, true]);

    const advancedOrders = [
      buildFixedPriceOrder({
        tokenId: tokenIds[0],
        proceeds: salePrices[0],
        fee: salePrices[0] / 100n,
        offerer: seller.account.address,
      }),
      buildFixedPriceOrder({
        tokenId: tokenIds[1],
        proceeds: salePrices[1],
        fee: salePrices[1] / 100n,
        offerer: seller.account.address,
      }),
    ] as const;

    const ethAmounts = [...salePrices];
    const totalPrice = salePrices[0] + salePrices[1];
    const totalWrap = wrapCost * BigInt(tokenIds.length);
    const fee = ((totalPrice + totalWrap) * 250n) / 10_000n;
    const totalValue = totalPrice + totalWrap + fee;

    const { saveLady } = await ignition.deploy(SaveLadyModule);
    await saveLady.write.initialize();

    await saveLady.write.sweepAndWrap(
      [advancedOrders, ZERO_BYTES32, tokenIds, ethAmounts],
      { account: buyer.account.address, value: totalValue },
    );

    const societyReader = await viem.getContractAt(
      "MockFameLadySociety",
      FLS_SOCIETY,
    );

    assert.equal(
      (await societyReader.read.wrappedOwner([tokenIds[0]])).toLowerCase(),
      buyer.account.address.toLowerCase(),
    );
    assert.equal(
      (await societyReader.read.wrappedOwner([tokenIds[1]])).toLowerCase(),
      buyer.account.address.toLowerCase(),
    );

    const balance = await publicClient.getBalance({
      address: saveLady.address,
    });
    assert.equal(balance, 0n);

    // avoid unused variable errors
    assert.ok(seaport);
    assert.ok(squad);
  });
});
