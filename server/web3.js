const Web3 = require("web3");
const solc = require("solc");
const fs = require("fs-extra");
const path = require("path");

const eventProvider = new Web3.providers.WebsocketProvider("ws://0.0.0.0:7545");
const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));
web3.setProvider(eventProvider);

const getAllAccount = async () => {
    try {
        const accounts = await web3.eth.getAccounts()
        return accounts
    } catch (error) {
        return new Error("Unable to fetch acccounts")
    }
}
module.exports = { web3, getAllAccount }