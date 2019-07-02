import React, { Component, Fragment } from 'react';
import './Reanimate.css';
import Reanimate from './Reanimate'

class Animated extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMounted: true,
      array: ['asd', 'asad', 'asdasdasd', 'asdasdasdasd', 'asdasdasdasd', 'sadasdasdasd']
    }
  }

  unmount = () => {
    const array = this.state.array;
    array.push('test');

    this.setState({ array, isMounted: false });
  };

  render() {
    const animations = {
      left: {
        from: 0,
        to: 300,
        type: 'ease-in',
      }
    }
    console.log(this.state.array);

    return (
      <Reanimate animations={animations} isMounted={this.state.isMounted} globalSpeed={200} interval={111}>
        {this.state.array.map((text, index) => {
          return <div className={`animated animated-${index}`} key={index} onClick={() => this.unmount()}>{text}</div>
        })}
      </Reanimate>


    );
  }
}

export default Animated;
