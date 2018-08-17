/**
 * Deployer is used for deploying new KyberNetwork reserve contracts.
 * It deployed all requires smart contracts for running a reserve:
 * <ul>
 *   <li>reserve</li>
 *   <li>conversionRates</li>
 *   <li>sanityRates (optional)</li>
 * </ul>
 */
class Deployer {
  /**
   * Create a deployer instance with given account parameter.
   * @param {object} provider - Web3 provider
   */
  constructor(provider) {}

  /**
   * Deploy new reserver and pricing contracts.
   * @param {object} account - Web3 account to create the smart contracts
   * @param {string} network - Address of KyberNetwork smart contract.
   * @param {boolean} [deploySanityRates=false] - If true, deploySanityRates contract will be deployed.
   * @return {Addresses} - Deployed reserve addresses set.
   */
  deploy(account, network, deploySanityRates) {}
}
