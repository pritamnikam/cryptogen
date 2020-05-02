const Blockchain = require('./index');
const Block = require('./block');
const { cryptoHash } = require('../util');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

describe('Blockchain', () => {
    let blockchain; 
    let newChain;
    let originalChain;
    let errorMock;
    let logMock;


    beforeEach(() => {
        errorMock = jest.fn();
        logMock = jest.fn();

        global.console.error = errorMock;
        global.console.log = logMock;

        blockchain = new Blockchain();
        blockchain.addBlock({data: 'Bears'});
        blockchain.addBlock({data: 'Beets'});
        blockchain.addBlock({data: 'Battlestar Gallectica'});

        newChain = new Blockchain();
        originalChain = blockchain.chain;
    });

    it('Contains chain array.', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('Starts with the `genesis` block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('Adds a new block to the chain.', () => {
        const newData = "foo bar";
        blockchain.addBlock({data: newData});

        expect(blockchain.chain[blockchain.chain.length - 1].data)
          .toEqual(newData);
    })

    describe('isValidChain()', () => {

        describe('When chain does not start with genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data: 'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('When chain starts with genesis block and has multiple blocks.', () => {
            describe('And a last reference has changed.', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lastHash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

                });
            });

            describe('and chain contains a block that has invalid field.', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'bad-and-evil-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and chain contains a block with jumpped difficulty.', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.lastHash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const difficulty = lastBlock.difficulty -3;
                    const data = [];

                    const hash = cryptoHash({timestamp, lastHash, data, nonce, difficulty});
                    const basdBlock = new Block({
                        timestamp, lastHash, data, hash, nonce, difficulty
                    });

                    blockchain.chain.push(basdBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and chain does not contains any invalid bolock.', () => {
                it('returns true', () => {
                    // Blockchain.print(blockchain.chain);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });

        });
    });


    describe('replaceChain()', () => {

        describe('New chain is not longer than original chain.', () => {
            beforeEach(() => {
                newChain.chain[0] = {new: 'new-chain'};
                blockchain.replaceChain(newChain.chain);
            });

            it('Does not replace the chain.', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('Error log called.', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('New chain in longer that the original chain.', () => {

            beforeEach(() => {
                newChain.addBlock({data: 'Bears'});
                newChain.addBlock({data: 'Beets'});
                newChain.addBlock({data: 'Battlestar'});
                newChain.addBlock({data: 'Gallectica'});
            });

            describe('New chain is invalid.', () => {

                beforeEach(() => {
                    newChain.chain[2].hash = 'some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                });

                it('Does not replace the chain.', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('Error log called.', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('New chain is valid.', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('Replaces the chain.', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('Success log called.', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });

            describe('and the `validTransactions` flag id true', () => {
                const validTransactionDataMock = jset.fn();
                const originalvalidTransactionData = blockchain.validTransactionData;
                blockchain.validTransactionData = validTransactionDataMock;

                it('returns true', () => {
                    newChain.addBlock( {data: 'foo' });
                    blockchain.replaceChain(newChain.chain);
                    expect(validTransactionDataMock).toHaveBeenCalled();
                    blockchain.validTransactionData = originalvalidTransactionData;
                })
            })
        });
    });


    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({ recipient: 'foo-address', amount: 20, chain: blockchain.chain });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });

        describe('and transaction data is valid', () => {
            it('returns true', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction] });
                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(true);
            });
        });

        describe('and the transaction data has multiple rewards', () => {
            it('returns false', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });
                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(false);
            });

        });

        describe('and the transaction data has atleast one malformed outputMap', () => {
            describe('and the transaction is not a reward transaction', () => {
                it('returns false', () => {
                    transaction.outputMap[wallet.publicKey] = 99999;
                    newChain.addBlock({ data: [transaction, rewardTransaction] });
                    expect(
                        blockchain.validTransactionData({ chain: newChain.chain })
                    ).toBe(false);
                });
            });

            describe('and the transaction is a reward transaction', () => {
                it('returns false', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 99999;
                    newChain.addBlock({ data: [transaction, rewardTransaction] });
                    expect(
                        blockchain.validTransactionData({ chain: newChain.chain })
                    ).toBe(false);
                });
            });
        });

        describe('and the transaction data has atleast one malformed input', () => {
            it('returns false', () => {});
        });

        describe('and blockchain contains multiple identetical transactions', () => {
            it('returns false', () => {
                newChain.addBlock({ data: [transaction, transaction, transaction, rewardTransaction] });
                expect(
                    blockchain.validTransactionData({ chain: newChain.chain })
                ).toBe(false);
            });
        });
    });

});