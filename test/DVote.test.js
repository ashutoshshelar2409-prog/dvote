const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DVote Smart Contract", function () {
  let dVote;
  let owner;
  let voter1;
  let voter2;
  let voter3;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();
    const DVoteFactory = await ethers.getContractFactory("DVote");
    dVote = await DVoteFactory.deploy();
    await dVote.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should start with 0 proposals", async function () {
      expect(await dVote.proposalCount()).to.equal(0);
      const allProposals = await dVote.getAllProposals();
      expect(allProposals.length).to.equal(0);
    });
  });

  describe("Proposal Creation", function () {
    it("should create a proposal successfully and emit ProposalCreated event", async function () {
      const title = "Fund Campus Web3 Hackathon";
      const description = "Allocate $500 for prizes and refreshments";
      const duration = 3600; // 1 hour

      const tx = await dVote.connect(owner).createProposal(title, description, duration);
      await expect(tx)
        .to.emit(dVote, "ProposalCreated")
        .withArgs(1, owner.address, title, description, (val) => val > 0);

      expect(await dVote.proposalCount()).to.equal(1);

      const proposal = await dVote.proposals(1);
      expect(proposal.id).to.equal(1);
      expect(proposal.title).to.equal(title);
      expect(proposal.description).to.equal(description);
      expect(proposal.yesVotes).to.equal(0);
      expect(proposal.noVotes).to.equal(0);
      expect(proposal.creator).to.equal(owner.address);
      expect(proposal.exists).to.be.true;
    });

    it("should reject creation with empty title", async function () {
      await expect(
        dVote.createProposal("", "Valid description", 3600)
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("should reject creation with 0 duration", async function () {
      await expect(
        dVote.createProposal("Valid Title", "Valid description", 0)
      ).to.be.revertedWith("Duration must be greater than 0");
    });

    it("should return all proposals via getAllProposals()", async function () {
      await dVote.createProposal("Proposal 1", "Desc 1", 1000);
      await dVote.createProposal("Proposal 2", "Desc 2", 2000);

      const all = await dVote.getAllProposals();
      expect(all.length).to.equal(2);
      expect(all[0].title).to.equal("Proposal 1");
      expect(all[1].title).to.equal("Proposal 2");
    });
  });

  describe("Voting Functionality", function () {
    beforeEach(async function () {
      await dVote.createProposal("Proposal 1", "Voting test proposal", 3600);
    });

    it("should record a YES vote successfully and emit Voted event", async function () {
      await expect(dVote.connect(voter1).vote(1, true))
        .to.emit(dVote, "Voted")
        .withArgs(1, voter1.address, true, 1, 0);

      const proposal = await dVote.proposals(1);
      expect(proposal.yesVotes).to.equal(1);
      expect(proposal.noVotes).to.equal(0);

      expect(await dVote.hasVoted(1, voter1.address)).to.be.true;
      const receipt = await dVote.getVote(1, voter1.address);
      expect(receipt.voted).to.be.true;
      expect(receipt.choice).to.be.true;
    });

    it("should record a NO vote successfully and update counts", async function () {
      await dVote.connect(voter1).vote(1, false);

      const proposal = await dVote.proposals(1);
      expect(proposal.yesVotes).to.equal(0);
      expect(proposal.noVotes).to.equal(1);

      expect(await dVote.hasVoted(1, voter1.address)).to.be.true;
      const receipt = await dVote.getVote(1, voter1.address);
      expect(receipt.voted).to.be.true;
      expect(receipt.choice).to.be.false;
    });

    it("should allow multiple different voters to vote on the same proposal", async function () {
      await dVote.connect(voter1).vote(1, true);
      await dVote.connect(voter2).vote(1, false);
      await dVote.connect(voter3).vote(1, true);

      const proposal = await dVote.proposals(1);
      expect(proposal.yesVotes).to.equal(2);
      expect(proposal.noVotes).to.equal(1);
    });

    it("should allow the same voter to vote on different proposals independently", async function () {
      await dVote.createProposal("Proposal 2", "Second proposal", 3600);

      await dVote.connect(voter1).vote(1, true);
      await dVote.connect(voter1).vote(2, false);

      expect(await dVote.hasVoted(1, voter1.address)).to.be.true;
      expect(await dVote.hasVoted(2, voter1.address)).to.be.true;
    });

    it("should reject duplicate voting from the same wallet on the same proposal", async function () {
      await dVote.connect(voter1).vote(1, true);

      await expect(
        dVote.connect(voter1).vote(1, true)
      ).to.be.revertedWith("Address has already voted on this proposal");

      await expect(
        dVote.connect(voter1).vote(1, false)
      ).to.be.revertedWith("Address has already voted on this proposal");
    });

    it("should reject votes after the deadline has passed", async function () {
      // Advance time by 3601 seconds (past the 3600s deadline)
      await time.increase(3601);

      await expect(
        dVote.connect(voter1).vote(1, true)
      ).to.be.revertedWith("Voting deadline has passed");
    });

    it("should report active status correctly before and after deadline", async function () {
      expect(await dVote.isProposalActive(1)).to.be.true;

      await time.increase(3601);

      expect(await dVote.isProposalActive(1)).to.be.false;
    });

    it("should reject voting on invalid proposal IDs (0, non-existent)", async function () {
      await expect(
        dVote.connect(voter1).vote(0, true)
      ).to.be.revertedWith("Invalid proposal ID");

      await expect(
        dVote.connect(voter1).vote(999, true)
      ).to.be.revertedWith("Invalid proposal ID");
    });

    it("should reject checking hasVoted on invalid proposal IDs", async function () {
      await expect(
        dVote.hasVoted(0, voter1.address)
      ).to.be.revertedWith("Invalid proposal ID");

      await expect(
        dVote.hasVoted(999, voter1.address)
      ).to.be.revertedWith("Invalid proposal ID");
    });
  });
});

