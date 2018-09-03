<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [reserve-sdk.js](#reserve-sdkjs)
- [Installation](#installation)
- [Documentation](#documentation)
- [Usage](#usage)
  - [Creating New Contract](#creating-new-contract)
  - [Reserve Operations](#reserve-operations)
    - [Permission Control](#permission-control)
    - [Control Rates](#control-rates)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# reserve-sdk.js
[![Build Status](https://travis-ci.com/KyberNetwork/reserve-sdk.js.svg?token=2kykYMd22vvW6D6VvzXS&branch=master)](https://travis-ci.com/KyberNetwork/reserve-sdk.js)
[![npm version](https://badge.fury.io/js/%40kyber.network%2Freserve-sdk.svg)](https://badge.fury.io/js/%40kyber.network%2Freserve-sdk)
[![Document](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/badge.svg)](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js)

Reserve SDK library provides convenient methods to create and operate a [KyberNetwork](https://kyber.network/) reserve.
This package is desinged to work for both client and server side JavaScript application.

It allows developers to set up and manage a reserve pool of tokens for instant token trade with KyberNetwork's smart contract. More information about KyberNetwork's reserve can be seens at [Reserve Use case](https://developer.kyber.network/docs/ReservesUseCase)


*Warning*: This is pre-released software, use it at your own risk.

# Installation

Install the package with:

    npm install --save @kyber.network/reserve-sdk
    
# Documentation
Reserve SDK allows you to interact with KyberNetwork's reserve smart contracts as if they were JavaScript objects. It's composed of two main class: 

- [Deployer](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/deployer.js~Deployer.html) class  provides an easy way of deploying a Reserve. It needs only the [web3 provider](https://web3js.readthedocs.io/en/1.0/web3.html)  to init and after deployment, it returns a set of [addresses](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/addresses.js~Addresses.html) for required contracts. 
- [Reserve](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html) class which allows user to manage the basic tasks regarding SDK,of which are: 
  * Permission management via [baseContract](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/base_contract.js~BaseContract.html) property
  * control conversion and sanity rates and get rates from the contracts. More on set Rates operations at [Kyber's developer guide](https://developer.kyber.network/docs/ReservesGuide#step-3-setting-token-conversion-rates-prices). These set rates operations are methods implemented in this Reserve Object.
  * secure funds, which is to control fund withdrawal and enable/ disable trade at desired. These operations are methods implemented in this Reserve Object. 

Detailed APIs can be seen from here [Reserve SDK.js docs](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js).

# Usage

## Creating New Contract

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

## Reserve Operations

The deployed contract addresses will be used for creating a `Reserve` instance to interact with reserver smart 
contracts.

### Permission Control

More on permission control at [setting permission](https://developer.kyber.network/docs/ReservesGuide#setting-permissions). To set permission with SDK, call to the contract that needs to change account's role with these methods from [baseContract](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/base_contract.js~BaseContract.html). The following example add Operator 0x0a4c79cE84202b03e95B7a692E5D728d83C44c76 to ConversionRates contract

```js
const reserve = new Reserve(provider, addresses);
const adminAccount = web3.eth.accounts.privateKeyToAccount('AdminAccountPrivateKey');

(async () => {
  // admin operations
  await reserve.ConversionRates.addOperator(adminAccount, '0x0a4c79cE84202b03e95B7a692E5D728d83C44c76');
  console.log(await reserve.ConversionRates.getOperators())
})();
```

### Control Rates
Control rates operations can be called directly as [reserve Object](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html)'s methods. There are 5 operations regarding set rates: [setRate](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-setRate), [setSanityRates](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-setSanityRates), [setReasonableDiff](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-setReasonableDiff), [setQtyStepFuncion](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-setQtyStepFunction) and [setImbalanceStepFunction](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-setImbalanceStepFunction). More about the meaning of these operations can be viewed in [Kyber's Developer guide](https://developer.kyber.network/docs/ReservesGuide#step-3-setting-token-conversion-rates-prices).
The following example set the base rate for KNC token.

```js
const reserve = new Reserve(provider, addresses);
const operatorAccount = web3.eth.accounts.privateKeyToAccount('operatorAccountPrivateKey');
const KNCTokenAddress = "0x095c48fbaa566917474c48f745e7a430ffe7bc27"

(async () => {
  // create rateSetting object and set base buy/ sell rate.
  rate = new RateSetting(KNCTokenAddress, 10000000, 1100000)
  await reserve.setRate( 
    operatorAccount,
    [rate],
    (await web3.eth.getBlockNumber()) + 1
  )
  // should log 10000000 and 1100000 as buy/sell rate
  console.log(await reserve.getBuyRates(KNCTokenAddress, 1,await web3.eth.getBlockNumber()))
  console.log(await reserve.getSellRates(KNCTokenAddress, 1,await web3.eth.getBlockNumber()))
})();
```

Please consult documentation for detail operation instructions.## Development

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
