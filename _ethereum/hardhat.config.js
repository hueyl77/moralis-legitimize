require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan");

const fs = require('fs')
const privateKey = fs.readFileSync(".secret-moralis-rinkeby").toString().trim() || "01234567890123456789"

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      //url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      url: `https://speedy-nodes-nyc.moralis.io/a3ba9d53b25d7c390de99bf8/polygon/mumbai`,
      accounts: [privateKey],//[process.env.METAMASK_PRIVATEKEY]
    },
    rinkeby: {
      //url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      url: `https://zzgqtllimjxs.usemoralis.com:2053/server`,
      accounts: [privateKey],//[process.env.METAMASK_PRIVATEKEY]
    }
  },
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "QZCARSAAUN64YCKR2M778UXZ6QM7RSNBXQ"
  }
}