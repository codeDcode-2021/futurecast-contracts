const { assert } = require("chai");
const { ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

let factory;
let accounts, admin, owner, user;

let provider = ethers.getDefaultProvider();
let questionInterface; 

const make2 = (str) => {
  str = str.toString();
  return str.length == 1 ? "0".concat(str) : str;
};
const toUnix = (strDate) => Date.parse(strDate) / 1000;
const fromUnix = (UNIX_timestamp) => {
  var a = new Date(UNIX_timestamp * 1000);
  var year = a.getFullYear();
  var month = make2(a.getMonth() + 1);
  var date = make2(a.getDate());
  var hour = make2(a.getHours());
  var min = make2(a.getMinutes());
  var sec = make2(a.getSeconds());
  var time =
    month + "/" + date + "/" + year + " " + hour + ":" + min + ":" + sec;
  return time;
};

beforeEach(async () => {
  // Getting all accounts
  accounts = await ethers.getSigners();

  // Setting appropriate accounts
  admin = accounts[0];
  owner = accounts[1];
  user = accounts[2];

  // Setting interface for question contract
  questionInterface = (await ethers.getContractFactory("Question")).interface;

  // Deploying the factory contract
  let factoryObject = await ethers.getContractFactory("Factory");
  factory = await factoryObject.connect(admin).deploy();

  // Calling the factory contract to deploy on Question
  await factory
    .connect(owner)
    .createQuestion(
      "Who do we think we are?",
      ["Humans", "Animals"],
      toUnix("01/01/2029 00:00:00")
    );
});

describe("Factory/Question Contract", () => {
  it("is setting the owner correctly.", async () => {
    let deployedQuestionAddress = await factory.connect(user).questionAddresses(0);

    let question = new ethers.Contract(
      deployedQuestionAddress,
      questionInterface,
      provider
    );

    let _owner = await question.connect(user).owner();
    assert.strictEqual(_owner, owner.address);
  });

  it("is setting the basic information[description, options, endTime] correctly.", async () => {
    let description = "Who will win World Cup 2030";
    let options = ["India", "Australia"];
    let endTime = "12/31/2030 05:05:05";

    await factory
      .connect(owner)
      .createQuestion(description, options, toUnix(endTime));

    let deployedQuestionAddress = await factory
      .connect(user)
      .giveLastDeployed();
    let question = new ethers.Contract(
      deployedQuestionAddress,
      questionInterface,
      provider
    );

    let _description = await question.connect(user).question();
    assert.strictEqual(_description, description);

    let _endtime = await question.connect(user).endTime();
    assert.strictEqual(fromUnix(parseInt(_endtime._hex)), endTime);

    let _options = await question.connect(user).giveOptions();
    for (let i = 0; i < options.length; i++) {
      assert.strictEqual(_options[i], options[i]);
    }
  });
});
