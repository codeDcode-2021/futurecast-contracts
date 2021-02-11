const assert = require("assert");
const maxGas = 10**6;
const optionSettings = {
  debug: true,
  total_accounts: 100,
  default_balance_ether: 1000,
  gasLimit: maxGas,
  gasPrice: maxGas,
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
let deployedQuestionAddress;


const toEth = (inWei) => web3.utils.fromWei(inWei.toString(), "ether");
const toWei = (inEth) => web3.utils.toWei(inEth.toString(), "ether");

function randomNumber(min, max){
  max = max+1;
  const r = Math.random()*(max-min) + min;
  return Math.floor(r);
}


beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  admin = accounts[0];
  owner = accounts[1];
  user = accounts[2];

  factoryInstance = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({
      data: compiledFactory.bytecode,
    })
    .send({ from: admin});
  factory = factoryInstance.methods;

  description = "Who will win World Cup 2030";
  options = ["India", "Australia"];
  endTime = "12/31/2030 05:05:05";

  tx = await factory
    .createQuestion(description, options, lib.toUnix(endTime))
    .send({ from: owner});
  // console.log('Amount to deploy: ', tx.gasUsed)


  deployedQuestionAddress = await factory.questionAddresses(0).call();
  question = await questionInstance(deployedQuestionAddress);
});

describe("Factory/Question Contract", () => {
  // it("is setting the owner correctly.", async () => {
  //   let _owner = await question.owner().call();
  //   assert.strictEqual(_owner, owner);
  // });


  // it("is setting the basic information[description, options, endTime] correctly.", async () => {
  //   let _description = await question.description().call();
  //   let _options = await question.giveOptions().call();
  //   let _endTime = await question.endTime().call();

  //   assert.strictEqual(_description, description);
  //   assert.strictEqual(lib.fromUnix(_endTime), endTime);
  //   for (let i = 0; i < options.length; i++) {
  //     assert.strictEqual(options[i], _options[i]);
  //   }
  // });


  // it("allows users to stake multiple times.", async () => {    
  //   tx = await question.stake(0)
  //   .send({gas:maxGas, from: user, value: toWei("100")});
  //   console.log('Gas used: ', tx.gasUsed);
    
  //   tx = await question.stakeDetails(user, 0).call();
  //   console.log('MyStake: ', toEth(tx));

  //   val = await question.marketMakerPool().call()
  //   console.log('MarketMakerPool: ', toEth(val))
  //   val = await question.validationPool().call()
  //   console.log('ValidationFeePool: ', toEth(val))
  //   val = await question.marketPool().call()
  //   console.log('TotalMarketPool: ', toEth(val))
  // });

  // it("allows users to change their stake.", async()=>{
  //   tx = await question.stake(0)
  //   .send({gas:maxGas, from: user, value: toWei("100")});
  //   console.log('Gas used for stake: ', tx.gasUsed);
   
  //   let amount = 23;
  //   tx = await question.changeStake(0, 1, toWei(amount.toString()))
  //   .send({gas:maxGas, from: user, });
  //   console.log('Gas used for change stake: ', tx.gasUsed);

  //   tx0 = await question.stakeDetails(user, 0).call();
  //   console.log('MyStake in 0: ', toEth(tx0));

  //   tx1 = await question.stakeDetails(user, 1).call();
  //   console.log('MyStake in 1: ', toEth(tx1));

  //   assert.strictEqual(toEth(tx1), (amount*99/100).toString());
  //   console.log('Assert passed.');
  // });

  it('allows validators to stake and validate.', async()=>{
    // Staking
    for(let i = 1; i<=30; i++)
      await question.stake(0).send({from: accounts[i],gas: maxGas,value: toWei(10)});
    
    for(let i = 31; i<=60; i++)
      await question.stake(1).send({from: accounts[i],gas: maxGas,value: toWei(10)});
    


    currentFakeTime = "01/01/2031 05:05:59";
    await question.changeFakeTimestamp(lib.toUnix(currentFakeTime))
    .send({gas: maxGas,from: user});

    // Validation
    for(let i = 61; i<=70; i++)
      await question.stakeForReporting(0).send({from: accounts[i],value: toWei(10),gas: maxGas});

    // Phase over + Reward Distribution
    currentFakeTime = "01/07/2031 05:05:59";
    await question.changeFakeTimestamp(lib.toUnix(currentFakeTime)).send({gas: maxGas,from: user});
    console.log('Question balance: ', toEth(await web3.eth.getBalance(deployedQuestionAddress)));
    // Staker redeem
    for(let i = 1; i<=30; i++){
      initBalance = await web3.eth.getBalance(accounts[i]);
      await question.redeemStakedPayout().send({from: accounts[i],gas: maxGas});
      finBalance = await web3.eth.getBalance(accounts[i]);
      console.log('Staker reward: ', i, ': ', toEth(finBalance - initBalance));
      
      // console.log('Question balance: ', toEth(await web3.eth.getBalance(deployedQuestionAddress)));
    }
    
    
    // Validator redeem
    for(let i = 61; i<=70; i++){
      initBalance = await web3.eth.getBalance(accounts[i]);
      await question.redeemReportingPayout().send({from: accounts[i],gas: maxGas});
      finBalance = await web3.eth.getBalance(accounts[i]);
      console.log('Validator reward: ', i, ': ', toEth(finBalance - initBalance));
    }
    

    // Owner redeem
    initBalance = await web3.eth.getBalance(owner);
    await question.redeemMarketMakerPayout().send({from: owner,gas: maxGas});
    finBalance = await web3.eth.getBalance(owner);
    console.log('Owner reward: ', toEth(finBalance - initBalance));
    console.log('Question balance: ', await web3.eth.getBalance(deployedQuestionAddress));
    
  });
  
  
  it('shows some events.', async()=>{
    
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