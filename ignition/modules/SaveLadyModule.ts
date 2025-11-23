import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ProxyModule from "./ProxyModule.js";

export default buildModule("SaveLadyModule", (m) => {
  const { proxy, proxyAdmin } = m.useModule(ProxyModule);

  const saveLady = m.contractAt("SaveLady", proxy);

  return { saveLady, proxy, proxyAdmin };
});
