const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');


const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({blockchain});

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

const syncChains = () => {
    const requestBlockURL = `${ROOT_NODE_ADDRESS}/api/blocks`;
    console.log(requestBlockURL);
    request({ url: requestBlockURL}, (error , response, body) => {
        if(!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log(`replace chain on the sync with: ${body}`);
            blockchain.replaceChain(rootChain);
        }
    });
}

let peer_port;

if (process.env.GENERATE_PEER_PORT === 'true') {
    peer_port = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = peer_port || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening on localhost:${PORT}`);

    if (PORT !== DEFAULT_PORT) {
        syncChains();
    }
});
