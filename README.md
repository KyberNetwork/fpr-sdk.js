# reserve-sdk.js
[![Build Status](https://travis-ci.com/KyberNetwork/reserve-sdk.js.svg?token=2kykYMd22vvW6D6VvzXS&branch=master)](https://travis-ci.com/KyberNetwork/reserve-sdk.js)
[![npm version](https://badge.fury.io/js/%40kyber.network%2Freserve-sdk.svg)](https://badge.fury.io/js/%40kyber.network%2Freserve-sdk)
[![Document](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/badge.svg)](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js)

Reserve SDK library provides convenient methods to create and operate a [KyberNetwork](https://kyber.network/) reserve.
This package is desinged to work for both client and server side JavaScript application.

*Warning*: This is pre-released software, use it at your own risk.

## Installation

Install the package with:

    npm install --save @kyber.network/reserve-sdk
    
## Documentation

See the [Reserve SDK.s docs](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js).

## Usage

### Creating New Contract

Deploying a new [KyberNetwork](https://kyber.network/) will create a number of smart contracts. 
The returned addresses should be saved to persistent storage to use in operation later.

Deployment requires a Ethereum node provider and an account.

Example for server side JavaScript application. 

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

Example for client side Javascript application, using Metamask.

```js
if (typeof window === "undefined" && typeof window.web3 === "undefined") {
  throw new Error("metamask is not installed");
}

const dpl = new Deployer(window.web3.currentProvider);
(async () => {
  const account = (await web3.eth.getAccounts())[0];
  await dpl.deploy(account);
})();
```

### Reserve Operations

The deployed contract addresses will be used for creating a `Reserve` instance to interact with reserver smart 
contracts.


```js
const reserve = new Reserve(provider, addresses);
(async () => {
  // admin operations
  await reserve.enableTrade();
  await reserve.disableTrade();
  await reserve.setRate(account, rates, 1000);
})();
```

Please consult documentation for detail operation instructions.
 

## Development

Run all tests:

```bash
$ npm install
$ npm test
```

Format codes:

```bash
$ npm run format
```

Generate documentation:

```bash
$ npm run doc
```
