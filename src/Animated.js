import React, { Component, Fragment } from 'react';
import './Reanimate.css';
import Reanimate from './Reanimate'

class Animated extends Component {
    constructor(props) {
        super(props);

        this.state = {
            animations: {
                transform: {
                    from: 'translateX(0)',
                    to: 'translateX(50%)',
                    type: 'linear',
                    speed: 1000
                }
            },
            animations2: {
                left: {
                    from: 500,
                    to: 400,
                    type: 'linear',
                    speed: 1000
                }
            },
            show2: true,
            show1: true,
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
        const animations = {
            transform: {
                from: 'translateX(50%)',
                to: 'translateX(0)',
                type: 'linear',
                speed: 1000
            }
        };

        const animations2 = {
            transform: {
                from: 'translateY(0)',
                to: 'translateY(50%)',
                type: 'linear',
                speed: 1000
            }
        };

        this.setState({ animations, animations2 });
    }

    render() {
        const { animations, animations2 } = this.state;
        console.log('asd', animations, animations2);
        return (
            <div>
                <button onClick={this.addElement}>Add Element</button>
                <Reanimate animations={animations} isMounted={this.state.isMounted} globalSpeed={1000} interval={111}>
                    {this.state.show1 && <div className={`animated`} key='asd' >asd</div>}
                </Reanimate>
                {/* <Reanimate animations={animations2} isMounted={this.state.isMounted} globalSpeed={1000} interval={0}>
                    {this.state.show2 && <div className={`animated`} key='asd2' onClick={() => this.setState({ show2: !this.state.show2, show1: !this.state.show1 })}>asd2</div>}
                </Reanimate> */}

            </div>

        );
    }
}

export default Animated;
