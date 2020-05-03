import React, { Component } from 'react'
import Block from './block';
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'

class Blocks extends Component {
    state = { blocks: [], paginatedID: 1, blocksLength: 0 };

    fetchPaginatedBlocks = paginatedID => () => {
        fetch(`${document.location.origin}/api/blocks${paginatedID}`)
        .then(response => response.json())
        .then(json => this.setState({ blocks: json }));
    }

    fetchBlocksLength = () => {
        fetch(`${document.location.origin}/api/blocks/length`)
        .then(response => response.json())
        .then(json => this.setState({ blocksLength: json }));
    }

    componentDidMount() {
        this.fetchBlocksLength();
        this.fetchPaginatedBlocks(this.state.paginatedID)();
    }

    render() {
        return(
            <div key='id'>
                <div><Link to='/'> Main </Link></div>
                <h3> Blocks </h3>
                <div>
                {
                    [...Array(Math.ceil(this.state.blocksLength/5)).keys()].map(key => {
                        const paginatedID = key + 1;

                        return (
                            <span key={key}>
                                <Button
                                    bsStyle='danger'
                                    bsSize='small'
                                    onClick={this.fetchPaginatedBlocks(paginatedID)}>
                                 {paginatedID}
                                 </Button> {'  '}
                            </span>
                        )
                    })
                }
                </div>
                <hr />
                { 
                    this.state.blocks.map(block => {
                        return (
                            <Block key='i' block={block} />
                        )
                    })
                }
            </div>
        )
    }
}

export default Blocks;