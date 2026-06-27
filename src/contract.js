export const CONTRACT_ADDRESS = "0x6cf38B99cc848fFFefdA568d1E60B3fE0E410a69";

export const CONTRACT_ABI = [
  "function registerMessage(bytes32 _messageId, uint256 _thresholdM, bytes32 _messageHash, address[] memory _guardians) external",
  "function submitContribution(bytes32 _messageId) external",
  "function messages(bytes32) external view returns (bytes32 messageId, address owner, uint256 thresholdM, uint256 totalGuardiansN, uint256 currentContributions, bytes32 messageHash, bool isDecrypted)",
  "function getGuardians(bytes32 _messageId) external view returns (address[] memory)"
];