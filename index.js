window.addEventListener('DOMContentLoaded', () => {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset');
    const announcer = document.querySelector('.announcer');

    let board = ['', '', '', '', '', '', '', '', ''];
    let isPlayerTurn = true;
    let currentPlayer = 'X';
    let isGameActive = true;
    let vsAI = true;

    const PLAYERX_WON = 'PLAYERX_WON';
    const PLAYERO_WON = 'PLAYERO_WON';
    const TIE = 'TIE';


    /*
        Indexes within the board
        [0] [1] [2]
        [3] [4] [5]
        [6] [7] [8]
    */

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            const a = board[winCondition[0]];
            const b = board[winCondition[1]];
            const c = board[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

    if (roundWon) {
            announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
            isGameActive = false;
            return;
        }

    if (!board.includes(''))
        announce(TIE);
    }

    const announce = (type) => {
        switch(type){
            case PLAYERO_WON:
                announcer.innerHTML = 'Player <span class="playerO">O</span> Won';
                break;
            case PLAYERX_WON:
                announcer.innerHTML = 'Player <span class="playerX">X</span> Won';
                break;
            case TIE:
                announcer.innerText = 'Tie';
        }
        announcer.classList.remove('hide');
    };

    const isValidAction = (tile) => {
        if (tile.innerText === 'X' || tile.innerText === 'O'){
            return false;
        }

        return true;
    };

    const updateBoard =  (index) => {
        board[index] = currentPlayer;
    }

    const changePlayer = () => {
    playerDisplay.classList.remove(`player${currentPlayer}`);
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    playerDisplay.innerText = currentPlayer;
    playerDisplay.classList.add(`player${currentPlayer}`);

    if (vsAI && currentPlayer === 'O' && isGameActive) {
        setTimeout(aiMove, 500);
    } else if (!vsAI) {
        isPlayerTurn = true; // allow next human player
    }
    };

    const aiMove = () => {
    if (!isGameActive) return;

    // 1. Try to win
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        const values = [board[a], board[b], board[c]];
        if (values.filter(v => v === 'O').length === 2 && values.includes('')) {
            const moveIndex = condition[values.indexOf('')];
            makeAIMove(moveIndex);
            return;
        }
    }

    // 2. Try to block player X from winning
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        const values = [board[a], board[b], board[c]];
        if (values.filter(v => v === 'X').length === 2 && values.includes('')) {
            const moveIndex = condition[values.indexOf('')];
            makeAIMove(moveIndex);
            return;
        }
    }

    // 3. Pick center if available
    if (board[4] === '') {
        makeAIMove(4);
        return;
    }

    // 4. Pick a corner if available
    const corners = [0, 2, 6, 8].filter(i => board[i] === '');
    if (corners.length > 0) {
        const moveIndex = corners[Math.floor(Math.random() * corners.length)];
        makeAIMove(moveIndex);
        return;
    }

    // 5. Pick any remaining empty tile
    const emptyIndexes = board
        .map((val, idx) => val === '' ? idx : null)
        .filter(idx => idx !== null);

    if (emptyIndexes.length > 0) {
        const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
        makeAIMove(randomIndex);
    }
    };

    const makeAIMove = (index) => {
    const tile = tiles[index];
    tile.innerText = currentPlayer;
    tile.classList.add(`player${currentPlayer}`);
    updateBoard(index);
    handleResultValidation();

    if (isGameActive) {
        isPlayerTurn = true;
        changePlayer();
    }
    };

    const userAction = (tile, index) => {
    if (!isPlayerTurn || !isValidAction(tile) || !isGameActive) return;

    tile.innerText = currentPlayer;
    tile.classList.add(`player${currentPlayer}`);
    updateBoard(index);
    handleResultValidation();

    if (isGameActive) {
        isPlayerTurn = false;  // Block player input until AI finishes
        changePlayer();
    }
};
    
   const resetBoard = () => {
    board = ['', '', '', '', '', '', '', '', ''];
    isPlayerTurn = true;
    isGameActive = true;
    announcer.classList.add('hide');

    if (currentPlayer === 'O') {
        changePlayer(); // Always start with X
    }

    if (!vsAI) {
        isPlayerTurn = true; // Allow first player
    }

    tiles.forEach(tile => {
        tile.innerText = '';
        tile.classList.remove('playerX');
        tile.classList.remove('playerO');
    });
    };

    tiles.forEach( (tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index));
    });

    resetButton.addEventListener('click', resetBoard);

    const toggleButton = document.querySelector('#toggle-mode');
        toggleButton.addEventListener('click', () => {
         vsAI = !vsAI;
         toggleButton.innerText = vsAI ? "Mode: Player vs AI" : "Mode: Player vs Player";
         resetBoard(); // Optional: restart game on mode change
    });
});