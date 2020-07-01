## Kyber Fed Price Reserve JS SDK

This SDK provides convenient methods to help developers to deploy, maintain and operate an on-chain Kyber Network [Fed Price Reserve](https://developer.kyber.network/docs/Reserves-Types/).To understand the design factors behind FPRs, refer [here](https://blog.kyber.network/kyber-fed-price-reserve-fpr-on-chain-market-making-for-professionals-7fea29ceac6c).

This SDK allows you to interact with KyberNetwork's reserve smart contracts as if they were JavaScript objects. It's composed of two main class

To see a reference implementation with detailed explanations and walkthroughs, refer [here](https://github.com/KyberNetwork/fpr-js-reference).

## Installation

Install the package with:

    npm install --save https://github.com/KyberNetwork/fpr-sdk.js
    
## Deployment

The [Deployer](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/deployer.js~Deployer.html) class  provides an easy way of deploying a Reserve. It needs only the [web3 provider](https://web3js.readthedocs.io/en/1.0/web3.html)  to init and after deployment, it returns a set of [addresses](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/addresses.js~Addresses.html) for required contracts. 


```js
// requires a Ethereum Remote Node Provider likes: infura.io, etherscan.io...
const provider = new Web3.providers.HttpProvider('ethereum-node')
const dpl = new Deployer(provider)

// initialize account from private key
const account = dpl.web3.eth.accounts.privateKeyToAccount('private-key')
// initialize account from keystore file
// const account = dpl.web3.eth.accounts.decrypt(fs.readFileSync(), "your-keystore-passphrase");

dpl.web3.eth.accounts.wallet.add(account)

let addresses;
(async () => addresses = await dpl.deploy(account))()

console.log(addresses)
```

## Adding Token Pairs


## Setting Operator Permissions


## Setting Base Rates And Step Functions


## Optimizing And Safety

