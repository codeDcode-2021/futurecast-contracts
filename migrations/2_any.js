const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require("fs-extra");

const compiledFactory = require("./../artifacts/contracts/Factory/EIP1167_Factory.sol/EIP1167_Factory.json");
const compiledQuestion = require("./../artifacts/contracts/Question/EIP1167_Question.sol/EIP1167_Question.json");

seedPhrase = "seed-phrase";
rpcEndpoint = "https://rpc-mumbai.matic.today";

const { toUnix } = require("./../helper/components-ganache");

const web3 = new Web3(new HDWalletProvider(seedPhrase, rpcEndpoint));
const minGas = 9500000;

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log("Attempting to deploy from account ", accounts[0]);

  initBal = await web3.eth.getBalance(accounts[0]);

  // Deploying EIP1167_Question contract
  const EIP1167_Question = await new web3.eth.Contract(compiledQuestion.abi)
    .deploy({ data: compiledQuestion.bytecode })
    .send({ from: accounts[0], gas: minGas });
  console.log(
    "Question contract is successfully deployed at: ",
    EIP1167_Question.options.address
  );

  // Deploy 1: Factory contract
  const factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({
      data: compiledFactory.bytecode,
      arguments: [EIP1167_Question.options.address],
    })
    .send({ from: accounts[0], gas: minGas });
  console.log(
    "Factory contract is successfully deployed at: ",
    factory.options.address
  );
  finBal = await web3.eth.getBalance(accounts[0]);
  console.log("Amount spent in deploying Question+Factory: ", initBal - finBal);

  description = "Who will win India vs England?";
  options = ["India", "England", "Tie"];
  bettingEndTime = "03/10/2021 00:00:00";
  eventEndTime = "03/15/2021 00:00:00";
  tx = await factory.methods
    .createQuestion(
      description,
      options,
      toUnix(bettingEndTime),
      toUnix(eventEndTime)
    )
    .send({ from: accounts[0], gas: minGas });
  console.log(tx.gasUsed);
  
  description = "Which team will win Etherpunk?";
  options = ["codeDcode", "not-codeDcode"];
  bettingEndTime = "02/22/2021 00:00:00";
  eventEndTime = "02/23/2021 00:00:00";
  tx = await factory.methods
    .createQuestion(
      description,
      options,
      toUnix(bettingEndTime),
      toUnix(eventEndTime)
    )
    .send({ from: accounts[0], gas: minGas });
  console.log(tx.gasUsed);
  

  // Printing
  var info = {
    factoryAddress: factory.options.address,
    factoryInterface: compiledFactory.abi,
    questionInterface: compiledQuestion.abi,
  };
  fs.ensureDirSync("./integ");
  fs.outputJSONSync("./integ/info.json", info);

  return process.exit(0);
};

try {
  deploy();
} catch (er) {
  console.log(er);
}
