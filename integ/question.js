// Preconfigured instance of the contract
import web3 from './web3';
import compiledContract from './build/Election.json';

export default async function questionInstance (deployedAddress){
    return (await new web3.eth.Contract(compiledQuestion.abi, deployedAddress))
      .methods;
}