import Web3 from "web3"
import Deployer from "./src/deployer.js"

const provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/27453d291e004037ac4734bd0138dc0f')
const dpl = new Deployer(provider)

// initialize account from private key
const account = dpl.web3.eth.accounts.privateKeyToAccount('2C9CFCEE9048E0D6B481E58F6E874368682B5FD01DD2BE267E71C4329ED3AFF5')

dpl.web3.eth.accounts.wallet.add(account)

let addresses;
(async () => {
    addresses = await dpl.deploy(account)
    console.log("Reserve deployed at:")
    console.log(addresses)
})()