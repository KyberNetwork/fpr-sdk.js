# Kyber Fed Price Reserve JS SDK

This SDK allows market makers and developers to deploy, maintain and operate an on-chain Kyber Network [Fed Price Reserve](https://developer.kyber.network/docs/Reserves-Types/) using Javascript and node.

## Useful Links
- [Example Code with Walkthroughs](https://github.com/KyberNetwork/kyber-pro/tree/master/tutorials/guides)
- [Kyber FPRs Explained](https://blog.kyber.network/kyber-fed-price-reserve-fpr-on-chain-market-making-for-professionals-7fea29ceac6c)
- [Kyber Reserve Documentation](https://developer.kyber.network/docs/Reserves-FedPriceReserve/)
- [API Documentation](https://fpr-sdk-js.knreserve.com/)

## Installation

Install the package with:

    npm install --save kyber-fpr-sdk    

## Usage

There are 2 main classes in this SDK.

- [Deployer](https://fpr-sdk-js.knreserve.com/class/src/deployer.js~Deployer.html) class allows users to deploy new smart contracts. 

- [Reserve](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html) class allows users to manage the key market making functions, including permission management, setting and controling quotes and fund security. 


## Deployer Class

The [Deployer](https://fpr-sdk-js.knreserve.com/class/src/deployer.js~Deployer.html) class only needs the [web3 provider](https://web3js.readthedocs.io/en/1.0/web3.html) to init. After deployment, it returns a set of [addresses](https://fpr-sdk-js.knreserve.com/class/src/addresses.js~Addresses.html) for required contracts. 


```js
// ethereum Remote Node Provider, for example infura.io
const provider = new Web3.providers.HttpProvider('ethereum-node-url')
const web3 = new Web3(provider)

// initialize account from private key
const account = dpl.web3.eth.accounts.privateKeyToAccount('private-key')
// initialize account from keystore file
// const account = dpl.web3.eth.accounts.decrypt(fs.readFileSync(), "your-keystore-passphrase");

dpl.web3.eth.accounts.wallet.add(account)

const dpl = new Deployer(web3)

let addresses;
(async () =>  { 
    addresses = await dpl.deploy(account)
    console.log(addresses)
})()

```

## Reserve Class

Reserve class allow users to make call to the smart contracts and query its state on the blockchain. 

- Permission infos: calling through baseContract's methods: [admin](https://fpr-sdk-js.knreserve.com/class/src/base_contract.js~BaseContract.html#instance-method-admin), [getAlerters](https://fpr-sdk-js.knreserve.com/class/src/base_contract.js~BaseContract.html#instance-method-getAlerters), [getOperators](https://fpr-sdk-js.knreserve.com/class/src/base_contract.js~BaseContract.html#instance-method-getOperators) and [pendingAdmin](https://fpr-sdk-js.knreserve.com/class/src/base_contract.js~BaseContract.html#instance-method-pendingAdmin). There are 3 contracts in Reserver object, all of these contracts came with these same methods. 
- Smart Contract addresses info: can be called as reserve's methods, which are: [conversionRatesContract](https://fpr-sdk-js.knreserve.com/class/src/conversion_rates_contract.js~ConversionRatesContract.html), [KyberNetwork](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-kyberNetwork), and [sanityRatesContract](https://fpr-sdk-js.knreserve.com/class/src/sanity_rates_contract.js~SanityRatesContract.html) for this reserve
- Rate infos: can be called as reserve's object methods, which are: [getBuyRates](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-getBuyRates), [getSellRates](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-getSellRates), [getSanityRates](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-getSanityRate) and [reasonableDiffInBps](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-reasonableDiffInBps) 
- Funds secure related infos: can be called as reserve's methods, which are: [tradeEnabled](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-tradeEnabled), [getBalance](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-getBalance) and [approvedWithdrawAddresses](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-approvedWithdrawAddresses)

The following example queries the sanityRatesContract's admin and the SanityRates contract:

```js
const reserve = new Reserve(web3, addresses);
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

More on permission control at [permission groups](https://github.com/KyberNetwork/kyber-pro/blob/master/tutorials/guides/tutorial-mainnetStaging.md#permission-groups). To set permission with SDK, call to the contract that needs to change account's role with these methods from [baseContract](https://fpr-sdk-js.knreserve.com/class/src/base_contract.js~BaseContract.html). The following example add Operator 0x0a4c79cE84202b03e95B7a692E5D728d83C44c76 to ConversionRates contract

```js
const reserve = new Reserve(web3, addresses);

(async () => {
  // admin operations
  await reserve.ConversionRates.addOperator(adminAccount, '0x0a4c79cE84202b03e95B7a692E5D728d83C44c76');
  console.log(await reserve.ConversionRates.getOperators())
})();
```

#### Control Rates
Control rates operations can be called directly as [reserve Object](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html)'s methods. There are 5 operations regarding set rates: [setRate](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-setRate), [setSanityRates](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-setSanityRates), [setReasonableDiff](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-setReasonableDiff), [setQtyStepFuncion](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-setQtyStepFunction) and [setImbalanceStepFunction](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-setImbalanceStepFunction). More about the meaning of these operations can be viewed in [the onboarding tutorials](https://github.com/KyberNetwork/kyber-pro/blob/master/tutorials/guides/tutorial-walkthrough1.md#4-setting-base-rates-and-step-functions-for-token).
The following example set the base rate for KNC token.

```js
const reserve = new Reserve(web3, addresses);
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

#### Fund Security
To secure reserve's fund, there are two main operations:
- withdrawal management: can be called as reserve's methods, which are: [approveWithdrawAddress](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-approveWithdrawAddress) and [withdraw](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-withdraw).
- and trade managementControl: can be called as reserve's methods, which are: [disableTrade](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-disableTrade) and [enableTrade](https://fpr-sdk-js.knreserve.com/class/src/reserve.js~Reserve.html#instance-method-enableTrade)

The following example show how to stop trade from the reserve and withdraw 1000 KNC from reserve to a receiver account to secure the fund: 

```js
  const reserve = new Reserve(web3, addresses);
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
