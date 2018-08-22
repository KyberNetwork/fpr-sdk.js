/* eslint-env mocha */
import assert from 'assert'
import ganache from 'ganache-cli'
import Web3 from 'web3'

import Deployer from '../src/deployer'
import conversionRatesABI from '../contracts/ConversionRatesContract.abi'
import kyberReserveContractABI from '../contracts/KyberReserveContract.abi'
import sanityRatesContractABI from '../contracts/SanityRatesContract.abi'

const provider = ganache.provider()
const web3 = new Web3(provider)
const kyberNetworkAddress = '0x91a502C678605fbCe581eae053319747482276b9'

describe('Deployer', () => {
  it('failed to create a new instance with no provider', () => {
    assert.throws(() => new Deployer())
  })

  it('failed to deploy with no account', async () => {
    const dpl = new Deployer(provider)
    try {
      await dpl.deploy(undefined, kyberNetworkAddress, false)
      assert.ok(false)
    } catch (err) {
      assert.equal(err.message, 'missing account')
    }
  })

  it('deployed successfully with no sanityRates contract', async () => {
    const dpl = new Deployer(provider)
    const account = await getTestAccount(provider)

    const addresses = await dpl.deploy(account, kyberNetworkAddress, false)
    assert.ok(addresses.getReserve())
    assert.ok(addresses.getConversionRates())
    assert.strictEqual(addresses.getSanityRates(), undefined)

    const conversionRatesContract = new dpl.web3.eth.Contract(
      conversionRatesABI,
      addresses.getConversionRates()
    )
    assert.strictEqual(
      await conversionRatesContract.methods.admin().call(),
      account.address
    )
    assert.strictEqual(
      await conversionRatesContract.methods.reserveContract().call(),
      addresses.getReserve()
    )

    const reserveContract = new dpl.web3.eth.Contract(
      kyberReserveContractABI,
      addresses.getReserve()
    )
    assert.strictEqual(
      await reserveContract.methods.admin().call(),
      account.address
    )
    assert.strictEqual(
      await reserveContract.methods.conversionRatesContract().call(),
      addresses.getConversionRates()
    )
    assert.strictEqual(
      await reserveContract.methods.kyberNetwork().call(),
      kyberNetworkAddress
    )
    assert.strictEqual(
      await reserveContract.methods.sanityRatesContract().call(),
      '0x0000000000000000000000000000000000000000'
    )
  })

  it('deployed successfully with sanityRates contract', async () => {
    const dpl = new Deployer(provider)
    const account = await getTestAccount(provider)
    const addresses = await dpl.deploy(account, kyberNetworkAddress, true)
    assert.ok(addresses.getReserve())
    assert.ok(addresses.getConversionRates())
    assert.ok(addresses.getSanityRates())

    const conversionRatesContract = new dpl.web3.eth.Contract(
      conversionRatesABI,
      addresses.getConversionRates()
    )
    assert.strictEqual(
      await conversionRatesContract.methods.admin().call(),
      account.address
    )
    assert.strictEqual(
      await conversionRatesContract.methods.reserveContract().call(),
      addresses.getReserve()
    )

    const reserveContract = new dpl.web3.eth.Contract(
      kyberReserveContractABI,
      addresses.getReserve()
    )
    assert.strictEqual(
      await reserveContract.methods.admin().call(),
      account.address
    )
    assert.strictEqual(
      await reserveContract.methods.conversionRatesContract().call(),
      addresses.getConversionRates()
    )
    assert.strictEqual(
      await reserveContract.methods.kyberNetwork().call(),
      kyberNetworkAddress
    )
    assert.strictEqual(
      await reserveContract.methods.sanityRatesContract().call(),
      addresses.getSanityRates()
    )

    const sanityRatesContract = new dpl.web3.eth.Contract(
      sanityRatesContractABI,
      addresses.getSanityRates()
    )
    assert.strictEqual(
      await sanityRatesContract.methods.admin().call(),
      account.address
    )
  })
})

async function getTestAccount (provider) {
  const accounts = provider.manager.state.accounts
  const testAddress = Object.keys(accounts)[0]

  const privateKey = '0x' + accounts[testAddress].secretKey.toString('hex')
  return web3.eth.accounts.privateKeyToAccount(privateKey)
}
