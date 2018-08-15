/**
 * Addresses contains addresses of all contracts of a KyberNetwork reserve.
 */
class Addresses {
  get sanityRates() {
    return this._sanityRates;
  }

  set sanityRates(value) {
    this._sanityRates = value;
  }
  get conversionRates() {
    return this._conversionRates;
  }

  set conversionRates(value) {
    this._conversionRates = value;
  }
  get reserve() {
    return this._reserve;
  }

  set reserve(value) {
    this._reserve = value;
  }
  /**
   * Create a addresses instance.
   * @param {string} reserve - Address of reserve smart contract.
   * @param {string} conversionRates - Address of pricing smart contract.
   * @param {string} sanityRates - Address of pricing smart contract.
   */
  constructor(reserve, conversionRates, sanityRates) {
    this._reserve = reserve;
    this._conversionRates = conversionRates;
    this._sanityRates = sanityRates;
  }
}

/**
 * Deployer is used for deploying new KyberNetwork reserve contracts.
 */
class Deployer {
  /**
   * Create a deployer instance with given account parameter.
   * @param {object} provider - Web3 provider
   */
  constructor(provider) {}

  /**
   * Deploy new reserver and pricing contracts.
   * @param {string} network - Address of KyberNetwork smart contract.
   * @return {Addresses} - Deployed reserve addresses set.
   */
  deploy(network) {}
}

/**
 * BaseContract contains common methods for all contracts of a KyberNetwork
 * reserve.
 */
class BaseContract {
  /**
   * Create new BaseContract instance.
   * @param {string} address - address of smart contract.
   */
  constructor(address) {}

  /**
   * Return the current admin address of contract.
   * @return {string} - current admin address
   */
  admin() {}

  /**
   * Return the pending admin address of contract.
   * An admin address is placed in pending if it is transfered but hasn't been
   * claimed yet.
   * @return {string} - pending admin address
   */
  pendingAdmin() {}

  /**
   * Return operator addresses of contract.
   * @return {array} - list of operator addresses
   */
  getOperators() {}

  /**
   * Return alerter addresses of contract.
   * @return {array} - list of alerter addresses
   */
  getAlerters() {}

  /**
   * transfer admin privilege to given address.
   * @param {string} address - new admin address
   */
  transferAdmin(address) {}

  /**
   * Claim admin privilege. The account address should be in already placed
   * in pendingAdmin for this to works.
   */
  claimAdmin() {}

  /**
   * Add given address from operators list.
   * @param {string} address - address to remove from operators list.
   */
  addOperator(address) {}

  /**
   * Remove given address from operators list.
   * @param {string} address - address to remove from operators list.
   */
  removeOperator(address) {}

  /**
   * Add new address to alerters list.
   * @param {string} address - address to add to alerters list.
   */
  addAlerter(address) {}

  /**
   * Remove address from alerters list.
   * @param {string} address - address to remove from alerters list.
   */
  removeAlerter(address) {}
}

/**
 * ReserveContract represents the KyberNetwork reserve smart contract.
 */
class ReserveContract extends BaseContract {
  /**
   * Create new ReserveContract instance.
   * @param {string} address - address of smart contract.
   */
  constructor(address) {
    super(address);
  }

  /**
   * Return true if trade is enabled.
   * @return {boolean} - if trade is enabled
   */
  tradeEnabled() {}

  /**
   * Return true if given address is allowed to withdraw from reserve contract.
   * @param {string} address - address to check if it is allowed to withraw
   * @return {boolean} - if address is allowed to withdraw
   */
  approvedWithdrawAddresses(address) {}

  /**
   * Return balance of given token.
   * @param {string} token - address of token to check balance.
   * @return {number} - balance of given token
   */
  getBalance(token) {}

  /**
   * Enable trading feature for reserve contract.
   */
  enableTrade() {}

  /**
   * Disable trading feature for reserve contract.
   */
  disableTrade() {}

  /**
   * Allow an address to withdraw a specific token.
   * @param {string} token - token address
   * @param {string} address - address to allow to withdraw
   */
  approveWithdrawAddress(token, address) {}

