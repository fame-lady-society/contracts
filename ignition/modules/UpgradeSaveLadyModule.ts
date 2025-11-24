import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import ProxyModule from "./ProxyModule.js";

export default buildModule("UpgradeModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const { proxyAdmin, proxy } = m.useModule(ProxyModule);

  const saveLady = m.contract("SaveLady");

  // Call the upgrade-time initializer to set proxy storage ownership.
  const encodedFunctionCall = m.encodeFunctionCall(saveLady, "upgradeInit", [
    proxyAdminOwner,
  ]);

  m.call(proxyAdmin, "upgradeAndCall", [proxy, saveLady, encodedFunctionCall], {
    from: proxyAdminOwner,
  });

  return { proxyAdmin, proxy, saveLady };
});
