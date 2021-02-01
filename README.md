# Kokken

## How to run?
 - `npm i`
 - `npm run compile`
 - `npm run test`

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