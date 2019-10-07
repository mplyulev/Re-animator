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
        const animations = [
            {
                left: {
                    from: 0,
                    to: 300,
                    type: 'linear',
                    speed: 1000
                },
                top: {
                    from: 0,
                    to: 300,
                    type: 'linear',
                    speed: 1000
                }
            },
            {
                top: {
                    from: 300,
                    to: 0,
                    type: 'linear',
                    speed: 555
                }
            },
            // {
            //     opacity: {
            //         from: 1,
            //         to: 0.5,
            //         type: 'linear',
            //         speed: 555
            //     }
            // },
            // {
            //     opacity: {
            //         from: 0.5,
            //         to: 1,
            //         type: 'linear',
            //         speed: 555
            //     }
            // },
            {
                fontSize: {
                    from: '14px',
                    to: '25px',
                    type: 'linear',
                    speed: 555
                }
            }
        ];

        const exitAnimations = [{
            opacity: {
                from: 1,
                to: 0,
                type: 'linear',
                speed: 1111
            }
        }
        ]

        return (
            <div className='test'>
                <button onClick={this.addElement}>Add Element</button>
                <Reanimate animations={animations} isMounted={this.state.isMounted} noEntryAnimation={true} noExitAnimation={false} globalSpeed={111} interval={0}>
                    {this.state.array.map((item) => {
                        return <div className={`animated`} key={item.id} onClick={() => this.remove(item.id)}>{Math.random()}</div>
                    })}
                </Reanimate>

            </div >

        );
    }
}

export default Animated;