  /**
   * Disallow an address to withdraw a specific token.
   * @param {string} token - token address
   * @param {string} address - address to disallow to withdraw
   */
  disapproveWithdrawAddress(token, address) {}

  /**
   * Withdraw token from reserve contract to destination address.
   * @param token - token address
   * @param amount - amount of token to withdraw
   * @param dest - destionation address to receive the token
   */
  withdraw(token, amount, dest) {}
}

/**
 * ConversionRatesContract represents the KyberNetwork conversion rates smart
 * contract.
 */
class ConversionRatesContract extends BaseContract {
  /**
   * Create new ConversionRatesContract instance.
   * @param {string} address - address of smart contract.
   */
  constructor(address) {
    super(address);
  }

  /**
   * Return the buying ETH based rate. The rate might be vary with
   * different quantity.
   * TODO: getRate method requires currentBlockNumber as parameter, investigate
   * if we can pass 0 and it will use current block number or not.
   * @param {string} token - token address
   * @param {number} qty - quantity of token
   */
  getBuyRates(token, qty) {}

  /**
   * Return the buying ETH based rate. The rate might be vary with
   * different quantity.
   * TODO: getRate method requires currentBlockNumber as parameter, investigate
   * if we can pass 0 and it will use current block number or not.
   * @param {string} token - token address
   * @param {number} qty - quantity of token
   */
  getSellRate(token, qty) {}

  /**
   * Set the buying rate for given token.
   * @param {string} token - token address
   * @param {number} rate - new rate to set
   */
  setBuyRate(token, rate) {}

  /**
   * Set the buying rate for given token.
   * @param {string} token - token address
   * @param {number} rate - new rate to set
   */
  setSellRate(token, rate) {}
}

/**
 * SanityRatesContract represents the KyberNetwork sanity rates smart contract.
 * It's purpose is to prevent unusual rates from conversion rates contract
 * to be used.
 */
class SanityRatesContract extends BaseContract {
  /**
   * Create new SanityRatesContract instance.
   * @param {string} address - address of smart contract.
   */
  constructor(address) {
    super(address);
  }
}

/**
 * @summary
 * Reserve represents a KyberNetwork reserve SDK.
 * @description
 * It contains methods to interact with reserve and pricing contracts, including:
 * <ul>
 *   <li> deploying new contracts<br>
 *   <li> reserve operations<br>
 *   <li> get/set pricing<br>
 *   <li> withdraw funds<br>
 * </ul>
 */
class Reserve {
  get sanityRatesContract() {
    return this._sanityRatesContract;
  }

  set sanityRatesContract(value) {
    this._sanityRatesContract = value;
  }
  get conversionRatesContract() {
    return this._conversionRatesContract;
  }

  set conversionRatesContract(value) {
    this._conversionRatesContract = value;
  }
  get reserveContract() {
    return this._reserveContract;
  }

  set reserveContract(value) {
    this._reserveContract = value;
  }
  /**
   * Create a Reserve instance.
   * @param {object} provider - Web3 provider
   * @param {Addresses} addresses - Addresses of deployed smart contracts.
   */
  constructor(provider, addresses) {
    this._reserveContract = new ReserveContract(addresses.reserve());
    this._conversionRatesContract = new ConversionRatesContract(
      addresses.conversionRates()
    );
    this._sanityRatesContract = new SanityRatesContract(
      addresses.sanityRates()
    );
  }

  /**
   * Update linking contract addresses between reserve contracts.
   * Reserve Contract links with:
   *  <ul>
   *   <li> network contract
   *   <li> conversionRates contract
   *   <li> sanityRates contract
   * </ul>
   * <br>
   * ConversionRates Contract links with:
   *  <ul>
   *   <li> reserve contract
   * </ul>
   * <br>
   * @param network
   * @param reserve
   * @param conversionRates
   * @param sanityRates
   */
  setContracts(network, reserve, conversionRates, sanityRates) {}

  // TODO: flattening reserve/converstionRates methods if needed
}
