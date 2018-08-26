import assert from 'assert'
import Web3 from 'web3'
import ganache from 'ganache-cli'

import ReserveContract from '../src/reserve_contract'
import Deployer from '../src/deployer'
import {
  default as ERC20TokenDeployer,
  exampleERC20Contract
} from './deploy_erc20'

const provider = ganache.provider()
const web3 = new Web3(provider)
const kyberNetworkAddress = '0x91a502C678605fbCe581eae053319747482276b9'

let addresses
beforeEach(async () => {
  const dpl = new Deployer(provider)
  addresses = await dpl.deploy(
    { address: (await dpl.web3.eth.getAccounts())[0] },
    kyberNetworkAddress,
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

  it('created an reserver contract instance successfully', () => {
    const reserveContract = new ReserveContract(provider, addresses.reserve)
    assert.ok(reserveContract.contract)
  })

  it('is able to alter trade status', async () => {
    const reserveContract = new ReserveContract(provider, addresses.reserve)
    const accounts = await reserveContract.web3.eth.getAccounts()
    const account = { address: accounts[0] }
    await assert.ok(await reserveContract.enableTrade(account))
    await assert.strictEqual(await reserveContract.tradeEnabled(), true)
    // it cannot disableTrade from a non alerter account
    await assertThrowAsync(async () => reserveContract.disableTrade(account))
    // it can disableTrade from an alerter account
    await reserveContract.addAlerter(account, accounts[1])
    await assert.ok(
      await reserveContract.disableTrade({ address: accounts[1] })
    )
    await assert.strictEqual(await reserveContract.tradeEnabled(), false)
  })

  it('is able to setContracts addresses', async () => {
    const reserveContract = new ReserveContract(provider, addresses.reserve)
    const accounts = await web3.eth.getAccounts()
    // it should run Ok with valid addresses
    await assert.ok(
      await reserveContract.setContracts(
        { address: accounts[0] },
        accounts[0],
        accounts[1],
        accounts[2]
      )
    )
    await assert.strictEqual(await reserveContract.kyberNetwork(), accounts[0])
    await assert.strictEqual(
      await reserveContract.conversionRatesContract(),
      accounts[1]
    )
    await assert.strictEqual(
      await reserveContract.sanityRatesContract(),
      accounts[2]
    )
    // it should throw if kybernetwork and conversionRate is not valid
    await assertThrowAsync(async () =>
      reserveContract.setContracts(
        { address: accounts[0] },
        'random',
        'random',
        accounts[2]
      )
    )
    // it should run ok without sanity Rates
    await assert.ok(
      await reserveContract.setContracts(
        { address: accounts[0] },
        accounts[0],
        accounts[1],
        undefined
      )
    )
  })

  it('is able to change withdrawal approvement status', async () => {
    console.log('testing approval status...')
    const reserveContract = new ReserveContract(provider, addresses.reserve)
    const accounts = await web3.eth.getAccounts()
    const tokenAddr = await ERC20TokenDeployer(provider)
    await assert.ok(
      await reserveContract.approveWithdrawAddress(
        { address: accounts[0] },
        tokenAddr,
        accounts[1]
      )
    )
    await assert.strictEqual(
      await reserveContract.approvedWithdrawAddresses(accounts[1], tokenAddr),
      true
    )
    await assert.ok(
      await reserveContract.disapproveWithdrawAddress(
        { address: accounts[0] },
        tokenAddr,
        accounts[1]
      )
    )
    await assert.strictEqual(
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
    assert.equal(await reserveContract.getBalance(tokenAddr), testAmount)

    // should throw since accounts[1] is not approved yet
    await assertThrowAsync(async () =>
      reserveContract.withdraw(
        { address: accounts[0] },
        tokenAddr,
        testAmount,
        accounts[1]
      )
    )
    // approve accounts[1] to receive testToken
    await assert.ok(
      await reserveContract.approveWithdrawAddress(
        { address: accounts[0] },
        tokenAddr,
        accounts[1]
      )
    )
    await assert.strictEqual(
      await reserveContract.approvedWithdrawAddresses(accounts[1], tokenAddr),
      true
    )
    // withdraw can only be called from operator..
    await assert.ok(
      await reserveContract.addOperator({ address: accounts[0] }, accounts[0])
    )
    // after approval, testToken should be able to withdraw
    await assert.ok(
      await reserveContract.withdraw(
        { address: accounts[0] },
        tokenAddr,
        testAmount,
        accounts[1]
      )
    )
    assert.equal(
      await tokenContract.methods.balanceOf(accounts[1]).call(),
      testAmount
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
    assert.equal(await reserveContract.getBalance(tokenAddr), testAmount)
  })
})

async function assertThrowAsync (fn) {
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
