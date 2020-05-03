import React, { Component } from 'react'
import Block from './block';

class Blocks extends Component {
    state = { blocks: [] };

    componentDidMount() {
        fetch('http://localhost:3000/api/blocks')
          .then(response => response.json())
          .then(json => this.state.blocks = json);
    }

    render() {
        return( 
            <div>
                <h3> Blocks </h3>
                {
                    this.state.blocks.map(block => {
                        return (
                            <Block key='block.hash' block={block}> </Block>
                        )
                    })
                }
            </div>
        );
    }
}

export default Blocks;