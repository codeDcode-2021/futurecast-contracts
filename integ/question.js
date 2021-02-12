// Preconfigured instance of the contract
import web3 from './web3-hardhat';
import info from './info.json';

export default async function questionInstance (deployedAddress){
    return (await new web3.eth.Contract(info.questionInterface, deployedAddress))
      .methods;
}