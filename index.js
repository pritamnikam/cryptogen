const bodyParser = require('body-parser');
const express = require('express');
const Blockchain = require('./blockchain');

const app = express();
const blockchain = new Blockchain();

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});


app.post('/api/mine', (req, res) => {
    const { body } = req.body;
    blockchain.addBlock({ body });

    res.redirect('/api/blocks');
});

const PORT = 3000;
app.listen(PORT, console.log(`listening on localhost:${PORT}`));


