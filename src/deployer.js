const Web3 = require("web3");
const fs = require("fs");
const RLP = require("rlp");
const path = require("path");
import Addresses from './addresses.js'
const deployGasLimit = 500 * 1000;

const contractPath = path.join(__dirname, "./contracts/");

/**
 * Deployer is used for deploying new KyberNetwork reserve contracts.
 * It deployed all requires smart contracts for running a reserve:
 * <ul>
 *   <li>reserve</li>
 *   <li>conversionRates</li>
 *   <li>sanityRates (optional)</li>
 * </ul>
 */

export default class Deployer {
  /**
   * Create a deployer instance with given account parameter.
   * @param {object} provider - Web3 provider
   * @param {string} gasPrice  - gasPrice
   */
  constructor(provider, gasPrice) {
    if (provider == undefined) {
      throw new Error('provider is not set')
    }    
    this.web3 = new Web3(provider)
    async () => {
      this.gasPrice = gasPrice == null ? await this.web3.eth.getGasPrice() : gasPrice;
    }
  }

  /**
   * Deploy new reserver and pricing contracts.
   * @param {object} account - Web3 account to create the smart contracts. This account is also set to be admin of the contracts
   * @param {string} network - Address of KyberNetwork smart contract.
   * @param {boolean} [deploySanityRates=false] - If true, deploySanityRates contract will be deployed.
   * @return {Addresses} - Deployed reserve addresses set.
   */
  async deploy(account, network, deploySanityRates) {
    if (!account) {
      throw new Error('missing account')
    }
    // All the contract must be deployed sequentially 
    const conversionAddress = await this.deployConversionRates(
      account,
      network
    );
    const reserveAddress = await this.deployReserve(
      account,
      network,
      conversionAddress
    );
    let sanityRatesAddress;
    if (deploySanityRates === true) {
      sanityRatesAddress = await this.deploySanityRates(account);
    }
    const addresses = new Addresses(reserveAddress, conversionAddress, sanityRatesAddress)
    return addresses;
  }

  async deployConversionRates(account) {
    console.log("Deploying conversion ... This might take a while for the tx to be mined");
    const byteCode = fs
      .readFileSync(`${contractPath}ConversionRates`)
      .toString("utf-8");
    const rawABI = fs.readFileSync(
      `${contractPath}ConversionRatesContract.abi`
    );
    const args = [account.address];
    return this.deployContract(account, byteCode, rawABI, args);
  }

  async deployReserve(account, network, conversionAddress) {
    console.log("Deploying reserve ... This might take a while for the tx to be mined");
    const byteCode = fs
      .readFileSync(`${contractPath}KyberReserve`)
      .toString("utf-8");
    const rawABI = fs.readFileSync(`${contractPath}KyberReserveContract.abi`);
    const args = [network, conversionAddress, account.address];
    return this.deployContract(account, byteCode, rawABI, args);
  }

  async deploySanityRates(account) {
    console.log("Deploying sanity ...This might take a while for the tx to be mined");

    const byteCode = fs
      .readFileSync(`${contractPath}SanityRates`)
      .toString("utf-8");
    const rawABI = fs.readFileSync(`${contractPath}SanityRatesContract.abi`);
    const args = [account.address];
    return this.deployContract(account, byteCode, rawABI, args);
  }

  async deployContract(account, byteCode, rawABI, args) {
    const nonce = await this.web3.eth.getTransactionCount(account.address);
    const contract = await new this.web3.eth.Contract(JSON.parse(rawABI));

    const deployedAddress = `0x${this.web3.utils
      .sha3(RLP.encode([account.address, nonce]))
      .slice(12)
      .substring(14)}`;

    const deploy = contract.deploy({
      data: `0x${byteCode}`,
      arguments: args
    });
    await this.sendTx(account, deploy, contract.options.address, nonce);
    return deployedAddress;
  }

  async sendTx(account, deployInfo, txTo, nonce) {
    let gasLimit;
    if (txTo !== null) {
      gasLimit = deployGasLimit;
    } else {
      try {
        gasLimit = await deployInfo.estimateGas();
      } catch (error) {
        console.log(
          "KyberDeployer : can't estimate gas %s. Use default gas limit instead",
          error
        );
        gasLimit = deployGasLimit;
      }
    }
    // build Tx object
    const txData = await deployInfo.encodeABI();
    const txFrom = account.address;
    const txKey = account.privateKey;
    const tx = {
      from: txFrom,
      to: txTo,
      nonce,
      data: txData,
      gas: gasLimit,
      gasPrice: this.gasPrice
    };
    const signedTx = await this.web3.eth.accounts.signTransaction(tx, txKey);
    // console.log(signedTx.rawTransaction);
    await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(
      result => {
        console.log("Result TxHash is %s", result.transactionHash);
      },
      err => {
        console.log("KyberDeployer can't send tx: %s", err);
      }
    );
  }
}
