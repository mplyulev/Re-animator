import React, { Component } from 'react';
import './Reanimate.css';
import Reanimate from './Reanimate'
import config from './config'

class Animated extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
     
    const style = {
      backgroundColor: 'red',
    };

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
      // top: {
      //   to: '25%',
      //   speed: 3000,
      //   type: 'linear'
      // },
      // transform: {
      //   from: 'scale(10) rotate(90deg)',
      //   to: 'scale(0.3) rotate(280deg)',
      //   speed: 5000,
      //   type: 'linear'
      // },
      backgroundColor: {
        from: 'gray',
        to: 'white',
        type: 'ease-in'
      },
      border: {
        from: '1px solid white',
        to: '5px dashed green',
        type: 'linear'
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
      
       
        <Reanimate animations={animations} globalSpeed={2000} interval={500}> 
        {arrays.map(text => {
          return  <div>{text}</div>  
        })}
        </Reanimate>
           
        
    );
  }
}

export default Animated;
