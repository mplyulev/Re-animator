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

        let areEquationsTheSame = false;
        let isDivisionWithRemain = false;
        let isResultAboveTreshold = false;
        let isSomeOfTheOprandsTheSame = false;
        let isInvalid = false;

        if (x === y) {
            isInvalid = true;
        }

        if (operationType === MULTIPLICATION || operationType === DIVISION) {
            if (x === 1 || y === 1) {
                isInvalid = true;
            }
        }

        if (x === finalResult || y === finalResult) {
            isInvalid = true;
        }

        areEquationsTheSame = this.state.days.some(day => {
            day[operationType].some(equation => {
                const { operand1, operand2 } = equation;
                return (x === operand1 || x === operand2) && (y === operand1 || y === operand2);
            })
        });

        if (operationType === DIVISION && finalResult % 1 !== 0) {
            isDivisionWithRemain = true;
        }

        if ((operationType === MULTIPLICATION || operationType === ADDITION) && finalResult > availableNumbers) {
            isResultAboveTreshold = true;
        }

        const operationTypes = Object.values(day);

        isSomeOfTheOprandsTheSame = operationTypes.some(operationType => {
            return operationType.some(equation => {
                const { operand1, operand2, result } = equation;

                return x === operand1 || x === operand2 || x === result
                    || y === operand1 || y === operand2 || y === result || finalResult === result || finalResult === operand1 || finalResult === operand2
            })
        })

        if (!isInvalid && !isSomeOfTheOprandsTheSame && !isResultAboveTreshold && !isDivisionWithRemain && !areEquationsTheSame) {
            return { operand1: x, operand2: y, result: finalResult }
        } else {
            return this.generateEquation(day, availableNumbers, operationType);
        }
    }

    visualize = () => {

    }

    randomize = (days) => {
        let availableNumbers = 60;
        days.forEach((day, index) => {
            console.log(index);
            availableNumbers += 2;
            for (let i = 0; i < EQUATIONS_PER_DAY; i++) {
                let addition = this.generateEquation(day, availableNumbers, ADDITION);
                day[ADDITION].push(addition);
            }
            for (let i = 0; i < EQUATIONS_PER_DAY; i++) {
                let subtraction = this.generateEquation(day, availableNumbers, SUBTRACTION);
                day[SUBTRACTION].push(subtraction);
            }
            for (let i = 0; i < EQUATIONS_PER_DAY; i++) {
                let multiplication = this.generateEquation(day, availableNumbers, MULTIPLICATION);
                day[MULTIPLICATION].push(multiplication);
            }
            if (availableNumbers > 80) {
                console.log('division');
                for (let i = 0; i < EQUATIONS_PER_DAY; i++) {
                    let division = this.generateEquation(day, availableNumbers, DIVISION);
                    day[DIVISION].push(division);
                }
            }

        });

        this.setState({ days })
    }

    componentDidMount() {
        const days = []

        for (let i = 1; i <= 20; i++) {
            const day = { add: [], sub: [], div: [], multiply: [] }
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
                {days.map((day, index) => (
                    <div className="day">
                        <h5>DAY {index + 1}</h5>
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
