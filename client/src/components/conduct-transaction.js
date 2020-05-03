import React, { Component } from 'react'
import { FormGroup, FormControl } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { history } from '../history';
import { Button } from  'react-bootstrap';

class ConductTransaction extends Component {
    state = { recipient: '', amount: 0, knownAddresses: [] };

    updateAmount = event => {
        this.setState({amount: Number(event.target.value)});
    }

    updateRecipient = event => {
        this.setState({recipient: event.target.value});
    }

    submitTransaction = () => {
        const postData = {
            recipient: this.state.recipient,
            amount: this.state.amount
          }
      
          fetch(`${document.location.origin}/api/transact`,{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
          })
          .then(response => response.json())
          .then(json => {
            alert(json.message || json.type );
            history.push('/transaction-pool')
          });
    }

    componentDidMount() {
        fetch(`${document.location.origin}/api/known-addresses`)
        .then(res => res.json())
        .then(json => this.setState({ knownAddresses: json }));
    }

    render() {
        return (
            <div className='ConductTransaction'>
                <Link to='/'> Main </Link>
                <br />
                <div> 
                    <h4> Known Addresses </h4>
                    <hr />
                        {
                            this.state.knownAddresses.map(address => (
                                <div> {address} </div>
                            ))
                        } 
                </div>
                <h3> Conduct a Transaction</h3>
                <FormGroup>
                    <FormControl
                        input='text'
                        placeholder='recipient'
                        value={this.state.recipient}
                        onChange={this.updateRecipient}
                    />
                </FormGroup>
                <FormGroup>
                    <FormControl
                        input='number'
                        placeholder='recipient'
                        value={this.state.amount}
                        onChange={this.updateAmount}
                    />
                </FormGroup>
                <Button
                    bsStyle='danger'
                    bsSize='small'
                    onClick={this.submitTransaction}>
                Submit
                </Button>
            </div>
        );
    }

}

export default ConductTransaction;