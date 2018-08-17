import assert from 'assert'
import Web3 from 'web3'

import BaseContract from '../src/base_contract'

const infuraAPI = process.env.INFURA_API
// TODO: use ganache provider instead once Deployer is implemented
const provider = new Web3.providers.HttpProvider(infuraAPI)
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
    let baseContract = new BaseContract(provider, devBaseContractAddress)
    assert.ok(baseContract.contract)
  })

  it('could view admin address', done => {
    const baseContract = new BaseContract(provider, devBaseContractAddress)
    ;(async () => {
      const admin = await baseContract.admin()
      assert.ok(Web3.utils.isAddress(admin))

      const pendingAdmin = await baseContract.pendingAdmin()
      assert.ok(Web3.utils.isAddress(pendingAdmin))
    })()
    done()
  })
})
