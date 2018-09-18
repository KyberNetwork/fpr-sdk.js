import Web3 from 'web3'
import { BigNumber } from 'bignumber.js'

import BaseContract from './base_contract'
import conversionRatesABI from '../contracts/ConversionRatesContract.abi'
import { validateAddress } from './validate'
import { assertOperator, assertAdmin } from './permission_assert'
import { monitorTx } from './monitor_tx'

/**
 * CompactData is used to save gas on get, set rates operations.
 * Instead of sending the whole buy, sell rates every time, only the different
 * is sent if possible.
 * The compact rate is calculated by following formula:
 *
 *      compact = ((rate / base) - 1) * 1000
 */
export class CompactData {
  get isBaseChanged () {
    return this._isBaseChanged
  }

  set isBaseChanged (value) {
    this._isBaseChanged = value
  }

  get compact () {
    return this._compact
  }

  set compact (value) {
    this._compact = value
  }

  get base () {
    return this._base
  }

  set base (value) {
    this._base = value
  }

  /**
   * Create a new CompactData instance.
   * @param {BigNumber} rate - the total rate
   * @param {BigNumber} base - the base to generate compact data
   */
  constructor (rate, base) {
    // const compactData = buildCompactData(rate, base)
    const minInt8 = -128
    const maxInt8 = 127

    rate = new BigNumber(rate)
    base = new BigNumber(base)

    let compact

    if (base.isEqualTo(0)) {
      base = rate
      this.isBaseChanged = true
      compact = new BigNumber(0)
    } else {
      compact = rate
        .dividedBy(base)
        .minus(new BigNumber(1))
        .multipliedBy(1000.0)
        .integerValue()

      // compact data is fit in a byte
      if (
        compact.isGreaterThanOrEqualTo(minInt8) &&
        compact.isLessThanOrEqualTo(maxInt8)
      ) {
        // overflowed, convert from int8 to byte so
        // * -1 --> 255
        // * -128 --> 128
        if (compact.isLessThan(0)) {
          compact = new BigNumber(2 ** 8).plus(compact)
        }
      } else {
        base = rate
        this.isBaseChanged = true
        compact = new BigNumber(0)
      }
    }

    this._base = base
    this._compact = compact
  }
}

/**
 * Build the compact data input.
 * In ConversionRates contract, the compact data is stored in two dimensions
 * array with location:
 *   - bulkIndex
 *   - indexInBulk
 *
 * When setting compact data, user needs to submit the whole bulk along with
 * its index.
 *
 * @param newBuys - buy compact data
 * @param newSells - sell compact data
 * @param indices - map of address to its bulk index
 * @return {{buyResults: Array, sellResults: Array, indexResults: Array}}
 */
export const buildCompactBulk = (newBuys, newSells, indices) => {
  let buyResults = []
  let sellResults = []
  let indexResults = []
  let buyBulks = {}
  let sellBulks = {}

  for (let addr in newBuys) {
    if (newBuys.hasOwnProperty(addr)) {
      const loc = indices[addr]
      if (!(loc.bulkIndex in buyBulks)) {
        buyBulks[loc.bulkIndex] = new Array(14).fill(0)
        sellBulks[loc.bulkIndex] = new Array(14).fill(0)
      }
      buyBulks[loc.bulkIndex][loc.indexInBulk] = newBuys[addr]
      sellBulks[loc.bulkIndex][loc.indexInBulk] = newSells[addr]
    }
  }

  for (let i in buyBulks) {
    if (buyBulks.hasOwnProperty(i)) {
      buyResults.push(buyBulks[i])
      sellResults.push(sellBulks[i])
      indexResults.push(i)
    }
  }
  return { buyResults, sellResults, indexResults }
}

/**
 * TokenControlInfo is the configurations of a ERC20 token.
 */
export class TokenControlInfo {
  get maxTotalImbalance () {
    return this._maxTotalImbalance
  }

