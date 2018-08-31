import ReserveContract from './reserve_contract'
import SanityRate from './sanity_rates_contract'
import conversionRates from './conversion_rates_contract'

export default class Reserve {
  /**
   *
   * @param {object} provider - Web3 provider
   * @param {Addresses} addresses - addresses of the contracts
   */
  constructor (provider, addresses) {
    const web3 = new Web3(provider)
    this.reserve = new ReserveContract(provider, addresses.reserve)
    this.sanityRates = new this.Sanity(provider, addresses.sanityRates)
    this.conversionRates = new this.conversionRates(
      provider,
      addresses.conversionRates
    )
  }

  /**
   * enableTrade allow the reserve to continue trading
   * @param {account} - Admin account
   * @return {object} - the tx object of send() command from this contract method
   */
  enableTrade (account) {
    return this.reserve.enableTrade(account)
  }
  /**
   * disableTrade stop the reserve from trading
   * @param {account} - Alerter account
   * @return {object} - the tx object of send() command from this contract method
   */
  disableTrade (account) {
    return this.reserve.disableTrade(account)
  }
  /**
   * tradeEnabled return true if the reserve is tradeEnabled, false otherwise
   * @return {bool} - tradeEnabled status of the reserve
   */
  tradeEnabled () {
    return this.contract.methods.tradeEnabled().call()
  }

  /**
   * set Contract addresses for reserve contract.
   * @param {object} account - admin account.
   * @param {string} network - address of kyber network smart contract.
   * @param {string} conversion - address of kyber network smart contract.
   * @param {string} sanity (optional) - address of sanity rates contract.
   * @returns {object} - the tx object of send() command from this contract method
   */
  setContracts (account, network, conversion, sanity) {
    return this.reserve.setContracts(account, network, conversion, sanity)
  }

  /**
   * conversionRatesContract return the address of conversion rates of this reserve
   * @return {string} - address of conversion rates contract
   */
  conversionRatesContract () {
    return this.reserve.conversionRatesContract().call()
  }

  /**
   * sanityRatesContract return the address of sanity rates of this reserve
   * @return {string} - address of sanity rates contract
   */
  sanityRatesContract () {
    return this.reserve.sanityRatesContract().call()
  }
  /**
   * kyberNetwork return the address of kyberNetwork contract of this reserve
   * @return {string} - address of kyberNetwork contract
   */
  kyberNetwork () {
    return this.reserve.kyberNetwork().call()
  }

  /**
   * approve withdraw address for a token on reserve.
   * @param {object} account - admin account.
   * @param {string} tokenAddress - contract address of the modifying token.
   * @param {string} withdrawAddress - address for withdrawal.
   * @returns {object} - the tx object of send() command from this contract method
   */
  approveWithdrawAddress (account, tokenAddress, withdrawAddress) {
    return this.reserve.approveWithdrawAddress(
      account,
      tokenAddress,
      withdrawAddress
    )
  }

  /**
   * disapprove withdraw address for a token on reserve.
   * @param {object} account - admin account.
   * @param {string} tokenAddress - contract address of the modifying token.
   * @param {string} withdrawAddress - address for withdrawal.
   * @returns {object} - the tx object of send() command from this contract method
   */
  disapproveWithdrawAddress (account, tokenAddress, withdrawAddress) {
    return this.reserve.disapproveWithdrawAddress(
      account,
      tokenAddress,
      withdrawAddress
    )
  }

  /**
   * check for approval status of a token address to a particular address
   * @param {object} address - address to withdraw the token to
   * @param {string} tokenAddress - address of the token's smart contract. Must be deployed already.
   * @returns {boolean} - true for approved, false otherwise
   */
  approvedWithdrawAddresses (address, tokenAddress) {
    return this.reserve.approvedWithdrawAddresses(address, tokenAddress)
  }

  /**
   * withdraw an amount of token to specified account
   * @param {object} account - admin account.
   * @param {string} tokenAddress - address of the token's smart contract. Must be deployed already.
   * @param {object} amount - amount to withdraw (BN|String|int), must be in wei.
   * @param {string} toAddress - address for withdrawal. Must be approved already.
   * @returns {object} - the tx object of send() command from this contract method
   */
  withdraw (account, tokenAddress, amount, toAddress) {
    return this.reserve.withdraw(account, tokenAddress, amount, toAddress)
  }

