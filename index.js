const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain, transactionPool});

setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const body = req.body;
    blockchain.addBlock(body);
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const { recipient, amount } = req.body;
    let transaction = transactionPool
        .existingTransaction( { inputAddress: wallet.publicKey });

    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({ recipient, amount });
        }
    } catch(error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction({transaction});
    res.status(200).json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

const syncChains = () => {
    const requestBlockURL = `${ROOT_NODE_ADDRESS}/api/blocks`;
    request({ url: requestBlockURL}, (error , response, body) => {
        if(!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log(`replace chain on the sync with: ${body}`);
            blockchain.replaceChain(rootChain);
        }
    });
}

const syncTransactions = () => {
    const requestTransactionURL = `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`;
    request({ url: requestTransactionURL }, (error , response, body) => {
        if(!error && response.statusCode === 200) {
            const rootTransactionMap = JSON.parse(body);
            console.log(`replace transaction map on the sync with: ${body}`);
            transactionPool.setMap(rootTransactionMap);
        }
    });
}

const syncWithRootState = () => {
    syncChains();
    syncTransactions();
}

let peer_port;

if (process.env.GENERATE_PEER_PORT === 'true') {
    peer_port = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = peer_port || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening on localhost:${PORT}`);

    if (PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});
