import React, { Component, Fragment } from 'react';
import './Reanimate.css';
import config from './config';

class Reanimate extends Component {
  constructor(props) {
    super(props);
    
    
    this.state = {
      style: null,
      
      children: [],
      childrenStyles: []
      
    }
  }

  componentDidMount() {
    let { animations } = this.props;
    const style = {};
    style.transition = ''
    let cssName = ''

    Object.entries(animations).map(([key, value], index) => {
      if (typeof value.from !== 'undefined') {
        style[key] = value.from;
      }

      cssName = config[key] && config[key].cssName;
      style.transition += `${cssName || key} ${value.speed / 1000}s ${value.type}${index !== Object.entries(animations).length - 1 ? ', ' : ''}`;
    });
     
    this.setState({ style });

    const newStyle = Object.assign({}, style);
    Object.entries(animations).map(([key, value]) => {
      let endValue = value.to;
      newStyle[key] = endValue;    
    });
     

    let children = [];
    let childrenStyles = [];
    let newChildrenStyles = [];
    this.props.children.map((child, index) => {
        setTimeout(() => {
          childrenStyles.push(style)
          children.push(child);
          this.setState({children, childrenStyles});
          setTimeout(() => {
            childrenStyles[index] = newStyle;
            console.log(childrenStyles);
              this.setState({ childrenStyles })
          }, 50)
        }, 1000*index)
    })
  }
  
  render() {  
    const children = React.Children.map(this.state.children, (child, index) => {
      return React.cloneElement(child, {
        ...child.props,
        style: { ...this.state.childrenStyles[index] }
      });
    });
    
    return (
      <Fragment>
        {children}
      </Fragment>
    );
  }
}

export default Reanimate;
