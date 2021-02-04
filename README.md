# Kokken

## Important files
```
contracts/Factory/Factory.sol
contracts/Question/Question.sol
```

## How to run?
 - `npm i`
 - `npm run compile`
 - `npm run test`

## <b>Info for front-end team</b>
 - `helper/factory.js`
 - `helper/question.js`
 - `helper/web3.js`
 - interface for Factory
 - interface for Question

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