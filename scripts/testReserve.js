var Reserve = require("../dist/reserve").default
var Web3 = require("web3")

var addresses = {
    "reserve": "0x1608Bbc3b74A4aF29836E6840e26E711C28AB22a",
    "conversionRates": "0xa2812E74C76191b922a12C2Ce89452Bb5AF4F9C9"
  }

var tokenControlInfo = { "minimalRecordResolution" : 100000000000000 ,
"maxPerBlockImbalance" : 2700000000000000000000,
"maxTotalImbalance" : 3800000000000000000000 
}
const KNCTokenAddress = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"

const provider = new Web3.providers.HttpProvider(process.env.ROPSTEN_NODE_URL)
const web3 = new Web3(provider)

const account = web3.eth.accounts.privateKeyToAccount(process.env.TESTNET_PRIVATE_KEY)
web3.eth.accounts.wallet.add(account)

const reserveOperator = new Reserve(provider, addresses)

reserveOperator.addToken(account, KNCTokenAddress, tokenControlInfo)
    .then(
        result => {console.log(result)}
    )
    .catch(
        error => { console.log(error)}
    )




// var addresses =require("./addresses.json")
// var tokenControlInfo = require("./tokenControlInfo.json")
// const KNCTokenAddress = "0x7b2810576aa1cce68f2b118cef1f36467c648f92"

// const provider = new Web3.providers.HttpProvider(process.env.ROPSTEN_NODE_URL)

// const web3 = new Web3(provider)
// const account = web3.eth.accounts.privateKeyToAccount(process.env.TESTNET_PRIVATE_KEY)
// 

// 

