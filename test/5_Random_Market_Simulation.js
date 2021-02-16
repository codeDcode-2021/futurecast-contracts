const assert = require('assert');
const maxGas = 10**7;

let factory;
let question;
let accounts, admin, owner, user;
let description, options, bettingEndTime, eventEndTime, newTime;
let deployedQuestionAddress;

const {
  web3, questionInstance, randomNumber, advanceTimeToThis,
  make2, toUnix, fromUnix, toEth, toWei,
  compiledFactory, compiledQuestion
} = require("./../helper/components");

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    owner = accounts[0];

    // Deploying EIP1167_Question contract
    const EIP1167_Question = await new web3.eth.Contract(compiledQuestion.abi)
    .deploy({ data: compiledQuestion.bytecode})
    .send({ from: owner, gas: maxGas});
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
    description, options, toUnix(bettingEndTime), toUnix(eventEndTime)
    ).send({from: owner, gas: maxGas});

    console.log(tx.gasUsed);

    deployedQuestionAddress = await factory.questionAddresses(0).call();
    question = await questionInstance(deployedQuestionAddress);
});

describe("Factory/Question Contract", () => {
  it('Random market simulation', async()=>{ // Changes from "allows validators to stake and validate."
    // Staking
    console.log("Reaching staking phase...");
    for(let i = 1; i<=80; i++){
      randomOption = randomNumber(0, 1);
      randomEth = randomNumber(1, 20);
      await question.stake(randomOption).send({from: accounts[i],gas: maxGas,value: toWei(randomEth)});
    }
    
    
    
    // Validation
    console.log("Reaching Validation phase...");
    currentFakeTime = "10/10/2031 01:00:00";
    await advanceTimeToThis(currentFakeTime);
    console.log(await question.currState().call());
    
    for(let i = 81; i<=100; i++){
      randomOption = randomNumber(0, 1);
      randomEth = randomNumber(1, 20);
      await question.stakeForReporting(randomOption).send({from: accounts[i], gas: maxGas, value: toWei(randomEth)});
    }

    console.log(await question.currState().call());  
    console.log("Reaching reward distribution phase...");

    // Phase over + Reward Distribution
    currentFakeTime = "10/15/2031 08:05:59";
    await advanceTimeToThis(currentFakeTime);

    // Staker redeem
    for(let i = 1; i<=80; i++){
      initBalance = await web3.eth.getBalance(accounts[i]);

      try {
        await question.redeemStakedPayout().send({from: accounts[i],gas: maxGas});
      } catch (error) {
        continue;
      }
      
      finBalance = await web3.eth.getBalance(accounts[i]);
      console.log('Staker reward: ', i, ': ', toEth(finBalance - initBalance));
    }

    // Validator redeem
    for(let i = 81; i<=100; i++){
      initBalance = await web3.eth.getBalance(accounts[i]);
      
      try {
        await question.redeemReportingPayout().send({from: accounts[i],gas: maxGas});
      } catch (error) {
        continue;        
      }
      finBalance = await web3.eth.getBalance(accounts[i]);
      console.log('Validator reward: ', i, ': ', toEth(finBalance - initBalance));
    }


    // Owner redeem
    initBalance = await web3.eth.getBalance(owner);
    await question.redeemMarketMakerPayout().send({from: owner, gas: maxGas});
    finBalance = await web3.eth.getBalance(owner);
    console.log('Owner reward: ', toEth(finBalance - initBalance));

    console.log('Question balance: ', toEth(await web3.eth.getBalance(deployedQuestionAddress)), "\n");
  });
});
