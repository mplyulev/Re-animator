import React, { Component, Fragment } from 'react';
import './Reanimate.css';
import Reanimate from './Reanimate'

class Animated extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMounted: true
    }
  }

  unmount = () => {
    console.log('unmounting');
    this.setState({ isMounted: false })
  };

  render() {

    // const style = {
    //   backgroundColor: 'red',
    // };

    const animations = {
      height: {
        from: 0,
        to: 100,
        type: 'ease-in',
      },
      opacity: {
        to: 1,
        type: 'ease-in-out',
      },
      // paddingLeft: {
      //   from: 1,
      //   to: 1000,
      //   speed: 10000,
      //   type: 'ease-in'
      // },
      backgroundColor: {
        from: 'gray',
        to: 'white',
        type: 'ease-in'
      },
      border: {
        from: '1px solid white',
        to: '5px dashed green',
        type: 'linear',
        speed: 5000
      },
      fontSize: {
        from: 200,
        to: 12,
        type: 'ease-in'
      },
      color: {
        from: 'red',
        to: 'blue',
        type: 'linear'
      }
    }

    const arrays = ['asd', 'asad', 'asdasdasd', 'asdasdasdasd', 'asdasdasdasd', 'sadasdasdasd']

    return (
      <Reanimate animations={animations} isMounted={this.state.isMounted} globalSpeed={10000} interval={1}>
        {arrays.map(text => {
          return <div onClick={this.unmount}>{text}</div>
        })}
      </Reanimate>


    );
  }
}

export default Animated;
