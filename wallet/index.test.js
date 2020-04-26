const Wallet = require('./index');
const { verifySignature } = require('../util');


describe('Wallet', () => {
    let wallet;
    beforeEach(()=> {
        wallet = new Wallet();
    });


    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        console.log(wallet.publicKey);
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('Signing data', () => {
        const data = 'foobar';

        it('verify a signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: wallet.sign(data)
            })).toBe(true);
        });

        it ('Does not verify an invalid signature.', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: new Wallet().sign(data)
            })).toBe(false);
        });
    });
});