  set maxTotalImbalance (value) {
    this._maxTotalImbalance = value
  }

  get maxPerBlockImbalance () {
    return this._maxPerBlockImbalance
  }

  set maxPerBlockImbalance (value) {
    this._maxPerBlockImbalance = value
  }

  get minimalRecordResolution () {
    return this._minimalRecordResolution
  }

  set minimalRecordResolution (value) {
    this._minimalRecordResolution = value
  }

  /**
   * Create a new TokenControlInfo instance.
   * @param minimalRecordResolution {uint} - minimum denominator in token wei that can be changed
   * @param maxPerBlockImbalance {uint} - maximum wei amount of net absolute (+/-) change for a token in an ethereum
   * block
   * @param maxTotalImbalance {uint} - wei amount of the maximum net token change allowable that happens between 2
   * price updates
   */
  constructor (
    minimalRecordResolution,
    maxPerBlockImbalance,
    maxTotalImbalance
  ) {
    this._minimalRecordResolution = minimalRecordResolution
    this._maxPerBlockImbalance = maxPerBlockImbalance
    this._maxTotalImbalance = maxTotalImbalance
  }
}

// StepFunctionDataPoint is the data point of a step function.
export class StepFunctionDataPoint {
  get y () {
    return this._y
  }

  set y (value) {
    this._y = value
  }

  get x () {
    return this._x
  }

  set x (value) {
    this._x = value
  }

  /**
   * Create a new StepFunctionDataPoint.
   * @param x {int} - buy step in wei amount
   * @param y {int} - impact on buy rate in basis points (bps). 1 bps = 0.01%
   */
  constructor (x, y) {
    this._x = x
    this._y = y
  }
}

/**
 * RateSetting represents the buy sell rates of a ERC20 token.
 */
export class RateSetting {
  get sell () {
    return this._sell
  }

  set sell (value) {
    this._sell = value
  }

  get buy () {
    return this._buy
  }

  set buy (value) {
    this._buy = value
  }

  get address () {
    return this._address
  }

  set address (value) {
    this._address = value
  }

  /**
   * Create a new RateSetting instance.
   * @param {string} address - ERC20 token address
   * @param {number} buy - buy rate per ETH
   * @param {number} sell - sell rate per ETH
   */
  constructor (address, buy, sell) {
    validateAddress(address)

    this._address = address
    this._buy = buy
    this._sell = sell
    // this._buy = Web3.utils.padLeft(Web3.utils.numberToHex(buy), 14)
    // this._sell = Web3.utils.padLeft(Web3.utils.numberToHex(sell), 14)
  }
}

/**
 * CompactDataLocation is the location of compact data of a token in
 * ConversionRates contract. When adding a new token, ConversionRatesContract
 * allocated a fixed location in compact data array for it, this can't be
 * changed.
 */
export class CompactDataLocation {
  get indexInBulk () {
    return this._indexInBulk
  }

  set indexInBulk (value) {
    this._indexInBulk = value
  }

  get bulkIndex () {
    return this._bulkIndex
  }

  set bulkIndex (value) {
    this._bulkIndex = value
  }

  constructor (bulkIndex, indexInBulk) {
    this._bulkIndex = bulkIndex
    this._indexInBulk = indexInBulk
  }
}

/**
 * ConversionRatesContract represents the KyberNetwork conversion rates smart
 * contract.
 */
