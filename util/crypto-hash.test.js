const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
    it('Returns a SHA-256 hash value.', () => {
        // Generated from SHA-256 online for string 'foo'
        // ref: https://emn178.github.io/online-tools/sha256.html
        expect(cryptoHash('foo'))
          .toEqual("b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b");
    });


    it('Produces the same hash for same input in any order', () => {
        expect(cryptoHash("one", "two", "three"))
          .toEqual(cryptoHash("two", "three", "one"));
    });

    it('produces an unique hash when the properties have changed as input', () => {
      const foo = {};
      const originalHash = cryptoHash(foo);
      foo['a'] = 'bar';
      expect(cryptoHash(foo)).not.toEqual(originalHash);
    })
});