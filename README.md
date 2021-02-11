# Kokken

## Important files
```
contracts/Factory/Factory.sol
contracts/Question/EIP1167_Question.sol
```

## How to run?
 - `npm i`
 - `npm run compile`
 - `npm run test`
 - `npm run lnode`
 - `npm run ldeploy`

## **Front end: Instructions for running locally**
 - `npm run lnode`: Start a local hardhat node in this terminal
 - Open a new terminal
 - `npm run ldeploy`: Deploy the contract into the local node
 - `integ/info.json`: A file containing factoryInterface, factoryAddress, questionInterface

## Directories
### Permanent:
 - `contracts`: smart contract scripts
 - `migrations`: migration scripts
 - `test`: testing scripts

### Temporary
 - `artifacts`: compiled scripts, needed for integrating with front-end
 
    We need the `interface` files of the compiled contracts.
    After smart contract development, we can write a script which will dump `interface` code into a separate file. This separate file will be downloaded by the user to interact with contracts.
 
## VS Code Extensions
 - Solidity by Juan Blanco: error messages in the editor
 - Prettier - Code Formatter: formatting js files

## Explanation

Phases: {BETTING, REPORTING, RESOLVED}

1) BETTING
    - People vote on their belief.
    - Market maker fee applied (0.5%)
    - Validation fee applied. (Fee - 0.5%)
    - Fee calculated by a time dependant formula

2) REPORTING
    - People (Ideally other than the original voters) vote on the right answer.
    - No fees applied (yet).
    - People receive money from wrong option voters in the reporting phase as well as from the validation fee pool.
    - Theoretically, more lucrative to stake money in this phase.
    - Hence, faster resolution times can be achieved.