  /**
   * Return balance of given token.
   * @param {string} token - address of token to check balance.
   * @return {number} - balance of given token
   */
  getBalance (token) {
    return this.reserve.getBalance(token)
  }

  /**
   * Set Sanity Rate for the sanity Ratescontract
   * @param {account} account - operator account
   * @param {strings[]} srcs - list of source ERC20 token contract addresses
   * @param {uint[]} rates - list of Rates in ETH weit
   * @returns {object} - the tx object of send() command from this contract method
   */
  setSanityRates (account, srcs, rates) {
    return this.setSanityRates(account, srcs, rates)
  }

  /**
   * Return the sanity Rate of a pair of token
   * @param {string} src - ERC20 token contract address of source token
   * @param {string} dest - ERC20 token contract address of destination token
   * @returns {string} - the uint rate in strings format.
   */
  getSanityRate (src, dest) {
    return this.sanityRates.getSanityRate(src, dest)
  }

  /**
   * resonableDiffInBps return the list of reasonableDiffs in basis points (bps)
   * @param {string} address - ERC20 token contract address to query
   * @returns {string} - the uint reasonable diff in string formatgi
   */
  reasonableDiffInBps (address) {
    return this.sanityRates.reasonableDiffInBps(address)
  }

  /**
   * setResonableDiff Set reasonable conversion rate difference in percentage (any conversion rate outside of this range is considered unreasonable).
   * @param {any} account - admin account
   * @param {any} addresses - list of ERC20 token contract to set
   * @param {any} diffs - list of diffs in bps (1 bps = 0.01%)
   * @returns {object} - the tx object of send() command from this contract method
   */
  setReasonableDiff (account, addresses, diffs) {
    return this.sanityRates.setReasonableDiff(account, addresses, diffs)
  }

  /**
   * Add a ERC20 token and its pricing configurations to reserve contract and
   * enable it for trading.
   * @param {object} account - Web3 account
   * @param {string} token - ERC20 token address
   * @param {TokenControlInfo} tokenControlInfo - https://developer.kyber.network/docs/VolumeImbalanceRecorder#settokencontrolinfo
   */

  addToken (account, token, tokenControlInfo) {
    return this.conversionRates.addToken(account, token, tokenControlInfo)
  }

  /**
   * Set adjustments for tokens' buy and sell rates depending on the net traded
   * amounts. Only operator can invoke.
   * @param {object} account - Web3 account
   * @param {string} token - ERC20 token address
   * @param {StepFunctionDataPoint[]} buy - array of buy step function configurations
   * @param {StepFunctionDataPoint[]} sell - array of sell step function configurations
   */
  setImbalanceStepFunction (account, token, buy, sell) {
    return this.conversionRates.setImbalanceStepFunction(
      account,
      token,
      buy,
      sell
    )
  }

  /**
   * Set adjustments for tokens' buy and sell rates depending on the size of a
   * buy / sell order. Only operator can invoke.
   * @param {object} account - Web3 account
   * @param {string} token - ERC20 token address
   * @param {StepFunctionDataPoint[]} buy - array of buy step function configurations
   * @param {StepFunctionDataPoint[]} sell - array of sell step function configurations
   */
  setQtyStepFunction (account, token, buy, sell) {
    return this.conversionRates.setQtyStepFunction(account, token, buy, sell)
  }

  /**
   * Return the buying ETH based rate. The rate might be vary with
   * different quantity.
   * @param {string} token - token address
   * @param {number} qty - quantity of token
   * @param {number} [currentBlockNumber=0] - current block number, default to
   * use latest known block number.
   * @return {number} - buy rate
   */
  getBuyRates (token, qty, currentBlockNumber = 0) {
    return this.conversionRates.getBuyRates(token, qty, currentBlockNumber)
  }

  /**
   * Return the buying ETH based rate. The rate might be vary with
   * different quantity.
   * @param {string} token - token address
   * @param {number} qty - quantity of token
   * @param {number} [currentBlockNumber=0] - current block number
   * known block number.
   */
  getSellRates (token, qty, currentBlockNumber = 0) {
    return this.conversionRates.getSellRates(token, qty, currentBlockNumber)
  }

  /**
   * Set the buying rate for given token.
   * @param {object} account - Web3 account
   * @param {RateSetting[]} rates - token address
   * @param {number} [currentBlockNumber=0] - current block number
   */
  setRate (account, rates, currentBlockNumber = 0) {
    return this.conversionRates.setRate(account, rates, currentBlockNumber)
  }
}
