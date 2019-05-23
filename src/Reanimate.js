import React, { Component, Fragment } from 'react';
import './Reanimate.css';

class Reanimate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      style: null,
      children: [],
      childrenStyles: [],
      unmountChildren: false
    }
  }

  animate = (isMounting) => {
    let { animations, globalSpeed, interval } = this.props;
    const style = {};
    style.transition = ''
    let lowestSpeed = 0;

    Object.entries(animations).map(([key, value], index) => {
      if (typeof value.from !== 'undefined') {
        style[key] = isMounting ? value.from : value.to;
      }
      let cssName = ''
      if (key !== key.toLowerCase()) {
        const keys = key.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1);
        keys.forEach((keyPart, index) => {
          cssName += keyPart.toLowerCase();
          if (index !== keys.length - 1) {
            cssName += '-';
          }

        });
      }

      if (value.speed > lowestSpeed) {
        lowestSpeed = value.speed;
      }
      style.transition += `${cssName || key} ${(value.speed || globalSpeed) / 1000}s ${value.type}${index !== Object.entries(animations).length - 1 ? ', ' : ''}`;
    });

    this.setState({ style });

    const newStyle = Object.assign({}, style);
    Object.entries(animations).map(([key, value]) => {
      let endValue = isMounting ? value.to : value.from;
      newStyle[key] = endValue;
    });


    let children = [];
    let childrenStyles = [];

    if (lowestSpeed < globalSpeed) {
      lowestSpeed = globalSpeed;
    }

    if (!isMounting) {
      setTimeout(() => {
        this.setState({ unmountChildren: true });
      }, lowestSpeed + 50);
    }


    this.props.children.map((child, index) => {
      console.log(child);
      setTimeout(() => {
        childrenStyles.push(style)
        children.push(child);
        this.setState({ children, childrenStyles });
        setTimeout(() => {
          childrenStyles[index] = newStyle;
          this.setState({ childrenStyles });
        }, 50)
      }, interval * index);
    });
  }

  componentDidMount() {
    this.animate(true)
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.isMounted !== this.props.isMounted && !this.props.isMounted) {
      this.animate(false);
    }
  }

  render() {
    const children = React.Children.map(this.state.children, (child, index) => {
      const childClone = React.cloneElement(child, {
        ...child.props,
        style: { ...this.state.childrenStyles[index] }
      });

      return childClone
    });

    return (
      <Fragment>
        {!this.state.unmountChildren ? children : null}
      </Fragment>
    );
  }
}

export default Reanimate;
