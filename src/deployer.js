import Web3 from 'web3'

import Addresses from './addresses.js'
import conversionRatesByteCode from './contracts/ConversionRatesContract.js'
import conversionRatesABI from '../abi/ConversionRatesContract.abi.json'
import kyberReserveContractABI from '../abi/KyberReserveContract.abi.json'
import kyberReserveContractByteCode from './contracts/KyberReserveContract.js'
import sanityRatesContractABI from '../abi/SanityRatesContract.abi.json'
import sanityRatesContractByteCode from './contracts/SanityRatesContract.js'

/**
 * KyberNetworkAddress is the smart contract address of KyberNetwork.</br>
 * *Last updated*: 2018, August 31
 * @type {string}
 */
export const KyberNetworkAddress = '0x91a502C678605fbCe581eae053319747482276b9'

/**
 * Deployer is used for deploying new KyberNetwork reserve contracts.
 * It deployed all requires smart contracts for running a reserve:
 * <ul>
 *   <li>reserve</li>
 *   <li>conversionRates</li>
 *   <li>sanityRates (optional)</li>
 * </ul>
 */
export default class Deployer {
  /**
   * Create a deployer instance with given account parameter.
   * @param {object} web3 - Web3 instance
   */
  constructor (web3) {
    if (web3.currentProvider == null) {
      throw new Error('web3 is not provided')
    }
    this.web3 = web3
  }

  /**
   * Deploy new reserve and pricing contracts.
   * @param {object} adminAddress - Web3 account to create the smart contracts. This account is also set to be admin of the contracts
   * @param {string} [network] - Address of KyberNetwork smart contract.
   * @param {boolean} [sanityRates=false] - If true, sanityRates contract will be deployed.
   * @param {number} gasPrice (optional) - the gasPrice desired for the tx
   * @return {Addresses} - Deployed reserve addresses set.
   */
  async deploy (
    adminAddress,
    network,
    sanityRates = false,
    gasPrice
  ) {
    if (!adminAddress) {
      throw new Error('missing admin address')
    }
    if (!network) {
      throw new Error('missing network address')
    }

    const deployContract = async (adminAddress, jsonInterface, byteCode, args) => {
      const dpl = new this.web3.eth.Contract(jsonInterface).deploy({
        data: `0x${byteCode}`,
        arguments: args
      })
      return dpl.send({
        from: adminAddress,
        gas: await dpl.estimateGas({
          from: adminAddress
        }),
        gasPrice: gasPrice
      })
    }

    const deployConversionRates = adminAddress => {
      console.log(
        'Deploying conversion ... This might take a while for the tx to be mined'
      )
      return deployContract(
        adminAddress,
        conversionRatesABI,
        conversionRatesByteCode,
        [adminAddress]
      )
    }

    const deployReserve = (adminAddress, network, conversionAddress) => {
      console.log(
        'Deploying reserve ... This might take a while for the tx to be mined'
      )
      const args = [network, conversionAddress, adminAddress]
      return deployContract(
        adminAddress,
        kyberReserveContractABI,
        kyberReserveContractByteCode,
        args
      )
    }

    const deploySanityRates = adminAddress => {
      console.log(
        'Deploying sanity ...This might take a while for the tx to be mined'
      )

      return deployContract(
        adminAddress,
        sanityRatesContractABI,
        sanityRatesContractByteCode,
        [adminAddress]
      )
    }

    // All the contract must be deployed sequentially
    const conversionRatesContract = await deployConversionRates(adminAddress)
    const reserveContract = await deployReserve(
      adminAddress,
      network,
      conversionRatesContract.options.address
    )
    let sanityRatesContract
    if (sanityRates) {
      sanityRatesContract = await deploySanityRates(adminAddress)
    }

    const setReserveAddressForConversionRates = async (
      conversionRatesContract,
      reserveAddress
    ) => {
      console.log('linking reserveContractAddress to conversionRateContract...')
      const setReserveAddressTx = await conversionRatesContract.methods.setReserveAddress(
        reserveAddress
      )
      return setReserveAddressTx.send({
        from: adminAddress,
        gas: await setReserveAddressTx.estimateGas({
          from: adminAddress
        }),
        gasPrice: gasPrice
      })
    }

    const setReserveAddressTxResult = await setReserveAddressForConversionRates(
      conversionRatesContract,
      reserveContract.options.address
    )
    console.log(
      'setReserveAddressTx: ',
      setReserveAddressTxResult.transactionHash
    )

    const setContractAddressesForReserve = async (
      reserveContract,
      networkAddress,
      rateAddress,
      sanityAddress
    ) => {
      console.log(
        'linking network, rate and sanity contract address to reserveContract...'
      )
      const setContractsTx = await reserveContract.methods.setContracts(
        networkAddress,
        rateAddress,
        sanityAddress
      )
      return setContractsTx.send({
        from: adminAddress,
        gas: await setContractsTx.estimateGas({
          from: adminAddress
        }),
        gasPrice: gasPrice
      })
    }
    const setContractAddressesTxResult = await setContractAddressesForReserve(
      reserveContract,
      network,
      conversionRatesContract.options.address,
      !sanityRatesContract
        ? '0x0000000000000000000000000000000000000000'
        : sanityRatesContract.options.address
    )
    console.log(
      'setContractAddressesTx: ',
      setContractAddressesTxResult.transactionHash
    )

    return new Addresses(
      reserveContract.options.address,
      conversionRatesContract.options.address,
      !sanityRatesContract ? undefined : sanityRatesContract.options.address
    )
  }
  async deploySanityRates (
    adminAddress,
    gasPrice
  ) {
    if (!adminAddress) {
      throw new Error('missing admin address')
    }

    const deployContract = async (adminAddress, jsonInterface, byteCode, args) => {
      const dpl = new this.web3.eth.Contract(jsonInterface).deploy({
        data: `0x${byteCode}`,
        arguments: args
      })
      return dpl.send({
        from: adminAddress,
        gas: await dpl.estimateGas({
          from: adminAddress
        }),
        gasPrice: gasPrice
      })
    }

    const deploySanityRates = adminAddress => {
      console.log(
        'Deploying sanity ...This might take a while for the tx to be mined'
      )

      return deployContract(
        adminAddress,
        sanityRatesContractABI,
        sanityRatesContractByteCode,
        [adminAddress]
      )
    }

    let sanityRatesContract = await deploySanityRates(adminAddress)
    return sanityRatesContract.options.address
    
  }
}