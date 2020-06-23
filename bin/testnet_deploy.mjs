#!/usr/bin/env node --experimental-modules --experimental-json-modules 

import Web3 from "web3"
import Deployer from "../src/deployer.js"

const provider = new Web3.providers.HttpProvider(process.env.ROPSTEN_NODE_URL)
const dpl = new Deployer(provider)

const account = dpl.web3.eth.accounts.privateKeyToAccount(process.env.TESTNET_PRIVATE_KEY)

dpl.web3.eth.accounts.wallet.add(account)

let addresses;
(async () => {
    addresses = await dpl.deploy(account)
    console.log("Reserves deployed at:")
    console.log(addresses)
})()