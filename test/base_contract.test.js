import assert from 'assert'
import Web3 from 'web3'

import BaseContract from '../src/base_contract'

const infuraAPI = process.env.INFURA_API
// TODO: use ganache provider instead once Deployer is implemented
const provider = new Web3.providers.HttpProvider(infuraAPI)
const web3 = new Web3(provider)
const devBaseContractAddress = '0x798AbDA6Cc246D0EDbA912092A2a3dBd3d11191B'

describe('BaseContract', () => {
  it('failed to create an instance if provider is not provided', () => {
    assert.throws(() => {
      BaseContract(undefined, devBaseContractAddress)
    })
  })

  it('failed to create an instance if address is invalid', () => {
    assert.throws(() => {
      ;(() => BaseContract(provider, ''))()
    })
    assert.throws(() => {
      ;(() => BaseContract(provider, 'invalid-address'))()
    })
  })

  it('created an instance successfully', () => {
    const baseContract = new BaseContract(provider, devBaseContractAddress)
    assert.ok(baseContract.contract)
  })

  it('could view admin address', async () => {
    const baseContract = new BaseContract(provider, devBaseContractAddress)
    const admin = await baseContract.admin()
    assert.ok(Web3.utils.isAddress(admin))

    const pendingAdmin = await baseContract.pendingAdmin()
    assert.ok(Web3.utils.isAddress(pendingAdmin))
  })

  // TODO: this task always failed because no contract is deployed in
  // test network
  it('could transfer admin account', async () => {
    const accounts = await web3.eth.getAccounts()
    const baseContract = new BaseContract(provider, devBaseContractAddress)
    const currentAdmin = accounts[0]
    const newAdmin = accounts[1]
    let admin, pendingAdmin

    await baseContract.transferAdmin(currentAdmin, newAdmin.address)
    admin = await baseContract.admin()
    assert.equal(admin, currentAdmin.address)
    pendingAdmin = await baseContract.pendingAdmin()
    assert.equal(pendingAdmin, newAdmin.address)

    await baseContract.claimAdmin(newAdmin)
    admin = await baseContract.admin()
    assert.equal(admin, newAdmin.address)
    pendingAdmin = await baseContract.pendingAdmin()
    assert.equal(pendingAdmin, '')
  })

  it('could get list of all operators', async () => {
    const baseContract = new BaseContract(provider, devBaseContractAddress)
    let operators

    operators = await baseContract.getOperators()
    assert.ok(operators)
  })

  // TODO: this task always failed because no contract is deployed in
  // test network
  it('could change operator address', async () => {
    const baseContract = new BaseContract(provider, devBaseContractAddress)
    const accounts = await web3.eth.getAccounts()
    const currentAdmin = accounts[0]
    const newOperator = accounts[1]
    let operators

    operators = await baseContract.getOperators()
    assert.ok(!operators.include(newOperator))

    await baseContract.addOperator(currentAdmin, newOperator)
    operators = await baseContract.getOperators()
    assert.ok(operators.include(newOperator))

    await baseContract.removeOperator(currentAdmin, newOperator)
    assert.ok(!operators.include(operator))
  })

  it('could get list of all alerters', async () => {
    const baseContract = new BaseContract(provider, devBaseContractAddress)
    let alerters

    alerters = await baseContract.getAlerters()
    assert.ok(alerters)
  })

  // TODO: this task always failed because no contract is deployed in
  // test network
  it('could change alerter address', async () => {
    const baseContract = new BaseContract(provider, devBaseContractAddress)
    const accounts = await web3.eth.getAccounts()
    const currentAdmin = accounts[0]
    const newAlerter = accounts[1]
    let alerters

    alerters = await baseContract.getAlerters()
    assert.ok(!alerters.include(newAlerter))

    await baseContract.addAlerter(currentAdmin, newAlerter)
    alerters = await baseContract.getAlerters()
    assert.ok(alerters.include(newAlerter))

    await baseContract.removeAlerter(currentAdmin, newAlerter)
    assert.ok(!alerters.include(newAlerter))
  })
})
