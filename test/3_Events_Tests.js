// const assert = require('assert');
// const maxGas = 10**7; // Changed maxGas from 10**6
// const optionSettings = {
//   debug: true,
//   total_accounts: 1000, // Changed from 100
//   default_balance_ether: 1200, // Changed from 1000
//   gasLimit: maxGas,
//   //gasPrice: maxGas, // Required?
//   callGasLimit: maxGas,
// };

// const ganache = require("ganache-cli");
// const provider = ganache.provider(optionSettings);
// const Web3 = require("web3");
// const web3 = new Web3(provider);

// const compiledFactory = require("./../artifacts/contracts/Factory/Factory.sol/Factory.json");
// const compiledQuestion = require("./../artifacts/contracts/Question/EIP1167_Question.sol/EIP1167_Question.json");
// const lib = require("../helper/t_conversions");

// const questionInstance = async (deployedAddress) => {
//   return (await new web3.eth.Contract(compiledQuestion.abi, deployedAddress))
//     .methods;
// };

// let factory;
// let question;
// let accounts, admin, owner, user;
// let description, options, bettingEndTime, eventEndTime, newTime;
// let deployedQuestionAddress;

// // Utility functions 
// const toEth = (inWei) => web3.utils.fromWei(inWei.toString(), "ether");
// const toWei = (inEth) => web3.utils.toWei(inEth.toString(), "ether");

// function randomNumber(min, max){
//   ++max;
//   const r = Math.random()*(max-min) + min;
//   return Math.floor(r);
// }

// let advanceTime = (time) => {
//   return new Promise((resolve, reject) => {
//     web3.currentProvider.send({jsonrpc: '2.0',method: 'evm_increaseTime',params: [time],id: new Date().getTime()}, 
//     (err, result) => {if (err) { return reject(err) }return resolve(result)})
//   })
// }

// let advanceBlock = () => {
//   return new Promise((resolve, reject) => {
//     web3.currentProvider.send({jsonrpc: '2.0',method: 'evm_mine',id: new Date().getTime()}, 
//     (err, result) => {if (err) { return reject(err) }const newBlockHash = web3.eth.getBlock('latest').hash; return resolve(newBlockHash)})
//   })
// }

// let advanceTimeAndBlock = async (time) => {
//   await advanceTime(time);
//   await advanceBlock();
//   return Promise.resolve(await web3.eth.getBlock("latest"));
// };

// let advanceTimeToThis = async(futureTime)=>{
//   try {
//     const blockNumber = await web3.eth.getBlockNumber();
//     const block = await web3.eth.getBlock(blockNumber);
//     currentTime = block.timestamp;
    
//     futureTime = lib.toUnix(futureTime);
//     diff = futureTime - currentTime;
//     await advanceTimeAndBlock(diff);
//   } catch (error) {
//     console.log(error);
//   }
// }

// beforeEach(async () => {
//     accounts = await web3.eth.getAccounts();
//     admin = accounts[0];
//     owner = accounts[1];
//     user = accounts[2];

//     factoryInstance = await new web3.eth.Contract(compiledFactory.abi)
//     .deploy({
//         data: compiledFactory.bytecode,
//     })
//     .send({ from: admin, gas: maxGas}); // Added gas: maxGas
//     factory = factoryInstance.methods;

//     description = "Who will win World Cup 2030";
//     options = ["India", "Australia"];
//     bettingEndTime = "10/10/2030 00:00:00";
//     eventEndTime = "10/10/2031 00:00:00";
    
//     tx =  await factory
//     .createQuestion(description, options, lib.toUnix(bettingEndTime), lib.toUnix(eventEndTime))
//     .send({ from: owner, gas: maxGas});// Added gas: maxGas
//     // console.log('Amount to deploy: ', tx.gasUsed)
    
//     deployedQuestionAddress = await factory.questionAddresses(0).call();
//     question = await questionInstance(deployedQuestionAddress);
// });

// describe("Tests for checking events", ()=>{
//     it("")
// });