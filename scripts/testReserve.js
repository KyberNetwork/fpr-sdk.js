var Reserve = require("../dist/reserve").default
var TokenControlInfo = require("../dist/conversion_rates_contract").TokenControlInfo
var Web3 = require("web3")

var addresses = {
    "reserve": "0x78Ad928a301Fa2f2Cc47a2598442e184eb57D029",
    "conversionRates": "0x2A1E2fE1610885B7342E01B7c574Ac25bbF84779"
  }

/*var tokenControlInfo = { 
    "minimalRecordResolution" : "100000000000000" ,
    "maxPerBlockImbalance" : "2700000000000000000000",
    "maxTotalImbalance" : "3800000000000000000000" 
    }*/
 
const tokenInfo = new TokenControlInfo(100000000000000,440000000000000000000n,920000000000000000000n)
const FPRTokenAddress = "0x4aeEd3fe72B1fA4c2ef58c7C3159Dc7558F0Aa40"

const provider = new Web3.providers.HttpProvider(process.env.ROPSTEN_NODE_URL)
const web3 = new Web3(provider)

const account = web3.eth.accounts.privateKeyToAccount(process.env.TESTNET_PRIVATE_KEY)
web3.eth.accounts.wallet.add(account)

const reserveOperator = new Reserve(web3, addresses)

reserveOperator.addToken(account, FPRTokenAddress, tokenInfo)
    .then( result => {console.log(result)})
    .catch( error => { console.log(error)})