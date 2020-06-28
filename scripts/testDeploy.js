// Run `npm run build` to transpile changes into ./dist
// Then run this file with node scripts/deploy.js

var Deployer = require("../dist/deployer").default
var Web3 = require("web3")

const provider = new Web3.providers.HttpProvider(process.env.ROPSTEN_NODE_URL)
const web3 = new Web3(provider)
const account = web3.eth.accounts.privateKeyToAccount(process.env.TESTNET_PRIVATE_KEY)

const deployer = new Deployer(provider, web3)

deployer.web3.eth.accounts.wallet.add(account)
deployer.deploy(account).then(addresses => {
    console.log(addresses) 
})

