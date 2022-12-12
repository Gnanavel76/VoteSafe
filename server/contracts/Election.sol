// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ElectionFactory {
    Election[] public electionConducted;

    function createElection(
        string memory _electionName,
        uint256 _electionStartsOn,
        uint256 _electionEndsOn
    ) public {
        Election newElection = new Election(
            _electionName,
            _electionStartsOn,
            _electionEndsOn,
            msg.sender
        );
        electionConducted.push(newElection);
    }

    function getElections()
        public
        view
        returns (Election[] memory _conductedElection)
    {
        return electionConducted;
    }
}

contract Election {
    address public admin;
    string public electionName;
    uint256 electionStartsOn;
    uint256 electionEndsOn;
    bool isElectionClosed;
    uint256 createdAt;

    struct Voter {
        string voterId;
        string voterImage;
        string name;
        uint256 dob;
        string phoneNo;
        string voterAddress;
        uint256 consituencyKey;
        address voterETHaccount;
        bool status;
        bool voted;
    }

    struct Candidate {
        uint256 candidateId;
        uint256 voterKey;
        string voterId;
        uint256 consituencyKey;
        string party;
        string partyImage;
        bool status;
    }

    struct Consituency {
        uint256 consituencyId;
        string name;
        bool status;
        string[] voters;
        uint256[] candidates;
        mapping(uint256 => uint256) votes;
        address winner;
    }

    uint256 public votersCount = 0;
    mapping(string => bool) public voterExist;
    mapping(address => bool) public voterAccountExist;
    mapping(uint256 => Voter) public voterData;

    uint256 public candidateCount = 0;
    mapping(string => bool) public candidateExist;
    mapping(uint256 => bool) public candidateIdExist;
    mapping(uint256 => Candidate) public candidateData;

    uint256 public consituencyCount = 0;
    mapping(uint256 => bool) public consituencyExist;
    mapping(uint256 => Consituency) public consituencyData;

    modifier onlyAdmin() {
        require(admin == msg.sender, "Only admin can execute this function!");
        _;
    }

    modifier isElectionActive() {
        require(!isElectionClosed, "Election is completed");
        require(
            block.timestamp > electionStartsOn,
            "Election has not commenced"
        );
        require(block.timestamp < electionEndsOn, "Election has completed");
        _;
    }

    modifier electionStatus() {
        require(!isElectionClosed, "Election is completed");
        require(
            block.timestamp < electionStartsOn,
            "Election has already commenced"
        );
        _;
    }

    constructor(
        string memory _electionName,
        uint256 _electionStartsOn,
        uint256 _electionEndsOn,
        address _admin
    ) {
        admin = _admin;
        electionName = _electionName;
        isElectionClosed = false;
        electionStartsOn = _electionStartsOn;
        electionEndsOn = _electionEndsOn;
        createdAt = block.timestamp;
    }

    function getElectionDetails()
        public
        view
        returns (
            string memory,
            bool,
            uint256,
            uint256
        )
    {
        return (
            electionName,
            isElectionClosed,
            electionStartsOn,
            electionEndsOn
        );
    }

    function updateElectionDetails(
        string memory _electionName,
        uint256 _electionStartsOn,
        uint256 _electionEndsOn
    ) public onlyAdmin {
        electionName = _electionName;
        electionStartsOn = _electionStartsOn;
        electionEndsOn = _electionEndsOn;
    }

    function addConsituency(uint256 _consituencyId, string memory _name)
        public
        onlyAdmin
        electionStatus
    {
        require(!consituencyExist[_consituencyId], "Consituency already exist");
        consituencyExist[_consituencyId] = true;
        consituencyData[consituencyCount].consituencyId = _consituencyId;
        consituencyData[consituencyCount].name = _name;
        consituencyData[consituencyCount].status = true;
        consituencyCount++;
    }

    function getConsituencyCount() public view returns (uint256) {
        return consituencyCount;
    }

    function updateConsituency(
        uint256 _consituencyIndex,
        uint256 _consituencyId,
        string memory _name
    ) public onlyAdmin electionStatus {
        uint256 oldConsituencyId = consituencyData[_consituencyIndex]
            .consituencyId;
        if (oldConsituencyId != _consituencyId) {
            require(
                !consituencyExist[_consituencyId],
                "Consituency id already exist"
            );
            consituencyExist[_consituencyId] = true;
            consituencyData[_consituencyIndex].consituencyId = _consituencyId;
            delete consituencyExist[oldConsituencyId];
        }
        consituencyData[_consituencyIndex].name = _name;
    }

    function disableConsituency(uint256 _consituencyId)
        public
        onlyAdmin
        electionStatus
        returns (bool)
    {
        consituencyData[_consituencyId].status = !consituencyData[
            _consituencyId
        ].status;
        return consituencyData[_consituencyId].status;
    }

    function addCandidate(
        uint256 _candidateId,
        uint256 _voterKey,
        string memory _voterId,
        uint256 _consituencyKey,
        string memory _party,
        string memory _partyImage
    ) public onlyAdmin electionStatus {
        require(!candidateIdExist[_candidateId], "Candidate id already exist");
        require(
            !candidateExist[_voterId],
            "Candidate is already enrolled in constituency"
        );
        candidateIdExist[_candidateId] = true;
        candidateExist[_voterId] = true;
        candidateData[candidateCount].candidateId = _candidateId;
        candidateData[candidateCount].voterKey = _voterKey;
        candidateData[candidateCount].voterId = _voterId;
        candidateData[candidateCount].consituencyKey = _consituencyKey;
        candidateData[candidateCount].party = _party;
        candidateData[candidateCount].partyImage = _partyImage;
        candidateData[candidateCount].status = true;
        consituencyData[_consituencyKey].candidates.push(candidateCount);
        candidateCount++;
    }

    function getCandidatesCount() public view returns (uint256) {
        return candidateCount;
    }

    function updateCandidate(
        uint256 _candidateIndex,
        uint256 _candidateId,
        uint256 _consituencyKey,
        string memory _party,
        string memory _partyImage
    ) public onlyAdmin electionStatus {
        uint256 oldCandidateId = candidateData[_candidateIndex].candidateId;
        if (oldCandidateId != _candidateId) {
            require(
                !candidateIdExist[_candidateId],
                "Candidate id already exist"
            );
            candidateIdExist[_candidateId] = true;
            candidateData[_candidateIndex].candidateId = _candidateId;
            delete candidateIdExist[oldCandidateId];
        }
        candidateData[_candidateIndex].consituencyKey = _consituencyKey;
        candidateData[_candidateIndex].party = _party;
        candidateData[_candidateIndex].partyImage = _partyImage;
    }

    function disableCandidate(uint256 _candidateIndex)
        public
        onlyAdmin
        electionStatus
        returns (bool)
    {
        candidateData[_candidateIndex].status = !candidateData[_candidateIndex]
            .status;
        return candidateData[_candidateIndex].status;
    }

    // get candidate list enrolled in a consituency
    function getConsituencyCandidates(uint256 _consituencyKey)
        public
        view
        returns (uint256[] memory)
    {
        return consituencyData[_consituencyKey].candidates;
    }

    // get consituency of a candidate
    function getCandidateConsituency(uint256 _candidateIndex)
        public
        view
        returns (uint256)
    {
        return candidateData[_candidateIndex].consituencyKey;
    }

    function addVoter(
        string memory _voterId,
        string memory _voterImage,
        string memory _name,
        uint256 _dob,
        string memory _phoneNo,
        string memory _voterAddress,
        uint256 _consituencyKey,
        address _voterETHaccount
    ) public onlyAdmin electionStatus {
        // It will check if voter is registered or not
        require(!voterExist[_voterId], "Voter already exist!");
        require(
            !voterAccountExist[_voterETHaccount],
            "ETH account is already associated with some other voter"
        );
        require(consituencyExist[_consituencyKey], "Invalid Consituency");
        voterExist[_voterId] = true;
        voterAccountExist[_voterETHaccount] = true;
        voterData[votersCount].voterId = _voterId;
        voterData[votersCount].voterImage = _voterImage;
        voterData[votersCount].name = _name;
        voterData[votersCount].dob = _dob;
        voterData[votersCount].phoneNo = _phoneNo;
        voterData[votersCount].voterAddress = _voterAddress;
        voterData[votersCount].consituencyKey = _consituencyKey;
        voterData[votersCount].voterETHaccount = _voterETHaccount;
        voterData[votersCount].status = true;
        voterData[votersCount].voted = false;
        votersCount++;
        // add voter to its consituency
        consituencyData[_consituencyKey].voters.push(_voterId);
    }

    function getVotersCount() public view returns (uint256) {
        return votersCount;
    }

    function updateVoter(
        uint256 _voterIndex,
        string memory _voterId,
        string memory _voterImage,
        string memory _name,
        uint256 _dob,
        string memory _phoneNo,
        string memory _voterAddress,
        uint256 _consituencyKey,
        address _voterETHaccount
    ) public onlyAdmin electionStatus {
        string memory oldVoterId = voterData[_voterIndex].voterId;
        if (
            keccak256(abi.encodePacked(oldVoterId)) !=
            keccak256(abi.encodePacked(_voterId))
        ) {
            require(
                !voterExist[_voterId],
                "Voter Id is already associated with some other voter"
            );
            voterExist[_voterId] = true;
            voterData[_voterIndex].voterId = _voterId;
            delete voterExist[oldVoterId];
        }
        address oldVoterETHaccount = voterData[_voterIndex].voterETHaccount;
        if (_voterETHaccount != oldVoterETHaccount) {
            require(
                !voterAccountExist[_voterETHaccount],
                "ETH account is already associated with some other voter"
            );
            voterAccountExist[_voterETHaccount] = true;
            voterData[_voterIndex].voterETHaccount = _voterETHaccount;
            delete voterAccountExist[oldVoterETHaccount];
        }
        voterData[_voterIndex].voterImage = _voterImage;
        voterData[_voterIndex].name = _name;
        voterData[_voterIndex].dob = _dob;
        voterData[_voterIndex].phoneNo = _phoneNo;
        voterData[_voterIndex].voterAddress = _voterAddress;
        voterData[_voterIndex].consituencyKey = _consituencyKey;
    }

    function disableVoter(uint256 _voterIndex)
        public
        onlyAdmin
        electionStatus
        returns (bool)
    {
        voterData[_voterIndex].status = !voterData[_voterIndex].status;
        return voterData[_voterIndex].status;
    }

    // get voters list enrolled in a consituency
    function getConsituencyVoters(uint256 _consituencyKey)
        public
        view
        returns (string[] memory)
    {
        return consituencyData[_consituencyKey].voters;
    }

    // get consituency of a voter
    function getVoterConsituency(uint256 _voterIndex)
        public
        view
        returns (uint256)
    {
        return voterData[_voterIndex].consituencyKey;
    }

    function castVote(
        uint256 _voterIndex,
        uint256 _consituencyIndex,
        uint256 _candidateIndex
    ) public isElectionActive returns (bool status) {
        // check if voter has voted or not
        require(voterAccountExist[msg.sender], "Invalid voter");
        require(!voterData[_voterIndex].voted, "Voter already casted his vote");
        // check if candidate is of respective consituency
        // if (
        //     candidateData[_candidateId].consituencyKey ==
        //     voterData[_voterIndex].consituencyKey
        // ) {
        consituencyData[_consituencyIndex].votes[_candidateIndex] += 1;
        voterData[_voterIndex].voted = true;
        return true;
        // } else {
        //     return false;
        // }
    }

    function getVotes(uint256 _consituencyId, uint256 _candidateId)
        public
        view
        returns (uint256)
    {
        return consituencyData[_consituencyId].votes[_candidateId];
    }

    function closeElection() public onlyAdmin {
        require(!isElectionClosed, "Election is not active");
        isElectionClosed = false;
    }
}
