import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Blocks from './blocks'
import ConductTransaction from './conduct-transaction'
import logo from '../assets/logo.png'

class App extends Component {
    state = { walletInfo: { address: 'fooxv6', amount:9999 } };

    componentDidMount() {
        fetch(`${document.location.origin}/api/wallet-info`)
          .then(res => res.json())
          .then(json => this.setState({walletInfo: json}));
    }

    render() {
        const { address, balance } = this.state.walletInfo;
        return (
            <div className='App'>
                <img className='logo' src={logo}></img>
                <br />
                <div>
                    <div>Welcome to blockchain</div>
                    <br />
                    <div><Link to='blocks'> Blocks </Link></div>
                    <br />
                    <div><Link to='conduct-transaction'> Conduct Transaction </Link></div>
                    <br />
                    <div><Link to='transaction-pool'> Transaction Pool </Link></div>
                    <br />
                    <div className='walletInfo'>
                        <div>Address: {address} </div>
                        <div>Balance: {balance} </div> 
                    </div>
                </div>
            </div>
        );
    }
}

export default App;