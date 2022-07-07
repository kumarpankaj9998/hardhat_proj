const { deployments, ethers, getNamedAccounts } = require(" hardhat"); //hre==hardhat
const { assert, expect } = require("chai");
describe("FundMe", async function () {
  //entire contract is under describe right now
  beforeEach(async function () {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    let sendVal = ethers.utils.parseUnits("1");
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

  describe("fund", async function () {
    it("it fails if you don't send enough eth", async function () {
      await expect(await fundMe.fund()).to.be.revertedWith(
        "You need to spend more eth!"
      );
    });
    it("updates the amount funded data structure", async function () {
      await fundMe.fund({ value: sendVal });
      const res = await fundMe.addressToAmountFunded(deployer);
      assert.equal(res.toString(), sendVal.toString());
    });
    it("updating the array of funders??", async function () {
      await fundMe.fund({ value: sendVal });
      const funder = await fundMe.funders(0);
      assert(funder, deployer);
    });
  });

  describe("withDraw", async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendVal });
    });
    it("Withdraw eth from a single founder", async function () {
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );

      const transactionRes = await fundMe.withDraw();
      const transactionRecipt = await transactionRes.wait(1);

      const { gasUsed, effectiveGasprice } = transactionRecipt;
      const gasCost = gasUsed.mul(effectiveGasprice);
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });
  });
});
