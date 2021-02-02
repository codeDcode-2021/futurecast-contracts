const { assert } = require("chai");
const { ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

let factory;
let accounts, admin, owner, user;

let provider = ethers.getDefaultProvider();

const make2 = (str)=>{
  str = str.toString();
  return (str.length == 1)?"0".concat(str):str;
}
const toUnix = (strDate) => Date.parse(strDate) / 1000;
const fromUnix = (UNIX_timestamp)=>{
  var a = new Date(UNIX_timestamp * 1000);
  var year = a.getFullYear();
  var month = make2((a.getMonth()+1));
  var date = make2(a.getDate());
  var hour = make2(a.getHours());
  var min = make2(a.getMinutes());
  var sec = make2(a.getSeconds());
  var time = date + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

beforeEach(async () => {
  // Getting all accounts
  accounts = await ethers.getSigners();
  
  // Setting appropriate accounts
  admin = accounts[0];
  owner = accounts[1];
  user = accounts[2];

  // Deploying the factory contract
  let factoryObject = await ethers.getContractFactory("Factory");
  factory = await factoryObject.connect(admin).deploy();

  // Calling the factory contract to deploy on Question
  await factory
    .connect(owner)
    .createMarket(
      "Who do we think we are?",
      ["Humans", "Animals"],
      toUnix("01/01/2029 00:00:00")
    );
});

describe("Market contract", () => {
  it("is setting the owner correctly.", async () => {
    let deployedQuestionAddress = await factory.marketAddresses(0);
    let abi = (await ethers.getContractFactory("Question")).interface;

    let question = new ethers.Contract(
      deployedQuestionAddress,
      abi,
      provider
    );

    let _owner = await question.connect(owner).owner();
    assert.strictEqual(_owner, owner.address);
  });
});
