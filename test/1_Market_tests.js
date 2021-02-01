const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

let market;
let marketFactory;

let marketAddress;
let accounts;
let admin;
let owner;
let addr1;

let provider = ethers.getDefaultProvider();


const toTimestamp = (strDate)=>Date.parse(strDate)/1000;




beforeEach(async ()=>{
    accounts = await ethers.getSigners();
    admin = accounts[0];
    owner = accounts[1];
    addr1 = accounts[2];
    

    let marketObject = await ethers.getContractFactory('EIP1167_Market');
    market = await marketObject.deploy();

    marketAddress = await market.address;

    let factoryObject = await ethers.getContractFactory('EIP1167_MarketFactory');
    marketFactory = await factoryObject.connect(admin).deploy(marketAddress);


    await marketFactory
        .connect(owner)
        .createMarket(
            "Who do we think we are?", 
            2, 
            ["Humans", "Animals"], 
            toTimestamp('01/01/2029 00:00:00')
        );    
});

describe("Market contract", ()=>{
    
    // it("has the same as Factory contract instance.", async()=>{
    //     //The big number at the end of the createMarket function is Unix Epoch Time of some moment in the future.
    //     await marketFactory
    //     .connect(owner)
    //     .createMarket(
    //         "Who do we think we are?", 
    //         2, 
    //         ["Humans", "Animals"], 
    //         toTimestamp('01/01/2029 00:00:00')
    //     );    

    //     assert(marketFactory.markets(0).bytecode == market.bytecode);
    // });

    it("is setting the owner correctly.", async()=>{
        
        let firstDeployedQuestionAddress = await marketFactory.markets(0);
        let abi = (await ethers.getContractFactory("Market")).interface;

        let question = new ethers.Contract(
            firstDeployedQuestionAddress,
            abi,
            provider
        );

        let _owner = await question.connect(owner).owner();
        assert.strictEqual(_owner, owner.address);

    });
});