export default class ConversionRatesContract extends BaseContract {
  /**
   * Create new ConversionRatesContract instance.
   * @param {object} provider - Web3 provider
   * @param {string} address - address of smart contract.
   * @param {number} [timeOutDuration=900000] (optional) - the timeout in millisecond duration for every send. Default at 15 mins
   */
  constructor (provider, address, timeOutDuration = 900000) {
    super(provider, address, timeOutDuration)
    this.web3 = new Web3(provider)
    this.contract = new this.web3.eth.Contract(conversionRatesABI, address)
    this.timeOutDuration = this.timeOutDuration
    /**
     * getTokenIndices returns the index of given Token to use in setCompact
     * data call.
     * @param {string} token - ERC 20 token address
     * @return {number} - index ot compact data
     */
    this.getTokenIndices = token => {
      let tokenIndices = {}

      return (async () => {
        validateAddress(token)

        if (token in tokenIndices) {
          return tokenIndices[token]
        }

        let results
        try {
          results = await this.contract.methods.getCompactData(token).call()
        } catch (err) {
          console.log(
            `failed to query token ${token} for compact data, error: ${err}`
          )
          return
        }
        tokenIndices[token] = new CompactDataLocation(results[0], results[1])
        return tokenIndices[token]
      })()
    }
  }

  /**
   * Add a ERC20 token and its pricing configurations to reserve contract and
   * enable it for trading.
   * @param {object} account - Web3 account, must be admin.
   * @param {string} token - ERC20 token address
   * @param {TokenControlInfo} tokenControlInfo - https://developer.kyber.network/docs/VolumeImbalanceRecorder#settokencontrolinfo
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   */

  async addToken (account, token, tokenControlInfo, gasPrice) {
    validateAddress(token)
    await assertAdmin(this, account.address)
    let tx = this.contract.methods.addToken(token)
    await monitorTx(
      tx.send({
        from: account.address,
        gas: await tx.estimateGas({ from: account.address }),
        gasPrice: gasPrice
      }),
      this.web3.eth,
      this.timeOutDuration
    )

    tx = this.contract.methods.setTokenControlInfo(
      token,
      tokenControlInfo.minimalRecordResolution,
      tokenControlInfo.maxPerBlockImbalance,
      tokenControlInfo.maxTotalImbalance
    )
    await monitorTx(
      tx.send({
        from: account.address,
        gas: await tx.estimateGas({ from: account.address }),
        gasPrice: gasPrice
      }),
      this.web3.eth,
      this.timeOutDuration
    )

    tx = this.contract.methods.enableTokenTrade(token)
    await monitorTx(
      tx.send({
        from: account.address,
        gas: await tx.estimateGas({ from: account.address }),
        gasPrice: gasPrice
      }),
      this.web3.eth,
      this.timeOutDuration
    )

    return this.getTokenIndices(token)
  }

  /**
   * Set adjustments for tokens' buy and sell rates depending on the net traded
   * amounts. Only operator can invoke.
   * @param {object} account - Web3 account, must be operator
   * @param {string} token - ERC20 token address
   * @param {StepFunctionDataPoint[]} buy - array of buy step function configurations
   * @param {StepFunctionDataPoint[]} sell - array of sell step function configurations
   * @param {number} [gasPrice=undefined] - the gasPrice desired for the tx
   */
  async setImbalanceStepFunction (
    account,
    token,
    buy,
    sell,
    gasPrice = undefined
  ) {
    validateAddress(token)
    await assertOperator(this, account.address)
    const xBuy = buy.map(val => val.x)
    const yBuy = buy.map(val => val.y)
    const xSell = sell.map(val => val.x)
    const ySell = sell.map(val => val.y)
    let tx = this.contract.methods.setImbalanceStepFunction(
      token,
      xBuy,
      yBuy,
      xSell,
      ySell
    )
    return monitorTx(
      tx.send({
        from: account.address,
        gas: await tx.estimateGas({ from: account.address }),
        gasPrice: gasPrice
      }),
      this.web3.eth,
      this.timeOutDuration
    )
  }

