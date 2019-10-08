import React, { Component, Fragment } from 'react';
import './Reanimate.css';

class Reanimate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            children: [],
            style: {},
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

    animate = (animation, isUnmounting, animatedChildrenKeys, prevAnimation, prevAnimations, isLastAnimation) => {
        console.log('asd anim', animation);
        let { leavingElementsKeys, elementAnimationMap } = this.state;
        const { exitAnimations, globalSpeed, children, noEntryAnimation, noExitAnimation } = this.props;
        let style;

        if (isUnmounting && exitAnimations !== undefined) {
            style = this.constructStyle(exitAnimations, false);
        } else if (isUnmounting && exitAnimations === undefined) {
            style = this.constructStyle(animation, true);
        } else if (!isUnmounting) {
            style = this.constructStyle(animation, false);
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

        this.requestTimeout(() => {
            (isUnmounting ? this.state.children : this.props.children).forEach(child => {
                if (animatedChildrenKeys.includes(child.key)) {
                    if (isUnmounting && noExitAnimation) {
                        this.removeChild(child.key);
                        elementAnimationMap[child.key] = null;
                        return;
                    }
                    elementAnimationMap[child.key].animationPending = true;
                    elementAnimationMap[child.key] && elementAnimationMap[child.key].startStyle && Object.keys(elementAnimationMap[child.key].startStyle).forEach(prop => {
                        if (!Object.keys(animation).includes(prop) && prop !== 'transition') {
                            style[prop] = elementAnimationMap[child.key].currentStyle[prop];
                            newStyle[prop] = elementAnimationMap[child.key].currentStyle[prop];
                        }
                    });

                    elementAnimationMap[child.key].startStyle = style
                    elementAnimationMap[child.key].currentStyle = newStyle;
                    elementAnimationMap[child.key].isStarting = true;
                    elementAnimationMap[child.key].prevAnimations = prevAnimations
                }
            });

            let childrenClone = [...this.props.children];
            if (!isUnmounting) {
                this.state.children.forEach((prevChild, index) => {
                    if (leavingElementsKeys.includes(prevChild.key) && children.every(child => child.key !== prevChild.key)) {
                        childrenClone.splice(index, 0, prevChild);
                    }
                });
                this.setState({ children: childrenClone });
            } else {
                this.setState({ leavingElementsKeys: leavingElementsKeys.concat(animatedChildrenKeys) });
            }

            this.setState({ style, elementAnimationMap });

            this.requestTimeout(() => {
                (isUnmounting ? this.state.children : this.props.children).forEach(child => {
                    if (animatedChildrenKeys.includes(child.key)) {
                        elementAnimationMap[child.key].isStarting = false;
                        if (isUnmounting && isLastAnimation) {
                            elementAnimationMap[child.key].shouldUnmount = true;
                        }
                        if (!isUnmounting && isLastAnimation) {
                            elementAnimationMap[child.key].isMounted = true;
                        }

                    }
                });

                this.setState({ style: newStyle });
            }, 0)
        }, 0);
    };

    handleTransitionEnd = ({ target }) => {
        const { elementAnimationMap } = this.state;
        const id = target.getAttribute('identification');
        if (elementAnimationMap[id].isUnmounting && elementAnimationMap[id].shouldUnmount) {
            target.parentNode.removeChild(target);
            elementAnimationMap[id].animationPending = false;
        }

        if (!elementAnimationMap[id].isUnmounting && elementAnimationMap[id].isMounted)
            elementAnimationMap[id].animationPending = false;

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
            });
            this.handleUnmountingAnimation(exitAnimations || animations, animatedChildrenKeys, elementAnimationMap);
        }

        if (newChildren.length !== oldChildren.length && newChildren.length > oldChildren.length) {
            const animatedChildrenKeys = this.findAddedChildrenKeys(newChildren, oldChildren).animatedChildrenKeys;
            animatedChildrenKeys.forEach(key => {
                elementAnimationMap[key] = {
                    isUnmounting: false
                }
            });

            this.handleMountingAnimations(animations, animatedChildrenKeys, elementAnimationMap);
        }
    }

    handleUnmountingAnimation = (animations, animatedChildrenKeys, elementAnimationMap) => {
        this.setState({ animatedChildrenKeys, isMounting: false }, () => {
            const { elementsWithFinishedAnimations, elementsWithPendingAnimations } = this.sortElements(animatedChildrenKeys, elementAnimationMap);
            Object.keys(elementsWithPendingAnimations).forEach(key => {
                if (elementsWithPendingAnimations[key].prevAnimations) {
                    this.handleAnimations(elementsWithPendingAnimations[key].prevAnimations.reverse(), Object.keys(elementsWithPendingAnimations));
                }

                if (!elementsWithPendingAnimations[key].prevAnimations) {
                    this.animate(animations.reverse()[0], true, Object.keys(elementsWithPendingAnimations));
                }
            });

            if (Object.keys(elementsWithFinishedAnimations).length > 0) {
                console.log('asd handle');
                this.handleAnimations(animations.reverse(), Object.keys(elementsWithFinishedAnimations));
            }
        });
    }

    handleMountingAnimations = (animations, animatedChildrenKeys, elementAnimationMap) => {
        this.setState({ animatedChildrenKeys, elementAnimationMap, isMounting: true }, () => {
            const { elementsWithFinishedAnimations, elementsWithPendingAnimations } = this.sortElements(animatedChildrenKeys, elementAnimationMap);

            animations.forEach((animation, index) => {
                if (index !== 0 && index <= animations.length - 1) {
                    const prevAnimation = animations[index - 1];
                    const isLastAnimation = index === animations.length - 1;
                    const prevAnimations = isLastAnimation ? animations : animations.slice(0, index);
                    const delay = this.getAnimationDelay(animations.slice(0, index));
                    this.requestTimeout(() => {
                        this.animate(animation, false, animatedChildrenKeys, prevAnimation, prevAnimations, isLastAnimation);
                    }, delay);
                } else {
                    this.animate(animation, false, animatedChildrenKeys);
                }
            });
        });
    }

    sortElements = (animatedChildrenKeys, elementAnimationMap) => {
        let elementsWithPendingAnimations = {};
        let elementsWithFinishedAnimations = {};
        animatedChildrenKeys.forEach(key => {
            elementAnimationMap[key].animationPending
                ? elementsWithPendingAnimations[key] = elementAnimationMap[key]
                : elementsWithFinishedAnimations[key] = elementAnimationMap[key]
        });

        return { elementsWithPendingAnimations, elementsWithFinishedAnimations }
    }

    handleAnimations = (animations, animatedChildrenKeys) => {
        animations.forEach((animation, index) => {
            if (index !== 0 && index <= animations.length - 1) {
                const prevAnimation = animations[index - 1];
                const prevAnimations = isLastAnimation ? animations : animations.slice(0, index);
                const delay = this.getAnimationDelay(animations.slice(0, index));
                const isLastAnimation = index === animations.length - 1;
                this.requestTimeout(() => {
                    this.animate(animation, true, animatedChildrenKeys, prevAnimation, prevAnimations, isLastAnimation);
                }, delay);
            } else {
                this.animate(animation, true, animatedChildrenKeys);
            }
        });
    }

    getAnimationDelay = (prevAnimations) => {
        return prevAnimations.reduce((acc, prevAnimation) => {
            acc += Math.max(...Object.values(prevAnimation).map(d => d.speed));
            return acc;
        }, 0);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.children.length !== this.state.children.length || this.state.style !== nextState.style;
    }

    // uuidv4() {
    //     return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    //         (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    //     );
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

        this.handleMountingAnimations(animations, animatedChildrenKeys, elementAnimationMap);
    };

    componentWillUnmount() {
        this.wrapperRef.current.removeEventListener('transitionend', this.handleTransitionEnd)
    }

    render() {

        const {
            children,
            isMounting,
            elementAnimationMap } = this.state;

        const childrenClone = React.Children.map(children, (child) => {
            const childAnimationData = elementAnimationMap[child.key];
            const { animationPending, currentStyle, startStyle, isStarting, isUnmounting, isMounted } = childAnimationData;
            let childStyle = !isStarting ? currentStyle : startStyle;
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