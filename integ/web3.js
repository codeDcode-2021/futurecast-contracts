import Web3 from 'web3';

let web3;
let walletStatus = false;

let initConnect = async()=>{  
    // metamask not available
    const provider = new Web3.providers
    .HttpProvider(
        'HTTP_PROVIDER'
    );
    web3 = new Web3(provider);
    
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