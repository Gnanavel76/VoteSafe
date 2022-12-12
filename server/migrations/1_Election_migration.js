var MyContract = artifacts.require("ElectionFactory");
module.exports = function (deployer) {
    deployer.deploy(MyContract);
};