const assert = require('assert');
const maxGas = 10**7; // Changed maxGas from 10**6
const optionSettings = {
  debug: true,
  total_accounts: 1000, // Changed from 100
  default_balance_ether: 1200, // Changed from 1000
  gasLimit: maxGas,
  //gasPrice: maxGas, // Required?
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
let description, options, bettingEndTime, eventEndTime, newTime;
let deployedQuestionAddress;


const toEth = (inWei) => web3.utils.fromWei(inWei.toString(), "ether");
const toWei = (inEth) => web3.utils.toWei(inEth.toString(), "ether");

function randomNumber(min, max){
  ++max;
  const r = Math.random()*(max-min) + min;
  return Math.floor(r);
}

let advanceTime = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({jsonrpc: '2.0',method: 'evm_increaseTime',params: [time],id: new Date().getTime()}, 
    (err, result) => {if (err) { return reject(err) }return resolve(result)})
  })
}

let advanceBlock = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({jsonrpc: '2.0',method: 'evm_mine',id: new Date().getTime()}, 
    (err, result) => {if (err) { return reject(err) }const newBlockHash = web3.eth.getBlock('latest').hash; return resolve(newBlockHash)})
  })
}

let advanceTimeAndBlock = async (time) => {
  await advanceTime(time);
  await advanceBlock();
  return Promise.resolve(await web3.eth.getBlock("latest"));
};

let advanceTimeToThis = async(futureTime)=>{
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    const block = await web3.eth.getBlock(blockNumber);
    currentTime = block.timestamp;
    
    futureTime = lib.toUnix(futureTime);
    diff = futureTime - currentTime;
    await advanceTimeAndBlock(diff);
  } catch (error) {
    console.log(error);
  }
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
    .send({ from: admin, gas: maxGas}); // Added gas: maxGas
  factory = factoryInstance.methods;

  description = "Who will win World Cup 2030";
  options = ["India", "Australia"];
  bettingEndTime = "10/10/2030 05:05:05";
  eventEndTime = "10/10/2031 05:05:05";

  tx = await factory
    .createQuestion(description, options, lib.toUnix(bettingEndTime), lib.toUnix(eventEndTime))
    .send({ from: owner, gas: maxGas}); // Added gas: maxGas
  // console.log('Amount to deploy: ', tx.gasUsed)

  deployedQuestionAddress = await factory.questionAddresses(0).call();
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
    console.log('MyStake: ', toEth(tx));

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
    console.log('Gas used for stake: ', tx.gasUsed);
   
    let amount = 23;
    tx = await question.changeStake(0, 1, toWei(amount.toString()))
    .send({gas:maxGas, from: user, });
    console.log('Gas used for change stake: ', tx.gasUsed);

    tx0 = await question.stakeDetails(user, 0).call();
    console.log('MyStake in 0: ', toEth(tx0));

    tx1 = await question.stakeDetails(user, 1).call();
    console.log('MyStake in 1: ', toEth(tx1));

    assert.strictEqual(toEth(tx1), (amount*99/100).toString());
    console.log('Assert passed.');
  });

  it.only('Small market simulation', async()=>{ // Changes from "allows validators to stake and validate."
    // Staking
    console.log("Reaching here.");
    for(let i = 1; i<=30; i++)
      await question.stake(0).send({from: accounts[i],gas: maxGas,value: toWei(10)});
    
    for(let i = 31; i<=60; i++)
      await question.stake(1).send({from: accounts[i],gas: maxGas,value: toWei(10)});

    currentFakeTime = "01/31/2031 06:06:06";
    await advanceTimeToThis(currentFakeTime);

    // Validation
    for(let i = 61; i<=70; i++)
      await question.stakeForReporting(0).send({from: accounts[i], gas: maxGas, value: toWei(10)});


    // Phase over + Reward Distribution
    currentFakeTime = "01/02/2031 08:05:59";
    await advanceTimeToThis(currentFakeTime);
    // console.log('Question balance: ', toEth(await web3.eth.getBalance(deployedQuestionAddress)));

    // Staker redeem
    for(let i = 1; i<=30; i++){
      initBalance = await web3.eth.getBalance(accounts[i]);
      await question.redeemStakedPayout().send({from: accounts[i],gas: maxGas});
      finBalance = await web3.eth.getBalance(accounts[i]);
      console.log('Staker reward: ', i, ': ', toEth(finBalance - initBalance));
    }
    console.log('\nQuestion balance: ', toEth(await web3.eth.getBalance(deployedQuestionAddress)), "\n");

    
    // Validator redeem
    for(let i = 61; i<=70; i++){
      initBalance = await web3.eth.getBalance(accounts[i]);
      await question.redeemReportingPayout().send({from: accounts[i],gas: maxGas});
      finBalance = await web3.eth.getBalance(accounts[i]);
      console.log('Validator reward: ', i, ': ', toEth(finBalance - initBalance));
    }
    console.log('\nQuestion balance: ', toEth(await web3.eth.getBalance(deployedQuestionAddress)), "\n");


    // Owner redeem
    initBalance = await web3.eth.getBalance(owner);
    await question.redeemMarketMakerPayout().send({from: owner,gas: maxGas});
    finBalance = await web3.eth.getBalance(owner);
    console.log('Owner reward: ', toEth(finBalance - initBalance));

    console.log('Question balance: ', toEth(await web3.eth.getBalance(deployedQuestionAddress)), "\n");
    
  });


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
});
