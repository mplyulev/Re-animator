import React, { Component, Fragment } from 'react';
import './Reanimate.css';
import Reanimate from './Reanimate'

class Animated extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show2: true,
            isMounted: true,
            array: [{ text: 'asd', id: Math.random() }, { text: 'asd', id: Math.random() }, { text: 'asd', id: Math.random() }, { text: 'asd', id: Math.random() }]
        }
    }

    remove = (id) => {
        let { array } = this.state;
        // array.splice(index, 1);
        array = array.filter(item => item.id !== id);
        this.setState({ array });
    };

    addElement = () => {
        let { array } = this.state;
        array.push({ text: 'test', id: Math.random() });
        this.setState({ array });
    }

    render() {
        const animations = {
            left: {
                from: 0,
                to: 300,
                type: 'linear',
                speed: 1000
            }
        }
        const animations2 = {
            left: {
                from: 300,
                to: 0,
                type: 'linear',
                speed: 1000
            }
        }

        return (
            <div>
                <button onClick={this.addElement}>Add Element</button>
                <Reanimate animations={animations} isMounted={this.state.isMounted} globalSpeed={1000} interval={0}>
                    <div className={`animated`} key='asd' >asd</div>
                </Reanimate>
                <Reanimate animations={animations2} isMounted={this.state.isMounted} globalSpeed={1000} interval={0}>
                    {this.state.show2 && <div className={`animated`} key='asd2' onClick={() => this.setState({ show2: !this.state.show2 })}>asd2</div>}
                </Reanimate>

            </div>

        );
    }
}

export default Animated;
