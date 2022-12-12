pragma solidity ^0.4.25;

contract ElectionFactory {
    address[] public electionConducted;

    event ElectionEvent(address _admin, address _electionAddress);

    function createElection(
        string memory _electionName,
        uint256 _electionStartsOn,
        uint256 _electionEndsOn
    ) public {
        address newElection = new Election(
            _electionName,
            _electionStartsOn,
            _electionEndsOn,
            msg.sender
        );
        electionConducted.push(newElection);
        emit ElectionEvent(msg.sender, newElection);
    }

    function getElections()
        public
        view
        returns (address[] memory _conductedElection)
    {
        return electionConducted;
    }
}

contract Election {
    address public admin;
    string public electionName;
    uint256 electionStartsOn;
    uint256 electionEndsOn;
    bool electionStatus;
    uint256 createdAt;

    struct Voter {
        uint256 aadharNo;
        string name;
        uint256 dob;
        string phoneNo;
        uint256 consituencyKey;
        address account;
        bool voted;
    }

    struct Candidate {
        uint256 candidateId;
        string name;
        string phoneNo;
        uint256 consituencyKey;
        string party;
        string partyImage;
    }

    struct Consituency {
        uint256 consituencyId;
        string name;
        address[] voters;
        uint256[] candidates;
        bool status;
        mapping(uint256 => uint256) votes;
        address winner;
    }

    address[] public votersList;
    mapping(uint256 => bool) public voterExist;
    mapping(address => bool) public voterAccountExist;
    mapping(address => Voter) public voterData;

    uint256 public candidateCount = 0;
    mapping(uint256 => bool) public candidateExist;
    mapping(uint256 => Candidate) public candidateData;

    uint256 public consituencyCount = 0;
    mapping(uint256 => bool) public consituencyExist;
    mapping(uint256 => Consituency) public consituencyData;

    modifier onlyAdmin() {
        require(admin == msg.sender, "Only admin can execute this function!");
        _;
    }

    modifier isElectionActive() {
        require(electionStatus, "Election is close");
        require(
            (now > electionStartsOn) && (now < electionEndsOn),
            "Election is close"
        );
        _;
    }

    constructor(
        string memory _electionName,
        uint256 _electionStartsOn,
        uint256 _electionEndsOn,
        address _admin
    ) public {
        admin = _admin;
        electionName = _electionName;
        electionStatus = true;
        electionStartsOn = _electionStartsOn;
        electionEndsOn = _electionEndsOn;
        createdAt = now;
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
        return (electionName, electionStatus, electionStartsOn, electionEndsOn);
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
        isElectionActive
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
    ) public onlyAdmin isElectionActive {
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
        consituencyData[consituencyCount].name = _name;
    }

    function disableConsituency(uint256 _consituencyIndex)
        public
        onlyAdmin
        isElectionActive
        returns (bool)
    {
        consituencyData[_consituencyIndex].status = !consituencyData[
            _consituencyIndex
        ].status;
        return consituencyData[_consituencyIndex].status;
    }

    function addCandidate(
        uint256 _candidateId,
        uint256 _aadharNo,
        string memory _name,
        string memory _phoneNo,
        uint256 _dob,
        uint256 _consituencyKey,
        string memory _party,
        string memory _partyImage,
        address _account
    ) public onlyAdmin isElectionActive {
        require(!candidateExist[_candidateId], "Candidate already exist!");
        candidateExist[_candidateId] = true;
        candidateData[candidateCount].candidateId = _candidateId;
        candidateData[candidateCount].name = _name;
        candidateData[candidateCount].phoneNo = _phoneNo;
        candidateData[candidateCount].consituencyKey = _consituencyKey;
        candidateData[candidateCount].party = _party;
        candidateData[candidateCount].partyImage = _partyImage;
        candidateCount++;

        addVoter(_aadharNo, _name, _phoneNo, _consituencyKey, _dob, _account);
        // add candidate to its consituency
        consituencyData[_consituencyKey].candidates.push(_candidateId);
    }

    function getCandidatesCount() public view returns (uint256) {
        return candidateCount;
    }

    function updateCandidate(
        uint256 _candidateIndex,
        uint256 _candidateId,
        uint256 _aadharNo,
        string memory _name,
        string memory _phoneNo,
        uint256 _dob,
        uint256 _consituencyKey,
        string memory _party,
        string memory _partyImage,
        address _account
    ) public onlyAdmin isElectionActive {
        uint256 oldCandidateId = candidateData[_candidateIndex].candidateId;
        if (oldCandidateId != _candidateId) {
            require(!candidateExist[_candidateId], "Candidate already exist!");
            candidateExist[_candidateId] = true;
            candidateData[_candidateIndex].candidateId = _candidateId;
            delete candidateExist[oldCandidateId];
        }
        candidateData[_candidateIndex].name = _name;
        candidateData[_candidateIndex].phoneNo = _phoneNo;
        candidateData[_candidateIndex].consituencyKey = _consituencyKey;
        candidateData[_candidateIndex].party = _party;
        candidateData[_candidateIndex].partyImage = _partyImage;
        updateVoter(
            _aadharNo,
            _name,
            _phoneNo,
            _consituencyKey,
            _dob,
            _account
        );
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
        uint256 _aadharNo,
        string memory _name,
        string memory _phoneNo,
        uint256 _consituencyKey,
        uint256 _dob,
        address _account
    ) public onlyAdmin isElectionActive {
        // It will check if voter is registered or not
        require(!voterExist[_aadharNo], "Voter already exist!");
        require(
            !voterAccountExist[_account],
            "Account is already associated with some other voter"
        );
        require(consituencyExist[_consituencyKey], "Invalid Consituency");
        votersList.push(_account);
        voterExist[_aadharNo] = true;
        voterAccountExist[_account] = true;
        voterData[_account].aadharNo = _aadharNo;
        voterData[_account].name = _name;
        voterData[_account].phoneNo = _phoneNo;
        voterData[_account].consituencyKey = _consituencyKey;
        voterData[_account].dob = _dob;
        voterData[_account].account = _account;
        voterData[_account].voted = false;

        // add voter to its consituency
        consituencyData[_consituencyKey].voters.push(_account);
    }

    function getVotersIdList() public view returns (address[] memory) {
        return votersList;
    }

    function updateVoter(
        uint256 _aadharNo,
        string memory _name,
        string memory _phoneNo,
        uint256 _consituencyKey,
        uint256 _dob,
        address _account
    ) public onlyAdmin isElectionActive {
        uint256 oldAadharNo = voterData[_account].aadharNo;
        if (oldAadharNo != _aadharNo) {
            require(!voterExist[_aadharNo], "Voter already exist!");
            voterExist[_aadharNo] = true;
            voterData[_account].aadharNo = _aadharNo;
            delete voterExist[oldAadharNo];
        }
        voterData[_account].name = _name;
        voterData[_account].phoneNo = _phoneNo;
        voterData[_account].consituencyKey = _consituencyKey;
        voterData[_account].dob = _dob;
        voterData[_account].voted = false;
    }

    // get voters list enrolled in a consituency
    function getConsituencyVoters(uint256 _consituencyKey)
        public
        view
        returns (address[] memory)
    {
        return consituencyData[_consituencyKey].voters;
    }

    // get consituency of a voter
    function getVoterConsituency(address _voterKey)
        public
        view
        returns (uint256)
    {
        return voterData[_voterKey].consituencyKey;
    }

    function castVote(uint256 _candidateId)
        public
        isElectionActive
        returns (bool status)
    {
        // check if voter has voted or not
        require(voterAccountExist[msg.sender], "Invalid voter");
        require(!voterData[msg.sender].voted, "Voter already casted his vote");
        // check if candidate is of respective consituency
        if (
            candidateData[_candidateId].consituencyKey ==
            voterData[msg.sender].consituencyKey
        ) {
            consituencyData[voterData[msg.sender].consituencyKey].votes[
                _candidateId
            ] += 1;
            voterData[msg.sender].voted = true;
            return true;
        } else {
            return false;
        }
    }

    function getVotes(uint256 _consituencyId, uint256 _candidateId)
        public
        view
        returns (uint256)
    {
        return consituencyData[_consituencyId].votes[_candidateId];
    }

    function closeElection() public onlyAdmin {
        require(now > electionEndsOn, "Election is not completed");
        require(electionStatus, "Election is not active");
        electionStatus = false;
    }
}
