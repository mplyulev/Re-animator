import React, { Component, Fragment } from 'react';
import './Reanimate.css';
import Reanimate from './Reanimate'

class Animated extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isMounted: true,
            array: [{ text: 'asd', id: Math.random() }, { text: 'asd', id: Math.random() }, { text: 'asd', id: Math.random() }, { text: 'asd', id: Math.random() }]
        }
    }

    remove = (index) => {
        let { array } = this.state;
        array.splice(index, 1);
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
        console.log(this.state.array);
        return (
            <div>
                <button onClick={this.addElement}>Add Element</button>
                <Reanimate animations={animations} isMounted={this.state.isMounted} globalSpeed={1000} interval={0}>
                    {this.state.array.map((item, index) => {
                        return <div className={`animated`} key={item.id} onClick={() => this.remove(index)}>{item.text}</div>
                    })}
                </Reanimate>
            </div>

        );
    }
}

export default Animated;
