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
    this.web3 = new Web3(provider)
    this.contract = new this.web3.eth.Contract(reserveContractABI, address)
  }

  async enableTrade (account) {
    const med = this.contract.methods.enableTrade()
    return this.contract.methods.enableTrade().send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })
    })
  }

  tradeEnabled () {
    return this.contract.methods.tradeEnabled().call()
  }
  async disableTrade (account) {
    const med = this.contract.methods.disableTrade()
    return med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })
    })
  }
  /**
   * set Contract addresses for reserver contract.
   * @param {object} account - admin account.
   * @param {string} network - address of kyber network smart contract.
   * @param {string} conversion - address of kyber network smart contract.
   * @param {string} sanity (optional) - address of sanity rates contract.
   * @returns {txObject} - the tx object of send() command from this contract method
   */
  async setContracts (account, network, conversion, sanity) {
    validateAddress(network)
    validateAddress(conversion)
    const med = this.contract.methods.setContracts(network, conversion, sanity)
    return med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })
    })
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

  /**
   * approve/disapprove withdraw address for a token on reserve.
   * @param {object} account - admin account.
   * @param {string} tokenAddress - contract address of the modifying token.
   * @param {string} withdrawAddress - address for withdrawal.
   * @param {boolean} approve - true if approving, false for disapproving.
   * @returns {txObject} - the tx object of send() command from this contract method
   */
  async approveWithdrawAddress (
    account,
    tokenAddress,
    withdrawAddress,
    approve
  ) {
    const med = this.contract.methods.approveWithdrawAddress(
      tokenAddress,
      withdrawAddress,
      approve
    )
    return med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })
    })
  }

  /**
   * check for approval status of a token address to a particular address
   * @param {object} address - address to withdraw the token to
   * @param {string} tokenAddress - address of the token's smart contract. Must be deployed already.
   * @returns {bool} - true for approved, false otherwise
   */
  approvedWithdrawAddresses (address, tokenAddress) {
    const addressHash = Web3.utils.soliditySha3(tokenAddress, address)
    return this.contract.methods.approvedWithdrawAddresses(addressHash).call()
  }

  /**
   * withdraw token
   * @param {object} account - admin account.
   * @param {string} tokenAddress - address of the token's smart contract. Must be deployed already.
   * @param {object} amount - amount to withdraw (BN|String|int), must be in wei.
   * @param {string} toAddress - address for withdrawal.
   * @returns {txObject} - the tx object of send() command from this contract method
   */
  async withdrawToken (account, tokenAddress, amount, toAddress) {
    const med = this.contract.methods.withdrawToken(tokenAddress, amount, toAddress)
    return med.send({
      from: account.address,
      gas: await med.estimateGas({
        from: account.address
      })  
    })
  }
}