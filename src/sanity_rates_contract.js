import SanityRatesContractABI from '../contracts/SanityRatesContract.abi'
import BaseContract from './base_contract'
import { validateAddress } from './validate'
import Web3 from 'web3'


/**
 * SanityRatesContract represents the KyberNetwork sanity rates smart contract.
 * It's purpose is to prevent unusual rates from conversion rates contract
 * to be used.
 */
export default class SanityRatesContract extends BaseContract {
  /**
   * Create new SanityRatesContract instance.
   * @param {object} provider - Web3 provider
   * @param {string} address - address of smart contract.
   */
  constructor(provider, address) {
    super(provider, address);
    this.web3 = new Web3(provider)
    this.contract = new this.web3.eth.Contract(SanityRatesContractABI, address)
  }

  /**
   * Return the sanity Rate of a pair of token
   * @param {string} src - ERC20 token contract address of source token
   * @param {string} dest - ERC20 token contract address of destination token
   */
  getSanityRate(src, dest) {
    validateAddress(src)
    validateAddress(dest)
    return this.contract.methods.getSanityRate(src, dest).call()
  }
  /**
   * Set Sanity Rate for the contract
   * @param {account} account - operator account 
   * @param {strings[]} srcs - list of source ERC20 token contract addresses 
   * @param {uint[]} rates - list of Rates in ETH weit 
   */
  async setSanityRates(account, srcs, rates) {
    const med = this.contract.methods.setSanityRates(srcs, rates)
    return med.send({
        from: account.address,
        gas: await med.estimateGas({
          from: account.address
        })
      })
  }

}
