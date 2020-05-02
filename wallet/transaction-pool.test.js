const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
let transactionPool, transaction, senderWallet;
beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({
        senderWallet: senderWallet,
        recipient: 'fake-recipient',
        amount: 50
    });
});

describe('setTransaction()', () => {
    it('Adds a transaction', () => {
        transactionPool.setTransaction(transaction);
        expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
});

describe('existingTransaction()', () => {
    it('returns an existing transaction given an input address.', () => {
        transactionPool.setTransaction(transaction);
        expect(
            transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })
        ).toBe(transaction);
    });
});

describe('validTransactions()', () => {
    let validTransactions, errorMock;
    beforeEach(() => {
        validTransactions = [];
        errorMock = jest.fn();
        global.console.error = errorMock;

        for (var i = 0; i < 10; ++i) {
            transaction = new Transaction({
                senderWallet: senderWallet,
                recipient: 'any-recipient',
                amount: 30
            });

            if (i%3 === 0) {
                transaction.input.amount = 99999;
            } else if (i%3 === 1) {
                transaction.input.signature = new Wallet().sign('foo');
            } else {
                validTransactions.push(transaction);
            }

            transactionPool.setTransaction(transaction);
        }
    });

    it('returns valid transactions.', () => {
        expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });

    it('logs errors for invalid transactins.', () => {
        transactionPool.validTransactions();
        expect(errorMock).toHaveBeenCalled();
    });
});

describe('clear()', () => {
    it('Clears the transactions.', () => {
        transactionPool.clear();
        expect(transactionPool.transactionMap).toEqual({});
    });
});

describe('clearBlockchainTransactions()', () => {
    it('Clears the pool of any exisitng transactions.', () => {
        const blockchain = new Blockchain();
        let expectedTransactions = {};

        for (let i = 0 ; i < 6; ++i) {
            const transaction = new Wallet().createTransaction({recipient: 'foo', amount: 20});
            transactionPool.setTransaction(transaction);

            if(i%2 === 0) {
                expectedTransactions[transaction.id] = transaction;
            } else {
                blockchain.addBlock({ data: [transaction] });
            }
        }

        transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });
        expect(transactionPool.transactionMap).toEqual(expectedTransactions);
    });
});

});


