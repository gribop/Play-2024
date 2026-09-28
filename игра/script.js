const gridContainer = document.querySelector('.grid-container');
const scoreDisplay = document.querySelector('#score');
const newGameButton = document.querySelector('#new-game');
const showScoresButton = document.querySelector('#show-scores');
const scoresModal = document.querySelector('#scores-modal');
const scoresList = document.querySelector('#scores-list');
const closeScoresButton = document.querySelector('#close-scores');

let grid = [];
let score = 0;

function initGame() {
    grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    score = 0;
    addRandomTile();
    addRandomTile();
    updateGrid();
}

function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) emptyCells.push({ r, c });
        }
    }

    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateGrid() {
    gridContainer.innerHTML = '';
    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('grid-cell');
            cellElement.textContent = cell === 0 ? '' : cell;
            cellElement.style.backgroundColor = getCellColor(cell);
            gridContainer.appendChild(cellElement);
        });
    });

    scoreDisplay.textContent = score;

    if (isGameOver()) {
        setTimeout(() => {
            alert(`Игра окончена! Ваши очки: ${score}`);
            handleGameOver();
        }, 100);
    }
}

function getCellColor(value) {
    const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f67c5f',
        128: '#f9f86e',
        256: '#f9f86e',
        512: '#edcf72',
        1024: '#edcc61',
        2048: '#edc53f'
    };
    return colors[value] || '#cdc1b4';
}

function isGameOver() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) return false;
            if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
            if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
        }
    }
    return true;
}

function move(direction) {
    const originalGrid = JSON.stringify(grid);
    let moved = false;

    switch (direction) {
        case 'left':
        case 'right':
            grid.forEach((row, r) => {
                grid[r] = slideRow(row, direction === 'right');
            });
            break;

        case 'up':
        case 'down':
            for (let c = 0; c < 4; c++) {
                const col = grid.map(row => row[c]);
                const newCol = slideRow(col, direction === 'down');
                for (let r = 0; r < 4; r++) {
                    grid[r][c] = newCol[r];
                }
            }
            break;
    }

    if (originalGrid !== JSON.stringify(grid)) {
        addRandomTile();
        moved = true;
    }

    updateGrid();
    return moved;
}

function slideRow(row, reverse = false) {
    const filtered = row.filter(val => val);
    if (reverse) filtered.reverse();

    for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
            filtered[i] *= 2;
            score += filtered[i];
            filtered.splice(i + 1, 1);
        }
    }

    while (filtered.length < 4) filtered.push(0);

    if (reverse) filtered.reverse();
    return filtered;
}

document.addEventListener('keydown', event => {
    const moves = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down'
    };

    if (moves[event.key]) {
        move(moves[event.key]);
    }
});

newGameButton.addEventListener('click', initGame);
showScoresButton.addEventListener('click', showScores);
closeScoresButton.addEventListener('click', () => scoresModal.style.display = 'none');

function showScores() {
    scoresList.innerHTML = '';
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.forEach(score => {
        const li = document.createElement('li');
        li.textContent = `${score.name} - ${score.score}`;
        scoresList.appendChild(li);
    });
    scoresModal.style.display = 'block';
}

function handleGameOver() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    if (scores.length < 10 || score > scores[scores.length - 1].score) {
        const name = prompt("Введите ваше имя:");
        if (name) {
            scores.push({ name, score });
            scores.sort((a, b) => b.score - a.score);
            if (scores.length > 10) scores.pop();
            localStorage.setItem('scores', JSON.stringify(scores));
        }
    }
}

initGame();