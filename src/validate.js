import Web3 from 'web3'

/**
 * throw an exception if the given address is not a valid Ethereum address.
 * @param address {string} - an Ethereum address
 */
export const validateAddress = address => {
  if (!Web3.utils.isAddress(address)) {
    throw new Error(`invalid address: '${address}'`)
  }
}
