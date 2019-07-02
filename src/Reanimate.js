import React, { Component, Fragment } from 'react';
import './Reanimate.css';

class Reanimate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      styles: [],
      children: [],
      childrenStyles: [],
      unmountChildren: false
    }
  }

  setStylesProps = (animations, currentStyle, isMounting) => {
    ;
    let style = {
      transition: ''
    };

    const { globalSpeed } = this.props;

    let lowestSpeed = 0;

    Object.entries(animations).map(([key, value], index) => {
      if (typeof value.from !== 'undefined') {
        style[key] = !currentStyle ? value.from : currentStyle[key];
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
      if (!isMounting) {
        if (value.type === 'ease-in') {
          value.type = 'ease-out';
        } else if (value.type === 'ease-out') {
          value.type = 'ease-in';
        }
      }

      style.transition += `${cssName || key} ${(value.speed || globalSpeed) / 1000}s ${value.type}${index !== Object.entries(animations).length - 1 ? ', ' : ''}`;
    });

    return style;
  }

  animate = (isMounting) => {
    let { animations, globalSpeed, interval } = this.props;
    let animatedElements = [];
    let currentStyles = [];
    let lowestSpeed = 0;
    let style;

    if (!isMounting) {
      animatedElements = document.getElementsByClassName('animated');

      Array.from(animatedElements).forEach((element) => {
        const currentStyle = window.getComputedStyle(element);

        currentStyles.push(this.setStylesProps(animations, currentStyle, isMounting));
      });
    }

    style = this.setStylesProps(animations, null, isMounting);
    this.setState({ currentStyles });
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
      this.requestTimeout(() => {
        this.setState({ unmountChildren: true });
      }, lowestSpeed);
    }

    this.props.children.map((child, index) => {
      this.requestTimeout(() => {
        childrenStyles.push(style);
        children.push(child);
        this.setState({ children, childrenStyles: isMounting ? childrenStyles : currentStyles });
        this.requestTimeout(() => {
          childrenStyles[index] = newStyle;
          this.setState({ childrenStyles });
        }, 0)
      }, interval * index);
    });
  }

  requestTimeout = (fn, delay) => {
    if (!window.requestAnimationFrame &&
      !window.webkitRequestAnimationFrame &&
      !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
      !window.oRequestAnimationFrame &&
      !window.msRequestAnimationFrame)
      return window.setTimeout(fn, delay);

    var start = new Date().getTime(),
      handle = new Object();

    function loop() {
      var current = new Date().getTime(),
        delta = current - start;

      delta >= delay ? fn.call() : handle.value = window.requestAnimFrame(loop);
    };

    handle.value = window.requestAnimFrame(loop);
    return handle;
  };


  componentDidMount() {
    window.requestAnimFrame = (function () {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
          window.setTimeout(callback, 1000 / 60);
        };
    })();
    this.animate(true)
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.isMounted !== this.props.isMounted && !this.props.isMounted) {
      this.animate(false);
    }
  }

  render() {
    console.log('updating');
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
