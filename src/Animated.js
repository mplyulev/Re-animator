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
        speed: 5000,
        type: 'ease-in',
      },
      opacity: {     
        to: 1,
        speed: 5000,
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
        speed: 5000,
        type: 'ease-in'
      },
      // border: {
      //   from: '1px solid white',
      //   to: '100px dashed green',
      //   speed: 10000,
      //   type: 'linear'
      // },
      // filter: {
      //   to: 'grayscale(20%) drop-shadow(8px 8px 140px yellow)',
      //   speed: 11000,
      //   type: 'ease-in'
      // },
      fontSize: {
        from: 200,
        to: 12,
        speed: 5000,
        type: 'ease-in'
      },
      color: {
        from: 'red',
        to: 'blue',
        speed: 5000,
        type: 'linear'
      }
    } 

    const arrays = ['asd', 'asad', 'asdasdasd', 'asdasdasdasd', 'asdasdasdasd', 'sadasdasdasd']
 
    return (
      
       
        <Reanimate animations={animations}> 
        {arrays.map(text => {
          return  <div>{text}</div>  
        })}
        </Reanimate>
           
        
    );
  }
}

export default Animated;
