const Wallet = require('./index');
const Transaction = require('./transaction');
const { verifySignature } = require('../util');
const { STARTING_BALANCE } = require('../config');
const Blockchain = require('../blockchain');


describe('Wallet', () => {
    let wallet;
    beforeEach(()=> {
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
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

        describe('and a chain is passed.', () => {
            it('calls the calculateBalance', () => {
                let calculateBalanceMock = jest.fn();
                let originalCreateTransaction = wallet.createTransaction;
                wallet.createTransaction = calculateBalanceMock;

                wallet.createTransaction({
                    recipient: 'foo',
                    amount: 50,
                    chain: new Blockchain().chain
                });

                expect(calculateBalanceMock).toHaveBeenCalled();
                wallet.createTransaction = originalCreateTransaction;
            });
        });
    });

    describe("calculateBalance()", () => {
        let blockchain;
        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('and there are no output for the wallet',() => {
            it('returns the `STARTING_BALANCE`', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(STARTING_BALANCE);
            });
        });

        describe('and there are outputs to the wallet.', () => {
            let transactionOne, transactionTwo;
            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 40
                });

                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                });

                blockchain.addBlock({ data: [transactionOne, transactionTwo] });
            });

            it('adds the sum of all outputs to the wallet balance.', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(
                    STARTING_BALANCE +
                    transactionOne.outputMap[wallet.publicKey] +
                    transactionTwo.outputMap[wallet.publicKey]
                    );
            });

            it('and wallet has made a transaction.', () => {
                const recentTransaction  = wallet.createTransaction({
                    recipient: 'foo-address',
                    amount: 10
                });

                blockchain.addBlock({ data: [recentTransaction] });


                expect(
                    Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey
                   })
                ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
            });

            describe('and there are outputs next to and after the recent transaction.', () => {
                let sameBlockTransaction, nextBlockTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient: 'later-foo-address',
                        amount: 60
                    });

                    sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
                    blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction] });
                    nextBlockTransaction = new Wallet().createTransaction({
                        recipient: wallet.publicKey,
                        amount: 50
                    });

                    blockchain.addBlock({ data: [nextBlockTransaction] });
                });

                it('include the output amounts in the returns balance', () => {
                    expect(
                        Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })
                    ).toEqual(
                        recentTransaction.outputMap[wallet.publicKey] +
                        sameBlockTransaction.outputMap[wallet.publicKey] +
                        nextBlockTransaction.outputMap[wallet.publicKey]
                    );
                });
            });
        });
    });
});