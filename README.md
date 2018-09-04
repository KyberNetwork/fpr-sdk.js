<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [reserve-sdk.js](#reserve-sdkjs)
- [Installation](#installation)
- [Documentation](#documentation)
- [Usage](#usage)
  - [Creating New Contract](#creating-new-contract)
  - [Reserve Operations](#reserve-operations)
    - [Contract States infos](#contract-states-infos)
    - [Permission Control](#permission-control)
    - [Control Rates](#control-rates)
    - [Fund Secure](#fund-secure)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# reserve-sdk.js
[![Build Status](https://travis-ci.com/KyberNetwork/reserve-sdk.js.svg?token=2kykYMd22vvW6D6VvzXS&branch=master)](https://travis-ci.com/KyberNetwork/reserve-sdk.js)
[![npm version](https://badge.fury.io/js/%40kyber.network%2Freserve-sdk.svg)](https://badge.fury.io/js/%40kyber.network%2Freserve-sdk)
[![Document](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/badge.svg)](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js)

Reserve SDK library provides convenient methods to create and operate a [KyberNetwork](https://kyber.network/) reserve.
This package is desinged to work for both client and server side JavaScript application.

It allows developers to set up and manage a reserve pool of tokens for instant token trade with KyberNetwork's smart contract. More information about KyberNetwork's reserve can be seen at [Reserve Use case](https://developer.kyber.network/docs/ReservesUseCase)


*Warning*: This is pre-released software, use it at your own risk.

## Installation

Install the package with:

    npm install --save @kyber.network/reserve-sdk
    
## Documentation
Reserve SDK allows you to interact with KyberNetwork's reserve smart contracts as if they were JavaScript objects. It's composed of two main class: 

- [Deployer](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/deployer.js~Deployer.html) class  provides an easy way of deploying a Reserve. It needs only the [web3 provider](https://web3js.readthedocs.io/en/1.0/web3.html)  to init and after deployment, it returns a set of [addresses](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/addresses.js~Addresses.html) for required contracts. 
- [Reserve](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html) class which allows user to manage the basic tasks regarding SDK,of which are: 
  * Permission management via [baseContract](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/base_contract.js~BaseContract.html) property
  * control conversion and sanity rates and get rates from the contracts. More on set Rates operations at [Kyber's developer guide](https://developer.kyber.network/docs/ReservesGuide#step-3-setting-token-conversion-rates-prices). These set rates operations are methods implemented in this Reserve Object.
  * secure funds, which is to control fund withdrawal and enable/ disable trade at desired. These operations are methods implemented in this Reserve Object. 

Detailed APIs can be seen from here [Reserve SDK.js docs](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js).

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

#### Contract States information

Reserve object allow users to make call to the smart contracts and query its state on the blockchain. These functions are:
- Permission infos: calling through baseContract's medthods: [admin](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/base_contract.js~BaseContract.html#instance-method-admin), [getAlerters](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/base_contract.js~BaseContract.html#instance-method-getAlerters), [getOperators](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/base_contract.js~BaseContract.html#instance-method-getOperators) and [pendingAdmin](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/base_contract.js~BaseContract.html#instance-method-pendingAdmin). There are 3 contracts in Reserver object, all of these contracts came with these same methods. 
- Smart Contract addresses info: can be called as reserve's methods, which are: [conversionRatesContract](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-conversionRatesContract), [KyberNetwork](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-kyberNetwork), and [sanityRatesContract](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-sanityRatesContract) for this reserve
- Rate infos: can be called as reserve's object methods, which are: [getBuyRates](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-getBuyRates), [getSanityRates](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-getSanityRate), [getSellRates](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-getSellRates), and [reasonableDiffInBps](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-reasonableDiffInBps) 
- Funds secure related infos: can be called as reserve's methods, which are: [tradeEnabled](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-tradeEnabled), [getBalance](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-getBalance) and [approvedWithdrawAddresses](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-approvedWithdrawAddresses)

The following example queries the sanityRatesContract's admin and the SanityRates contract:

```js
const reserve = new Reserve(provider, addresses);
const KNCTokenAddress = "0x095c48fbaa566917474c48f745e7a430ffe7bc27";
const ETHTokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

(async () => {
  // get sanityContract address
  console.log('SanityRates contract address is ', await reserve.sanityRates.admin())
  const sanityRates = await reserve.getSanityRate(KNCTokenAddress, ETHTokenAddress)
  console.log('SanityRates for KNC-ETH is ', sanityRates)
})();
```


#### Permission Control

More on permission control at [setting permission](https://developer.kyber.network/docs/ReservesGuide#setting-permissions). To set permission with SDK, call to the contract that needs to change account's role with these methods from [baseContract](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/base_contract.js~BaseContract.html). The following example add Operator 0x0a4c79cE84202b03e95B7a692E5D728d83C44c76 to ConversionRates contract

```js
const reserve = new Reserve(provider, addresses);

(async () => {
  // admin operations
  await reserve.ConversionRates.addOperator(adminAccount, '0x0a4c79cE84202b03e95B7a692E5D728d83C44c76');
  console.log(await reserve.ConversionRates.getOperators())
})();
```

#### Control Rates
Control rates operations can be called directly as [reserve Object](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html)'s methods. There are 5 operations regarding set rates: [setRate](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-setRate), [setSanityRates](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-setSanityRates), [setReasonableDiff](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-setReasonableDiff), [setQtyStepFuncion](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-setQtyStepFunction) and [setImbalanceStepFunction](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-setImbalanceStepFunction). More about the meaning of these operations can be viewed in [Kyber's Developer guide](https://developer.kyber.network/docs/ReservesGuide#step-3-setting-token-conversion-rates-prices).
The following example set the base rate for KNC token.

```js
const reserve = new Reserve(provider, addresses);
const operatorAccount = web3.eth.accounts.privateKeyToAccount('operatorAccountPrivateKey');
const KNCTokenAddress = "0x095c48fbaa566917474c48f745e7a430ffe7bc27";

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

#### Fund Secure  
To secure reserve's fund, there are two main operations:
- withdrawal management: can be called as reserve's methods, which are: [approveWithdrawAddress](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-approveWithdrawAddress) and [withdraw](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-withdraw).
- and trade managementControl: can be called as reserve's methods, which are: [disableTrade](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-disableTrade) and [enableTrade](https://doc.esdoc.org/github.com/KyberNetwork/reserve-sdk.js/class/src/reserve.js~Reserve.html#instance-method-enableTrade)

The following example show how to stop trade from the reserve and withdraw 1000 KNC from reserve to a receiver account to secure the fund: 

```js
  const reserve = new Reserve(provider, addresses);
  const adminAccount = web3.eth.accounts.privateKeyToAccount('adminAccountPrivateKey');
  const operatorAccount = web3.eth.accounts.privateKeyToAccount('operatorAccountPrivateKey');
  const alerterAccount = web3.eth.accounts.privateKeyToAccount('alerterAccountPrivateKey');
  const receiverAddress = '0x69E3D8B2AE1613bEe2De17C5101E58CDae8a59D4' ;
  const KNCTokenAddress = '0x095c48fbaa566917474c48f745e7a430ffe7bc27';

  (async () => {
    // stop trade. 
    await reserveContract.disableTrade(alerterAccount)
    // approve receiver to receive KNC from this reserve
    await reserveContract.approveWithdrawAddress(operatorAccount,KNCTokenAddress, receiverAddress)
    if (await reserveContract.approvedWithdrawAddresses(receiverAddress, KNCTokenAddress) == true) {
      await reserveContract.withdraw(adminAccount, KNCTokenAddress, 1000)
    } else {
      console.log('cannot withdraw KNC at this moment, please retry again later')
    }
  })();
```

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
