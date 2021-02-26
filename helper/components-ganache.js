const maxGas = 10**7;
const optionSettings = {
  debug: true,
  total_accounts: 1000,
  default_balance_ether: 1000,
  gasLimit: maxGas,
  callGasLimit: maxGas,
};

const ganache = require("ganache-cli");
const provider = ganache.provider(optionSettings);
const Web3 = require("web3");
const web3 = new Web3(provider);

const compiledFactory = require("../artifacts/contracts/Factory/EIP1167_Factory.sol/EIP1167_Factory.json");
const compiledQuestion = require("../artifacts/contracts/Question/EIP1167_Question.sol/EIP1167_Question.json");

const toEth = (inWei) => web3.utils.fromWei(inWei.toString(), "ether");
const toWei = (inEth) => web3.utils.toWei(inEth.toString(), "ether");

function randomNumber(min, max){
  ++max;
  const r = Math.random()*(max-min) + min;
  return Math.floor(r);
}

function advanceTime(time){
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({jsonrpc: '2.0',method: 'evm_increaseTime',params: [time],id: new Date().getTime()}, 
    (err, result) => {if (err) { return reject(err) }return resolve(result)})
  })
}

function advanceBlock(){
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({jsonrpc: '2.0',method: 'evm_mine',id: new Date().getTime()}, 
    (err, result) => {if (err) { return reject(err) }const newBlockHash = web3.eth.getBlock('latest').hash; return resolve(newBlockHash)})
  })
}



async function advanceTimeAndBlock(time){
  await advanceTime(time);
  await advanceBlock();
  return Promise.resolve(await web3.eth.getBlock("latest"));
};

async function advanceTimeToThis(futureTime){
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    const block = await web3.eth.getBlock(blockNumber);
    currentTime = block.timestamp;
    
    futureTime = toUnix(futureTime);
    diff = futureTime - currentTime;
    await advanceTimeAndBlock(diff);
  } catch (error) {
    console.log(error);
  }
}

function make2(str){
  str = str.toString();
  return str.length == 1 ? "0".concat(str) : str;
};

const toUnix = (strDate) => Date.parse(strDate) / 1000;
const fromUnix = (UNIX_timestamp) => {
  var a = new Date(UNIX_timestamp * 1000);
  var year = a.getFullYear();
  var month = make2(a.getMonth() + 1);
  var date = make2(a.getDate());
  var hour = make2(a.getHours());
  var min = make2(a.getMinutes());
  var sec = make2(a.getSeconds());
  var time =
    month + "/" + date + "/" + year + " " + hour + ":" + min + ":" + sec;
  return time;
};
  
const questionInstance = async (deployedAddress) => {
  return (await new web3.eth.Contract(compiledQuestion.abi, deployedAddress))
  .methods;
};

module.exports = {
  web3, questionInstance, randomNumber, advanceTimeToThis,
  make2, toUnix, fromUnix, toEth, toWei,
  compiledFactory, compiledQuestion
};