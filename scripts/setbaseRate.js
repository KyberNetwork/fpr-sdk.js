var Reserve = require("../dist/reserve").default
var BaseContract = require("../dist/base_contract").default
var Web3 = require("web3")

var addresses = {
    "reserve": "0x2d2868c4Bc3365a7050345EC509433E7502E72f5",
    "conversionRates": "0x2fd0550FFa48A76A90d7DE168C711e05dF05cB05"
  }
const KNCTokenAddress = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"

const provider = new Web3.providers.HttpProvider(process.env.ROPSTEN_NODE_URL)
const web3 = new Web3(provider)

const account = web3.eth.accounts.privateKeyToAccount(process.env.TESTNET_PRIVATE_KEY)
const operatorAccount = web3.eth.accounts.privateKeyToAccount(process.env.TEST_OPERATOR_PRIVATE_KEY)
web3.eth.accounts.wallet.add(account)

const reserve = new Reserve(web3, addresses)
const Breserve = new BaseContract(web3, addresses.conversionRates)
Breserve.addOperator(account, operatorAccount).then( result => {
const rate = {"address": KNCTokenAddress, "buy" : 4500000000000000,"sell":4700000000000000}
web3.eth.getBlockNumber().then (blockNumber => {
reserve.setRate(account,[rate], blockNumber
  ).then ( result => {console.log(result)})
    .catch( error => { console.log(error)})})})