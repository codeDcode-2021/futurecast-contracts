const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs-extra');

const compiledFactory = require('../artifacts/contracts/Factory/Factory.sol/Factory.json');
const compiledQuestion = require("../artifacts/contracts/Question/EIP1167_Question.sol/EIP1167_Question.json");

const { toUnix, fromUnix } = require('../helper/t_conversions');

const seedPhrase = 'YOUR-SEED-PHRASE';
// a group of words that allow access to a cryptocurrency wallet
const rpcEndpoint = 'RPC-ENDPOINT';
// an endpint for connecting your web3 instance wallet and the blockchain node

const provider = new HDWalletProvider(seedPhrase, rpcEndpoint);
const web3 = new Web3(provider);
const minGas = 10**7;



const deploy = async()=>{
  const accounts = await web3.eth.getAccounts();
  console.log('Attempting to deploy from account ', accounts[0]);
  
  // Deploy 1: Factory contract
  const factory = await new web3.eth.Contract(compiledFactory.abi)
  .deploy({ data: compiledFactory.bytecode})
  .send({ from: accounts[0], gas: minGas });
  console.log("Factory contract is successfully deployed at: ", factory.options.address);
  
  
  description = "Who will win World Cup 2030";
  options = ["India", "Australia"];
  bettingEndTime = "10/10/2030 00:00:00";
  eventEndTime = "10/10/2031 00:00:00";
  
  // Deploy 2: sample questions
  for(let i = 0; i<10; i++){
    tx = await factory.methods.createQuestion(
      description, options, toUnix(bettingEndTime), toUnix(eventEndTime)
      ).send({from: accounts[0], gas: minGas});
      console.log(tx);
    }
    
    // printing important information
    try {
      var info = {
        factoryAddress: factory.options.address,
        factoryInterface: compiledFactory.abi,
        questionInterface: compiledQuestion.abi
      }  
      fs.ensureDirSync("./integ");
      fs.outputJSONSync("./integ/info.json", info);
    } catch (error) {
      console.log(error);
    }
    return process.exit(1);
  };
  
  deploy();