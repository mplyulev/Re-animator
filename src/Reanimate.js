import React, { Component, Fragment } from 'react';
import './Reanimate.css';

class Reanimate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            children: [],
            style: {},
            childrenStyleMap: {},
            isMounting: true,
            animatedChildrenKeys: [],
            leavingElementsKeys: [],
            elementsWithPendingAnimation: []
        }

        this.wrapperRef = React.createRef();
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

    constructStyle = (animations, isUnmounting) => {
        let style = {
            transition: ''
        };

        const { globalSpeed, exitAnimations } = this.props;
        Object.entries(isUnmounting ? exitAnimations || animations : animations).map(([cssPropName, value], index) => {
            if (isUnmounting) {
                style[cssPropName] = exitAnimations !== undefined ? value.from : value.to;
            }

            if (!isUnmounting) {
                style[cssPropName] = value.from;
            }


            if (cssPropName !== cssPropName.toLowerCase()) {
                cssPropName = this.constructCSSPropName(cssPropName);
            }

            style.transition += `${cssPropName} ${(value.speed || globalSpeed) / 1000}s ${value.type}${index !== Object.entries(animations).length - 1 ? ', ' : ''}`;
        });

        return style;
    }

    animate = (animation, isUnmounting, animatedChildrenKeys) => {
        console.log('asd animating', animatedChildrenKeys);
        let { childrenStyleMap, leavingElementsKeys } = this.state;
        const { exitAnimations, globalSpeed, children, noEntryAnimation, noExitAnimation } = this.props;
        let style;

        if (isUnmounting && exitAnimations !== undefined) {
            style = this.constructStyle(exitAnimations, false);
        } else if (isUnmounting && exitAnimations === undefined) {
            style = this.constructStyle(animation, true);
        } else if (!isUnmounting) {
            style = this.constructStyle(animation, false);
        }

        this.setState({ currentStyle: style });
        const newStyle = Object.assign({}, style);
        Object.entries(!isUnmounting ? animation : exitAnimations || animation).map(([key, value]) => {
            newStyle[key] = value.to;
            if (!isUnmounting || (isUnmounting && exitAnimations !== undefined)) {
                newStyle[key] = value.to;
            } else if (isUnmounting && exitAnimations === undefined) {
                newStyle[key] = value.from;
            }
        });
        console.log('asd', animatedChildrenKeys)
        this.requestTimeout(() => {
            (isUnmounting ? this.state.children : this.props.children).forEach(child => {
                if (animatedChildrenKeys.includes(child.key)) {
                    if (isUnmounting && noExitAnimation) {
                        this.removeChild(child.key);
                        return;
                    }

                    let mergedStyles = { ...childrenStyleMap[child.key], ...newStyle };
                    childrenStyleMap[child.key] = mergedStyles;
                }
            });

            this.setState({ style });
            if (!isUnmounting) {
                const childrenClone = [...this.props.children]
                this.state.children.forEach((prevChild, index) => {
                    if (leavingElementsKeys.includes(prevChild.key) && children.every(child => child.key !== prevChild.key)) {
                        childrenClone.splice(index, 0, prevChild);
                    }
                });

                this.setState({ children: childrenClone });
            } else if (isUnmounting) {
                this.setState({ leavingElementsKeys: leavingElementsKeys.concat(animatedChildrenKeys) });
                const handleTransitionEnd = (event) => this.handleTransitionEndCallback(event, animatedChildrenKeys, handleTransitionEnd);
                this.wrapperRef.current.addEventListener('transitionend', handleTransitionEnd);
            }

            this.requestTimeout(() => {
                this.setState({ style: newStyle });
            }, 0)
        }, 0);
    };

    handleTransitionEndCallback = ({ target }, animatedChildrenKeys, eventRef) => {
        const { children, leavingElementsKeys } = this.state;
        const id = target.getAttribute('identification');

        if (animatedChildrenKeys.includes(id)) {
            const index = children.findIndex((child) => child.key === id);
            if (index >= 0) {
                children.splice(index, 1);
                const filteredKeys = leavingElementsKeys.filter(key => key !== id);
                this.setState({ children, leavingElementsKeys: filteredKeys });
                this.wrapperRef.current.removeEventListener('transitionend', eventRef);
            }
        }
    }

    removeChild = (id) => {
        const { children, animatedChildrenKeys } = this.state;
        if (animatedChildrenKeys.includes(id)) {
            const index = children.findIndex((child) => child.key === id);
            if (index >= 0) {
                children.splice(index, 1);
                this.setState({ children });
            }
        }
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
        const animatedChildren = [];

        oldChildren.forEach(oldChild => {
            if (!newChildren.find(newChild => oldChild.key === newChild.key)) {
                animatedChildrenKeys.push(oldChild.key);
                animatedChildren.push(oldChild);
            }
        });

        return { animatedChildrenKeys, animatedChildren };
    }

    findAddedChildrenKeys = (newChildren, oldChildren) => {
        const animatedChildrenKeys = [];
        const animatedChildren = [];

        newChildren.forEach(newChild => {
            if (!oldChildren.find(oldChild => newChild.key === oldChild.key)) {
                animatedChildrenKeys.push(newChild.key);
                animatedChildren.push(newChild);
            }
        });

        return { animatedChildrenKeys, animatedChildren };
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

    componentWillReceiveProps(nextProps, nextState) {
        const newChildren = nextProps.children;
        const oldChildren = this.props.children;
        const { animations } = this.props;
        if (newChildren.length !== oldChildren.length && newChildren.length < oldChildren.length) {
            const animatedChildrenKeys = this.findRemovedChildrenKeys(newChildren, oldChildren).animatedChildrenKeys;
            this.handleUnmountingAnimation(animations, animatedChildrenKeys);
        }

        if (newChildren.length !== oldChildren.length && newChildren.length > oldChildren.length) {
            const animatedChildrenKeys = this.findAddedChildrenKeys(newChildren, oldChildren).animatedChildrenKeys;
            this.handleMountingAnimations(animations, animatedChildrenKeys);
        }
    }

    handleUnmountingAnimation = (animations, animatedChildrenKeys) => {
        this.setState({ animatedChildrenKeys, isMounting: false }, () => {
            animations.forEach((animation, index) => {
                if (index !== 0) {
                    this.requestTimeout(this.animate(animation, true, animatedChildrenKeys), animations[index - 1].speed);
                } else {
                    this.animate(animation, true, animatedChildrenKeys);
                }
            })
        })
    }

    handleMountingAnimations = (animations, animatedChildrenKeys) => {
        console.log('asd anim keys', animatedChildrenKeys);
        this.setState({ animatedChildrenKeys, isMounting: true }, () => {
            animations.forEach((animation, index) => {
                if (index !== 0 && index <= animations.length - 1) {
                    const prevAnimation = animations[index - 1];
                    const getSpeeds = (animation) => {
                        console.log('asd second anim')
                        return Object.values(animation).map(d => d.speed);
                    }

                    const minSpeed = Math.max(...getSpeeds(prevAnimation));
                    this.requestTimeout(() => this.animate(animations[index - 1], false, animatedChildrenKeys), minSpeed);
                } else {
                    console.log('asd first', animatedChildrenKeys);
                    this.animate(animation, false, animatedChildrenKeys);
                }
            })
        })
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     if (nextState.children.length !== this.state.children.length || this.state.style !== nextState.style) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    componentDidMount() {
        this.addRequestAnimFramePolyfill();
        const { children, animations } = this.props;
        const animatedChildrenKeys = this.findAddedChildrenKeys(children, []).animatedChildrenKeys;
        this.setState({ animatedChildrenKeys }, () => {
            this.handleMountingAnimations(animations, this.state.animatedChildrenKeys);
        });
    };

    render() {
        const { style, children, animatedChildrenKeys, isMounting, childrenStyleMap, leavingElementsKeys } = this.state;

        const childrenClone = React.Children.map(children, (child) => {
            const isMountingWhileUnmountPending = isMounting && leavingElementsKeys.includes(child.key)
            const isEnteringWithoutAnimation = animatedChildrenKeys.includes(child.key) && isMounting && this.props.noEntryAnimation;
            let childStyle = !isMounting || isMountingWhileUnmountPending || isEnteringWithoutAnimation
                ? Object.assign({}, childrenStyleMap[child.key])
                : Object.assign({}, style);

            if (isEnteringWithoutAnimation) {
                childStyle.transition = '';
            } // now we can see the element in the beggining. should not see it ;
            const childClone = React.cloneElement(child, {
                ...child.props,
                identification: child.key,
                style: childStyle
            });

            return childClone
        });

        return (
            <div ref={this.wrapperRef} >
                {childrenClone}
            </div>
        );
    }
}

export default Reanimate;