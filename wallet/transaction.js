const uuid = require('uuid/v1');
const { verifySignature } = require('../util');
const { MINER_INPUT, MINER_REWARD } = require('../config');

class Transaction {
    constructor({senderWallet, recipient, amount, outputMap, input }) {
        this.id = uuid();
        this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});
        this.input = input || this.createInput({senderWallet, outputMap: this.outputMap});
    }

    createOutputMap({senderWallet, recipient, amount}) {
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }

    createInput({senderWallet, outputMap}) {
        return {
            timestamp: Date.now(),
            address: senderWallet.publicKey,
            amount: senderWallet.balance,
            signature: senderWallet.sign(outputMap)
        };
    }

    update({ senderWallet, recipient, amount}) {
        if(amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance')
        }

        if (!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        } else {
            this.outputMap[recipient] = amount + this.outputMap[recipient];
        }
        
        this.outputMap[senderWallet.publicKey] =
            this.outputMap[senderWallet.publicKey] - amount;
        
        this.input = this.createInput({senderWallet, outputMap: this.outputMap});
    }

    static validTransaction(transaction) {
        const {input: { address, amount, signature }, outputMap} = transaction;

        const amountTotal = Object.values(outputMap)
                .reduce((total, outputAmount) => total + outputAmount );

        if (amount !== amountTotal) {
            console.error(`Invalid transaction for ${address}`);
            return false;
        }

        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error(`Invalid signature for ${address}`);
            return false;
        }

        return true;
    }

    static rewardTransaction({ minerWallet }) {
        return new this({
            senderWallet: minerWallet,
            outputMap: {[minerWallet.publicKey]: MINER_REWARD},
            input: MINER_INPUT
        });
    }
}

module.exports = Transaction;