# Kyber FPR Reserve

Kyber FPR allows market makers to set up and manage a reserve pool of tokens for instant token trade with KyberNetwork's smart contract. For more information about FPRs, refer to the FPR [blog post](https://blog.kyber.network/kyber-fed-price-reserve-fpr-on-chain-market-making-for-professionals-7fea29ceac6c)

This SDK library provides convenient methods to deploy and operate a Kyber FPR reserve, allowing you to interact with KyberNetwork's reserve smart contracts as if they were JavaScript objects. 

*Software is currently in alpha, please use with care*

## Installation

To install in your node program:

`npm install --save git@github.com:KyberNetwork/fpr-sdk.js.git`

## Deployment 

The Deployer allows you to easily deploy a smart contract to the Ethereum Network. 

```js
var FPR = require("@kyber.network/reserve-sdk")

// requires a Ethereum Remote Node Provider 
const provider = new Web3.providers.HttpProvider('ethereum-node-url')
const dpl = new FPR.Deployer(provider)

// initialize account from private key
const account = dpl.web3.eth.accounts.privateKeyToAccount('private-key')
// initialize account from keystore file
// const account = dpl.web3.eth.accounts.decrypt(fs.readFileSync(), "your-keystore-passphrase");

dpl.web3.eth.accounts.wallet.add(account)

// You will need this address to initialize the reserve class later
let addresses;
dpl.deploy(account).then(addresses => {
    console.log(addresses) 
})
```

## Usage 

Usage documentation coming soon.

## Testing

Install Ganache, and run:

`npm test`