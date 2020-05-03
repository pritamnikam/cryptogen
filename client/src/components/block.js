import React, { Component } from 'react'
import { Button } from  'react-bootstrap';
import Transaction from './transaction'

class Block extends Component {
    state = { displayTransaction: false };

    toggleTransaction = () => {
        this.setState({ displayTransaction: !this.state.displayTransaction });
    }

    get displayTransaction() {
        const { data } = this.props.block;
        const stringifiedData = JSON.stringify(data);
        const dataDisplay = (stringifiedData.length > 35) ? `${stringifiedData.substring(0, 35)}...` : stringifiedData;

        if(this.state.displayTransaction) {
            return (
                <div>
                    {
                        data.map(transaction => (
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction={transaction} />
                            </div>
                        ))
                        
                    }
                    <Button
                        bsStyle='danger'
                        bsSize='small'
                        onClick={this.toggleTransaction}>
                      Show less
                    </Button>
                </div>
            );
        }

        return (
            <div>
                <div> Data: {dataDisplay} </div>
                <Button
                    bsStyle='danger'
                    bsSize='small'
                    onClick={this.toggleTransaction}>
                Show more
                </Button>
            </div>
        );
    }

    render() {
        const { timestamp, hash } = this.props.block;
        const hashDisplay = `${hash.substring(0, 15)}...`;
        return (
            <div className='block'>
                <div>Timestamp: { new Date(timestamp).toLocaleDateString() }</div>
                <div>Hash: { hashDisplay } </div>
                { this.displayTransaction }
            </div>
        )
    };
}

export default Block;