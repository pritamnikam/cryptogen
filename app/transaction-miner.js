const Transaction = require("../wallet/transaction");

class TransactionMiner {
    constructor({blockchain, transactionPool, wallet, pubsub}) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransactions() {
        // gets the transaction pool's valid transaction.
        const validTransactions = this.transactionPool.validTransactions();

        // Generate a reward for the minor.
        
        validTransactions.push(
            Transaction.rewardTransaction( { minerWallet: this.wallet } )
        );

        // Adds a block to the blockchain with all valid transaction from the pool.
        this.blockchain.addBlock( {data: validTransactions} );

        // publish the block.
        this.pubsub.broadcastChain();

        // clear the transaction from the transaction pool.
        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;