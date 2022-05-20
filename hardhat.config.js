/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-truffle5');
require('@tenderly/hardhat-tenderly');

module.exports = {
  defaultNetwork: 'hardhat',
  tenderly: {
    project: "raricapital",
    username: "Sk0g3n",
  },
  networks: {
    hardhat: {
      chainID: 1337,
      allowUnlimitedContractSize: true,
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.5.16',
      },
      {
        version: '0.6.12',
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
};
