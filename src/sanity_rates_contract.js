import SanityRatesContractABI from '../contracts/SanityRatesContract.abi'
import BaseContract from './base_contract'
import { validateAddress } from './validate'
import Web3 from 'web3'
import { assertOperator, assertAdmin } from './permission_assert'
import { monitorTx} from './monitor_tx'

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
  constructor (provider, address, timeOutDuration = 900000) {
    super(provider, address,timeOutDuration)
    this.web3 = new Web3(provider)
    this.contract = new this.web3.eth.Contract(SanityRatesContractABI, address)
    this.timeOutDuration= timeOutDuration
  }

  /**
   * Return the sanity Rate of a pair of token
   * @param {string} src - ERC20 token contract address of source token
   * @param {string} dest - ERC20 token contract address of destination token
   * @param {number} [timeOutDuration=900000] (optional) - the timeout in millisecond duration for every send. Default at 15 mins
   * @returns {string} - the uint rate in strings format.
   */
  getSanityRate (src, dest) {
    validateAddress(src)
    validateAddress(dest)
    return this.contract.methods.getSanityRate(src, dest).call()
  }

  /**
   * Set Sanity Rate for the contract
   * @param {object} account - operator account
   * @param {string[]} srcs - list of source ERC20 token contract addresses
   * @param {uint[]} rates - list of Rates in ETH wei
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   * @returns {object} - the tx object of send() command from this contract method
   */
  async setSanityRates (account, srcs, rates, gasPrice) {
    await assertOperator(this, account.address)
    const med = this.contract.methods.setSanityRates(srcs, rates)
    return monitorTx(med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      }),
      gasPrice: gasPrice
    }), this.web3.eth, this.timeOutDuration)
  }

  /**
   * resonableDiffInBps return the list of reasonableDiffs in basis points (bps)
   * @param {string} address - ERC20 token contract address to query
   * @returns {string} - the uint reasonable diff in string format
   */
  reasonableDiffInBps (address) {
    validateAddress(address)
    return this.contract.methods.reasonableDiffInBps(address).call()
  }

  /**
   * setResonableDiff Set reasonable conversion rate difference in percentage (any conversion rate outside of this range is considered unreasonable).
   * @param {object} account - admin account
   * @param {string[]} addresses - list of ERC20 token contract to set
   * @param {uint[]} diffs - list of diffs in bps (1 bps = 0.01%)
   * @param {number} [gasPrice=undefined] - the gasPrice desired for the tx
   * @returns {object} - the tx object of send() command from this contract method
   */
  async setReasonableDiff (account, addresses, diffs, gasPrice = undefined) {
    await assertAdmin(this, account.address)
    const med = this.contract.methods.setReasonableDiff(addresses, diffs)
    return monitorTx(med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      }),
      gasPrice: gasPrice
    }), this.web3.eth, this.timeOutDuration)
  }
}
