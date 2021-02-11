const assert = require("assert");
const maxGas = 10000000;
const optionSettings = {
  a: 10,
  default_balance_ether: 10000,
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
let description, options, endTime;


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

  description = "Who will win World Cup 2030";
  options = ["India", "Australia"];
  endTime = "12/31/2030 05:05:05";

  tx = await factory
    .createQuestion(description, options, lib.toUnix(endTime))
    .send({ from: owner, gas: maxGas });
  console.log('Amount to deploy: ', tx.gasUsed)


  let deployedQuestionAddress = await factory.questionAddresses(0).call();
  question = await questionInstance(deployedQuestionAddress);
});

describe("Factory/Question Contract", () => {
  it("is setting the owner correctly.", async () => {
    let _owner = await question.owner().call();
    assert.strictEqual(_owner, owner);
  });


  it("is setting the basic information[description, options, endTime] correctly.", async () => {
    let _description = await question.description().call();
    let _options = await question.giveOptions().call();
    let _endTime = await question.endTime().call();

    assert.strictEqual(_description, description);
    assert.strictEqual(lib.fromUnix(_endTime), endTime);
    for (let i = 0; i < options.length; i++) {
      assert.strictEqual(options[i], _options[i]);
    }
  });


  it("allows users to stake multiple times.", async () => {    
    tx = await question.stake(0)
    .send({gas:maxGas, from: user, value: toWei("100")});
    console.log('Gas used: ', tx.gasUsed);
    
    tx = await question.stakeDetails(user, 0).call();
    console.log('MyStake: ', tx);

    val = await question.marketMakerPool().call()
    console.log('MarketMakerPool: ', toEth(val))
    val = await question.validationPool().call()
    console.log('ValidationFeePool: ', toEth(val))
    val = await question.marketPool().call()
    console.log('TotalMarketPool: ', toEth(val))
  });

  it("allows users to change their stake.", async()=>{
    tx = await question.stake(0)
    .send({gas:maxGas, from: user, value: toWei("100")});
    console.log('Gas used: ', tx.gasUsed);
   
    let amount = 23;
    tx = await question.changeStake(0, 1, toWei(amount.toString()))
    .send({gas:maxGas, from: user, });
    console.log('Gas used: ', tx.gasUsed);

    tx0 = await question.stakeDetails(user, 0).call();
    console.log('MyStake in 0: ', toEth(tx0));

    tx1 = await question.stakeDetails(user, 1).call();
    console.log('MyStake in 1: ', toEth(tx1));

    assert.strictEqual(toEth(tx1), (amount*99/100).toString());
  });

/*
it('computes validation fee correctly.', async()=>{  
  startTime = lib.toUnix("01/01/2021 00:00:00")
  endTime = lib.toUnix("12/01/2021 00:00:00")
  currentTime = lib.toUnix("01/01/2021 00:00:05")
  
  tx = await question.TcalcValidationFeePer(currentTime, startTime, endTime).call();
  console.log('At month 0:', 'fee: ', tx/100);
  
  for(let i = 2; i<=11; i++){
    currentTime = lib.toUnix(lib.make2(i)+"/01/2021 00:00:00")
    tx = await question.TcalcValidationFeePer(currentTime, startTime, endTime).call();
    console.log('At month ', i, 'fee: ', tx/100);
  }
  
  currentTime = lib.toUnix("11/30/2021 23:23:59")
  tx = await question.TcalcValidationFeePer(currentTime, startTime, endTime).call();
  console.log('At month 12:', 'fee: ', tx/100);
});
*/
});