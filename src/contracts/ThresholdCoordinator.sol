// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ThresholdCoordinator {
    
    struct MessageMetadata {
        bytes32 messageId;
        address owner;
        uint256 thresholdM;
        uint256 totalGuardiansN;
        uint256 currentContributions;
        bytes32 messageHash; // Kriptografski otisak enkriptovane poruke
        bool isDecrypted;
        address[] guardians;
    }

    mapping(bytes32 => MessageMetadata) public messages;
    mapping(bytes32 => mapping(address => bool)) public hasContributed;
    mapping(bytes32 => mapping(address => bool)) public isGuardian;

    event MessageRegistered(bytes32 indexed messageId, address indexed owner, uint256 thresholdM);
    event GuardianContributed(bytes32 indexed messageId, address indexed guardian, uint256 timestamp);
    event ThresholdReached(bytes32 indexed messageId, uint256 timestamp);

    function registerMessage(
        bytes32 _messageId,
        uint256 _thresholdM,
        bytes32 _messageHash,
        address[] memory _guardians
    ) external {
        require(messages[_messageId].owner == address(0), "Poruka sa ovim ID-em vec postoji");
        require(_thresholdM > 0 && _thresholdM <= _guardians.length, "Nevalidan prag M");
        require(_guardians.length > 0, "Lista cuvara ne sme biti prazna");

        MessageMetadata storage msgData = messages[_messageId];
        msgData.messageId = _messageId;
        msgData.owner = msg.sender;
        msgData.thresholdM = _thresholdM;
        msgData.totalGuardiansN = _guardians.length;
        msgData.messageHash = _messageHash;
        msgData.guardians = _guardians;
        msgData.isDecrypted = false;

        for (uint256 i = 0; i < _guardians.length; i++) {
            isGuardian[_messageId][_guardians[i]] = true;
        }

        emit MessageRegistered(_messageId, msg.sender, _thresholdM);
    }

    function submitContribution(bytes32 _messageId) external {
        require(isGuardian[_messageId][msg.sender], "Niste autorizovani cuvar za ovu poruku");
        require(!hasContributed[_messageId][msg.sender], "Vec ste dali svoj doprinos");
        require(!messages[_messageId].isDecrypted, "Poruka je vec desifrovana");

        hasContributed[_messageId][msg.sender] = true;
        messages[_messageId].currentContributions++;

        emit GuardianContributed(_messageId, msg.sender, block.timestamp);

        if (messages[_messageId].currentContributions >= messages[_messageId].thresholdM) {
            messages[_messageId].isDecrypted = true;
            emit ThresholdReached(_messageId, block.timestamp);
        }
    }

    function getGuardians(bytes32 _messageId) external view returns (address[] memory) {
        return messages[_messageId].guardians;
    }
}