// Preconfigured instance of the contract
import web3 from './web3-hardhat';
import info from './info.json';

export default factory = new web3.eth.Contract(
    info.factoryInterface,
    info.factoryAddress
);