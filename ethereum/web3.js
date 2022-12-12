const Web3 = require("web3");
require("dotenv").config();

let web3;
let web3Network;

console.log("NODE_ENV", process.env.NODE_ENV);

if (process.env.NODE_ENV == "GANACHE" || process.env.NODE_ENV === undefined) {
  // web3 = new Web3(ganache.provider());

  // local ganache-cli setup
  const eventProvider = new Web3.providers.WebsocketProvider("ws://0.0.0.0:7545");
  web3 = new Web3(new Web3.providers.HttpProvider("http://0.0.0.0:7545"));

  web3Network = "ganache";
  web3.setProvider(eventProvider);
}

module.exports = { web3, web3Network };
