import React from 'react'
import { render } from 'react-dom'
import App from './components/app'
import './index.css'

import { Router, Switch, Route } from 'react-router-dom';
import history from './history';
import Blocks from './components/blocks';
import ConductTransaction from './components/conduct-transaction';
import TransactionPool from './components/transaction-pool';

render(
    <Router history={history}>
        <Switch>
            <Route exact path='/' component={App} />
            <Route path='/blocks' component={Blocks} />
            <Route path='/conduct-transaction' component={ConductTransaction} />
            <Route path='/transaction-pool' component={TransactionPool} />
        </Switch>
    </Router>,
    document.getElementById('root')
);