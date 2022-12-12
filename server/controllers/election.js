const { getFactoryObject, getContractObject } = require("../web3");


exports.updateElection = async (req, res) => {
    try {
        const { user } = req
        const contractObject = await getFactoryObject();
        const result = [];
        const elections = await contractObject.methods
            .getElections()
            .call({ from: user.publicAddress });
        for (let i = 0; i < elections.length; i++) {
            const electionObject = await getContractObject(elections[i]);
            const electionDetails = await electionObject.methods
                .getElectionDetails()
                .call({ from: user.publicAddress });
            result.push({
                electionAddress: elections[i],
                electionName: electionDetails["0"],
                electionStatus: electionDetails["1"],
                electionStartsOn: new Date(parseInt(electionDetails["2"]) * 1000).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
                electionEndsOn: new Date(parseInt(electionDetails["3"]) * 1000).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
            });
        }
        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
}

exports.addConsituency = async (req, res) => {

}
exports.getAllConsituency = async (req, res) => {

}
exports.updateConsituency = async (req, res) => {

}