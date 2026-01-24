function environmentFetcher(envName: string, optional: boolean = false) {
  return (networkName: string): string => {
    networkName = networkName.toUpperCase();
    const value = process.env[`${networkName}_${envName}`] ?? process.env[envName];
    
    if (!value && !optional) {
      throw new Error(`Missing ${networkName}_${envName}`);
    }
    
    return value ?? "";
  };
}

export const envDeploymentKeyFile = environmentFetcher("DEPLOYMENT_KEY_FILE", true);
export const envDeploymentKeyPassword = environmentFetcher(
  "DEPLOYMENT_KEY_PASSWORD",
  true,
);
export const envBaseURI = environmentFetcher("BASE_URI", true);
export const envTestName = environmentFetcher("TEST_NAME", true);
export const envTestSymbol = environmentFetcher("TEST_SYMBOL", true);
export const envWrappedTokenAddress = environmentFetcher("WRAPPED_TOKEN", true);
export const envWrappedTokenName = environmentFetcher("WRAPPED_TOKEN_NAME", true);
export const envWrappedTokenSymbol = environmentFetcher("WRAPPED_TOKEN_SYMBOL", true);
export const envWrappedTokenRendererAddress = environmentFetcher(
  "WRAPPED_TOKEN_RENDERER",
  true,
);
export const envRpc = environmentFetcher("RPC", true);
export const envEtherscanApiKey = environmentFetcher("ETHERSCAN_API_KEY", true);
export const envSignerPrivateKey = environmentFetcher("SIGNER_PRIVATE_KEY", true);
