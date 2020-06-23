import Web3 from "web3"
import Deployer from "../src/deployer.js"

const provider = new Web3.providers.HttpProvider(process.env.WEB3_NODE_ADDRESS)
const dpl = new Deployer(provider)

// initialize account from private key
const account = dpl.web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY)

dpl.web3.eth.accounts.wallet.add(account)

let addresses;
(async () => {
    addresses = await dpl.deploy(account)
    console.log("Reserve deployed at:")
    console.log(addresses)
    console.log("TODO: give the etherscan link here")
})()