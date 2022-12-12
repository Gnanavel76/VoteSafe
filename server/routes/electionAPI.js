const express = require("express");
const router = express.Router();
const { getAccounts, createElection, getAllElection, updateElection, addConsituency, getAllConsituency, updateConsituency, disableConsituency, addVoter, getVoterList, getVoter, updateVoter, disableVoter, addCandidate, getCandidateList, getCandidate, disableCandidate, updateCandidate, getVoterById, getConsituencyCandidates, castVote, getConsituency, getCandidateVotes } = require("../contractMethods");
const { isAuthenticated } = require("../middlewares/auth");
const { handleFormData } = require("../middlewares/file");
const { uploadFileToCloudinary, isFaceMatching } = require("../util");
const fs = require("fs")
const path = require("path")
const download = require('image-downloader');
const { getAllAccount } = require("../web3");

// get available accounts
router.get("/accounts", isAuthenticated, async (req, res, next) => {
  try {
    const result = await getAccounts();
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// create a new election
router.post("/newElection", isAuthenticated, async (req, res) => {
  try {
    const { user } = req
    const { name, startsOn, endsOn } = req.body
    const receipt = await createElection(user.publicAddress, name, startsOn, endsOn)
    // { "transactionHash": "0xf3729ab6d07b7f25ec7a90378753382f0c3d50f74f63845f2af78bf8bd73c928", "transactionIndex": 0, "blockHash": "0x80647352475425907fd306732b85005a3cb222fa361bd8749cd7337b3c2e03ec", "blockNumber": 11, "from": "0xd5909c7e39133c698deb7462f5c52472bb502bfc", "to": "0x80b2c3ba6fea66d8dcaa1d137a81524a5b3d37d5", "gasUsed": 2328574, "cumulativeGasUsed": 2328574, "contractAddress": null, "status": true, "logsBloom": "0x00000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000800000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000", "events": { "ElectionEvent": { "logIndex": 0, "transactionIndex": 0, "transactionHash": "0xf3729ab6d07b7f25ec7a90378753382f0c3d50f74f63845f2af78bf8bd73c928", "blockHash": "0x80647352475425907fd306732b85005a3cb222fa361bd8749cd7337b3c2e03ec", "blockNumber": 11, "address": "0x80B2C3ba6fEa66d8dcaA1D137A81524A5b3d37D5", "type": "mined", "id": "log_36fccb07", "returnValues": { "0": "0xD5909c7E39133C698deB7462f5C52472bb502bfC", "1": "0xC82BD98da1142eF7c8C0D88626A26DAf7D4E0ac6", "_admin": "0xD5909c7E39133C698deB7462f5C52472bb502bfC", "_electionAddress": "0xC82BD98da1142eF7c8C0D88626A26DAf7D4E0ac6" }, "event": "ElectionEvent", "signature": "0x4110e6dce22529242be460d4955dc89edd46097295e097137bd6d9ea5715cbe3", "raw": { "data": "0x000000000000000000000000d5909c7e39133c698deb7462f5c52472bb502bfc000000000000000000000000c82bd98da1142ef7c8c0d88626a26daf7d4e0ac6", "topics": ["0x4110e6dce22529242be460d4955dc89edd46097295e097137bd6d9ea5715cbe3"] } } } }
    res.status(200).send(receipt);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

// get all conducted election list
router.get("/getAllElection", isAuthenticated, async (req, res) => {
  try {
    const { user } = req
    const elections = await getAllElection(user.publicAddress)
    res.status(200).send(elections);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

router.put("/updateElection", isAuthenticated, async (req, res) => {
  try {
    const { user } = req
    console.log(user);
    const { electionAddress, name, startsOn, endsOn } = req.body
    await updateElection(user.publicAddress, electionAddress, name, startsOn, endsOn)
    res.status(200).send("Election updated successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

// get a conducted election on index
router.get("/getElections/:index", async function (req, res, next) {
  try {
    const result = await logic.getElectionAddress(parseInt(req.params.index));
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

// get admin of conducted election at address
router.get("/getElectionAdmin/:address", async function (req, res, next) {
  try {
    const result = await logic.getElectionAdmin(req.params.address);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

// get election name of conducted eletion
router.get("/getElectionName/:address", async function (req, res, next) {
  try {
    const result = await logic.getElectionName(req.params.address);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

// add Consituency to Consituency list
router.post("/addConsituency/:address", isAuthenticated, async function (req, res, next) {
  try {
    const address = req.params.address;
    const { user } = req
    const { consituencyId, consituencyName } = req.body;
    const result = await addConsituency(
      user.publicAddress,
      address,
      consituencyId,
      consituencyName
    );
    res.status(200).send(result);
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

// get consituency list from Consituency list
router.get("/getAllConsituency/:address", isAuthenticated, async function (req, res, next) {
  try {
    const { user } = req
    const { address } = req.params
    const result = await getAllConsituency(user.publicAddress, address);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

// get consituency data from Consituency list
router.get("/getConsituency/:address", async function (req, res, next) {
  try {
    const result = await logic.getConsituency(
      req.params.address,
      req.query.consituencyId
    );
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

// get consituency data from Consituency list
router.put("/updateConsituency/:address", isAuthenticated, async function (req, res, next) {
  try {
    const address = req.params.address;
    const { user } = req
    const { consituencyKey, consituencyId, consituencyName } = req.body;
    const result = await updateConsituency(
      user.publicAddress,
      address,
      consituencyKey,
      consituencyId,
      consituencyName
    );
    res.status(200).send(result);
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

// get consituency data from Consituency list
router.delete("/disableConsituency/:address", isAuthenticated, async function (req, res, next) {
  try {
    const address = req.params.address;
    const { user } = req
    const { consituencyKey } = req.body;
    const status = await disableConsituency(
      user.publicAddress,
      address,
      consituencyKey
    );
    res.status(200).send(status);
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

// add voter to voter list
router.post("/addVoter/:address", isAuthenticated, handleFormData, async function (req, res, next) {
  try {
    const address = req.params.address;
    const { user } = req
    const {
      voterId,
      voterImage,
      name,
      dob,
      phoneNo,
      voterAddress,
      consituencyKey,
      voterETHaccount,
    } = req.body;
    const uploadedVoterImage = await uploadFileToCloudinary(voterImage.filepath, { folder: "VoteSafe", use_filename: true })
    if (!uploadedVoterImage.status) {
      throw new Error("Unable to upload voter image. Try agian!")
    }
    const receipt = await addVoter(
      user.publicAddress,
      address,
      voterId,
      uploadedVoterImage.url,
      name,
      dob,
      phoneNo,
      voterAddress,
      consituencyKey,
      voterETHaccount
    );
    res.status(200).json({
      status: true,
      message: 'Voter successfully added in the consituency!',
      transactionHash: receipt.transactionHash
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

// get voter list from Voter List
router.get("/getVoterList/:address", isAuthenticated, async function (req, res, next) {
  try {
    const { user } = req
    const { address } = req.params
    const result = await getVoterList(user.publicAddress, address);
    res.send(result);
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

// get voter data from voter list
router.get("/:address/getVoter/:voterId", isAuthenticated, async function (req, res, next) {
  try {
    const { user } = req
    const { address, voterId } = req.params
    const result = await getVoter(user.publicAddress, address, voterId);
    res.status(200).json({
      status: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

router.get("/:address/getVoterById/:voterId", async function (req, res, next) {
  try {
    const { address, voterId } = req.params
    const account = await getAllAccount()[0]
    const result = await getVoterById(account, address, voterId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});


router.put("/:address/updateVoter/:voterIndex", isAuthenticated, handleFormData, async function (req, res, next) {
  try {
    const { address, voterIndex } = req.params
    const { user } = req
    let {
      voterId,
      voterImage,
      name,
      dob,
      phoneNo,
      voterAddress,
      consituencyKey,
      voterETHaccount,
    } = req.body;
    if (voterImage && typeof voterImage !== 'string') {
      const uploadedVoterImage = await uploadFileToCloudinary(voterImage.filepath, { folder: "VoteSafe", use_filename: true })
      if (!uploadedVoterImage.status) {
        throw new Error("Unable to upload voter image. Try agian!")
      }
      voterImage = uploadedVoterImage.url;
    } else {
      const voterDetails = await getVoter(user.publicAddress, address, voterIndex)
      voterImage = voterDetails.voterImage;
    }
    const result = await updateVoter(
      user.publicAddress,
      address,
      voterIndex,
      { voterId, voterImage, name, dob, phoneNo, voterAddress, consituencyKey, voterETHaccount }
    );
    res.status(200).json({
      status: true,
      message: 'Voter successfully udpated!',
      transactionHash: result.transactionHash
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

router.delete("/disableVoter/:address", isAuthenticated, async function (req, res, next) {
  try {
    const address = req.params.address;
    const { user } = req
    const { voterIndex } = req.body;
    await disableVoter(
      user.publicAddress,
      address,
      voterIndex
    );
    res.status(200).json({
      status: true,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

// add candidate to election candidate list
router.post("/addCandidate/:address", isAuthenticated, handleFormData, async function (req, res, next) {
  try {
    const address = req.params.address;
    const { user } = req
    const {
      candidateId,
      voterId,
      consituencyKey,
      party,
      partyImage
    } = req.body;
    const uploadedImage = await uploadFileToCloudinary(partyImage.filepath, { folder: "VoteSafe", use_filename: true })
    if (!uploadedImage.status) {
      throw new Error("Unable to upload party image. Try agian!")
    }
    const result = await addCandidate(
      user.publicAddress,
      address,
      candidateId,
      voterId[0],
      voterId.slice(1),
      consituencyKey,
      party,
      uploadedImage.url
    );
    res.status(200).json({
      status: true,
      message: 'Candidate successfully added in the consituency!',
      transactionHash: result.transactionHash
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

// get candidate list from candidate List
router.get("/getCandidateList/:address", isAuthenticated, async function (req, res, next) {
  try {
    const { user } = req
    const { address } = req.params
    const result = await getCandidateList(user.publicAddress, address);
    res.status(200).json({
      status: true,
      data: result,
      transactionHash: result.transactionHash
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
})

// get candidate data from candidate list
router.get("/:address/getCandidate/:candidateId", isAuthenticated, async function (req, res, next) {
  try {
    const { user } = req
    const { address, candidateId } = req.params
    const data = await getCandidate(
      user.publicAddress, address, candidateId
    );
    res.status(200).json({
      status: true,
      data
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

router.put("/:address/updateCandidate/:candidateIndex", isAuthenticated, handleFormData, async function (req, res, next) {
  try {
    const { address, candidateIndex } = req.params
    const { user } = req
    let {
      candidateId,
      consituencyKey,
      party,
      partyImage,
    } = req.body;
    if (partyImage && typeof partyImage !== 'string') {
      const uploadedVoterImage = await uploadFileToCloudinary(partyImage.filepath, { folder: "VoteSafe", use_filename: true })
      if (!uploadedVoterImage.status) {
        throw new Error("Unable to upload party image. Try agian!")
      }
      partyImage = uploadedVoterImage.url;
    } else {
      const candidateDetails = await getCandidate(user.publicAddress, address, candidateIndex)
      partyImage = candidateDetails.partyImage;
    }
    const result = await updateCandidate(
      user.publicAddress,
      address,
      candidateIndex,
      candidateId,
      consituencyKey,
      party,
      partyImage
    );
    res.status(200).json({
      status: true,
      message: 'Candidate successfully udpated!',
      transactionHash: result.transactionHash
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

router.delete("/disableCandidate/:address", isAuthenticated, async function (req, res, next) {
  try {
    const address = req.params.address;
    const { user } = req
    const { candidateKey } = req.body;
    await disableCandidate(
      user.publicAddress,
      address,
      candidateKey
    );
    res.status(200).json({
      status: true,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

router.post("/detectFace/:address", handleFormData, async function (req, res, next) {
  try {
    const address = req.params.address;
    const {
      face,
      voterIndex,
      voterId,
      voterImage,
      voterETHAccount,
      consituencyKey
    } = req.body;
    const capturedVoterImage = path.join(__dirname, `../temp/${voterId}_capturedVoterImage.png`)
    const knownVoterImage = path.join(__dirname, `../temp/${voterId}_knownVoterImage.jpg`)
    const rawData = fs.readFileSync(face.filepath)
    fs.writeFileSync(capturedVoterImage, rawData)
    await download.image({
      url: voterImage,
      dest: knownVoterImage,               // will be saved to /path/to/dest/image.jpg
    })
    let result = await isFaceMatching(capturedVoterImage, knownVoterImage)
    if (typeof result === "string") {
      result = result.trim()
    } else {
      throw new Error("Could not detect face. Try again!")
    }
    console.log(result === "[False]");
    console.log(result);
    console.log(typeof result);
    if (result === "[False]") {
      throw new Error("Could not detect face")
    }
    const candidates = await getConsituencyCandidates(address, voterETHAccount, consituencyKey)
    res.status(200).json({
      status: true,
      candidates
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

// get candidate list enrolled in a voter's consituency
router.get("/getVoterConsituencyCandidates/:address", async function (
  req,
  res,
  next
) {
  try {
    const result = await logic.getVoterConsituencyCandidates(
      req.params.address,
      req.query.voterId,
      req.query.consituencyId
    );
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

// cast the vote to candidate of respective consituency
router.post("/castVote/:address", async function (req, res, next) {
  try {
    const address = req.params.address;
    const {
      voterETHAccount,
      voterIndex,
      consituencyId,
      candidateId
    } = req.body;
    const consituency = await getConsituency(voterETHAccount, address, consituencyId)
    const candidate = await getCandidate(voterETHAccount, address, candidateId)
    console.log(consituency, "sadasdas");
    console.log(candidate, "asdsad");
    const result = await castVote(
      address,
      voterETHAccount,
      voterIndex,
      consituency.consituencyId,
      candidate.candidateId
    );
    res.status(200).json({
      status: true,
      isVoted: true
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

// get voting count of a candidate of a respective consituency
router.post("/getCandidateVotes/:address", isAuthenticated, async function (req, res, next) {
  try {
    const { address } = req.params
    const { user } = req
    const { consituencyKey } = req.body

    const consituency = await getConsituency(user.publicAddress, address, consituencyKey)
    const candidates = await getConsituencyCandidates(address, user.publicAddress, consituency.consituencyId);
    const votes = await getCandidateVotes(address, user.publicAddress, consituencyKey, candidates)
    let response = []
    for (let index = 0; index < candidates.length; index++) {
      response.push({ ...candidates[index], votes: votes[index] })
    }
    res.status(200).json({
      status: true,
      votes: response
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      error: error.message
    });
  }
});

// close the Election
router.post("/closeElection/:address", async (req, res, next) => {
  try {
    const result = await logic.closeElection(
      req.params.address,
      req.body.account
    );
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

// get the winner of the election
router.get("/electionResult/:address", async (req, res, next) => {
  try {
    const result = await logic.electionResult(req.params.address);
    console.log("election winner api result", result);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

// get the winner of the election
router.get("/electionData/:address", async (req, res, next) => {
  try {
    const result = await logic.electionData(req.params.address);
    console.log("election winner api result", result);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

module.exports = router;
