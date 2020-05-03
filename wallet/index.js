const Transaction = require('./transaction');
const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ recipient, amount, chain }) {
        if (chain) {
            this.balance = Wallet.calculateBalance({ chain: chain, address: this.publicKey });
        }

        if( amount > this.balance) {
            throw new Error('Amount exceed balance');
        }

        return new Transaction({senderWallet: this, recipient, amount});
    }

    static calculateBalance({ chain, address }) {
        let hasCondunctedTransaction = false;
        let totalBalance = 0;
        for (let i = chain.length - 1; i > 0; --i) {
            const block = chain[i];
            for (let transaction of block.data) {
                if (transaction.input.address === address) {
                    hasCondunctedTransaction = true;
                }

                if (transaction.outputMap[address]) {
                    totalBalance += transaction.outputMap[address];
                }
            }

            if (hasCondunctedTransaction) {
                break;
            }
        }

        return hasCondunctedTransaction ? totalBalance : STARTING_BALANCE + totalBalance;
    }
}

module.exports = Wallet;