import React, { Component, Fragment } from 'react';
import './Reanimate.css';

class Reanimate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            children: [],
            style: {},
            animatedChildrenKeys: [],
            currentStyle: {},
            elementsWithPendingAnimation: []
        }
    }

    constructCSSPropName = (key) => {
        let cssPropName = '';
        const keys = key.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1);
        keys.forEach((keyPart, index) => {
            cssPropName += keyPart.toLowerCase();
            if (index !== keys.length - 1) {
                cssPropName += '-';
            }
        });

        return cssPropName;
    }

    setStylesProps = (animations, isUnmounting) => {
        let style = {
            transition: ''
        };

        let currentStyle = {
            transition: ''
        }
        const { globalSpeed, exitAnimations } = this.props;
        Object.entries(isUnmounting ? exitAnimations || animations : animations).map(([cssPropName, value], index) => {
            if (isUnmounting) {
                style[cssPropName] = exitAnimations !== undefined ? value.from : value.to;
            }

            if (!isUnmounting) {
                style[cssPropName] = value.from;
            }

            currentStyle[cssPropName] = value.to;


            if (cssPropName !== cssPropName.toLowerCase()) {
                cssPropName = this.constructCSSPropName(cssPropName);
            }

            style.transition += `${cssPropName} ${(value.speed || globalSpeed) / 1000}s ${value.type}${index !== Object.entries(animations).length - 1 ? ', ' : ''}`;
            currentStyle.transition = style.transition;
        });

        this.setState({ currentStyle });
        return style;
    }

    animate = (isUnmounting, animatedChildrenKeys) => {
        let { elementsWithPendingAnimation } = this.state;
        const { exitAnimations, animations, globalSpeed, children } = this.props;
        let style;

        if (isUnmounting && exitAnimations !== undefined) {
            style = this.setStylesProps(exitAnimations, false);
        } else if (isUnmounting && exitAnimations === undefined) {
            style = this.setStylesProps(animations, true);
        } else if (!isUnmounting) {
            style = this.setStylesProps(animations, false);
        }

        const newStyle = Object.assign({}, style);
        let lowestSpeed = 0;
        Object.entries(!isUnmounting ? animations : exitAnimations || animations).map(([key, value]) => {
            newStyle[key] = value.to;
            if (!isUnmounting || (isUnmounting && exitAnimations !== undefined)) {
                newStyle[key] = value.to;
            } else if (isUnmounting && exitAnimations === undefined) {
                newStyle[key] = value.from;
            }
        });

        if (lowestSpeed < globalSpeed) {
            lowestSpeed = globalSpeed;
        }

        this.requestTimeout(() => {
            this.setState({ style, isSettingNewStyle: false });
            if (!isUnmounting) {
                this.setState({ children });
            } else {
                animatedChildrenKeys.forEach(key => {
                    elementsWithPendingAnimation.push({ key, newStyle });
                });
                console.log('fuck');
                this.setState({ elementsWithPendingAnimation });
                this.requestTimeout(() => {
                    elementsWithPendingAnimation = elementsWithPendingAnimation.filter((element) => !animatedChildrenKeys.includes(element.key));
                    this.setState({ children, elementsWithPendingAnimation });
                }, lowestSpeed)
            }

            this.requestTimeout(() => {
                this.setState({ style: newStyle });
            }, 0)
        }, 0);
    }

    requestTimeout = (fn, delay) => {
        if (!window.requestAnimationFrame &&
            !window.webkitRequestAnimationFrame &&
            !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
            !window.oRequestAnimationFrame &&
            !window.msRequestAnimationFrame)
            return window.setTimeout(fn, delay);

        const start = new Date().getTime(),
            handle = new Object();

        const loop = () => {
            var current = new Date().getTime(),
                delta = current - start;

            delta >= delay ? fn.call() : handle.value = window.requestAnimFrame(loop);
        };

        handle.value = window.requestAnimFrame(loop);
        return handle;
    };

    findRemovedChildrenKeys = (newChildren, oldChildren) => {
        const animatedChildrenKeys = [];
        oldChildren.forEach(oldChild => {
            if (!newChildren.find(newChild => oldChild.key === newChild.key)) {
                animatedChildrenKeys.push(oldChild.key)
            }
        });

        return animatedChildrenKeys;
    }

    findAddedChildrenKeys = (newChildren, oldChildren) => {
        const animatedChildrenKeys = [];

        newChildren.forEach(newChild => {
            if (!oldChildren.find(oldChild => newChild.key === oldChild.key)) {
                animatedChildrenKeys.push(newChild.key)
            }
        });

        return animatedChildrenKeys;
    }

    componentWillReceiveProps(nextProps, nextState) {
        const newChildren = React.Children.toArray(nextProps.children);
        const oldChildren = React.Children.toArray(this.props.children);

        if (newChildren.length !== oldChildren.length && newChildren.length < oldChildren.length) {
            const animatedChildrenKeys = this.findRemovedChildrenKeys(newChildren, oldChildren);
            this.setState({ animatedChildrenKeys }, () => {
                this.animate(true, animatedChildrenKeys);
            })
        }

        if (newChildren.length !== oldChildren.length && newChildren.length > oldChildren.length) {
            const animatedChildrenKeys = this.findAddedChildrenKeys(newChildren, oldChildren);
            this.setState({ animatedChildrenKeys }, () => {
                this.animate(false, animatedChildrenKeys);
            })
        }
    }

    addRequestAnimFramePolyfill = () => {
        window.requestAnimFrame = (() => {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (/* function */ callback, /* DOMElement */ element) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.children.length !== this.state.children.length || this.state.style !== nextState.style) {
            return true;
        } else {
            return false;
        }
    }

    componentDidMount() {
        this.addRequestAnimFramePolyfill();
        const children = React.Children.toArray(this.props.children);
        const animatedChildrenKeys = this.findAddedChildrenKeys(children, []);
        this.setState({ animatedChildrenKeys }, () => {
            animatedChildrenKeys && this.animate(false, animatedChildrenKeys);
        });
    };

    render() {
        const { style, children, animatedChildrenKeys, currentStyle, elementsWithPendingAnimation } = this.state;

        const childrenClone = React.Children.map(children, (child) => {
            let childStyle = animatedChildrenKeys.includes(`.$${child.key}`) ? style : currentStyle;
            const elementWithPendingAnimation = elementsWithPendingAnimation.find(element => element.key === `.$${child.key}`);
            if (elementWithPendingAnimation) {
                childStyle = elementWithPendingAnimation.newStyle;
            }

            const childClone = React.cloneElement(child, {
                ...child.props,
                id: child.key,
                style: childStyle
            });

            return childClone
        });

        return (
            <Fragment>
                {childrenClone}
            </Fragment >
        );
    }
}

export default Reanimate;
