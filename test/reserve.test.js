import assert from 'assert'
import Web3 from 'web3'
import ganache from 'ganache-cli'

import Reserve from '../src/reserve'
import Deployer from '../src/deployer'

const provider = ganache.provider()
const web3 = new Web3(provider)
const kyberNetworkAddress = '0x91a502C678605fbCe581eae053319747482276b9'

let addresses


describe('Reserve', () => {
  it('failed to create an instance if provider is not provided', () => {
    assert.throws(() => {
      Reserve(undefined, addresses)
    })
  })

  it('failed to create an instance if address is invalid', () => {
    assert.throws(() => {
      Reserve(provider, '')
    })
    assert.throws(() => {
      Reserve(provider, 'invalid-address')
    })
  })

  it('created an reserve contract instance successfully', async () => {
    const dpl = new Deployer(provider)
    addresses = await dpl.deploy(
      { address: (await dpl.web3.eth.getAccounts())[0] },
      kyberNetworkAddress,
      true
    )
    const reserve = new Reserve(provider, addresses)
    assert.ok(reserve.reserve)
    assert.ok(reserve.sanityRates)
    assert.ok(reserve.conversionRates)
  })

  it('created an reserve contract instance successfully without sanity Rates',async () => {
    const dpl = new Deployer(provider)
    addresses = await dpl.deploy(
      { address: (await dpl.web3.eth.getAccounts())[0] },
      kyberNetworkAddress,
      false
    )    
    const reserve = new Reserve(provider, addresses)
    assert.ok(reserve.reserve)
    assert.ok(!reserve.sanityRates)
    assert.ok(reserve.conversionRates)
  })

})
