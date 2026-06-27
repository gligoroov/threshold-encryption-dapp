const { expect } = require("chai");
const { ethers } = require("hardhat"); 

describe("ThresholdCoordinator", function () {
    let coordinator;
    let owner, guardian1, guardian2, nonGuardian;

    beforeEach(async function () {
        // Uzimamo testne naloge iz Remixa
        [owner, guardian1, guardian2, nonGuardian] = await ethers.getSigners();

        // Deployujemo ugovor svež pre svakog testa
        const ThresholdCoordinator = await ethers.getContractFactory("ThresholdCoordinator");
        coordinator = await ThresholdCoordinator.deploy();
        await coordinator.deployed();
    });

    it("1. Trebalo bi da uspesno registruje poruku sa metapodacima", async function () {
        const messageId = ethers.utils.formatBytes32String("poruka1");
        const messageHash = ethers.utils.formatBytes32String("hash_sadrzaja");
        const thresholdM = 2;
        const guardians = [guardian1.address, guardian2.address];

        // Izvršavamo registraciju
        await expect(coordinator.registerMessage(messageId, thresholdM, messageHash, guardians))
            .to.emit(coordinator, "MessageRegistered");

        // Proveravamo upisane podatke
        const msgData = await coordinator.messages(messageId);
        expect(msgData.owner).to.equal(owner.address);
        expect(msgData.thresholdM.toNumber()).to.equal(thresholdM);
    });

    it("2. Ne bi trebalo da dozvoli doprinos od adrese koja nije cuvar", async function () {
        const messageId = ethers.utils.formatBytes32String("poruka2");
        const messageHash = ethers.utils.formatBytes32String("hash_sadrzaja2");
        const thresholdM = 2;
        const guardians = [guardian1.address, guardian2.address];

        // Registrujemo poruku
        await coordinator.registerMessage(messageId, thresholdM, messageHash, guardians);

        // nonGuardian pokušava da pošalje doprinos i očekujemo REVERT
        await expect(
            coordinator.connect(nonGuardian).submitContribution(messageId)
        ).to.be.revertedWith("Niste autorizovani cuvar za ovu poruku");
    });
});