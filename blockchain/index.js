const Block = require('./block');
const { cryptoHash } = require('../util');
const { MINER_REWARD, MINER_INPUT } = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

class Blockchain {
    constructor() {
        const genesisBlock = Block.genesis();
        this.chain = [];
        this.chain.push(genesisBlock);
    }

    addBlock({ data }) {
        const minedBlock =
          Block.mineBlock({
              lastBlock: this.chain[this.chain.length - 1], 
              data
            });
        
        this.chain.push(minedBlock);
    }

    replaceChain(chain, validateTransactions, onSuccess) {
        if(chain.length <= this.chain.length) {
            console.error('Chain must be longer than original chain.');
            return;
        }

        if(!Blockchain.isValidChain(chain)) {
            console.error('Chain must be valid.');
            return;
        }

        if (validateTransactions &&
            !this.validTransactionData( {chain} )) {
            console.error('Chain has invalid transaction data.');
            return;
        }

        if (onSuccess) onSuccess();

        console.log('Chain is replaced.', chain);
        this.chain = chain;
    }

    validTransactionData({ chain }) {
        for (let i = 1; i < chain.length; ++i) {
            let block = chain[i];
            let rewardTransactionCount = 0;
            let transactionSet = new Set();
            for (let j = 0; j < block.data.length; ++j) {
                const transaction = block.data[i];

                // Reward transactions
                if (transaction.input.address === MINER_INPUT.address) {
                    ++rewardTransactionCount;

                    // multiple reward transactin per block not allowed.
                    if (rewardTransactionCount > 1) {
                        console.error('Minor rewards exceeds limit.');
                        return false;
                    }

                    // Reward balance should be valid amount.
                    if (Object.values(transaction.outputMap)[0] !== MINER_REWARD) {
                        console.error('Miner reward amount is invalid.');
                        return false;
                    }
                } else {
                    // Check whether transaction is valid or not.
                    if(!Transaction.validTransaction(transaction)) {
                        console.error('Transaction is invalid.');
                        return false;
                    }

                    // Check whether the block holds multiple identical transactions.
                    if (transactionSet.has(transaction)) {
                        console.error('Multiple identical transactions in block.');
                        return false;
                    }
                    transactionSet.add(transaction);

                    // Check whether the transaction blanace sum up to input balance.
                    const trueBalance = Wallet.calculateBalance( {
                                        chain: this.chain,
                                        address: transaction.input.address
                                    });
                    if (trueBalance !== transaction.input.balance) {
                        console.log('Invalid input amount.');
                        return false;
                    }
                }
            }
        }
        return true;
    }

    static isValidChain(chain) {
        if(chain.length == 0 ||
           JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            // console.log('Failed for genesis.');
            return false;
        }

        for (let i = 1; i < chain.length; ++i) {
            const block = chain[i];
            const actualLastHash = chain[i-1].hash;
            const actualLastDifficulty = chain[i-1].difficulty;

            const {timestamp, lastHash, data, hash, nonce, difficulty} = block;

            if (actualLastHash != lastHash) {
                // console.log('Failed for lastHash-mismatch: ' + JSON.stringify(block));
                return false;
            }

            if (Math.abs(actualLastDifficulty - difficulty) > 1) {
                return false;
            }

            const validatedCryptoHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (validatedCryptoHash != hash) {
                // console.log('Failed for hash-mismatch: ' + JSON.stringify(block));
                return false;
            }
        }

        return true;
    }

    static print(chain) {
        for (let i = 0; i < chain.length; ++i) {
            const block = chain[i];
            console.log('Block #'+ i +': ' + JSON.stringify(block));
        }
    }
}

module.exports = Blockchain;