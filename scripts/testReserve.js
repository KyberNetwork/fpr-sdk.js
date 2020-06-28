var Reserve = require("../dist/reserve").default
var Web3 = require("web3")

var addresses = {
    "reserve": "0x70c77F50b64664639F5fEDEc17C6BeCbd7e4DEad",
    "conversionRates": "0x18acC1770784A5951E9800E96D11de7e1Beb54DE"
  }

var tokenControlInfo = { 
    "minimalRecordResolution" : "100000000000000" ,
    "maxPerBlockImbalance" : "2700000000000000000000",
    "maxTotalImbalance" : "3800000000000000000000" 
    }

const KNCTokenAddress = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"

const provider = new Web3.providers.HttpProvider(process.env.ROPSTEN_NODE_URL)
const web3 = new Web3(provider)

const account = web3.eth.accounts.privateKeyToAccount(process.env.TESTNET_PRIVATE_KEY)
web3.eth.accounts.wallet.add(account)

const reserveOperator = new Reserve(web3, addresses)

reserveOperator.addToken(account, KNCTokenAddress, tokenControlInfo)
    .then( result => {console.log(result)})
    .catch( error => { console.log(error)})