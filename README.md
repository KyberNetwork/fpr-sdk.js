# Kyber FPR Reserve

Kyber FPR allows market makers to set up and manage a reserve pool of tokens for instant token trade with KyberNetwork's smart contract. For more information about FPRs, refer to the FPR [blog post](https://blog.kyber.network/kyber-fed-price-reserve-fpr-on-chain-market-making-for-professionals-7fea29ceac6c)

This SDK library provides convenient methods to deploy and operate a Kyber FPR reserve, allowing you to interact with KyberNetwork's reserve smart contracts as if they were JavaScript objects. 

Walkthrough tutorial coming soon.

## Requirements

1. An Web3 Provider. To get started, you can get a free account at [Infura](https://infura.io)
2. An Ethereum Account, with the corresponding private key or passphrase

## Installation

To install in your node program:

`npm install --save git@github.com:KyberNetwork/fpr-sdk.js.git#v2020`

## Deployment 

The deployer will deploy the required smart contracts to operate an FPR.

```js
var FPR = require("kyber-fpr-sdk")
var Web3 = require("web3")

const provider = new Web3.providers.HttpProvider(NODE_URL)
const deployer = new FPR.Deployer(provider)

// If using private key
const account = deployer.web3.eth.accounts.privateKeyToAccount(TESTNET_PRIVATE_KEY)
// If using a pass phrase
// const account = dpl.web3.eth.accounts.decrypt(fs.readFileSync(), "your-keystore-passphrase");

deployer.web3.eth.accounts.wallet.add(account)
deployer.deploy(account).then(addresses => {
    console.log(addresses) 
})
```

## Usage 

Usage documentation coming soon.

## Testing

Install Ganache, and run:

`npm test`