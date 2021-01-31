const { expect } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

let market;
let marketFactory;
let implementationAddress;
let admin;
let owner;
let addr1;
let addr2;
let addr3;

beforeEach(async function() {
    [admin, owner, addr1] = await ethers.getSigners();

    let Market = await ethers.getContractFactory('EIP1167_Market');
    market = await Market.deploy();
    implementationAddress = await market.address;

    let MarketFactory = await ethers.getContractFactory('EIP1167_MarketFactory');
    marketFactory = await MarketFactory.connect(admin).deploy(implementationAddress);

});

describe("MarketFactory contract", ()=>{
    it("Implementation address in MarketFactory and primary market address should be same", async ()=>{
        expect(await marketFactory.implementation()).to.equal(implementationAddress);
    });

    it("MarketFactory contract's admin is same as the admin who deployed the contract", async()=>{
        expect(await marketFactory.admin()).to.equal(admin.address);
    });
});

describe("Market contract", ()=>{
    
    it("Primary market contract should have the same bytecode as the contract deployed by the MarketFactory contract", async()=>{
        //The big number at the end of the createMarket function is Unix Epoch Time of some moment in the future.
        await marketFactory.connect(addr1).createMarket("Some question", 2, ["SomeOption1", "SomeOption2"], 1613036635);
        expect(await (marketFactory.markets(0)).bytecode).to.equal(market.bytecode);
    });

    it("Owner of the deployed market should addr1", async()=>{
        //TODO
    });
});
