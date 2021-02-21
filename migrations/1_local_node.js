const { ethers } = require("hardhat");
const {
  web3, questionInstance, randomNumber, advanceTimeToThis,
  make2, toUnix, fromUnix, toEth, toWei,
  compiledFactory, compiledQuestion
} = require("../helper/components-ganache");

main = async()=>{
  let accounts = await ethers.getSigners();

  let baseQuestionInstance = await ethers.getContractFactory('EIP1167_Question');
  question = await baseQuestionInstance.deploy();
  
  
  // let factoryInstance = await ethers.getContractFactory('EIP1167_Factory');
  // factory = await factoryInstance.deploy();

  // let description = "Who will win World Cup 2030";
  // let options = ["India", "Australia"];
  // let bettingEndTime = "10/10/2030 00:00:00";
  // let eventEndTime = "10/10/2031 00:00:00";

  // // Deploying sample questions
  // for(let i = 0; i<100; i++){
  //   tx = await factory.connect(accounts[0]).createQuestion(
  //     description, options, toUnix(bettingEndTime), toUnix(eventEndTime)
  //   );
  // }
}

try {
  main();
} catch (err) {
  console.log(err)
}