import assert from 'assert'
import Web3 from 'web3'
import ganache from 'ganache-cli'

import ReserveContract from '../src/reserve_contract'
import Deployer, { KyberNetworkAddress } from '../src/deployer'
import {
  default as ERC20TokenDeployer,
  exampleERC20Contract
} from './deploy_erc20'

const provider = ganache.provider()
const web3 = new Web3(provider)

export const assertThrowAsync = async fn => {
  let dummy = () => {}
  try {
    await fn()
  } catch (err) {
    dummy = () => {
      throw err
    }
  } finally {
    assert.throws(dummy)
  }
}

let addresses
beforeEach(async () => {
  const dpl = new Deployer(provider)
  addresses = await dpl.deploy(
    { address: (await dpl.web3.eth.getAccounts())[0] },
    KyberNetworkAddress,
    false
  )
})

describe('ReserveContract', () => {
  it('failed to create an instance if provider is not provided', () => {
    assert.throws(() => {
      ReserveContract(undefined, addresses.reserve)
    })
  })

  it('failed to create an instance if address is invalid', () => {
    assert.throws(() => {
      ReserveContract(provider, '')
    })
    assert.throws(() => {
      ReserveContract(provider, 'invalid-address')
    })
  })

  it('created an reserve contract instance successfully', () => {
    const reserveContract = new ReserveContract(provider, addresses.reserve)
    assert.ok(reserveContract.contract)
  })

  it('is able to alter trade status', async () => {
    const reserveContract = new ReserveContract(provider, addresses.reserve)
    const accounts = await reserveContract.web3.eth.getAccounts()
    const account = { address: accounts[0] }
    assert.ok(await reserveContract.enableTrade(account))
    assert.strictEqual(await reserveContract.tradeEnabled(), true)
    // it cannot disableTrade from a non alerter account
    await assertThrowAsync(() => reserveContract.disableTrade(account))
    // it can disableTrade from an alerter account
    await reserveContract.addAlerter(account, accounts[1])
    assert.ok(await reserveContract.disableTrade({ address: accounts[1] }))
    assert.strictEqual(await reserveContract.tradeEnabled(), false)
  })

  it('is able to setContracts addresses', async () => {
    const reserveContract = new ReserveContract(provider, addresses.reserve)
    const accounts = await web3.eth.getAccounts()
    // it should run Ok with valid addresses
    assert.ok(
      await reserveContract.setContracts(
        { address: accounts[0] },
        accounts[0],
        accounts[1],
        accounts[2]
      )
    )
    assert.strictEqual(await reserveContract.kyberNetwork(), accounts[0])
    assert.strictEqual(
      await reserveContract.conversionRatesContract(),
      accounts[1]
    )
    assert.strictEqual(await reserveContract.sanityRatesContract(), accounts[2])
    // it should throw if kybernetwork and conversionRate is not valid
    await assertThrowAsync(() =>
      reserveContract.setContracts(
        { address: accounts[0] },
        'random',
        'random',
        accounts[2]
      )
    )
    // it should run ok without sanity Rates
    assert.ok(
      await reserveContract.setContracts(
        { address: accounts[0] },
        accounts[0],
        accounts[1],
        undefined
      )
    )

    // it should throw an error if sanity rates address is invalid
    await assertThrowAsync(() =>
      reserveContract.setContracts(
        { address: accounts[0] },
        accounts[0],
        accounts[1],
        'invalid-address'
      )
    )
  })

  it('is able to change withdrawal approvement status', async () => {
    console.log('testing approval status...')
    const reserveContract = new ReserveContract(provider, addresses.reserve)
    const accounts = await web3.eth.getAccounts()
    const tokenAddr = await ERC20TokenDeployer(provider)
    assert.ok(
      await reserveContract.approveWithdrawAddress(
        { address: accounts[0] },
        tokenAddr,
        accounts[1]
      )
    )
    assert.strictEqual(
      await reserveContract.approvedWithdrawAddresses(accounts[1], tokenAddr),
      true
    )
    assert.ok(
      await reserveContract.disapproveWithdrawAddress(
        { address: accounts[0] },
        tokenAddr,
        accounts[1]
      )
    )
    assert.strictEqual(
      await reserveContract.approvedWithdrawAddresses(accounts[1], tokenAddr),
      false
    )
  })

  it('is able to withdraw Token', async () => {
    console.log('testing token withdrawal...')
    const testAmount = 1000
    const reserveContract = new ReserveContract(provider, addresses.reserve)
    const accounts = await reserveContract.web3.eth.getAccounts()
    const tokenAddr = await ERC20TokenDeployer(provider)
    const tokenContract = new reserveContract.web3.eth.Contract(
      JSON.parse(exampleERC20Contract.abi),
      tokenAddr
    )

    // send some token to reserve
    await tokenContract.methods
      .transfer(addresses.reserve, testAmount)
      .send({ from: accounts[0] })
    assert.strictEqual(
      await reserveContract.getBalance(tokenAddr),
      testAmount.toString()
    )

    // should throw since accounts[1] is not approved yet
    await assertThrowAsync(() =>
      reserveContract.withdraw(
        { address: accounts[0] },
        tokenAddr,
        testAmount,
        accounts[1]
      )
    )
    // approve accounts[1] to receive testToken
    assert.ok(
      await reserveContract.approveWithdrawAddress(
        { address: accounts[0] },
        tokenAddr,
        accounts[1]
      )
    )
    assert.strictEqual(
      await reserveContract.approvedWithdrawAddresses(accounts[1], tokenAddr),
      true
    )
    // withdraw can only be called from operator..
    assert.ok(
      await reserveContract.addOperator({ address: accounts[0] }, accounts[0])
    )
    // after approval, testToken should be able to withdraw
    assert.ok(
      await reserveContract.withdraw(
        { address: accounts[0] },
        tokenAddr,
        testAmount,
        accounts[1]
      )
    )
    assert.strictEqual(
      await tokenContract.methods.balanceOf(accounts[1]).call(),
      testAmount.toString()
    )
  })

  it('get the correct balance of a token in reserve', async () => {
    console.log('testing getBalance...')
    const testAmount = 1000
    const reserveContract = new ReserveContract(provider, addresses.reserve)
    const tokenAddr = await ERC20TokenDeployer(provider)
    const accounts = await reserveContract.web3.eth.getAccounts()
    const tokenContract = new reserveContract.web3.eth.Contract(
      JSON.parse(exampleERC20Contract.abi),
      tokenAddr
    )
    await tokenContract.methods
      .transfer(addresses.reserve, testAmount)
      .send({ from: accounts[0] })
    assert.strictEqual(
      await reserveContract.getBalance(tokenAddr),
      testAmount.toString()
    )
  })
})
