const redis = require('redis');
const Blockchain = require('../blockchain')

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}

class PubSub {
    constructor( {blockchain, transactionPool} ) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribeAllChannels();
        this.subscriber.on('message', (channel, message) => {
            this.handleMessage(channel, message);
        });
    }

    handleMessage(channel, message) {
        console.log(`Received Message. Channel: ${channel} and Message: ${message}.`);

        const paresedMesage = JSON.parse(message);
        switch(channel) {
            case CHANNELS.BLOCKCHAIN: {
                this.blockchain.replaceChain(paresedMesage, true, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: paresedMesage
                    });
                });
                break;
            }

            case CHANNELS.TRANSACTION: {
                this.transactionPool.setTransaction(paresedMesage);
                break;
            }

            default: {
                return;
            }
        }
    }

    subscribeAllChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        })
    }

    publish({channel, message }) {
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        })
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN, 
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction({ transaction }){
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        });
    }
}

module.exports = PubSub;