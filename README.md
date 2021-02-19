# Kokken
## Introduction
 - Simple decentralized prediction market on ethereum
 - Owners:
   - Post a question
   - Post start time & end time
   - Get the rewards at the end
 - Users:
   - Stake on an option
     - Pay some validation+platform fee, which increases as we reach closer to the end time
     - Can change their option at any time
     - Get reward after resolution phase
   - Change their option by paying a small amount of fee
 - Validators:
   - Can validate on an option
   - Get rewards if their option turns out to be correct

 - Right users will always get profit
 - Right validators will always get profit
 - Owner will get their benefit
 - Betting, inactive, reporting, resolved

## Features
 - External staking through smart contract, ps: more profit to everyone
 - Deployment on matic
 - Compatible with metamask and portis

## Technology used:
 - Smart contract: 
   - Solidity
   - [EIP1167 Proxy contract](https://eips.ethereum.org/EIPS/eip-1167)
 - Front-end:
   - React
   - Web3
   - Metamask
   - Portis
   - Infura

## Smart contracts
 - `contracts/Factory/EIP1167_Factory.sol`
 - `contracts/Question/EIP1167_Question.sol`

## How to run?
 - `npm i`
 - `npm run compile`
 - `npm run test`
 - `npm run lnode`
 - `npm run ldeploy`
 - `npm run any:deploy`

## Global deploy instructions
 - **Get rpcEndpoint and seed-phrase**: Edit `migrations/2_any.js` file, and enter appropriate credentials.
 - **`npm run any:deploy`**

## **Front end: Instructions for running locally**
 - `npm run lnode`: Start a local hardhat node in this terminal
 - Open a new terminal
 - `npm run ldeploy`: Deploy the contract into the local node
 - `integ/info.json`: A file containing factoryInterface, factoryAddress, questionInterface

## Reading events from front-end
```
await question.getPastEvents(
  'staked',
  {
    filter: {
    _user: [user]
  },
  fromBlock: 0,
  toBlock: 'latest'
  },
  (error, events)=>{
  events.forEach((item, index)=>{
    console.log(item.address); // Contract address
    console.log(item.returnValues); // event arguments
  });
  }
);
```

## Directories
### Permanent:
 - `contracts`: smart contract scripts
 - `migrations`: migration scripts
 - `test`: testing scripts

### Temporary
 - `artifacts`: compiled scripts, needed for integrating with front-end
## VS Code Extensions
 - Solidity by Juan Blanco: error messages in the editor
 - Prettier - Code Formatter: formatting js files

## Contributors
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/akcgjc007">
          <img src="https://avatars2.githubusercontent.com/u/56300182" width="100;" alt="anupam"/>
          <br />
          <sub><b>Anupam Kumar</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/rashtrakoff">
          <img src="https://avatars2.githubusercontent.com/u/55590938" width="100;" alt="anupam"/>
          <br />
          <sub><b>Chinmay Sai Vemuri</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/sksuryan">
          <img src="https://avatars2.githubusercontent.com/u/42460131" width="100;" alt="anupam"/>
          <br />
          <sub><b>Saurabh Kumar Suryan</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/CapTen101">
          <img src="https://avatars2.githubusercontent.com/u/45699327" width="100;" alt="anupam"/>
          <br />
          <sub><b>Tushar Rohilla</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/VipinVIP">
          <img src="https://avatars2.githubusercontent.com/u/58673683" width="100;" alt="anupam"/>
          <br />
          <sub><b>VIPIN K P</b></sub>
      </a>
    </td>
  </tr>
</table>