import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import Transaction from './transaction';
import { history } from '../history';
import { Button } from  'react-bootstrap';

class TransactionPool extends Component {
    state = { transactionPoolMap: [] }

    fetchTransactions = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
        .then(response => response.json())
        .then(json => this.setState({ transactionPoolMap: json }));
    }

    fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transactions`)
        .then(response => {
            if(response.status === 200) {
                alert('Success');
                history.push('/blocks');
            } else {
                alert('The mine-transaction block request did not complete.');
            }
        })

    }

    componentDidMount() {
        this.fetchTransactions();

        this.fetchPoolIntrval = setInterval(()=>{
            this.fetchTransactions();
        }, 20000);
    }

    componentWillUnmount() {
        clearInterval(this.fetchPoolIntrval);
    }

    render() {
        return (
            <div className='TransactionPool'>
                <div> <Link to='/'> Main </Link> </div>
                <h3> Transaction Pool </h3>
                <hr />
                {
                    Object.values(this.state.transactionPoolMap).map(transaction => {
                        return (
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction={transaction} />
                            </div>
                        )
                    })
                }
                < hr />
                <Button
                    bsStyle='danger'
                    bsSize='small'
                    onClick={this.fetchMineTransactions}>
                Mine transactions
                </Button>
            </div>
        )
    }
}

export default TransactionPool;