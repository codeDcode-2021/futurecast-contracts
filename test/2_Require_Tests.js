const assert = require('assert');
const truffleAssert = require('truffle-assertions');
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
let description, options, bettingEndTime, eventEndTime;
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
  bettingEndTime = "12/31/2030 05:05:05";
  eventEndTime = "01/31/2031 05:05:05";

  tx = await factory
    .createQuestion(description, options, lib.toUnix(bettingEndTime), lib.toUnix(eventEndTime))
    .send({ from: owner, gas: maxGas}); // Added gas: maxGas
  // console.log('Amount to deploy: ', tx.gasUsed)

  deployedQuestionAddress = await factory.questionAddresses(0).call();
  question = await questionInstance(deployedQuestionAddress);
});

describe("Test for require statements in functions 'Stake' and 'Init'", ()=>{

    it("Can't initialize a market again", async()=>{
      console.log(await question.marketInitialized().call())
      await truffleAssert.reverts(
        question.init(
          accounts[0], 
          "Who will be the president of the USA ?", 
          ["Donald Trump", "Joe Biden"], 
          lib.toUnix(bettingEndTime),
          lib.toUnix(eventEndTime)
          ).send({from: accounts[0], gas: maxGas}),
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
    