var Deployer = require("../dist/deployer").default
var Web3 = require("web3")

const provider = new Web3.providers.HttpProvider(process.env.ROPSTEN_NODE_URL)
const deployer = new Deployer(provider)

const account = deployer.web3.eth.accounts.privateKeyToAccount(process.env.TESTNET_PRIVATE_KEY)

deployer.web3.eth.accounts.wallet.add(account)
deployer.deploy(account).then(addresses => {
    console.log(addresses) 
})
