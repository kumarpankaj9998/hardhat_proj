const { deployments, ethers, getNamedAccounts } = require(" hardhat"); //hre==hardhat
const { assert } = require("chai");
describe("FundMe", async function () {
  //entire contract is under describe right now
  beforeEach(async function () {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    deployer = await getNamedAccounts();
    await deployments.fixture(["all"]);

    fundMe = await ethers.getContract("FundMe");
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  describe("constructor", async function () {
    //inside the contract...this is a sub test
    it("sets the aggregator addresses correctly", async function () {
      const res = await fundMe.priceFeed();
      assert.equal(res, mockV3Aggregator.address);
    });
  });
});
