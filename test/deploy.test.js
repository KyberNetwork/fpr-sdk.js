/* eslint-env mocha */
import assert from 'assert'
import ganache from 'ganache-cli'
import Web3 from 'web3'

import Deployer from '../src/deployer'

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
    assert.notEqual(addresses.getReserve(), null)
    assert.notEqual(addresses.getConversionRates(), null)
    assert.equal(addresses.getSanityRates(), null)
  })

  it('deployed successfully with sanityRates contract', async () => {
    const dpl = new Deployer(provider)
    const account = await getTestAccount(provider)
    const addresses = await dpl.deploy(account, kyberNetworkAddress, true)
    assert.notEqual(addresses.getReserve(), null)
    assert.notEqual(addresses.getConversionRates(), null)
    assert.notEqual(addresses.getSanityRates(), null)
  })
})

async function getTestAccount (provider) {
  const accounts = await provider.manager.state.accounts
  const testAddress = Object.keys(accounts)[0]

  const privateKey = '0x' + accounts[testAddress].secretKey.toString('hex')
  const account = await web3.eth.accounts.privateKeyToAccount(privateKey)
  return account
}
