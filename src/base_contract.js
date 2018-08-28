import Web3 from 'web3'

import baseContractABI from '../contracts/base_contract_abi'
import { validateAddress } from './validate'

/**
 * BaseContract contains common methods for all contracts of a KyberNetwork
 * reserve.
 */
export default class BaseContract {
  /**
   * Create new BaseContract instance.
   * @param {object} provider - Web3 provider
   * @param {string} address - address of smart contract.
   */
  constructor (provider, address) {
    if (!provider) {
      throw new Error('missing provider')
    }

    validateAddress(address)

    const web3 = new Web3(provider)
    this.contract = new web3.eth.Contract(baseContractABI, address)
  }

  /**
   * Return the current admin address of contract.
   * @return {string} - current admin address
   */
  admin () {
    return this.contract.methods.admin().call()
  }

  /**
   * Return the pending admin address of contract.
   * An admin address is placed in pending if it is transfered but hasn't been
   * claimed yet.
   * @return {string} - pending admin address
   */
  pendingAdmin () {
    return this.contract.methods.pendingAdmin().call()
  }

  /**
   * transfer admin privilege to given address.
   * @param {object} account - current admin account
   * @param {string} address - new admin address
   */
  async transferAdmin (account, address) {
    validateAddress(address)
    const med = this.contract.methods.transferAdmin(address)
    return med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })
    })
  }

  /**
   * Claim admin privilege. The account address should be in already placed
   * in pendingAdmin for this to works.
   */
  async claimAdmin (account) {
    const med = this.contract.methods.claimAdmin()
    return med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })
    })
  }

  /**
   * Return operator addresses of contract.
   * @return {array} - list of operator addresses
   */
  getOperators () {
    return this.contract.methods.getOperators().call()
  }

  /**
   * Add given address from operators list.
   * @param {object} account - current admin account
   * @param {string} address - address to remove from operators list.
   */
  async addOperator (account, address) {
    validateAddress(address)
    const med = this.contract.methods.addOperator(address)
    return med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })
    })
  }

  /**
   * Remove given address from operators list.
   * @param {object} account - current admin account
   * @param {string} address - address to remove from operators list.
   */
  async removeOperator (account, address) {
    validateAddress(address)
    const med = this.contract.methods.removeOperator(address)
    return med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })
    })
  }

  /**
   * Return alerter addresses of contract.
   * @return {array} - list of alerter addresses
   */
  getAlerters () {
    return this.contract.methods.getAlerters().call()
  }

  /**
   * Add new address to alerters list.
   * @param {object} account - current admin account
   * @param {string} address - address to add to alerters list.
   */
  async addAlerter (account, address) {
    validateAddress(address)
    const med = this.contract.methods.addAlerter(address)
    return med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })
    })
  }

  /**
   * Remove address from alerters list.
   * @param {object} account - current admin account
   * @param {string} address - address to remove from alerters list.
   */
  async removeAlerter (account, address) {
    validateAddress(address)
    const med = this.contract.methods.removeAlerter(address)
    return med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })
    })
  }
}
