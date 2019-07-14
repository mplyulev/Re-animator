import React, { Component, Fragment } from 'react';
import './Reanimate.css';
const EQUATIONS_PER_DAY = 3
const ADDITION = 'add';
const SUBTRACTION = 'sub';
const MULTIPLICATION = 'multiply';
const DIVISION = 'div';

class Reanimate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            days: []
        }
    }

    generateEquation = (day, availableNumbers, operationType) => {
        const x = Math.floor(Math.random() * availableNumbers) + 1;
        const y = Math.floor(Math.random() * availableNumbers) + 1;
        let finalResult;

        switch (operationType) {
            case ADDITION:
                finalResult = x + y
                break;
            case SUBTRACTION:
                finalResult = x > y ? x - y : y - x;
                break;
            case DIVISION:
                finalResult = x > y ? x / y : y / x;
                break;
            case MULTIPLICATION:
                finalResult = x * y
                break;
            default:
        }

        let isInvalid = false;

        isInvalid = this.state.days.some(day => {
            day[operationType].some(equation => {
                const { operand1, operand2 } = equation;
                return (x === operand1 || x === operand2) && (y === operand1 || y === operand2);
            })
        });

        if (operationType === DIVISION && finalResult % 1 !== 0) {
            return this.generateEquation(day, availableNumbers, operationType);
        }

        isInvalid = day[operationType].length > 0 && day[operationType].some(equation => {
            const { operand1, operand2, result } = equation;
            return operand1 === x || operand1 === y || operand2 === x || operand2 === y || result === finalResult
        });

        if (finalResult > availableNumbers || x === y) {
            isInvalid = true;
        }


        if (operationType === SUBTRACTION) {
            day[ADDITION].forEach(equation => {
                const { operand1, operand2, result } = equation;
                if (operand1 === x || operand1 === y || operand2 === x || operand2 === y) {
                    isInvalid = true;
                }
            });
        }

        if (!isInvalid) {
            return { operand1: x, operand2: y, result: finalResult }
        } else {
            return this.generateEquation(day, availableNumbers, operationType);
        }
    }

    visualize = () => {

    }

    randomize = (days) => {
        let availableNumbers = 40;
        days.forEach((day, index) => {
            availableNumbers += 2;
            for (let i = 0; i < EQUATIONS_PER_DAY; i++) {
                let addition = this.generateEquation(day, availableNumbers, ADDITION);
                let subtraction = this.generateEquation(day, availableNumbers, SUBTRACTION);
                let multiplication = this.generateEquation(day, availableNumbers, MULTIPLICATION);
                let division = this.generateEquation(day, availableNumbers, DIVISION);

                day[ADDITION].push(addition);
                day[SUBTRACTION].push(subtraction);
                day[MULTIPLICATION].push(multiplication);
                day[DIVISION].push(division);
            }
        });

        this.setState({ days })
    }

    componentDidMount() {
        const days = []

        for (let i = 1; i <= 30; i++) {
            const day = { number: i, add: [], sub: [], div: [], multiply: [] }
            days.push(day);
        }
        this.setState({ days: days }, () => {
            this.randomize(this.state.days);
        });
    };

    render() {
        const { days } = this.state;

        return (
            <Fragment>
                {days.map(day => (
                    <div className="day">
                        <h5>DAY {day.number}</h5>
                        <div className="equation">
                            <h6>ADDITION</h6>
                            {day.add.map(equation => (
                                <p>{equation.operand1} + {equation.operand2} = {equation.result}</p>
                            )
                            )}
                        </div>
                        <div className="equation">
                            <h6>SUBTRACTION</h6>
                            {day.sub.map(equation => (
                                <p>{equation.operand1 > equation.operand2 ? equation.operand1 : equation.operand2}
                                    {` - `}   {equation.operand1 > equation.operand2 ? equation.operand2 : equation.operand1} = {equation.result}</p>
                            )
                            )}
                        </div>
                        <div className="equation">
                            <h6>MULTIPLICATION</h6>
                            {day.multiply.map(equation => (
                                <p>{equation.operand1} * {equation.operand2} = {equation.result}</p>
                            )
                            )}
                        </div>
                        <div className="equation">
                            <h6>DIVISION</h6>
                            {day.div.map(equation => (
                                <p>{equation.operand1 > equation.operand2 ? equation.operand1 : equation.operand2}
                                    {` / `}   {equation.operand1 > equation.operand2 ? equation.operand2 : equation.operand1} = {equation.result}</p>
                            )
                            )}
                        </div>
                    </div>)

                )}
            </Fragment >
        );
    }
}

export default Reanimate;
