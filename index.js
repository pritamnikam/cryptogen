const bodyParser = require('body-parser');
const express = require('express');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub')

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

const DEFAULT_PORT = 3000;
let peer_port;

if (process.env.GENERATE_PEER_PORT === 'true') {
    peer_port = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = peer_port || DEFAULT_PORT;
app.listen(PORT, console.log(`listening on localhost:${PORT}`));


