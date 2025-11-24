import hre from "hardhat";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import SaveLadyModule from "../ignition/modules/SaveLadyModule.js";

const SEAPORT_ADDRESS = "0x0000000000000068F116a894984e2DB1123eB395" as const;
const FLS_SQUAD = "0xf3E6DbBE461C6fa492CeA7Cb1f5C5eA660EB1B47" as const;
const FLS_SOCIETY = "0x6cF4328f1Ea83B5d592474F9fCDC714FAAfd1574" as const;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

const { ignition, viem } = await hre.network.connect();
const publicClient = await viem.getPublicClient();
const [buyer] = await viem.getWalletClients();

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
      salt: 0x72db8c0b0000000000000000000000000000000000000000099a7a4860269428n,
      startTime: 1763916631n,
      endTime: 1763920231n,
      signature:
        "0x274b008b46929365f3a96652ba1281d5054d428e725be72707c42a5a12c761172b358536fbcf86687140b09c94444b258d674efa89d8215b747d1f543e7e2b53",
    }),
    buildFixedPriceOrder({
      tokenId: 887n,
      proceeds: 9702000000000000n,
      fee: 98000000000000n,
      offerer: "0xcfd84fd5854c9eb9d43f87bc043b55219c5fb36d" as const,
      startTime: 1763878624n,
      endTime: 1766470623n,
      orderType: 1,
      signature:
        "0x35ea9ccfa19838ca3eea5f35296984be2040eed32a205c547e5f8ff59b3f69f0afec30de496da795d8384a7e95013159672d6f568ee0af26113aeea1ebc9f851",
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
  signature,
}: {
  tokenId: bigint;
  proceeds: bigint;
  fee: bigint;
  offerer: `0x${string}`;
  startTime?: bigint;
  endTime?: bigint;
  orderType?: number;
  salt?: bigint;
  signature?: `0x${string}`;
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
    },
    numerator: 1n,
    denominator: 1n,
    signature: signature ?? "0x",
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
    const seaport = await viem.getContractAt<"SeaportInterface">(
      "SeaportInterface",
      SEAPORT_ADDRESS,
    );

    const mockOrders = buildMockAdvancedOrders();

    for (let i = 0; i < mockOrders.length; i++) {
      const p = mockOrders[i].parameters;
      const counter = await seaport.read.getCounter([p.offerer]);
      const orderHash = await seaport.read.getOrderHash([{ ...p, counter }]);
      const [isValidated, isCancelled, totalFilled, totalSize] =
        await seaport.read.getOrderStatus([orderHash]);

      // assert.notEqual(orderHash, ZERO_BYTES32, `zero order hash for ${i}`);
      assert.equal(
        orderHash,
        i === 0
          ? "0x948e255213dbddf1724351ad9bbbe4f0c9569e2b522e3bb493ab5c76e696483b"
          : "0x6d1ab4950efd6db639fba9b67f3e0e45f32f6de074e5670ffbd3c253cd4e49bf",
        `orderHash mismatch for index ${i}`,
      );
      assert.equal(isValidated, false, `isValidated mismatch for index ${i}`);
      assert.equal(isCancelled, false, `isCancelled mismatch for index ${i}`);
      assert.equal(totalFilled, 0n, `totalFilled mismatch for index ${i}`);
    }
  });

  it("sweeps multiple orders and forwards full wrap cost", async function () {
    const { ignition, viem } = await hre.network.connect();
    const society = await viem.getContractAt<"FameLadySociety">(
      "FameLadySociety",
      FLS_SOCIETY,
    );
    const squad = await viem.getContractAt<"FameLadySquad">(
      "FameLadySquad",
      FLS_SQUAD,
    );
    const seaport = await viem.getContractAt<"SeaportInterface">(
      "SeaportInterface",
      SEAPORT_ADDRESS,
    );

    const advancedOrders = buildMockAdvancedOrders();
    // add up parameter.startAmount for each consideration and each order
    const salePrices = advancedOrders.map((ao) =>
      ao.parameters.consideration.reduce((sum, c) => sum + c.startAmount, 0n),
    );
    const tokenIds = advancedOrders.map(
      (ao) => ao.parameters.offer[0].identifierOrCriteria,
    );
    const wrapCost = await society.read.wrapCost();

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

    assert.equal(
      (await society.read.ownerOf([tokenIds[0]])).toLowerCase(),
      buyer.account.address.toLowerCase(),
    );
    assert.equal(
      (await society.read.ownerOf([tokenIds[1]])).toLowerCase(),
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
