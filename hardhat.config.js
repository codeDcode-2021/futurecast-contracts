require("@nomiclabs/hardhat-waffle");
/**
 * @type import('hardhat/config').HardhatUserConfig
 * @todo Following are public key, and not private
 */


module.exports = {
  defaultNetwork: "localhost",
  networks: {
    hardhat: {
      gas: 10000000,
      blockGasLimit: 10000000,
      accounts: {
        mnemonic: "test test test test test test test test test test test test ",
        initialIndex: 0,
        path: "m/44'/60'/0'/0",
        count: 1000,
        accountsBalance: "1000000000000000000000"
      }
    },
  },
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  mocha: {
    timeout: 200000
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
