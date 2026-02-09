import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NamedLadyRendererV2Module = buildModule(
  "NamedLadyRendererV2Module",
  (m) => {
    const baseURI = m.getParameter(
      "baseURI",
      "https://example.com/fls-named-metadata/",
    );
    const originalBaseURI = m.getParameter(
      "originalBaseURI",
      "https://example.com/fls-original-metadata/",
    );
    const emitableNft = m.getParameter(
      "emitableNft",
      "0x6cF4328f1Ea83B5d592474F9fCDC714FAAfd1574",
    );
    const signer = m.getParameter(
      "signer",
      "0x0000000000000000000000000000000000000000",
    );

    const renderer = m.contract("NamedLadyRendererV2", [
      baseURI,
      originalBaseURI,
      emitableNft,
      signer,
    ]);

    const fls = m.contractAt("FameLadySociety", emitableNft);
    m.call(fls, "setRenderer", [renderer]);

    return { renderer };
  },
);

export default NamedLadyRendererV2Module;
