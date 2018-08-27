import Web3 from 'web3'

export const validateAddress = address => {
  if (!Web3.utils.isAddress(address)) {
    throw new Error(`invalid address: '${address}'`)
  }
}
