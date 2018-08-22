/**
 * Addresses contains addresses of all contracts of a KyberNetwork reserve.
 */
export default class Addresses {
  get sanityRates () {
    return this._sanityRates
  }

  set sanityRates (value) {
    this._sanityRates = value
  }

  get conversionRates () {
    return this._conversionRates
  }

  set conversionRates (value) {
    this._conversionRates = value
  }

  get reserve () {
    return this._reserve
  }

  set reserve (value) {
    this._reserve = value
  }

  /**
   * Create a addresses instance.
   * @param {string} reserve - Address of reserve smart contract.
   * @param {string} conversionRates - Address of pricing smart contract.
   * @param {string} sanityRates - Address of pricing smart contract.
   */
  constructor (reserve, conversionRates, sanityRates) {
    this._reserve = reserve
    this._conversionRates = conversionRates
    this._sanityRates = sanityRates
  }
}
