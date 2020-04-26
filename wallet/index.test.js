const Wallet = require('./index');
const Transaction = require('./transaction');
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

    describe('createTransaction()', () => {

        describe('and amount exceeds the balance', () => {
            it('and throws exception', () => {
                expect(() => wallet.createTransaction({amount: 9999, recipient: 'foo-recipient-address'}))
                    .toThrow('Amount exceed balance');
            });
        });


        describe('and amount is valid', () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient-address';
                transaction = wallet.createTransaction({amount, recipient});
            });

            it('and creates a instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('matches the transaction input to the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs amount the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            })
        });

    });
});