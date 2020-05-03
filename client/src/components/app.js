import React, { Component } from 'react'
import Blocks from './blocks'
import logo from '../assets/logo.png'

class App extends Component {
    state = { walletInfo: { address: 'fooxv6', amount:9999 } };

    componentDidMount() {
        fetch('http://localhost:3000/api/wallet-info')
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
                    <div className='walletInfo'>
                        <div>Address: {address} </div>
                        <div>Balance: {balance} </div> 
                    </div>
                    <br />
                    <Blocks />
                </div>
            </div>
        );
    }
}

export default App;