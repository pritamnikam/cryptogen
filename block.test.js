const Block = require('./block');
const  {GENESIS_DATA} = require('./config');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
    const timestamp = 'a-hash';
    const lastHash = 'foo-hash';
    const hash = 'bar-hash';
    const data = ['blockchain', 'data'];
    const block = new Block({timestamp, lastHash, hash, data});

    it('has a timestamp, lastHash, hash and data property', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
    });
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
    const minedBlock = Block.mineBlock({
        lastBlock: lastBlock,
        data});

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
        const hash = cryptoHash(minedBlock.timestamp, minedBlock.lastHash, data);
        expect(minedBlock.hash).toEqual(hash);
    });
});