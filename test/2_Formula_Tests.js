const assert = require("assert");
const maxGas = 10000000;
const optionSettings = {
  a: 10,
  default_balance_ether: 10,
  gasLimit: maxGas,
  callGasLimit: maxGas,
};

const lib = require("./../helper/t_conversions");


const ganache = require("ganache-cli");
const provider = ganache.provider(optionSettings);
const Web3 = require("web3");
const web3 = new Web3(provider);

const compiledFormula = require("./../artifacts/contracts/Utils/Formulas.sol/Formulas.json");
let formula;

const questionInstance = async (deployedAddress) => {
  return (await new web3.eth.Contract(compiledQuestion.abi, deployedAddress))
    .methods;
};

const toEth = (inWei) => web3.utils.fromWei(inWei, "ether");
const toWei = (inEth) => web3.utils.toWei(inEth, "ether");

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
	admin = accounts[0]

  formulaInstance = await new web3.eth.Contract(compiledFormula.abi)
    .deploy({
      data: compiledFormula.bytecode,
    })
    .send({ from: admin, gas: maxGas });

  formula = formulaInstance.methods;
});

describe("Formula", () => {
  it("is alright.", async () => {
		startTime = lib.toUnix("01/01/2021 00:00:00")
		endTime = lib.toUnix("12/01/2021 00:00:00")


    currentTime = lib.toUnix("01/01/2021 00:00:05")
    ans = await formula.calcValidationFee(currentTime, startTime, endTime).call();
    console.log('At month 0:', 'fee: ', ans/10**6);
		
    for(let i = 2; i<=11; i++){
			currentTime = lib.toUnix(lib.make2(i)+"/01/2021 00:00:00")
			ans = await formula.calcValidationFee(currentTime, startTime, endTime).call();
			console.log('At month ', i, 'fee: ', ans/10**6);
		}

    currentTime = lib.toUnix("11/30/2021 23:23:59")
    ans = await formula.calcValidationFee(currentTime, startTime, endTime).call();
    console.log('At month 12:', 'fee: ', ans/10**6);
		
	});
});
