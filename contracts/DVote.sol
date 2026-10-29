// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DVote
 * @dev Decentralized Voting Application Smart Contract for GDG Web3
 * Allows anyone to create proposals with a duration/deadline, and allows
 * users to cast a single YES or NO vote per proposal before the deadline.
 */
contract DVote {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        address creator;
        bool exists;
    }


    // Incremental proposal ID counter
    uint256 public proposalCount;

    // proposalId => Proposal
    mapping(uint256 => Proposal) public proposals;

    // proposalId => (voter => hasVoted)
    mapping(uint256 => mapping(address => bool)) private _hasVoted;

    // proposalId => (voter => choice) (true = YES, false = NO)
    mapping(uint256 => mapping(address => bool)) private _voterChoice;

    // Events
    event ProposalCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string description,
        uint256 deadline
    );

    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool choice,
        uint256 yesVotes,
        uint256 noVotes
    );

    /**
     * @dev Creates a new proposal.
     * @param _title Title of the proposal (cannot be empty).
     * @param _description Description/details of the proposal.
     * @param _durationInSeconds Voting duration in seconds from current block timestamp (must be > 0).
     * @return proposalId The ID of the newly created proposal.
     */
    function createProposal(
        string calldata _title,
        string calldata _description,
        uint256 _durationInSeconds
    ) external returns (uint256 proposalId) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_durationInSeconds > 0, "Duration must be greater than 0");

        proposalCount++;
        proposalId = proposalCount;

        uint256 deadline = block.timestamp + _durationInSeconds;

        proposals[proposalId] = Proposal({
            id: proposalId,
            title: _title,
            description: _description,
            deadline: deadline,
            yesVotes: 0,
            noVotes: 0,
            creator: msg.sender,
            exists: true
        });

        emit ProposalCreated(proposalId, msg.sender, _title, _description, deadline);
    }

    /**
     * @dev Casts a vote (YES = true, NO = false) on an active proposal.
     * Each address may only vote once per proposal.
     * @param _proposalId The ID of the proposal.
     * @param _choice True for YES, False for NO.
     */
    function vote(uint256 _proposalId, bool _choice) external {
        require(_proposalId > 0 && _proposalId <= proposalCount && proposals[_proposalId].exists, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp < proposal.deadline, "Voting deadline has passed");
        require(!_hasVoted[_proposalId][msg.sender], "Address has already voted on this proposal");

        _hasVoted[_proposalId][msg.sender] = true;
        _voterChoice[_proposalId][msg.sender] = _choice;

        if (_choice) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }

        emit Voted(_proposalId, msg.sender, _choice, proposal.yesVotes, proposal.noVotes);
    }

    /**
     * @dev Checks if an address has voted on a given proposal.
     * @param _proposalId The ID of the proposal.
     * @param _voter The address to check.
     */
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        require(_proposalId > 0 && _proposalId <= proposalCount && proposals[_proposalId].exists, "Invalid proposal ID");
        return _hasVoted[_proposalId][_voter];
    }

    /**
     * @dev Gets the vote details of a voter for a given proposal.
     * @param _proposalId The ID of the proposal.
     * @param _voter The address of the voter.
     * @return voted Whether the voter has voted.
     * @return choice The vote choice if voted (true = YES, false = NO).
     */
    function getVote(uint256 _proposalId, address _voter) external view returns (bool voted, bool choice) {
        require(_proposalId > 0 && _proposalId <= proposalCount && proposals[_proposalId].exists, "Invalid proposal ID");
        return (_hasVoted[_proposalId][_voter], _voterChoice[_proposalId][_voter]);
    }

    /**
     * @dev Returns all proposals created so far.
     */
    function getAllProposals() external view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalCount);
        for (uint256 i = 1; i <= proposalCount; i++) {
            allProposals[i - 1] = proposals[i];
        }
        return allProposals;
    }

    /**
     * @dev Helper view to check if a proposal is active.
     */
    function isProposalActive(uint256 _proposalId) external view returns (bool) {
        require(_proposalId > 0 && _proposalId <= proposalCount && proposals[_proposalId].exists, "Invalid proposal ID");
        return block.timestamp < proposals[_proposalId].deadline;
    }
}

