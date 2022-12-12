const fs = require("fs-extra");
const path = require("path")
const { web3 } = require("./web3");
const ElectionFactory = require("./build/contracts/ElectionFactory.json")
const Election = require("./build/contracts/Election.json")

const getFactoryObject = () => {
  try {
    const contractObject = new web3.eth.Contract(
      ElectionFactory.abi,
      ElectionFactory.networks[5777].address
    );
    return contractObject;
  } catch (error) {
    throw error.message;
  }
};

const getContractObject = address => {
  try {
    const contractObject = new web3.eth.Contract(
      Election.abi,
      address
    );

    return contractObject;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getAccounts = async () => {
  try {
    return await web3.eth.getAccounts();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createElection = async (account, name, startsOn, endsOn) => {
  try {
    const contractObject = getFactoryObject();
    const receipt = await contractObject.methods
      .createElection(name, startsOn, endsOn)
      .send({ from: account, gas: 4000000 });
    return receipt;
  } catch (error) {
    throw error;
  }
};

const getAllElection = async (account) => {
  try {
    const contractObject = await getFactoryObject();
    const result = [];
    const elections = await contractObject.methods
      .getElections()
      .call({ from: account });
    for (let i = 0; i < elections.length; i++) {
      const electionObject = await getContractObject(elections[i]);
      const electionDetails = await electionObject.methods
        .getElectionDetails()
        .call({ from: account });
      result.push({
        electionAddress: elections[i],
        electionName: electionDetails["0"],
        isElectionClosed: electionDetails["1"],
        electionStartsOn: electionDetails["2"],
        electionEndsOn: electionDetails["3"],
      });
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const updateElection = async (account, electionAddress, name, startsOn, endsOn) => {
  try {
    const contractObject = await getFactoryObject();
    const elections = await contractObject.methods
      .getElections()
      .call({ from: account });
    let electionObject
    for (let i = 0; i < elections.length; i++) {
      if (electionAddress === elections[i]) {
        electionObject = await getContractObject(elections[i]);
        break
      }
    }
    const result = await electionObject.methods
      .updateElectionDetails(name, startsOn, endsOn)
      .send({ from: account });
    return result;
  } catch (error) {
    throw error;
  }
};

const getElectionAddress = async index => {
  try {
    const elections = await getConductedElections();

    return elections[index];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getElectionAdmin = async address => {
  try {
    const contractObject = getContractObject(address);
    const accounts = await web3.eth.getAccounts();
    const result = await contractObject.methods
      .admin()
      .call({ from: accounts[0] });
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getElectionName = async address => {
  try {
    const contractObject = getContractObject(address);
    const accounts = await web3.eth.getAccounts();
    const result = await contractObject.methods
      .electionName()
      .call({ from: accounts[0] });
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const addConsituency = async (account, address, consituencyId, name) => {
  try {
    const contractObject = getContractObject(address);
    const receipt = await contractObject.methods
      .addConsituency(parseInt(consituencyId), name)
      .send({ from: account, gas: 1000000 });
    return receipt;
  } catch (error) {
    throw error
  }
};

// get all the added consituency
const getAllConsituency = async (account, address) => {
  try {
    const contractObject = getContractObject(address);
    const consituencyIdList = await contractObject.methods
      .getConsituencyCount()
      .call({ from: account });
    const consituencyList = []
    for (let i = 0; i < consituencyIdList; i++) {
      consituencyList.push(getConsituency(account, address, i))
    }
    let result = await Promise.all(consituencyList);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// get the consituency
const getConsituency = async (account, address, consituencyKey) => {
  try {
    const contractObject = getContractObject(address);
    const result = await contractObject.methods
      .consituencyData(consituencyKey)
      .call({ from: account });
    const { consituencyId, name, status } = result
    return { consituencyKey, consituencyId, name, status }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateConsituency = async (account, address, consituencyKey, consituencyId, name) => {
  try {
    const contractObject = getContractObject(address);
    const receipt = await contractObject.methods
      .updateConsituency(consituencyKey, parseInt(consituencyId), name)
      .send({ from: account, gas: 1000000 });
    return receipt;
  } catch (error) {
    throw error
  }
};

const disableConsituency = async (account, address, consituencyKey) => {
  try {
    const contractObject = getContractObject(address);
    const status = await contractObject.methods
      .disableConsituency(consituencyKey)
      .send({ from: account, gas: 1000000 });
    console.log(status);
    return status;
  } catch (error) {
    console.log(error);
    throw error
  }
};

const addVoter = async (
  account,
  electionAddress,
  voterId,
  voterImage,
  name,
  dob,
  phoneNo,
  voterAddress,
  consituencyKey,
  voterETHaccount
) => {
  try {
    const contractObject = getContractObject(electionAddress);
    const receipt = await contractObject.methods
      .addVoter(voterId, voterImage, name, dob, phoneNo, voterAddress, consituencyKey, voterETHaccount)
      .send({ from: account, gas: 3000000 });
    return receipt;
  } catch (error) {
    console.log(
      error
    );
    const err = new Error(error.message.split("revert")[1].trim())
    throw err;
  }
};

const getVoterList = async (account, electionAddress) => {
  const response = {};
  try {
    const contractObject = getContractObject(electionAddress);
    const votersIdList = await contractObject.methods
      .getVotersCount()
      .call({ from: account });
    console.log("logic: get voter list:", votersIdList);
    const votersList = []
    for (let i = 0; i < votersIdList; i++) {
      votersList.push(getVoter(account, electionAddress, i))
    }
    const voters = await Promise.all(votersList);
    response["status"] = true;
    response["voters"] = voters;
    response["message"] = "Voters fetched successfully";
    return response;
  } catch (error) {
    const err = new Error(error.message.split("revert")[1].trim())
    throw err;
  }
};

const getVoter = async (account, electionAddress, voterIndex) => {
  try {
    const contractObject = getContractObject(electionAddress);
    const response = await contractObject.methods
      .voterData(voterIndex)
      .call({ from: account });
    const { voterId, voterImage, name, dob, phoneNo, voterAddress, consituencyKey, voterETHaccount, status } = response
    return { voterIndex, voterId, voterImage, name, dob, phoneNo, voterAddress, consituencyKey, voterETHaccount, status };
  } catch (error) {
    const err = new Error(error.message.split("revert")[1].trim())
    throw err;
  }
};

const getVoterById = async (account, electionAddress, voterId) => {
  const response = {};
  try {
    const contractObject = getContractObject(electionAddress);
    const votersIdList = await contractObject.methods
      .getVotersCount()
      .call({ from: account });
    console.log("logic: get voter list:", votersIdList);
    const votersList = []
    for (let i = 0; i < votersIdList; i++) {
      votersList.push(getVoter(account, electionAddress, i))
    }
    const voters = await Promise.all(votersList);
    const voter = voters.filter(v => voterId === v.voterId)
    if (voter.length === 0) {
      throw new Error("Voter not found")
    }
    response["status"] = true;
    response["voter"] = voter;
    response["message"] = "Voters fetched successfully";
    return response;
  } catch (error) {
    let err = error
    if (err.message.includes("revert")) {
      err = new Error(error.message.split("revert")[1].trim())
    }
    throw err;
  }
};

const updateVoter = async (account, address, voterIndex, voterDetails) => {
  try {
    const contractObject = getContractObject(address);
    const { voterId, voterImage, name, dob, phoneNo, voterAddress, consituencyKey, voterETHaccount } = voterDetails
    const receipt = await contractObject.methods
      .updateVoter(voterIndex, voterId, voterImage, name, dob, phoneNo, voterAddress, consituencyKey, voterETHaccount)
      .send({ from: account, gas: 1000000 });
    return receipt;
  } catch (error) {
    const err = new Error(error.message.split("revert")[1].trim())
    throw err;
  }
};

const disableVoter = async (account, address, voterIndex) => {
  try {
    const contractObject = getContractObject(address);
    const status = await contractObject.methods
      .disableVoter(voterIndex)
      .send({ from: account, gas: 1000000 });
    return status;
  } catch (error) {
    console.log(error);
    const err = new Error(error.message.split("revert")[1].trim())
    throw err;
  }
};

const addCandidate = async (
  account,
  address,
  candidateId,
  voterKey,
  voterId,
  consituencyId,
  party,
  partyImage
) => {
  try {
    const contractObject = getContractObject(address);
    const receipt = await contractObject.methods
      .addCandidate(
        candidateId,
        voterKey,
        voterId,
        consituencyId,
        party,
        partyImage
      )
      .send({ from: account, gas: 1000000 });
    return receipt;
  } catch (error) {
    const err = new Error(error.message.split("revert")[1].trim())
    throw err;
  }
};

const getCandidateList = async (account, address) => {
  try {
    const contractObject = getContractObject(address);
    const candidateIdList = await contractObject.methods
      .getCandidatesCount()
      .call({ from: account });
    const candidateList = []
    for (let i = 0; i < candidateIdList; i++) {
      candidateList.push(getCandidate(account, address, i))
    }
    let result = await Promise.all(candidateList);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getCandidate = async (account, address, candidateKey) => {
  try {
    const contractObject = getContractObject(address);
    const result = await contractObject.methods
      .candidateData(candidateKey)
      .call({ from: account });
    console.log(result);
    const { candidateId, party, partyImage, voterKey, voterId, consituencyKey: standingConsituencyKey, status: candidateStatus } = result
    const { name, dob, phoneNo, voterAddress, voterETHaccount, consituencyKey } = await getVoter(
      account, address, voterKey
    );
    return {
      candidateKey, candidateId, voterId, standingConsituencyKey, party, partyImage, candidateStatus,
      consituencyKey, name, dob, phoneNo, voterAddress, voterETHaccount
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateCandidate = async (account, address, candidateKey, candidateId, consituencyKey, party, partyImage) => {
  try {
    const contractObject = getContractObject(address);
    const receipt = await contractObject.methods
      .updateCandidate(candidateKey, candidateId, consituencyKey, party, partyImage)
      .send({ from: account, gas: 1000000 });
    return receipt;
  } catch (error) {
    console.log(error);
    throw error
  }
};

const disableCandidate = async (account, address, candidateKey) => {
  try {
    const contractObject = getContractObject(address);
    const status = await contractObject.methods
      .disableCandidate(candidateKey)
      .send({ from: account, gas: 1000000 });
    return status;
  } catch (error) {
    console.log(error);
    throw error
  }
};

// get the candidateList enrolled in a consituency
const getConsituencyCandidates = async (address, account, consituencyId) => {
  try {
    const contractObject = getContractObject(address);
    const candidateIdList = await contractObject.methods
      .getConsituencyCandidates(consituencyId)
      .call({ from: account });
    const candidateList = []
    for (let i = 0; i < candidateIdList.length; i++) {
      candidateList.push(getCandidate(account, address, candidateIdList[i]))
    }
    let result = await Promise.all(candidateList);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
  return new Promise(async (resolve, reject) => {
    try {
      const contractObject = getContractObject(address);
      //const accounts = await web3.eth.getAccounts();
      const candidateList = await contractObject.methods
        .getConsituencyCandidates(consituencyId)
        .call({ from: account });
      // console.log(
      //   "inside get consituency candidates: canidateList",
      //   candidateList
      // );

      resolve(candidateList);
    } catch (error) {
      console.error("get consituency candidates: ", error);
      reject(error);
    }
  });
};

// get candidates of voter's consituency
const getVoterConsituencyCandidates = async (
  address,
  voterId,
  consituencyId
) => {
  try {
    const candidateList = await getConsituencyCandidates(
      address,
      voterId,
      consituencyId
    );

    let result = {
      consituencyId: consituencyId,
      candidateList: candidateList
    };
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const castVote = async (address, account, voteIndex, consituencyIndex, candidateIndex) => {
  console.log(voteIndex, consituencyIndex, candidateIndex);
  console.log(account);
  try {
    const contractObject = getContractObject(address);
    const isVoted = await contractObject.methods
      .castVote(voteIndex, consituencyIndex, candidateIndex)
      .send({ from: account });
    return isVoted;
  } catch (error) {
    let err = error
    if (err.message.includes("revert")) {
      err = new Error(error.message.split("revert")[1].trim())
    }
    throw err;
  }
};

const getCandidateVotes = async (address, account, consituencyId, candidates) => {
  try {
    const contractObject = getContractObject(address);
    const candidateVotes = []
    for (let i = 0; i < candidates.length; i++) {
      candidateVotes.push(contractObject.methods.getVotes(consituencyId, candidates[i].candidateKey).call({ from: account }))
    }
    let result = await Promise.all(candidateVotes);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const closeElection = async (address, account) => {
  let response = {};
  try {
    // const accounts = await web3.eth.getAccounts();
    const contractObject = getContractObject(address);
    const receipt = await contractObject.methods
      .closeElection()
      .send({ from: account, gas: 1000000 });
    // console.info(receipt);
    console.info("Election closed successfully!");
    response["status"] = true;
    response["message"] = "Election closed successfully!";
    response["transactionHash"] = receipt.transactionHash;
    return response;
  } catch (error) {
    console.error("ERROR: ", error.message);
    response["status"] = false;
    response["message"] = error.message.split("revert")[1];
    return response;
  }
};

const electionData = async address => {
  try {
    const accounts = await web3.eth.getAccounts();

    const consituencyList = await getConsituencyList(address);

    const consituencyIdList = consituencyList.map(consituency =>
      parseInt(consituency.consituencyId)
    );

    const consituencyCandidateList = await Promise.all(
      consituencyIdList.map(async consituencyId => ({
        consituencyId: consituencyId,
        candidateList: await getConsituencyCandidates(
          address,
          accounts[0],
          consituencyId
        )
      }))
    );
    // console.log(consituencyCandidateList);
    let electionData = await Promise.all(
      consituencyCandidateList.map(
        async ({ consituencyId, candidateList }) =>
          await Promise.all(
            candidateList.map(async candidateId => {
              const candidate = await getCandidate(address, candidateId);
              const consituency = await getConsituency(address, consituencyId);
              return {
                consituencyId: consituencyId,
                consituencyName: consituency.name,
                candidateId: candidateId,
                candidateName: candidate.name,
                candidateParty: candidate.party,
                votes: await getCandidateVotes(
                  address,
                  consituencyId,
                  candidateId
                )
              };
            })
          )
      )
    );

    // merge the nested arrays in one using reduce and concat
    electionData = [].concat(...electionData);
    //  console.log("Votes---> ", votes);
    return electionData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const electionResult = async address => {
  try {
    // get all the election data, candidate vote count
    const electionDataArr = await electionData(address);
    // get all the consituency list names
    const consituencyList = [
      ...new Set(electionDataArr.map(obj => obj.consituencyId))
    ];
    //console.log(consituencyList);

    // Initiate the partyCount with object (party, seat count, index)
    let partyCount = [
      ...new Set(electionDataArr.map(obj => obj.candidateParty))
    ].map((party, index) => ({
      party: party,
      count: 0,
      index: index
    }));
    //console.log(partyCount);

    // who won the consituency
    consituencyList.forEach(consituencyId => {
      // filter the candidates as per the consituency
      const data = electionDataArr.filter(
        obj => obj.consituencyId == consituencyId
      );

      let maxVotes = 0;
      let party = [];

      data.forEach(obj => {
        if (maxVotes <= obj.votes && obj.votes > 0) {
          maxVotes = obj.votes;
          party.push(obj.candidateParty);
        }
      });
      // console.log("win party", maxVotes, party);
      if (party.length == 1) {
        partyCount.forEach(obj => {
          if (obj.party === party[0]) {
            obj.count++;
          }
        });
      }
    });
    //console.log("PAr", partyCount);
    let winningParty = [];
    let winningSeats = partyCount
      .map(party => party.count)
      .reduce((a, b) => {
        // console.log("a,b", a, b);
        return Math.max(a, b);
      });
    console.log("wseats", winningSeats);

    partyCount.forEach(obj => {
      if (winningSeats <= obj.count) {
        winningSeats = obj.count;
        winningParty.push(obj.party);
      }
    });
    //console.log(winningParty, winningSeats, "----><");
    return [partyCount, winningParty, winningSeats];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  getAccounts,
  createElection,
  getAllElection,
  updateElection,
  getElectionAddress,
  getElectionAdmin,
  getElectionName,
  addConsituency,
  getAllConsituency,
  getConsituency,
  updateConsituency,
  disableConsituency,
  addVoter,
  getVoterList,
  getVoter,
  getVoterById,
  updateVoter,
  disableVoter,
  addCandidate,
  getCandidateList,
  getCandidate,
  updateCandidate,
  disableCandidate,
  getConsituencyCandidates,
  getVoterConsituencyCandidates,
  castVote,
  getCandidateVotes,
  closeElection,
  electionResult,
  electionData
};
