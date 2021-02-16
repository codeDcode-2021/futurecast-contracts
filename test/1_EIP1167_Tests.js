const assert = require('assert');
const maxGas = 10**7; // Changed maxGas from 10**6

let factory;
let question;
let accounts, admin, owner, user;
let description, options, bettingEndTime, eventEndTime, newTime;
let deployedQuestionAddress;

const {
  web3, questionInstance, randomNumber, advanceTimeToThis,
  make2, toUnix, fromUnix, toEth, toWei,
  compiledFactory, compiledQuestion
} = require("../helper/components");

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    admin = accounts[0];
    owner = accounts[1];
    user = accounts[2];

    // Deploying EIP1167_Question contract
    const EIP1167_Question = await new web3.eth.Contract(compiledQuestion.abi)
    .deploy({ data: compiledQuestion.bytecode})
    .send({ from: accounts[0], gas: maxGas});
    console.log("Question contract is successfully deployed at: ", EIP1167_Question.options.address);
    
    // Deploying EIP1167_Factory contract
    const factoryInstance = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ 
      data: compiledFactory.bytecode, 
      arguments: [EIP1167_Question.options.address]
    })
    .send({ from: accounts[0], gas: maxGas });
    console.log("Factory contract is successfully deployed at: ", factoryInstance.options.address);
    factory = factoryInstance.methods;

    let description = "Who will win World Cup 2030";
    let options = ["India", "Australia"];
    let bettingEndTime = "10/10/2030 00:00:00";
    let eventEndTime = "10/10/2031 00:00:00";
  
    let tx = await factory.createQuestion(
    description, options,  toUnix(bettingEndTime),  toUnix(eventEndTime)
    ).send({from: accounts[1], gas: maxGas});

    console.log(tx.gasUsed);

    deployedQuestionAddress = await factory.questionAddresses(0).call();
    question = await questionInstance(deployedQuestionAddress);
});

describe("Factory/Question Contract", () => {
  it("is setting the owner correctly.", async () => {
    let _owner = await question.owner().call();
    assert.strictEqual(_owner, owner);
  });

  // it("is setting the basic information[description, options, endTime] correctly.", async () => {
  //   let allPublicVariables = await question.publicVariables().call();

  //   let _options = allPublicVariables[3];
  //   let _bettingEndTime = allPublicVariables[1][1];
  //   let _eventEndTime = allPublicVariables[1][2];
  //   let _description = allPublicVariables[0];
    
  //   assert.strictEqual(_description, description);
  //   assert.strictEqual( toUnix(bettingEndTime).toString(), _bettingEndTime);
  //   assert.strictEqual( toUnix(eventEndTime).toString(), _eventEndTime);
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

  it('Small market simulation', async()=>{ // Changes from "allows validators to stake and validate."
    // Staking
    console.log("Reaching here 1");
    for(let i = 1; i<=30; i++)
      await question.stake(0).send({from: accounts[i],gas: maxGas,value: toWei(10)});
    
    for(let i = 31; i<=60; i++)
      await question.stake(1).send({from: accounts[i],gas: maxGas,value: toWei(10)});

    console.log("Reaching here 2");
    // Validation
    currentFakeTime = "10/10/2031 01:00:00";
    await advanceTimeToThis(currentFakeTime);
    // console.log(await question.getTimeStamp().call());
    console.log(await question.currState().call());

    for(let i = 61; i<=70; i++)
      await question.stakeForReporting(0).send({from: accounts[i], gas: maxGas, value: toWei(30)});

    console.log(await question.currState().call());  
    console.log("Reaching here 3");

    // Phase over + Reward Distribution
    currentFakeTime = "10/15/2031 08:05:59";
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
});
