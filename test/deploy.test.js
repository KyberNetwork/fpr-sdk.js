import assert from 'assert'
import ganache from 'ganache-cli'
import Web3 from 'web3'

import Deployer, { KyberNetworkAddress } from '../src/deployer'
import conversionRatesABI from '../abi/ConversionRatesContract.abi'
import kyberReserveContractABI from '../abi/KyberReserveContract.abi'
import sanityRatesContractABI from '../abi/SanityRatesContract.abi'

const provider = ganache.provider()
const web3 = new Web3(provider)

describe('Deployer', () => {
  it('failed to create a new instance with no provider', () => {
    assert.throws(() => new Deployer())
  })

  it('failed to deploy with no account', async () => {
    const dpl = new Deployer(web3)
    try {
      await dpl.deploy(undefined, KyberNetworkAddress, false)
      assert.ok(false)
    } catch (err) {
      assert.strictEqual(err.message, 'missing admin address')
    }
  })

  it('failed to deploy with no network address', async () => {
    const dpl = new Deployer(web3)
    const account = await getTestAccount(web3)
    try{
      await dpl.deploy(account.address, undefined, false)
      assert.ok(false)
    }catch (err){
      assert.strictEqual(err.message, 'missing network address')
    }
  })

  it('deployed successfully with no sanityRates contract', async () => {
    const dpl = new Deployer(web3)
    const account = await getTestAccount(web3)

    const addresses = await dpl.deploy(account.address, KyberNetworkAddress, false)
    assert.ok(addresses.reserve)
    assert.ok(addresses.conversionRates)
    assert.strictEqual(addresses.sanityRates, undefined)

    const conversionRatesContract = new dpl.web3.eth.Contract(
      conversionRatesABI,
      addresses.conversionRates
    )
    assert.strictEqual(
      await conversionRatesContract.methods.admin().call(),
      account.address
    )
    assert.strictEqual(
      await conversionRatesContract.methods.reserveContract().call(),
      addresses.reserve
    )

    const reserveContract = new dpl.web3.eth.Contract(
      kyberReserveContractABI,
      addresses.reserve
    )
    assert.strictEqual(
      await reserveContract.methods.admin().call(),
      account.address
    )
    assert.strictEqual(
      await reserveContract.methods.conversionRatesContract().call(),
      addresses.conversionRates
    )
    assert.strictEqual(
      await reserveContract.methods.kyberNetwork().call(),
      KyberNetworkAddress
    )
    assert.strictEqual(
      await reserveContract.methods.sanityRatesContract().call(),
      '0x0000000000000000000000000000000000000000'
    )
  })

  it('deployed successfully with sanityRates contract', async () => {
    const dpl = new Deployer(web3)
    const account = await getTestAccount(web3)
    const addresses = await dpl.deploy(account.address, KyberNetworkAddress, true)
    assert.ok(addresses.reserve)
    assert.ok(addresses.conversionRates)
    assert.ok(addresses.sanityRates)

    const conversionRatesContract = new dpl.web3.eth.Contract(
      conversionRatesABI,
      addresses.conversionRates
    )
    assert.strictEqual(
      await conversionRatesContract.methods.admin().call(),
      account.address
    )
    assert.strictEqual(
      await conversionRatesContract.methods.reserveContract().call(),
      addresses.reserve
    )

    const reserveContract = new dpl.web3.eth.Contract(
      kyberReserveContractABI,
      addresses.reserve
    )
    assert.strictEqual(
      await reserveContract.methods.admin().call(),
      account.address
    )
    assert.strictEqual(
      await reserveContract.methods.conversionRatesContract().call(),
      addresses.conversionRates
    )
    assert.strictEqual(
      await reserveContract.methods.kyberNetwork().call(),
      KyberNetworkAddress
    )
    assert.strictEqual(
      await reserveContract.methods.sanityRatesContract().call(),
      addresses.sanityRates
    )

    const sanityRatesContract = new dpl.web3.eth.Contract(
      sanityRatesContractABI,
      addresses.sanityRates
    )
    assert.strictEqual(
      await sanityRatesContract.methods.admin().call(),
      account.address
    )
  })
})

async function getTestAccount (web3) {
  const accounts = provider.manager.state.accounts
  const testAddress = Object.keys(accounts)[0]

  const privateKey = '0x' + accounts[testAddress].secretKey.toString('hex')
  return web3.eth.accounts.privateKeyToAccount(privateKey)
}
