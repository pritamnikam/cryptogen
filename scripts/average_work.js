const Blockchain = require('../blockchain');

const blockchain = new Blockchain();
blockchain.addBlock({ data: 'First'});

let prevTimestamp, nextTimestamp, nextBlock, difference, avarage;

const times = []; 

for (let i = 0; i < 100; ++i) {
    prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

    blockchain.addBlock({data: `Block ${i}`});
    nextBlock = blockchain.chain[blockchain.chain.length -1];

    nextTimestamp = nextBlock.timestamp;

    difference = nextTimestamp - prevTimestamp;
    times.push(difference);
    avarage = times.reduce((total, num) => (total + num)) / times.length;

    console.log(`Time to mine: ${difference}ms. Difficulty: ${nextBlock.difficulty}, Average time: ${avarage}ms`);
}
