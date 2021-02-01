const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

let templateQuestion;
let templateQuestionAddress;
let factory;


let accounts,admin,owner,user;

let provider = ethers.getDefaultProvider();

const toTimestamp = (strDate) => Date.parse(strDate) / 1000;

beforeEach(async () => {
  accounts = await ethers.getSigners();
  admin = accounts[0];
  owner = accounts[1];
  user = accounts[2];

  let templateQuestionObject = await ethers.getContractFactory("EIP1167_Question");
  templateQuestion = await templateQuestionObject.deploy();

  templateQuestionAddress = await templateQuestion.address;

  let factoryObject = await ethers.getContractFactory("EIP1167_Factory");
  factory = await factoryObject.connect(admin).deploy(templateQuestionAddress);

  await factory
    .connect(owner)
    .createMarket(
      "Who do we think we are?",
      ["Humans", "Animals"],
      toTimestamp("01/01/2029 00:00:00")
    );
});

describe("Market contract", () => {
  // it("has the same as Factory contract instance.", async()=>{
  //     //The big number at the end of the createMarket function is Unix Epoch Time of some moment in the future.
  //     await marketFactory
  //     .connect(owner)
  //     .createMarket(
  //         "Who do we think we are?",
  //         2,
  //         ["Humans", "Animals"],
  //         toTimestamp('01/01/2029 00:00:00')
  //     );

  //     assert(marketFactory.markets(0).bytecode == market.bytecode);
  // });

  it("is setting the owner correctly.", async () => {
    let firstDeployedQuestionAddress = await factory.markets(0);
    let abi = (await ethers.getContractFactory("Question")).interface;

    let question = new ethers.Contract(
      firstDeployedQuestionAddress,
      abi,
      provider
    );

    let _owner = await question.connect(owner).owner();
    assert.strictEqual(_owner, owner.address);
  });
});