  /**
   * Set adjustments for tokens' buy and sell rates depending on the size of a
   * buy / sell order. Only operator can invoke.
   * @param {object} account - Web3 account, must be operator
   * @param {string} token - ERC20 token address
   * @param {StepFunctionDataPoint[]} buy - array of buy step function configurations
   * @param {StepFunctionDataPoint[]} sell - array of sell step function configurations
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   */
  async setQtyStepFunction (account, token, buy, sell, gasPrice) {
    validateAddress(token)
    await assertOperator(this, account.address)
    const xBuy = buy.map(val => val.x)
    const yBuy = buy.map(val => val.y)
    const xSell = sell.map(val => val.x)
    const ySell = sell.map(val => val.y)

    let tx = this.contract.methods.setQtyStepFunction(
      token,
      xBuy,
      yBuy,
      xSell,
      ySell
    )

    return monitorTx(
      tx.send({
        from: account.address,
        gas: await tx.estimateGas({ from: account.address }),
        gasPrice: gasPrice
      }),
      this.web3.eth,
      this.timeOutDuration
    )
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
    return this.contract.methods
      .getRate(token, currentBlockNumber, true, qty)
      .call()
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
    return this.contract.methods
      .getRate(token, currentBlockNumber, false, qty)
      .call()
  }

  /**
   * Set the buying rate for given token.
   * @param {object} account - Web3 account, must be operator
   * @param {RateSetting[]} rates - token address
   * @param {number} [currentBlockNumber=0] - current block number
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   */
  async setRate (account, rates, currentBlockNumber = 0, gasPrice) {
    await assertOperator(this, account.address)
    const indices = await rates.reduce(async (acc, val) => {
      const accumulator = await acc.then()
      accumulator[val.address] = await this.getTokenIndices(val.address)
      return Promise.resolve(accumulator)
    }, Promise.resolve({}))

    const data = await rates.reduce(
      async (acc, val) => {
        const accumulator = await acc.then()

        const currentBaseBuy = await this.contract.methods
          .getBasicRate(val.address, true)
          .call()

        const buyCompactData = new CompactData(val.buy, currentBaseBuy)

        const currentBaseSell = await this.contract.methods
          .getBasicRate(val.address, false)
          .call()
        const sellCompactData = new CompactData(val.sell, currentBaseSell)

        if (buyCompactData.isBaseChanged || sellCompactData.isBaseChanged) {
          accumulator.tokens.push(val.address)
          accumulator.baseBuys.push(buyCompactData.base.toString())
          accumulator.baseSells.push(sellCompactData.base.toString())
        }
        const buyCompact = buyCompactData.compact.toString()
        accumulator.compactBuys[val.address] = buyCompact
        const sellCompact = sellCompactData.compact.toString()
        accumulator.compactSells[val.address] = sellCompact

        return Promise.resolve(accumulator)
      },
      Promise.resolve({
        tokens: [],
        baseBuys: [],
        baseSells: [],
        compactBuys: {},
        compactSells: {}
      })
    )

    let compactInputs = buildCompactBulk(
      data.compactBuys,
      data.compactSells,
      indices
    )
    compactInputs.buyResults = compactInputs.buyResults.map(val =>
      Web3.utils.padLeft(Web3.utils.bytesToHex(val), 14)
    )
    compactInputs.sellResults = compactInputs.sellResults.map(val =>
      Web3.utils.padLeft(Web3.utils.bytesToHex(val), 14)
    )

    let tx
    if (data.tokens.length === 0) {
      tx = this.contract.methods.setCompactData(
        compactInputs.buyResults,
        compactInputs.sellResults,
        currentBlockNumber,
        compactInputs.indexResults
      )
    } else {
      tx = this.contract.methods.setBaseRate(
        data.tokens,
        data.baseBuys,
        data.baseSells,
        compactInputs.buyResults,
        compactInputs.sellResults,
        currentBlockNumber,
        compactInputs.indexResults
      )
    }

    const gas = await tx.estimateGas({ from: account.address })
    return monitorTx(
      tx.send({
        from: account.address,
        gas,
        gasPrice: gasPrice
      }),
      this.web3.eth,
      this.timeOutDuration
    )
  }
}
