const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const path = require('path');

const isDevelopment = process.env.ENV === 'development';
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain, transactionPool});
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './client/dist')));

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.get('/api/blocks/length', (req, res) => {
    res.json(blockchain.chain.length);
});

app.get('/api/blocks:id', (req, res) => {
    const { id } = req.params;
    const reverseChain = blockchain.chain.slice().reverse();
    
    const paginatedID = parseInt(id);
    const length = blockchain.chain.length;

    let startIndex = (paginatedID - 1) * 5;
    let endIndex = paginatedID * 5;

    startIndex = (startIndex > length) ? length : startIndex;
    endIndex = (endIndex > length) ? length : endIndex;
    res.json(reverseChain.slice(startIndex, endIndex));
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
            transaction.update({
                senderWallet: wallet,
                recipient,
                amount
            });
        } else {
            transaction = wallet.createTransaction({
                recipient,
                amount,
                chain: blockchain.chain
            });
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

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;
    res.json({
        address,
        balance: Wallet.calculateBalance({chain : blockchain.chain, address })
    });
});

app.get('/api/known-addresses', (req, res) => {
    const addressMap = {}
    for (let block of blockchain.chain) {
        for (let transaction in block.data) {
            const recipients = Object.keys(transaction.outputMap);
            recipients.forEach(recipient => addressMap[recipient] = recipient);
        }
    }
    res.json( Object.keys(addressMap) );
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/dist/index.html'));
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

if (isDevelopment) {
    
    const walletFoo = new Wallet();
    const walletBar = new Wallet();

    const performTransaction = () => {
        const trans1 = wallet.createTransaction({
            recipient: walletFoo.publicKey,
            amount: 50
        });

        const trans2 = wallet.createTransaction({
            recipient: walletBar.publicKey,
            amount: 30
        });

        return [trans1, trans2];
    }

    const performFooTransaction = () => {
        const trans1 = walletFoo.createTransaction({
            recipient: wallet.publicKey,
            amount: 50
        });

        const trans2 = walletFoo.createTransaction({
            recipient: walletBar.publicKey,
            amount: 30
        });

        return [trans1, trans2];
    }

    const performBarTransaction = () => {
        const trans1 = walletBar.createTransaction({
            recipient: wallet.publicKey,
            amount: 50
        });

        const trans2 = walletBar.createTransaction({
            recipient: walletFoo.publicKey,
            amount: 30
        });

        return [trans1, trans2];
    }

    for (let i = 0 ; i < 5; ++i) {
        blockchain.addBlock( {
            data: performTransaction()
        });

        blockchain.addBlock( {
            data: performFooTransaction()
        });

        blockchain.addBlock( {
            data: performBarTransaction()
        });
    }
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
