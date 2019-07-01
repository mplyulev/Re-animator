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
    this.setState({ isMounted: false })
  };



  render() {
    const animations = {
      left: {
        from: 0,
        to: 300,
        type: 'linear'
      }
      // height: {
      //   from: 0,
      //   to: 100,
      //   type: 'ease-in',
      // },
      // opacity: {
      //   to: 1,
      //   type: 'ease-in-out',
      // },
      // // paddingLeft: {
      // //   from: 1,
      // //   to: 1000,
      // //   speed: 10000,
      // //   type: 'ease-in'
      // // },
      // backgroundColor: {
      //   from: 'gray',
      //   to: 'white',
      //   type: 'ease-in'
      // },
      // border: {
      //   from: '1px solid white',
      //   to: '5px dashed green',
      //   type: 'linear',
      //   speed: 5000
      // },
      // fontSize: {
      //   from: 200,
      //   to: 12,
      //   type: 'ease-in'
      // },
      // color: {
      //   from: 'red',
      //   to: 'blue',
      //   type: 'linear'
      // }
    }

    const arrays = ['asd', 'asad', 'asdasdasd', 'asdasdasdasd', 'asdasdasdasd', 'sadasdasdasd']

    return (
      <Reanimate animations={animations} isMounted={this.state.isMounted} globalSpeed={5000} interval={111}>
        {arrays.map((text, index) => {
          return <div className={`animated animated-${index}`} key={index} onClick={this.unmount}>{text}</div>
        })}
      </Reanimate>


    );
  }
}

export default Animated;
