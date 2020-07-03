import Web3 from 'web3'

import baseContractABI from '../abi/base_contract_abi.json'
import { validateAddress } from './validate.js'
import { assertAdmin } from './permission_assert.js'

/**
 * BaseContract contains common methods for all contracts of a KyberNetwork
 * reserve.
 */
export default class BaseContract {
  /**
   * Create new BaseContract instance.
   * @param {object} web3 - Web3 instance
   * @param {string} address - address of smart contract.
   */
  constructor (web3, address) {
    if (!web3) {
      throw new Error('missing web3 instance')
    }

    if (web3.currentProvider == null ) {
      throw new Error('web3 instance has no provider')
    } 

    validateAddress(address)

    this.web3 = web3
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
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   */
  async transferAdmin (adminaccount, address, gasPrice) {
    validateAddress(address)
    await assertAdmin(this, adminaccount)
    const med = this.contract.methods.transferAdmin(address)
    return med.send({
      from: adminaccount,
      gas: await med.estimateGas({
        from: adminaccount,
        gasPrice: gasPrice
      })
    })
  }

  /**
   * Claim admin privilege. The account address should be in already placed
   * in pendingAdmin for this to works.
   * @param {object} account - the pending admin account
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   */
  async claimAdmin (newaccount, gasPrice) {
    const med = this.contract.methods.claimAdmin()
    return med.send({
      from: newaccount,
      gas: await med.estimateGas({
        from: newaccount,
        gasPrice: gasPrice
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
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   */
  async addOperator (adminaccount, address, gasPrice) {
    validateAddress(address)
    await assertAdmin(this, adminaccount)
    const med = this.contract.methods.addOperator(address)
    return med.send({
      from: adminaccount,
      gas: await med.estimateGas({
        from: adminaccount,
        gasPrice: gasPrice
      })
    })
  }

  /**
   * Remove given address from operators list.
   * @param {object} account - current admin account
   * @param {string} address - address to remove from operators list.
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   */
  async removeOperator (adminaccount, address, gasPrice) {
    validateAddress(address)
    await assertAdmin(this, adminaccount)
    const med = this.contract.methods.removeOperator(address)
    return med.send({
      from: adminaccount,
      gas: await med.estimateGas({
        from: adminaccount,
        gasPrice: gasPrice
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
   * @param {number} gasPrice (string) - the gasPrice desired for the tx
   */
  async addAlerter (adminaccount, address, gasPrice) {
    validateAddress(address)
    await assertAdmin(this, adminaccount)
    const med = this.contract.methods.addAlerter(address)
    return med.send({
      from: adminaccount,
      gas: await med.estimateGas({
        from: adminaccount,
        gasPrice: gasPrice
      })
    })
  }

  /**
   * Remove address from alerters list.
   * @param {object} account - current admin account
   * @param {string} address - address to remove from alerters list.
   * @param {number} gasPrice (string) - the gasPrice desired for the tx
   */
  async removeAlerter (adminaccount, address, gasPrice) {
    validateAddress(address)
    await assertAdmin(this, adminaccount)
    const med = this.contract.methods.removeAlerter(address)
    return med.send({
      from: adminaccount,
      gas: await med.estimateGas({
        from: adminaccount,
        gasPrice: gasPrice
      })
    })
  }
}
