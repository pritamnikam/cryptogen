const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;
const STARTING_BALANCE = 1000;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '----',
    data: [],
    hash: 'hash-one',
    nonce: 1,
    difficulty: INITIAL_DIFFICULTY
};

const MINER_INPUT = { address: '*authorized-reward*'};
const MINER_REWARD = 50;

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STARTING_BALANCE,
    MINER_INPUT,
    MINER_REWARD
};