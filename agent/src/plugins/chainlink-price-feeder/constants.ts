export const aggregatorAbi = [
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function getRoundData(uint80 _roundId) view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];

export const PRICE_FEDDER_ABI = [
  'function getHistoricalData(address feedAddress, uint80 roundId) view returns (int256)',
];

