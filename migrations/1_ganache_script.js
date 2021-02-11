const fs = require('fs-extra');
const hre = require("hardhat");
const compiledFactory = require("./../artifacts/contracts/Factory/Factory.sol/Factory.json");
const compiledQuestion = require("./../artifacts/contracts/Question/EIP1167_Question.sol/EIP1167_Question.json");


main = async()=>{
  const FactoryFile = await hre.ethers.getContractFactory("Factory");
  const factory = await FactoryFile.deploy();

  await factory.deployed();

  console.log("Greeter deployed to:", factory.address);
  var mydic = {
    factoryAddress: factory.address,
    factoryInterface: compiledFactory.abi,
    questionInterface: compiledQuestion.abi
  }

  fs.ensureDirSync("./deployInfo");
  fs.outputJSONSync("./deployInfo/info.json", mydic)
}

main();