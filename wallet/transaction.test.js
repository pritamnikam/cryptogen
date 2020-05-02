const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util/index');
const { MINER_INPUT, MINER_REWARD } = require('../config');

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
    });

    describe('update()', () => {

        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        describe('and amount is invalid', () => {
            it('throws an exception', () => {
                expect(() => transaction.update(
                    {senderWallet, recipient: 'foo', amount: 9999})
                ).toThrow('Amount exceeds balance');
            })
        });

        describe('and amount is valid', () => {

            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = 'next-recipient';
                nextAmount = 50;
    
                transaction.update({senderWallet, recipient: nextRecipient, amount: nextAmount});
            });
    
            it('outputs the amount to the next recipient', () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });
    
            it('substracts the amount from the original sender output amount', () => {
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
            });
    
            it('maintains the total output that matches the total input', () => {
                expect(Object.values(transaction.outputMap)
                        .reduce(
                            (total, outputAmount) => total + outputAmount))
                .toEqual(transaction.input.amount);
            });
    
            it('re-signs the transaction', () => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            });


            describe('and another update for the same recipient', () => {
                let anotherAmount;

                beforeEach(() => {
                    anotherAmount = 80;
                    transaction.update({senderWallet, recipient: nextRecipient, amount: anotherAmount});
                });

                it('adds to the recipient amount', () => {
                    expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + anotherAmount);
                });

                it('substracts the amount from original senders amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey])
                        .toEqual(originalSenderOutput - nextAmount - anotherAmount);
                })
            });
        });

    });

    describe('rewardTransaction()', () => {
        let minerWallet, rewardTransaction;

        beforeEach(() => {
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({minerWallet});
        });

        it('Creates transaction with miner input.', () => {
            expect(rewardTransaction.input).toEqual(MINER_INPUT);
        });

        it('Creates one transaction for the miner with `MINING_REWARD`', () => {
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINER_REWARD);
        })
    });
})