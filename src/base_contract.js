import Web3 from 'web3'
import baseContractABI from './base_contract_abi'

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
    if (!Web3.utils.isAddress(address)) {
      throw new Error(`invalid address: '${address}'xx`)
    }

    const web3 = new Web3(provider)
    this.contract = new web3.eth.Contract(baseContractABI, address)
  }

  /**
   * Return the current admin address of contract.
   * @return {string} - current admin address
   */
  async admin () {
    return this.contract.methods.admin().call()
  }

  /**
   * Return the pending admin address of contract.
   * An admin address is placed in pending if it is transfered but hasn't been
   * claimed yet.
   * @return {string} - pending admin address
   */
  async pendingAdmin () {
    return this.contract.methods.pendingAdmin().call()
  }

  /**
   * Return operator addresses of contract.
   * @return {array} - list of operator addresses
   */
  getOperators () {}

  /**
   * Return alerter addresses of contract.
   * @return {array} - list of alerter addresses
   */
  getAlerters () {}

  /**
   * transfer admin privilege to given address.
   * @param {string} address - new admin address
   */
  transferAdmin (address) {}

  /**
   * Claim admin privilege. The account address should be in already placed
   * in pendingAdmin for this to works.
   */
  claimAdmin () {}

  /**
   * Add given address from operators list.
   * @param {string} address - address to remove from operators list.
   */
  addOperator (address) {}

  /**
   * Remove given address from operators list.
   * @param {string} address - address to remove from operators list.
   */
  removeOperator (address) {}

  /**
   * Add new address to alerters list.
   * @param {string} address - address to add to alerters list.
   */
  addAlerter (address) {}

  /**
   * Remove address from alerters list.
   * @param {string} address - address to remove from alerters list.
   */
  removeAlerter (address) {}
}
