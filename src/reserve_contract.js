import Web3 from 'web3'
import reserveContractABI from '../contracts/KyberReserveContract.abi'
import BaseContract from './base_contract'

const validateAddress = address => {
  if (!Web3.utils.isAddress(address)) {
    throw new Error(`invalid address: '${address}'`)
  }
}

/**
 * ReserveContract contains extended methods for KyberReserveContract
 */
export default class ReserveContract extends BaseContract {
  /**
   * Create new BaseContract instance.
   * @param {object} provider - Web3 provider
   * @param {string} address - address of kyber reserver smart contract.
   */
  constructor (provider, address) {
    super(provider, address)
    const web3 = new Web3(provider)
    this.contract = new web3.eth.Contract(reserveContractABI, address)
  }

  enableTrade (account) {
    return this.contract.methods.enableTrade().send({ from: account.address })
  }
  tradeEnabled () {
    return this.contract.methods.tradeEnabled().call()
  }
  disableTrade (account) {
    return this.contract.methods.disableTrade().send({ from: account.address })
  }
  /**
   * set Contract addresses for reserver contract.
   * @param {object} account - admin account.
   * @param {string} network - address of kyber network smart contract.
   * @param {string} conversion - address of kyber network smart contract.
   * @param {string} sanitys (optional) - address of sanity rates contract.
   * @returns {txObject} - the tx object of send() command from this contract method
   */
  setContracts (account, network, conversion, sanity) {
    validateAddress(network)
    validateAddress(conversion)
    return this.contract.methods
      .setContracts(network, conversion, sanity)
      .send({ from: account.address })
  }

  conversionRatesContract () {
    return this.contract.methods.conversionRatesContract().call()
  }

  sanityRatesContract () {
    return this.contract.methods.sanityRatesContract().call()
  }

  kyberNetwork () {
    return this.contract.methods.kyberNetwork().call()
  }
}
