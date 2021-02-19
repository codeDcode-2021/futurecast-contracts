const Web3 = require('web3');
const fs = require('fs-extra');
const HDWalletProvider = require('truffle-hdwallet-provider');

const seedPhrase = 'ritual crane almost reason fox engage pet display dilemma inspire hat vivid';
// a group of words that allow access to a cryptocurrency wallet
const rpcEndpoint = 'https://kovan.infura.io/v3/19b85f951b5a4440923fa8f61eb27245';
// an endpint for connecting your web3 instance wallet and the blockchain node

// Setting up the provider
const provider = new HDWalletProvider(seedPhrase, rpcEndpoint);
const web3 = new Web3(provider);

const info = require('./../integ/info.json');


const deploy = async()=>{
  accounts = await web3.eth.getAccounts();
  console.log('Current account address: ', accounts[0]);
  initBal = await web3.eth.getBalance(accounts[0]);
  console.log("Account balance: ", initBal);
  
  
  factory = new web3.eth.Contract(
    info.factoryInterface,
    info.factoryAddress
    );
    
  res = await factory.methods.giveQuestionAddresses().call();
  console.log(res)

    i =13
    question = await new web3.eth.Contract(info.questionInterface, res[i])
    
    res = await question.getPastEvents(
      'staked',
      {
        filter: {
          _market: [res[i]],
          _user: [accounts[0]]
        },
        fromBlock: '23400000',
        toBlock:   'latest'
      }
      );
      
      amount = {}  
      res.forEach(item => {
        // console.log(item.returnValues);
        if(amount[item.returnValues._optionId] === undefined){
          amount[item.returnValues._optionId]
          = parseInt(item.returnValues._amount);
        }
        else{
          amount[item.returnValues._optionId]
          += parseInt(item.returnValues._amount);
        }
      });
      console.log(amount);
  
  return process.exit(0);
};
  
deploy();