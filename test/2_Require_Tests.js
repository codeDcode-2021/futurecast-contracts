const assert = require('assert');
const truffleAssert = require('truffle-assertions');
const maxGas = 10**7; // Changed maxGas from 10**6

let factory;
let question;
let accounts, admin, owner, user;
let description, options, bettingEndTime, eventEndTime;
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
    // console.log("Question contract is successfully deployed at: ", EIP1167_Question.options.address);
    
    // Deploying EIP1167_Factory contract
    const factoryInstance = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ 
      data: compiledFactory.bytecode, 
      arguments: [EIP1167_Question.options.address]
    })
    .send({ from: accounts[0], gas: maxGas });
    // console.log("Factory contract is successfully deployed at: ", factoryInstance.options.address);
    factory = factoryInstance.methods;

    description = "Who will win World Cup 2030";
    options = ["India", "Australia"];
    bettingEndTime = "10/10/2030 00:00:00";
    eventEndTime = "10/10/2031 00:00:00";
  
    tx = await factory.createQuestion(
    description, options,  toUnix(bettingEndTime),  toUnix(eventEndTime)
    ).send({from: accounts[1], gas: maxGas});

    deployedQuestionAddress = await factory.questionAddresses(0).call();
    question = await questionInstance(deployedQuestionAddress);
});

describe("Test for require statements in functions 'Stake' and 'Init'", ()=>{

    it("Can't initialize a market again", async()=>{
      // console.log(await question.marketInitialized().call()); // Should return true
      await truffleAssert.reverts(
        question.init(
          user, 
          "Who will be the president of the USA ?", 
          ["Donald Trump", "Joe Biden"], 
           toUnix(bettingEndTime),
           toUnix(eventEndTime)
          ).send({from: user, gas: maxGas}),
        "Can't change the market parameters once initialized !"
      );
    });
  
    it("Can't stake < 10^4 wei", async()=>{
      await truffleAssert.reverts(
        question.stake(1).send({from: accounts[0],gas: maxGas,value: toWei(0)}),
        "Invalid amount to stake."
      );
    });
});

describe("Test for require statements in function 'changeStake'", ()=>{
    it("Can't change stake if not participated in voting yet", async()=>{
        await truffleAssert.reverts(
          question.changeStake(0, 1, toWei(200)).send({from: accounts[0], gas: maxGas}),
          "You haven't voted before!"
        );
      });
    
    it("Can't change stake if stake change amount is higher than the amount in the option", async()=>{
    question.stake(1).send({from: accounts[0],gas: maxGas,value: toWei(10)}),
    await truffleAssert.reverts(
        question.changeStake(1, 0, toWei(200)).send({from: accounts[0], gas: maxGas}),
        "Stake change amount is higher than the staked amount !"
        );
    });

    it("Options must not be same", async()=>{
    question.stake(1).send({from: accounts[0],gas: maxGas,value: toWei(10)}),
    await truffleAssert.reverts(
        question.changeStake(1, 1, toWei(5)).send({from: accounts[0], gas: maxGas}),
        "Options are the same !"
        );
    });

    it("Stake amount must be sufficient", async()=>{
    question.stake(1).send({from: accounts[0],gas: maxGas,value: toWei(10)}),
    await truffleAssert.reverts(
        question.changeStake(1, 0, 100).send({from: accounts[0], gas: maxGas}),
        "Insufficient stake change amount"
        );
    });
});

// Not valid now
// describe('Test for stakeForReporting function require statements', ()=>{
//     it("Can't stake during reporting phase if user has already staked && reported earlier", async()=>{
//       console.log(await question.currState.call()),
//         await truffleAssert.reverts(
//           question.stakeForReporting(0).send({from: accounts[0], gas: maxGas, value: toWei(5)}),
//           "Sorry, you have already staked/voted!"
//         );
//       });
// });
    