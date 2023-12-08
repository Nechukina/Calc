const display = document.querySelector('.calculator-screen');
const maximumInput = 7;
const maximumInputWithDecimal = 6;
const maximumOutput = 16;
const safeMaxNumb = Number.MAX_SAFE_INTEGER;

const calculator = {
    displayValue: '0',
    firstOperand: null,
    operator: null,
    waitingForSecondOperand: false,
    result: null,
};

const errorMessages = {
    maxLengthExceeded: 'Превышено максимальное количество введенных символов',
    decimalLengthExceeded: 'Значение после десятичной точки превысит максимально допустимую длину',
    decimalAlreadyPresent: 'В числе уже присутствует десятичная точка',
    divisionByZero: 'На ноль делить нельзя, попробуй другой делитель',
    missingOperation: 'Введите операцию',
    missingSecondOperand: 'Не введен второй операнд',
    largeNumber: 'Слишком большое число. Начнем сначала'
};

function inputDigit(digit) {

    const { displayValue, waitingForSecondOperand } = calculator;
    resetCalculatorResult();

    switch (true) {
        case waitingForSecondOperand:
            calculator.displayValue = digit;
            calculator.waitingForSecondOperand = false;
            break;
        case displayValue === '0':
            calculator.displayValue = digit;
            break;
        case displayValue.length >= maximumInput:
            alert(errorMessages.maxLengthExceeded);
            return;
        default:
            calculator.displayValue += digit;
            break;
    }

    updateDisplay();
}

function inputDecimal(dot) {

    const { displayValue, waitingForSecondOperand } = calculator;

    resetCalculatorResult();
    if (displayValue.length >= 6 && !waitingForSecondOperand) {
        alert(errorMessages.decimalLengthExceeded);
        return;
    } else if (displayValue.includes(dot) && !waitingForSecondOperand) {
        alert(errorMessages.decimalAlreadyPresent);
        return;
    }

    switch (true) {
        case calculator.waitingForSecondOperand:
            calculator.displayValue = '0.';
            calculator.waitingForSecondOperand = false;
            break;
        default:
            calculator.displayValue += dot;
            break;
    }

    updateDisplay();
}

function handleOperator(nextOperator) {
    const { firstOperand, displayValue, operator, waitingForSecondOperand, result } = calculator;
    let inputValue;
    if (result) {
        inputValue = parseFloat(result);
    } else {
        inputValue = parseFloat(displayValue);
    }


    switch (true) {
        case operator && waitingForSecondOperand:
            calculator.operator = nextOperator;
            return;
        case firstOperand === null:
            calculator.firstOperand = inputValue;
            calculator.displayValue = String(inputValue);
            break;
        default:
            const calcResult = doCalculation(operator, firstOperand, inputValue);
            if (calcResult === null) {
                return;
            }
            if (Math.abs(calcResult) > safeMaxNumb || calcResult.toString().length > maximumOutput) {
                alert(errorMessages.largeNumber);
                resetCalculator();
                return;
            }
            calculator.displayValue = String(calcResult);
            calculator.firstOperand = calcResult;
            break;
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
    updateDisplay();
}

function handleEqual() {
    const { firstOperand, displayValue, operator, waitingForSecondOperand } = calculator;
    const inputValue = parseFloat(displayValue);

    switch (true) {
        case firstOperand === null:
            alert(errorMessages.missingOperation);
            return;
        case operator !== null && waitingForSecondOperand:
            alert(errorMessages.missingSecondOperand);
            return;
        case firstOperand !== null:
            const result = doCalculation(operator, firstOperand, inputValue);
            if (result !== null) {
                if (Math.abs(result) > safeMaxNumb || result.toString().length > maximumOutput) {
                    alert(errorMessages.largeNumber);
                    resetCalculator();
                    return;
                }
                resetCalculator();
                calculator.result = String(result);
                updateDisplay();
                break;
            }
    }
}

function doCalculation(operator, firstOperand, secondOperand) {
    let result;
    if (operator === '/' && secondOperand === 0) {
        alert(errorMessages.divisionByZero);
        return null;
    }
    switch (operator) {
        case '+':
            result = firstOperand + secondOperand;
            break;
        case '-':
            result = firstOperand - secondOperand;
            break;
        case '*':
            result = firstOperand * secondOperand;
            break;
        case '/':
            result = firstOperand / secondOperand;
            break;
    }

    const decimalCount = (result.toString().split('.')[1] || '').length;
    if (decimalCount > 3) {
        result = result.toFixed(3);
    }

    return result;
}

function changeSign() {

    if (calculator.result) {
        calculator.result = (-parseFloat(calculator.result)).toString();
    } else {
        calculator.displayValue = (-parseFloat(calculator.displayValue)).toString();
    }
    updateDisplay();
}


function deleteLastSymbol() {
    let { displayValue, firstOperand, result } = calculator;
    if (result) {
        calculator.displayValue = result;
        displayValue = result;
        resetCalculatorResult();
    }
    calculator.displayValue = calculator.displayValue.slice(0, -1);
    if (!calculator.displayValue.length || calculator.displayValue === '-0' || calculator.displayValue === '-') {
        calculator.displayValue = '0';
    }
    if (firstOperand !== null) {
        calculator.firstOperand = Number(calculator.displayValue);
    }
    updateDisplay();
}

function resetCalculatorResult() {
    if (calculator.result) {
        calculator.result = null;
    }
}

function resetCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.operator = null;
    calculator.waitingForSecondOperand = false;
    calculator.result = null;
    updateDisplay();
}

function updateDisplay() {
    if (calculator.result) {
        display.value = calculator.result;
    } else {
        display.value = calculator.displayValue;
    }
}

document.querySelector('.calculator-buttons').addEventListener('click', (event) => {
    const { target } = event;

    switch (true) {
        case target.classList.contains('operator'):
            handleOperator(target.value);
            break;
        case target.classList.contains('decimal'):
            inputDecimal(target.value);
            break;
        case target.classList.contains('delete'):
            deleteLastSymbol();
            break;
        case target.classList.contains('all-clear'):
            resetCalculator();
            break;
        case target.classList.contains('equal'):
            handleEqual();
            break;
        case target.classList.contains('change-sign'):
            changeSign();
            break;
        case target.classList.contains('digit'):
            inputDigit(target.value);
            break;
    }
});

updateDisplay();
