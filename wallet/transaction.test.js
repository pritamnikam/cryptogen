const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util/index');

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount;
    let errorMock;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;

        transaction = new Transaction({ senderWallet, recipient, amount});
        errorMock = jest.fn();

        global.console.error = errorMock;
    });

    it('has a `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('outputMap', () => {
        it('has a `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining amount for the `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    });

    describe('input', () => {
        it('has a `input`', () => {
            expect(transaction).toHaveProperty('input');
        });

        it('has a `timestamp`', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it('has a `address` that of the `senderWallet`', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('has a `amount` that of the `senderWallet`', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it('signs the transaction', () => {
            expect(
                verifySignature({
                publicKey: senderWallet.publicKey,
                signature: transaction.input.signature,
                data: transaction.outputMap
            })
            ).toBe(true);
        })
    });

    describe('validTransaction()', () => {
        describe('when a transaction is valid', () => {
            it('return true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            })
        });

        describe('when transaction is invalid', () => {
            describe('and the transaction outputMap is invalid.', () => {
                it('return false', () => {
                    transaction.outputMap[senderWallet.publicKey] = 9999;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            });

            describe('has invalid signature', () => {
                it('return false', () => {
                    transaction.input.signature = new Wallet().sign('data');
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            })
        });
    })
})