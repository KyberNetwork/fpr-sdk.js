import Web3 from 'web3'

import reserveContractABI from '../abi/KyberReserveContract.abi.json'
import BaseContract from './base_contract.js'
import { validateAddress } from './validate.js'
import { assertAdmin, assertAlerter } from './permission_assert.js'

/**
 * ReserveContract contains extended methods for KyberReserveContract
 */
export default class ReserveContract extends BaseContract {
  /**
   * Create new BaseContract instance.
   * @param {object} provider - Web3 provider
   * @param {string} address - address of kyber reserve smart contract.
   */
  constructor (web3, address) {
    super(web3, address)
    this.web3 = web3
    this.contract = new this.web3.eth.Contract(reserveContractABI, address)
  }
  /**
   * enableTrade allow the reserve to continue trading
   * @param {object} adminAccount - address of Admin account
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   * @return {object} - the tx object of send() command from this contract method
   */
  async enableTrade (adminAccount, gasPrice) {
    await assertAdmin(this, adminAccount)
    const med = this.contract.methods.enableTrade()
    return this.contract.methods.enableTrade().send({
      from: adminAccount,
      gas: await med.estimateGas({
        from: adminAccount
      }),
      gasPrice: gasPrice
    })
  }

  /**
   * disableTrade stop the reserve from trading
   * @param {object} alerterAccount - address of Alerter account
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   * @return {object} - the tx object of send() command from this contract method
   */
  async disableTrade (alerterAccount, gasPrice) {
    await assertAlerter(this, alerterAccount)
    const med = this.contract.methods.disableTrade()
    return med.send({
      from: alerterAccount,
      gas: await med.estimateGas({
        from: alerterAccount
      }),
      gasPrice: gasPrice
    })
  }

  /**
   * tradeEnabled return true if the reserve is tradeEnabled, false otherwise
   * @return {boolean} - tradeEnabled status of the reserve
   */
  tradeEnabled () {
    return this.contract.methods.tradeEnabled().call()
  }

  /**
   * set Contract addresses for reserve contract.
   * @param {object} adminAccount - address of admin account.
   * @param {string} network - address of kyber network smart contract.
   * @param {string} conversion - address of kyber network smart contract.
   * @param {string} sanity (optional) - address of sanity rates contract.
   * @param {number} [gasPrice=undefined] - the gasPrice desired for the tx
   * @returns {object} - the tx object of send() command from this contract method
   */
  async setContracts (
    adminAccount,
    network,
    conversion,
    sanity,
    gasPrice = undefined
  ) {
    validateAddress(network)
    validateAddress(conversion)
    await assertAdmin(this, adminAccount)
    if (sanity !== undefined) {
      validateAddress(sanity)
    } else {
      sanity = '0x0000000000000000000000000000000000000000'
    }

    const med = this.contract.methods.setContracts(network, conversion, sanity)
    return med.send({
      from: adminAccount,
      gas: await med.estimateGas({
        from: adminAccount
      }),
      gasPrice: gasPrice
    })
  }

  /**
   * conversionRatesContract return the address of conversion rates of this reserve
   * @return {string} - address of conversion rates contract
   */
  conversionRatesContract () {
    return this.contract.methods.conversionRatesContract().call()
  }

  /**
   * sanityRatesContract return the address of sanity rates of this reserve
   * @return {string} - address of sanity rates contract
   */
  sanityRatesContract () {
    return this.contract.methods.sanityRatesContract().call()
  }

  /**
   * kyberNetwork return the address of kyberNetwork contract of this reserve
   * @return {string} - address of kyberNetwork contract
   */
  kyberNetwork () {
    return this.contract.methods.kyberNetwork().call()
  }

  /**
   * approve withdraw address for a token on reserve.
   * @param {object} adminAccount - address of admin account.
   * @param {string} tokenAddress - contract address of the modifying token.
   * @param {string} withdrawAddress - address for withdrawal.
   * @param {number} [gasPrice=undefined] - the gasPrice desired for the tx
   * @returns {object} - the tx object of send() command from this contract method
   */
  async approveWithdrawAddress (
    adminAccount,
    tokenAddress,
    withdrawAddress,
    gasPrice = undefined
  ) {
    await assertAdmin(this, adminAccount)
    const med = this.contract.methods.approveWithdrawAddress(
      tokenAddress,
      withdrawAddress,
      true
    )
    return med.send({
      from: adminAccount,
      gas: await med.estimateGas({
        from: adminAccount
      }),
      gasPrice: gasPrice
    })
  }

  /**
   * disapprove withdraw address for a token on reserve.
   * @param {object} adminAccount - address of admin account.
   * @param {string} tokenAddress - contract address of the modifying token.
   * @param {string} withdrawAddress - address for withdrawal.
   * @param {number} [gasPrice=undefined] - the gasPrice desired for the tx
   * @returns {object} - the tx object of send() command from this contract method
   */
  async disapproveWithdrawAddress (
    adminAccount,
    tokenAddress,
    withdrawAddress,
    gasPrice = undefined
  ) {
    await assertAdmin(this, adminAccount)
    const med = this.contract.methods.approveWithdrawAddress(
      tokenAddress,
      withdrawAddress,
      false
    )
    return med.send({
      from: adminAccount,
      gas: await med.estimateGas({
        from: adminAccount
      }),
      gasPrice: gasPrice
    })
  }

  /**
   * check for approval status of a token address to a particular address
   * @param {object} address - address to withdraw the token to
   * @param {string} tokenAddress - address of the token's smart contract. Must be deployed already.
   * @returns {boolean} - true for approved, false otherwise
   */
  approvedWithdrawAddresses (address, tokenAddress) {
    const addressHash = Web3.utils.soliditySha3(tokenAddress, address)
    return this.contract.methods.approvedWithdrawAddresses(addressHash).call()
  }

  /**
   * withdraw an amount of token to specified account
   * @param {object} adminAccount - address of admin account.
   * @param {string} tokenAddress - address of the token's smart contract. Must be deployed already.
   * @param {object} amount - amount to withdraw (BN|String|int), must be in wei.
   * @param {string} toAddress - address for withdrawal. Must be approved already.
   * @param {number} [gasPrice=undefined] - the gasPrice desired for the tx
   * @returns {object} - the tx object of send() command from this contract method
   */
  async withdraw (
    adminAccount,
    tokenAddress,
    amount,
    toAddress,
    gasPrice = undefined
  ) {
    await assertAdmin(this, adminAccount)
    const med = this.contract.methods.withdraw(tokenAddress, amount, toAddress)
    return med.send({
      from: adminAccount,
      gas: await med.estimateGas({
        from: adminAccount
      }),
      gasPrice: gasPrice
    })
  }

  /**
   * Return balance of given token.
   * @param {string} token - address of token to check balance.
   * @return {number} - balance of given token
   */
  getBalance (token) {
    return this.contract.methods.getBalance(token).call()
  }
}
