import assert from 'assert'
import Web3 from 'web3'
import ganache from 'ganache-cli'

import BaseContract from '../src/base_contract'
import Deployer, { KyberNetworkAddress } from '../src/deployer'

const provider = ganache.provider()
const web3 = new Web3(provider)

let addresses
beforeEach(async () => {
  const dpl = new Deployer(provider)
  addresses = await dpl.deploy(
    { address: (await dpl.web3.eth.getAccounts())[0] },
    KyberNetworkAddress,
    false
  )
})

describe('BaseContract', () => {
  it('failed to create an instance if provider is not provided', () => {
    assert.throws(() => {
      BaseContract(undefined, addresses.conversionRates)
    })
  })

  it('failed to create an instance if address is invalid', () => {
    assert.throws(() => {
      BaseContract(provider, '')
    })
    assert.throws(() => {
      BaseContract(provider, 'invalid-address')
    })
  })

  it('created an instance successfully', () => {
    const baseContract = new BaseContract(provider, addresses.conversionRates)
    assert.ok(baseContract.contract)
  })

  it('could view admin address', async () => {
    const baseContract = new BaseContract(provider, addresses.conversionRates)
    const admin = await baseContract.admin()
    const accounts = await web3.eth.getAccounts()
    assert.strictEqual(admin, accounts[0])

    const pendingAdmin = await baseContract.pendingAdmin()
    assert.ok(Web3.utils.isAddress(pendingAdmin))
  })

  it('could transfer admin account', async () => {
    const accounts = await web3.eth.getAccounts()
    const baseContract = new BaseContract(provider, addresses.conversionRates)
    const currentAdmin = accounts[0]
    const newAdmin = accounts[1]
    let admin, pendingAdmin

    await baseContract.transferAdmin({ address: currentAdmin }, newAdmin)
    admin = await baseContract.admin()
    assert.strictEqual(admin, currentAdmin)
    pendingAdmin = await baseContract.pendingAdmin()
    assert.strictEqual(pendingAdmin, newAdmin)

    await baseContract.claimAdmin({ address: newAdmin })
    admin = await baseContract.admin()
    assert.strictEqual(admin, newAdmin)
    pendingAdmin = await baseContract.pendingAdmin()
    assert.strictEqual(
      pendingAdmin,
      '0x0000000000000000000000000000000000000000'
    )
  })

  it('could get list of all operators', async () => {
    const baseContract = new BaseContract(provider, addresses.conversionRates)
    let operators

    operators = await baseContract.getOperators()
    assert.strictEqual(operators.length, 0)
  })

  it('could change operator address', async () => {
    const baseContract = new BaseContract(provider, addresses.conversionRates)
    const accounts = await web3.eth.getAccounts()
    const currentAdmin = accounts[0]
    const newOperator = accounts[1]
    let operators

    operators = await baseContract.getOperators()
    assert.ok(!operators.includes(newOperator))

    await baseContract.addOperator({ address: currentAdmin }, newOperator)
    operators = await baseContract.getOperators()
    assert.ok(operators.includes(newOperator))

    await baseContract.removeOperator({ address: currentAdmin }, newOperator)
    operators = await baseContract.getOperators()
    assert.ok(!operators.includes(newOperator))
  })

  it('could get list of all alerters', async () => {
    const baseContract = new BaseContract(provider, addresses.conversionRates)
    let alerters

    alerters = await baseContract.getAlerters()
    assert.ok(alerters)
  })

  it('could change alerter address', async () => {
    const baseContract = new BaseContract(provider, addresses.conversionRates)
    const accounts = await web3.eth.getAccounts()
    const currentAdmin = accounts[0]
    const newAlerter = accounts[1]
    let alerters

    alerters = await baseContract.getAlerters()
    assert.ok(!alerters.includes(newAlerter))

    await baseContract.addAlerter({ address: currentAdmin }, newAlerter)
    alerters = await baseContract.getAlerters()
    assert.ok(alerters.includes(newAlerter))

    await baseContract.removeAlerter({ address: currentAdmin }, newAlerter)
    alerters = await baseContract.getAlerters()
    assert.ok(!alerters.includes(newAlerter))
  })
})
