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
            elementAnimationMap: {},
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

    animate = (animation, isUnmounting, animatedChildrenKeys, prevAnimation, isLastAnimation) => {
        let { childrenStyleMap, leavingElementsKeys, elementAnimationMap } = this.state;
        const { exitAnimations, globalSpeed, children, noEntryAnimation, noExitAnimation } = this.props;
        let style;
        if (isUnmounting && exitAnimations !== undefined) {
            style = this.constructStyle(exitAnimations, false);
        } else if (isUnmounting && exitAnimations === undefined) {
            style = this.constructStyle(animation, true);
        } else if (!isUnmounting) {
            style = this.constructStyle(animation, false);
        }

        let isMountingSequence = !isUnmounting && prevAnimation;

        if (isMountingSequence) {
            Object.entries(prevAnimation).map(([key, value]) => {
                if (!Object.keys(animation).includes(key)) {
                    style[key] = value.to
                }
            });

            const prevChildren = this.state.children.filter(child => !animatedChildrenKeys.includes(child.key));
            prevChildren.forEach(child => {
                if (childrenStyleMap[child.key]) {
                    let mergedStyles = { ...childrenStyleMap[child.key] && style, ...newStyle };
                    childrenStyleMap[child.key].style = mergedStyles;
                    childrenStyleMap[child.key].isPrevChild = true;
                }
            });
        }

        const newStyle = Object.assign({}, style);
        Object.entries(!isUnmounting ? animation : exitAnimations || animation).map(([key, value]) => {
            newStyle[key] = value.to;
            if (!isUnmounting || (isUnmounting && exitAnimations !== undefined)) {
                newStyle[key] = value.to;
            } else if (isUnmounting && exitAnimations === undefined) {
                newStyle[key] = value.from;
            }
        });

        this.setState({ childrenStyleMap });
        this.requestTimeout(() => {
            (isUnmounting ? this.state.children : this.props.children).forEach(child => {
                if (animatedChildrenKeys.includes(child.key)) {
                    if (isUnmounting && noExitAnimation) {
                        this.removeChild(child.key);
                        elementAnimationMap[child.key] = null;
                        return;
                    }

                    isUnmounting && Object.keys(elementAnimationMap[child.key].startStyle).forEach(prop => {
                        if (!Object.keys(animation).includes(prop) && prop !== 'transition') {
                            style[prop] = elementAnimationMap[child.key].startStyle[prop];
                            newStyle[prop] = elementAnimationMap[child.key].currentStyle[prop];
                        }
                    });

                    elementAnimationMap[child.key].startStyle = style
                    elementAnimationMap[child.key].currentStyle = newStyle;
                    elementAnimationMap[child.key].isStarting = true;
                }
            });

            this.setState({ style, elementAnimationMap });
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

            }

            this.requestTimeout(() => {
                (isUnmounting ? this.state.children : this.props.children).forEach(child => {
                    if (animatedChildrenKeys.includes(child.key)) {
                        elementAnimationMap[child.key].isStarting = false;
                    }
                });

                this.setState({ style: newStyle });
            }, 0)
        }, 0);
    };

    handleTransitionEnd = ({ target }, animatedChildrenKeys) => {
        console.log('asd handling')
        const { children, leavingElementsKeys, elementAnimationMap } = this.state;
        const id = target.getAttribute('identification');
        // elementAnimationMap[id].animationPending =  ? true : false
        if (animatedChildrenKeys.includes(id) && elementAnimationMap[id].isUnmounting) {

        }

        this.setState({ elementAnimationMap });
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
        const { elementAnimationMap } = this.state;
        const { animations, exitAnimations } = this.props;
        if (newChildren.length !== oldChildren.length && newChildren.length < oldChildren.length) {
            const animatedChildrenKeys = this.findRemovedChildrenKeys(newChildren, oldChildren).animatedChildrenKeys;
            animatedChildrenKeys.forEach(key => {
                elementAnimationMap[key].isUnmounting = true;
                elementAnimationMap[key].animationPending = true;
            });
            this.handleUnmountingAnimation(exitAnimations || animations.reverse(), animatedChildrenKeys);
        }

        if (newChildren.length !== oldChildren.length && newChildren.length > oldChildren.length) {
            const animatedChildrenKeys = this.findAddedChildrenKeys(newChildren, oldChildren).animatedChildrenKeys;
            animatedChildrenKeys.forEach(key => {
                elementAnimationMap[key] = {
                    isUnmounting: false,
                    animationPending: true
                }
            });
            this.handleMountingAnimations(animations, animatedChildrenKeys, elementAnimationMap);
        }
    }

    handleUnmountingAnimation = (animations, animatedChildrenKeys) => {
        this.setState({ animatedChildrenKeys, isMounting: false }, () => {
            animations.forEach((animation, index) => {
                if (index !== 0 && index <= animations.length - 1) {
                    const prevAnimation = animations[index - 1];
                    const minSpeed = this.getAnimationSpeed(prevAnimation);
                    const isLastAnimation = index === animations.length - 1;
                    this.requestTimeout(() => {
                        this.animate(animation, true, animatedChildrenKeys, prevAnimation, isLastAnimation)
                    }, minSpeed);
                } else {
                    this.animate(animation, true, animatedChildrenKeys);
                }
            });
        });
    }

    handleMountingAnimations = (animations, animatedChildrenKeys) => {
        this.setState({ animatedChildrenKeys, isMounting: true }, () => {
            animations.forEach((animation, index) => {
                if (index !== 0 && index <= animations.length - 1) {
                    const prevAnimation = animations[index - 1];
                    const minSpeed = this.getAnimationSpeed(prevAnimation);
                    this.requestTimeout(() => {
                        this.animate(animation, false, animatedChildrenKeys, prevAnimation);
                    }, minSpeed);
                } else {
                    this.animate(animation, false, animatedChildrenKeys);
                }
            });
        });
    }

    getAnimationSpeed = (prevAnimation) => {
        return Math.max(...Object.values(prevAnimation).map(d => d.speed));
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
        let elementAnimationMap = {};
        const { children, animations } = this.props;
        const animatedChildrenKeys = this.findAddedChildrenKeys(children, []).animatedChildrenKeys;
        this.wrapperRef.current.addEventListener('transitionend', (e) => this.handleTransitionEnd(e, animatedChildrenKeys));

        animatedChildrenKeys.forEach(key => {
            elementAnimationMap[key] = {
                isUnmounting: false,
                animationPending: true
            }
        });

        this.setState({ animatedChildrenKeys, elementAnimationMap }, () => {
            this.handleMountingAnimations(animations, animatedChildrenKeys);
        });
    };

    componentWillUnmount() {
        this.wrapperRef.current.removeEventListener('transitionend', this.handleTransitionEnd)
    }

    render() {
        const {
            style,
            children,
            animatedChildrenKeys,
            isMounting,
            elementAnimationMap,
            childrenStyleMap,
            leavingElementsKeys } = this.state;

        const childrenClone = React.Children.map(children, (child) => {
            const isChildAnimated = animatedChildrenKeys.includes(child.id);
            // const isMountingWhileUnmountPending = isMounting && leavingElementsKeys.includes(child.key)
            const isEnteringWithoutAnimation = isChildAnimated && isMounting && this.props.noEntryAnimation;
            // let childStyle = elementAnimationMap[child.key] && elementAnimationMap[child.key].currentStyle || style;
            const childAnimationData = elementAnimationMap[child.key];
            const { animationPending, currentStyle, startStyle, isStarting } = childAnimationData;
            let childStyle = animationPending && !isStarting ? currentStyle : startStyle;
            //     ? Object.assign({}, childrenStyleMap[child.key].style)
            // : Object.assign({}, style);
            // if (isMounting && !isChildAnimated && childrenStyleMap[child.key] && childrenStyleMap[child.key].isPrevChild) {
            //     childStyle = childrenStyleMap[child.key].style;
            // }

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