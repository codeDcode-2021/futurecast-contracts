const fs = require('fs-extra');
const { toUnix } = require('../helper/t_conversions');
const { ethers } = require("hardhat");

const compiledFactory = require("../artifacts/contracts/Factory/Factory.sol/Factory.json");
const compiledQuestion = require("../artifacts/contracts/Question/EIP1167_Question.sol/EIP1167_Question.json");

main = async()=>{
  let accounts = await ethers.getSigners();

  let factoryInstance = await ethers.getContractFactory('Factory');
  factory = await factoryInstance.deploy();

  description = "Who will win World Cup 2030";
  options = ["India", "Australia"];
  endTime = "12/31/2030 05:05:05";

  // Deploying sample questions
  for(let i = 0; i<10; i++){
    tx = await factory.connect(accounts[0]).createQuestion(description, options, toUnix(endTime));
  }
  
  // Making the integ/info.json
  // var info = {
  //   factoryAddress: factory.address,
  //   factoryInterface: compiledFactory.abi,
  //   questionInterface: compiledQuestion.abi
  // }
  // fs.ensureDirSync("./integ");
  // fs.outputJSONSync("./integ/info.json", info);     
}

main();