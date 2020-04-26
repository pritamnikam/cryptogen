const uuid = require('uuid/v1');
const { verifySignature } = require('../util');

class Transaction {
    constructor({senderWallet, recipient, amount}) {
        this.id = uuid();
        this.outputMap = this.createOutputMap({senderWallet, recipient, amount});
        this.input = this.createInput({senderWallet, outputMap: this.outputMap});
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
}

module.exports = Transaction;