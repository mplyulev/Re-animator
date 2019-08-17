import React, { Component, Fragment } from 'react';
import './Reanimate.css';
import Reanimate from './Reanimate'
import Item from './Item';

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
                },
                top: {
                    from: 0,
                    to: 300,
                    type: 'linear',
                    speed: 1000
                },
            },
            animations2: {
                left: {
                    from: 500,
                    to: 400,
                    type: 'linear',
                    speed: 1000
                }
            },
        }
    }

    toggleItem = () => {

    }

    render() {
        const exitAnimation = {
            transform: {
                from: 'translateX(50%)',
                to: 'translateX(0)',
                type: 'linear',
                speed: 1000
            },

            top: {
                from: 0,
                to: 200,
                type: 'linear',
                speed: 1000
            },
        };

        const animations = {
            transform: {
                from: 'translateX(0)',
                to: 'translateX(50%)',
                type: 'linear',
                speed: 1000
            },

            top: {
                from: 0,
                to: 200,
                type: 'linear',
                speed: 1000
            }
        };

        return (
            <div>
                <button onClick={this.addElement}>Add Element</button>
                <Reanimate animations={animations}
                    // dontAnimateOnMount={false}
                    // dontAnimateOnUnmount={true}
                    globalSpeed={1000}
                    exitAnimation={exitAnimation}
                    interval={111}>
                    <Item key='test'></Item>
                    {/* <div className="animated" key='test'></div> */}
                </Reanimate>
            </div >

        );
    }
}

export default Animated;
