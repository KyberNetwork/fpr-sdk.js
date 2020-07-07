import assert from 'assert'
import Web3 from 'web3'
import ganache from 'ganache-cli'
import deployERC20Contract from './deploy_erc20'

import ConversionRatesContract, {
  buildCompactBulk,
  CompactData,
  CompactDataLocation,
  RateSetting,
  StepFunctionDataPoint,
  TokenControlInfo
} from '../src/conversion_rates_contract'
import Deployer, { KyberNetworkAddress } from '../src/deployer'
import { BigNumber } from 'bignumber.js'
import { assertThrowAsync } from './test_util'

const provider = ganache.provider()
const web3 = new Web3(provider)

let addresses
let accounts
beforeEach(async () => {
  const dpl = new Deployer(web3)
  addresses = await dpl.deploy(
    (await dpl.web3.eth.getAccounts())[0],
    KyberNetworkAddress,
    false
  )
  accounts = await web3.eth.getAccounts()
})

describe('ConversionRatesContract', () => {
  it('failed to create an instance if instance is not provided', () => {
    assert.throws(() => {
      ConversionRatesContract(undefined, addresses.conversionRates)
    })
  })

  it('failed to create an instance if address is invalid', () => {
    assert.throws(() => {
      ConversionRatesContract(web3, '')
    })
    assert.throws(() => {
      ConversionRatesContract(web3, 'invalid-address')
    })
  })

  it('created an instance successfully', () => {
    const conversionRatesContract = new ConversionRatesContract(
      web3,
      addresses.conversionRates
    )
    assert.ok(conversionRatesContract.contract)
  })

  it('built compact rate correctly', () => {
    let compactData = new CompactData(new BigNumber(40), new BigNumber(30))
    assert.ok(compactData.base.isEqualTo(40))
    assert.ok(compactData.compact.isEqualTo(0))

    compactData = new CompactData(new BigNumber(31), new BigNumber(30))
    assert.ok(compactData.base.isEqualTo(30))
    assert.ok(compactData.compact.isEqualTo(33))

    compactData = new CompactData(new BigNumber(3381), new BigNumber(3000))
    assert.ok(compactData.base.isEqualTo(3000))
    assert.ok(compactData.compact.isEqualTo(127))

    compactData = new CompactData(new BigNumber(2616), new BigNumber(3000))
    assert.ok(compactData.base.isEqualTo(3000))
    assert.ok(compactData.compact.isEqualTo(128))

    compactData = new CompactData(new BigNumber(2997), new BigNumber(3000))
    assert.ok(compactData.base.isEqualTo(3000))
    assert.ok(compactData.compact.isEqualTo(255))

    compactData = new CompactData(new BigNumber(1000), new BigNumber(3000))
    assert.ok(compactData.base.isEqualTo(1000))
    assert.ok(compactData.compact.isEqualTo(0))
  })

  it('build compact bulk correctly', () => {
    const addr1 = '0x14535eE720e329f66071B86486763Da4637034aE'
    const addr2 = '0x24535eE720e329F66071b86486763da4637034AE'
    const addr3 = '0x34535ee720e329f66071B86486763Da4637034aE'
    const buysInput = {
      [addr1]: 23,
      [addr2]: 24,
      [addr3]: 25
    }
    const sellsInput = {
      [addr1]: 26,
      [addr2]: 27,
      [addr3]: 28
    }
    const indicesInput = {
      [addr1]: new CompactDataLocation(3, 9),
      [addr2]: new CompactDataLocation(9, 5),
      [addr3]: new CompactDataLocation(9, 6)
    }

    const results = buildCompactBulk(buysInput, sellsInput, indicesInput)
    const expectedBuys = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 24, 25, 0, 0, 0, 0, 0, 0, 0]
    ]
    const expectedSells = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 26, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 27, 28, 0, 0, 0, 0, 0, 0, 0]
    ]
    const expectedIndices = [3, 9]

    assert.deepEqual(results.buyResults, expectedBuys)
    assert.deepEqual(results.sellResults, expectedSells)
    assert.deepEqual(results.indexResults, expectedIndices)
  })

  it('could get and set rates', async () => {
    let tokens = []
    tokens.push(await deployERC20Contract(web3))
    tokens.push(await deployERC20Contract(web3))
    const buyRates = [100, 200]
    const sellRates = [300, 400]

    const admin = accounts[0]
    const operator = accounts[1]
    const crc = new ConversionRatesContract(web3, addresses.conversionRates)

    await crc.addOperator(admin, operator)

    // should not be able to add Token from non-admin account
    await assertThrowAsync(async () =>
      crc.addToken(
        operator,
        tokens[0],
        new TokenControlInfo(2, 4000, 4000 * 12)
      )
    )

    // should not be able to call write/set funcs from non-admin account
    await assertThrowAsync(async () =>
      crc.setQtyStepFunction(
        admin,
        tokens[0],
        [new StepFunctionDataPoint(0, 0)],
        [new StepFunctionDataPoint(0, 0)]
      )
    )
    await assertThrowAsync(async () =>
      crc.setImbalanceStepFunction(
        admin ,
        tokens[0],
        [new StepFunctionDataPoint('100000000000000000000', 0)],
        [new StepFunctionDataPoint('100000000000000000000', 0)]
      )
    )

    await Promise.all(
      tokens.map(async token => {
        await crc.addToken(
          admin,
          token,
          new TokenControlInfo(2, 4000, 4000 * 12)
        )

        await crc.setQtyStepFunction(
          operator,
          token,
          [new StepFunctionDataPoint(0, 0)],
          [new StepFunctionDataPoint(0, 0)]
        )

        await crc.setImbalanceStepFunction(
          operator,
          token,
          [new StepFunctionDataPoint('100000000000000000000', 0)],
          [new StepFunctionDataPoint('100000000000000000000', 0)]
        )
      })
    )

    // should not be able to setRate from non operator account
    await assertThrowAsync(async () =>
      crc.setRate(
        admin,
        [new RateSetting(tokens[0], buyRates[0], sellRates[0])],
        (await web3.eth.getBlockNumber()) + 1
      )
    )
    await crc.setRate(
      operator,
      [new RateSetting(tokens[0], buyRates[0], sellRates[0])],
      (await web3.eth.getBlockNumber()) + 1
    )

    assert.ok(
      await crc.getBuyRates(tokens[0], 1, await web3.eth.getBlockNumber()),
      buyRates[0].toString()
    )
    assert.strictEqual(
      await crc.getSellRates(tokens[0], 1, await web3.eth.getBlockNumber()),
      sellRates[0].toString()
    )

    await crc.setRate(
      operator,
      [new RateSetting(tokens[1], buyRates[1], sellRates[1])],
      (await web3.eth.getBlockNumber()) + 1
    )

    assert.strictEqual(
      await crc.getBuyRates(tokens[1], 1, await web3.eth.getBlockNumber()),
      buyRates[1].toString()
    )
    assert.strictEqual(
      await crc.getSellRates(tokens[1], 1, await web3.eth.getBlockNumber()),
      sellRates[1].toString()
    )

    await crc.setRate(
      operator,
      tokens.map(
        (token, index) =>
          new RateSetting(token, buyRates[index] + 1, sellRates[index] + 2)
      ),
      (await web3.eth.getBlockNumber()) + 1
    )

    await Promise.all(
      tokens.map(async (token, index) => {
        let currentBlock = await web3.eth.getBlockNumber()
        assert.strictEqual(
          await crc.getBuyRates(token, 1, currentBlock),
          (buyRates[index] + 1).toString()
        )
        assert.strictEqual(
          await crc.getSellRates(token, 1, currentBlock),
          (sellRates[index] + 2).toString()
        )
      })
    )

    await crc.setRate(
      operator,
      tokens.map(
        (token, index) =>
          new RateSetting(token, buyRates[index] + 1000, sellRates[index] + 2)
      ),
      (await web3.eth.getBlockNumber()) + 1
    )

    await Promise.all(
      tokens.map(async (token, index) => {
        let currentBlock = await web3.eth.getBlockNumber()
        assert.strictEqual(
          await crc.getBuyRates(token, 1, currentBlock),
          (buyRates[index] + 1000).toString()
        )
        assert.strictEqual(
          await crc.getSellRates(token, 1, currentBlock),
          (sellRates[index] + 2).toString()
        )
      })
    )

    await crc.setRate(
       operator,
      tokens.map(
        (token, index) =>
          new RateSetting(token, buyRates[index] + 500, sellRates[index] + 600)
      ),
      (await web3.eth.getBlockNumber()) + 1
    )

    await Promise.all(
      tokens.map(async (token, index) => {
        let currentBlock = await web3.eth.getBlockNumber()
        assert.strictEqual(
          await crc.getBuyRates(token, 1, currentBlock),
          (buyRates[index] + 500).toString()
        )
        assert.strictEqual(
          await crc.getSellRates(token, 1, currentBlock),
          (sellRates[index] + 600).toString()
        )
      })
    )
  })
})
