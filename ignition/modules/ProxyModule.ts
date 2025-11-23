import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProxyModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const saveLady = m.contract("SaveLady");

  const proxy = m.contract("TransparentUpgradeableProxy", [
    saveLady,
    proxyAdminOwner,
    "0x",
  ]);

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin",
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { proxyAdmin, proxy };
});
