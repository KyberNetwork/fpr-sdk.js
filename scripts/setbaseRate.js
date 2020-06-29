//run this file with node scripts/serbaseRate.js
var Reserve = require("../dist/reserve").default
var BaseContract = require("../dist/base_contract").default
var RateSetting = require("../dist/conversion_rates_contract").RateSetting
var Web3 = require("web3")

var addresses = {
    "reserve": "0x78Ad928a301Fa2f2Cc47a2598442e184eb57D029",
    "conversionRates": "0x2A1E2fE1610885B7342E01B7c574Ac25bbF84779"
  }
const KNCTokenAddress = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"

const provider = new Web3.providers.HttpProvider(process.env.ROPSTEN_NODE_URL)
const web3 = new Web3(provider)
const account = web3.eth.accounts.privateKeyToAccount(process.env.TESTNET_PRIVATE_KEY)
const operatorAccount = web3.eth.accounts.privateKeyToAccount(process.env.TEST_OPERATOR_PRIVATE_KEY)

//setting opeartor for conversion rates contracts using the base_contract class
const reserve = new Reserve(web3, addresses)
const Breserve = new BaseContract(web3, addresses.conversionRates)

web3.eth.accounts.wallet.add(account)
web3.eth.accounts.wallet.add(operatorAccount)
const rate =  new RateSetting (KNCTokenAddress, 4500000000000000,4700000000000000)
console.log(rate)

//setRate is a only operator function hence adding operator to conversionrates
Breserve.addOperator(account, '0x9e5f206aA7aAc88fe4d5Bc378d114FF8bD5A67c5')
.then( result => { console.log(result)
web3.eth.getBlockNumber().then (blockNumber => {
reserve.setRate(operatorAccount, [rate] , blockNumber)
    .then ( result => {console.log(result)})
    .catch( error => { console.log(error)})
    })

}) .catch(error => {console.log(error)}) 