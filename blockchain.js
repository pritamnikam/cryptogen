const Block = require('./block');
const cryptoHash = require('./crypto-hash');

class Blockchain {
    constructor() {
        const genesisBlock = Block.genesis();
        this.chain = [];
        this.chain.push(genesisBlock);
    }

    addBlock({ data }) {
        const minedBlock =
          Block.mineBlock({
              lastBlock: this.chain[this.chain.length - 1], 
              data
            });
        
        this.chain.push(minedBlock);
    }

    replaceChain(chain) {
        if(chain.length <= this.chain.length) {
            console.error('Chain must be longer than original chain.');
            return;
        }

        if(!Blockchain.isValidChain(chain)) {
            console.error('Chain must be valid.');
            return;
        }

        console.log('Chain is replaced.' +chain);
        this.chain = chain;
    }

    static isValidChain(chain) {
        if(chain.length == 0 ||
           JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            // console.log('Failed for genesis.');
            return false;
        }

        for (let i = 1; i < chain.length; ++i) {
            const block = chain[i];
            const actualLastHash = chain[i-1].hash;

            const {timestamp, lastHash, data, hash, nonce, difficulty} = block;

            if (actualLastHash != lastHash) {
                // console.log('Failed for lastHash-mismatch: ' + JSON.stringify(block));
                return false;
            }

            const validatedCryptoHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (validatedCryptoHash != hash) {
                // console.log('Failed for hash-mismatch: ' + JSON.stringify(block));
                return false;
            }
        }

        return true;
    }

    static print(chain) {
        for (let i = 0; i < chain.length; ++i) {
            const block = chain[i];
            console.log('Block #'+ i +': ' + JSON.stringify(block));
        }
    }
}

module.exports = Blockchain;