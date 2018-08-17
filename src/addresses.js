/**
 * Addresses contains addresses of all contracts of a KyberNetwork reserve.
 */
export default class Addresses {
  getSanityRates() {
    return this.sanityRates;
  }

  setSanityRates(value) {
    this.sanityRates = value;
  }

  getConversionRates() {
    return this.conversionRates;
  }

  setConversionRates(value) {
    this.conversionRates = value;
  }

  getReserve() {
    return this.reserve;
  }

  setReserve(value) {
    this.reserve = value;
  }

  /**
   * Create a addresses instance.
   * @param {string} reserve - Address of reserve smart contract.
   * @param {string} conversionRates - Address of pricing smart contract.
   * @param {string} sanityRates - Address of pricing smart contract.
   */
  constructor(reserve, conversionRates, sanityRates) {
    this.reserve = reserve;
    this.conversionRates = conversionRates;
    this.sanityRates = sanityRates;
  }
}
