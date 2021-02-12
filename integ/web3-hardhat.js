const Web3 = require("web3");
const hre = require("hardhat");

let web3;
let walletStatus = false;

let initConnect = async()=>{
    web3 = new Web3(hre.network.provider);
};
initConnect();


let connectWallet = ()=>{
    try {
        web3.currentProvider.enable();
        walletStatus = true;
    } catch (error) {
        console.log(error);
        walletStatus = false;
    }
    // This line enables the web3 to read metamask info
}

export default web3;