import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import ProxyModule from "./ProxyModule.js";

export default buildModule("UpgradeModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const { proxyAdmin, proxy } = m.useModule(ProxyModule);

  const saveLady = m.contract("SaveLady");

  m.call(proxyAdmin, "upgradeAndCall", [proxy, saveLady, "0x"], {
    from: proxyAdminOwner,
  });

  return { proxyAdmin, proxy, saveLady };
});
