
const gameBoard = document.querySelector('.p');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const buttons = document.querySelectorAll('.numbers');
const enterButton = document.querySelector('.equals');
const clearButton = document.querySelector('.clear');
const resultDisplay = document.querySelector('.result span');

let dropInterval = 2000; 
let fallSpeed = 25; // السرعة بالسبيكسل لكل إطار
let playerLives = 3;
let score = 0;
let drops = [];

const lanes = [0, 1, 2, 3, 4];

function createEquation() {
    let num1, num2, operator, result;
    do {
        num1 = Math.floor(Math.random() * 10) + 1;  
        num2 = Math.floor(Math.random() * 10) + 1;

        const operators = ['+', '-', '*', '/'];
        operator = operators[Math.floor(Math.random() * operators.length)];

        if (operator === '/') {
           
            while (num1 % num2 !== 0) {
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
            }
        }

        result = eval(`${num1} ${operator} ${num2}`);
    } while (result < 0 || !Number.isInteger(result)); 

    return {
        equation: `${num1} ${operator} ${num2}`,
        answer: result
    };
}


function createDrop() {
    const drop = document.createElement('div');
    drop.className = 'drop';
    const equationObj = createEquation();
    drop.textContent = equationObj.equation;
    drop.dataset.answer = equationObj.answer;

    // تحديد مسار القطرة
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const laneWidth = gameBoard.offsetWidth / lanes.length;
    drop.style.left = `${lane * laneWidth}px`;

    gameBoard.appendChild(drop);
    drops.push(drop);
}

// function moveDrops() {
//     drops.forEach((drop, index) => {
//         let top = parseInt(window.getComputedStyle(drop).getPropertyValue('top'));
//         drop.style.top = `${top + fallSpeed}px`;

//         if (top >= gameBoard.offsetHeight - 50) {
//             removeDrop(drop);
//             loseLife();
//         }
//     });
// }

let lastTime = 0;

function moveDrops(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    drops.forEach((drop) => {
        let top = parseFloat(drop.style.top) || 0;

        drop.style.top = `${top + (fallSpeed * deltaTime) / 1000}px`;

        if (top >= gameBoard.offsetHeight ) {
            removeDrop(drop);
            loseLife();
        }
    });

    // استدعاء هذه الدالة مرة أخرى لإطارات الحركة التالية
    requestAnimationFrame(moveDrops);
}

// بدء الحركة بإطار الحركة الأول
requestAnimationFrame(moveDrops);

function checkAnswer() {
    const answer = parseInt(resultDisplay.textContent);
    const dropIndex = drops.findIndex(drop => parseInt(drop.dataset.answer) === answer);

    if (dropIndex !== -1) {
        score++;
        scoreElement.textContent = `Score: ${score}`;
        removeDrop(drops[dropIndex]);
        resultDisplay.textContent = '0';
    } else {
        resultDisplay.textContent = '0'; 
    }
}

function removeDrop(drop) {
    gameBoard.removeChild(drop);
    drops = drops.filter(d => d !== drop);
}

function loseLife() {
    playerLives--;
    livesElement.textContent = `Lives: ${playerLives}`;
    clearAllDrops();
    if (playerLives === 0) {
        endGame();
    } else {
        setTimeout(createDrop, dropInterval);
    }
}

function clearAllDrops() {
    drops.forEach(drop => gameBoard.removeChild(drop));
    drops = [];
}

function endGame() {
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
    localStorage.setItem('mathGameScore', score);
    resetGame();
}

function resetGame() {
    drops.forEach(drop => gameBoard.removeChild(drop));
    drops = [];
    score = 0;
    playerLives = 3;
    scoreElement.textContent = `Score: ${score}`;
    livesElement.textContent = `Lives: ${playerLives}`;
}

buttons.forEach(button => {
    button.addEventListener('click', () => {
        if (resultDisplay.textContent === '0') {
            resultDisplay.textContent = button.value;
        } else {
            resultDisplay.textContent += button.value;
        }
    });
});

clearButton.addEventListener('click', () => {
    resultDisplay.textContent = '0';
});

enterButton.addEventListener('click', checkAnswer);

// التعامل مع إدخالات لوحة المفاتيح
document.addEventListener('keydown', (event) => {
    if (!isNaN(event.key)) {
        if (resultDisplay.textContent === '0') {
            resultDisplay.textContent = event.key;
        } else {
            resultDisplay.textContent += event.key;
        }
    } else if (event.key === 'Enter') {
        checkAnswer();
    } else if (event.key === 'Backspace') {
        resultDisplay.textContent = '0';
    }
});

const gameInterval = setInterval(() => {
    createDrop();
    moveDrops();
}, dropInterval);
