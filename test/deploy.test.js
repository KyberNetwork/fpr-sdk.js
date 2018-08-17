import assert from "assert";
import ganache from "ganache-cli";
import Web3 from "web3";

import Deployer from "../src/deployer";

const provider = ganache.provider();
const web3 = new Web3(provider);
const kyberNetworkAddress = "0x91a502C678605fbCe581eae053319747482276b9";

let accounts;
beforeEach(async () => {
  accounts = web3.eth.getAccounts();
});

describe("Deployer", () => {
  it("failed to deploy with no provider", async () => {
    try {
      const dpl = new Deployer();
      await dpl.deploy(accounts[0], kyberNetworkAddress, false);
    } catch (err) {
      assert(false);
    }
  });

  it("failed to deploy with no account", async () => {
    try {
      const dpl = new Deployer(provider);
      await dpl.deploy(undefined, kyberNetworkAddress, false);
    } catch (err) {
      assert(false);
    }
  });

  it("deployed successfully with no sanityRates contract", async () => {
    const dpl = new Deployer(provider);
    const addresses = await dpl.deploy(accounts[0], kyberNetworkAddress, false);
    assert.NotEqual(addresses.getReserve(), "");
    assert.NotEqual(addresses.getConversionRates(), "");
    assert.Equal(addresses.getSanityRates(), "");
  });

  it("deployed successfully with sanityRates contract", async () => {
    const dpl = new Deployer(provider);
    const addresses = await dpl.deploy(accounts[0], kyberNetworkAddress, true);
    assert.NotEqual(addresses.getReserve(), "");
    assert.NotEqual(addresses.getConversionRates(), "");
    assert.NotEqual(addresses.getSanityRates(), "");
  });
});
