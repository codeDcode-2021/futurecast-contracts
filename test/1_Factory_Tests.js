const assert = require("assert");
const maxGas = 10000000;
const optionSettings = {
  a: 10,
  default_balance_ether: 100,
  gasLimit: maxGas,
  callGasLimit: maxGas,
};

const ganache = require("ganache-cli");
const provider = ganache.provider(optionSettings);
const Web3 = require("web3");
const web3 = new Web3(provider);

const compiledFactory = require("./../artifacts/contracts/Factory/Factory.sol/Factory.json");
const compiledQuestion = require("./../artifacts/contracts/Question/EIP1167_Question.sol/EIP1167_Question.json");
const lib = require("../helper/t_conversions");

const questionInstance = async (deployedAddress) => {
  return (await new web3.eth.Contract(compiledQuestion.abi, deployedAddress))
    .methods;
};

let factory;
let question;
let accounts, admin, owner, user;

const toEth = (inWei) => web3.utils.fromWei(inWei, "ether");
const toWei = (inEth) => web3.utils.toWei(inEth, "ether");

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  admin = accounts[0];
  owner = accounts[1];
  user = accounts[2];

  factoryInstance = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({
      data: compiledFactory.bytecode,
    })
    .send({ from: admin, gas: maxGas });

  factory = factoryInstance.methods;
});

describe("Factory/Question Contract", () => {
  it("is setting the owner correctly.", async () => {
    await factory
      .createQuestion(
        "Who do we think we are?",
        ["Humans", "Animals"],
        lib.toUnix("01/01/2029 00:00:00")
      )
      .send({ from: owner, gas: maxGas });
    let deployedQuestionAddress = await factory.questionAddresses(0).call();

    question = await questionInstance(deployedQuestionAddress);

    let _owner = await question.owner().call();
    assert.strictEqual(_owner, owner);
  });

  it("is setting the basic information[description, options, endTime] correctly.", async () => {
    let description = "Who will win World Cup 2030";
    let options = ["India", "Australia"];
    let endTime = "12/31/2030 05:05:05";

    await factory
      .createQuestion(description, options, lib.toUnix(endTime))
      .send({ from: owner, gas: maxGas });

    let deployedQuestionAddress = await factory.questionAddresses(0).call();
    question = await questionInstance(deployedQuestionAddress);

    let _description = await question.description().call();
    let _options = await question.giveOptions().call();
    let _endTime = await question.endTime().call();

    assert.strictEqual(_description, description);
    assert.strictEqual(lib.fromUnix(_endTime), endTime);
    for (let i = 0; i < options.length; i++) {
      assert.strictEqual(options[i], _options[i]);
    }
  });

  it("allows users to vote.", async () => {
    let description = "Who will win World Cup 2030";
    let options = ["India", "Australia"];
    let endTime = "12/31/2030 05:05:05";

    await factory
      .createQuestion(description, options, lib.toUnix(endTime))
      .send({ from: owner, gas: maxGas });

    let deployedQuestionAddress = await factory.questionAddresses(0).call();
    question = await questionInstance(deployedQuestionAddress);

    
    await question.stake(0).send({ 
      from: user, 
      value: toWei("10"),
      gas: maxGas
    });
  });

  // it("does not allow voting twice.", async () => {
  //   // TODO:
  // });

  // it("decides the fee.", async () => {
	// 	let description = "Who will win World Cup 2030";
  //   let options = ["India", "Australia"];
  //   let endTime = "02/17/2021 05:00:00";

  //   await factory
  //     .createQuestion(description, options, lib.toUnix(endTime))
  //     .send({ from: owner, gas: maxGas });

  //   let deployedQuestionAddress = await factory.questionAddresses(0).call();
  //   question = await questionInstance(deployedQuestionAddress);
		
	// 	const l = await question.additionalFee().call();
	// 	console.log(l/10**6);
	// });


});
