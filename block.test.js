const Block = require('./block');
const  {GENESIS_DATA, MINE_RATE} = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
    const timestamp = 2000;
    const lastHash = 'foo-hash';
    const hash = 'bar-hash';
    const nonce = 1;
    const difficulty = 1;
    const data = ['blockchain', 'data'];
    const block = new Block({timestamp, lastHash, hash, data, nonce, difficulty});

    it('has a timestamp, lastHash, hash and data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('Returns a Block instance.', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('Returns the genesis data.', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe("mineBlock()", () => {
        const lastBlock = Block.genesis();
        const data = "mine data";
        const { difficulty } = lastBlock;
        let nonce = 0;

        const minedBlock = Block.mineBlock({ lastBlock: lastBlock, data });

        it('Returns a Block instance.', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('Sets the `lastHash` to the `hash` of the mined block.', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('Sets the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('Sets the `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('Creates `SHA-256` on the proper inputs.', () => {
            const hash = cryptoHash(
                minedBlock.timestamp,
                minedBlock.lastHash,
                data,
                minedBlock.nonce,
                minedBlock.difficulty);

            expect(minedBlock.hash).toEqual(hash);
        });

        it('Satisfies the difficultly.', () => {
            // console.log('difficultly: ' + minedBlock.difficulty);
            expect(minedBlock.hash.substring(0, minedBlock.difficulty))
              .toEqual('0'.repeat(minedBlock.difficulty));
        });

        
    it('Adjusts the difficulty.', () => {
        const possibleDifficulties = [block.difficulty + 1, block.difficulty - 1];
        expect(possibleDifficulties.includes(minedBlock.difficulty)).toBe(true);
    });

    });

    describe('adjustDifficulty()', () => {
        it('Raise difficulty if next block is added faster than the mining rate.', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });

        it('Lower the difficulty if new block is added slower than the mining rate.', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });


        it('has a lower limit of 1.', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({originalBlock: block})).toEqual(1);
        });
    });
});