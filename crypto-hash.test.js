const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
    it('Returns a SHA-256 hash value.', () => {
        // Generated from SHA-256 online for string 'foo'
        // ref: https://emn178.github.io/online-tools/sha256.html
        expect(cryptoHash('foo'))
          .toEqual('2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae');
    });


    it('Produces the same hash for same input in any order', () => {
        expect(cryptoHash("one", "two", "three"))
          .toEqual(cryptoHash("two", "three", "one"));
    });

    
});