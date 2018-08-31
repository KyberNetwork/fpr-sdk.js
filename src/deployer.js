import Web3 from 'web3'

import Addresses from './addresses'
import conversionRatesByteCode from '../contracts/ConversionRatesContract'
import conversionRatesABI from '../contracts/ConversionRatesContract.abi'
import kyberReserveContractABI from '../contracts/KyberReserveContract.abi'
import kyberReserveContractByteCode from '../contracts/KyberReserveContract'
import sanityRatesContractABI from '../contracts/SanityRatesContract.abi'
import sanityRatesContractByteCode from '../contracts/SanityRatesContract'

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
   * @param {object} provider - Web3 provider
   */
  constructor (provider) {
    if (!provider) {
      throw new Error('provider is not set')
    }
    this.web3 = new Web3(provider)
  }

  /**
   * Deploy new reserve and pricing contracts.
   * @param {object} account - Web3 account to create the smart contracts. This account is also set to be admin of the contracts
   * @param {string} [network=KyberNetworkAddress] - Address of KyberNetwork smart contract.
   * @param {boolean} [sanityRates=false] - If true, sanityRates contract will be deployed.
   * @param {number} [gasPrice=undefined] - the gasPrice desired for the tx
   * @return {Addresses} - Deployed reserve addresses set.
   */
  async deploy (account, network = KyberNetworkAddress, sanityRates = false,gasPrice = undefined) {
    if (!account) {
      throw new Error('missing account')
    }

    const deployContract = async (account, jsonInterface, byteCode, args) => {
      const dpl = new this.web3.eth.Contract(jsonInterface).deploy({
        data: `0x${byteCode}`,
        arguments: args
      })
      return dpl.send({
        from: account.address,
        gas: await dpl.estimateGas({
          from: account.address
        }),
        gasPrice: gasPrice
      })
    }

    const deployConversionRates = account => {
      console.log(
        'Deploying conversion ... This might take a while for the tx to be mined'
      )
      return deployContract(
        account,
        conversionRatesABI,
        conversionRatesByteCode,
        [account.address]
      )
    }

    const deployReserve = (account, network, conversionAddress) => {
      console.log(
        'Deploying reserve ... This might take a while for the tx to be mined'
      )
      const args = [network, conversionAddress, account.address]
      return deployContract(
        account,
        kyberReserveContractABI,
        kyberReserveContractByteCode,
        args
      )
    }

    const deploySanityRates = account => {
      console.log(
        'Deploying sanity ...This might take a while for the tx to be mined'
      )

      return deployContract(
        account,
        sanityRatesContractABI,
        sanityRatesContractByteCode,
        [account.address]
      )
    }

    // All the contract must be deployed sequentially
    const conversionRatesContract = await deployConversionRates(account)
    const reserveContract = await deployReserve(
      account,
      network,
      conversionRatesContract.options.address
    )
    let sanityRatesContract
    if (sanityRates) {
      sanityRatesContract = await deploySanityRates(account)
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
        from: account.address,
        gas: await setReserveAddressTx.estimateGas({
          from: account.address
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
        from: account.address,
        gas: await setContractsTx.estimateGas({
          from: account.address
        }),
        gasPrice: gasPrice
      })
    }
    const setContractAddressesTxResult = await setContractAddressesForReserve(
      reserveContract,
      network,
      conversionRatesContract.options.address,
      !sanityRatesContract ? undefined : sanityRatesContract.options.address
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
}
