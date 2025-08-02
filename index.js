await liff.init({ liffId: "2007866055-KVkZeq0J" })

window.addEventListener('DOMContentLoaded', () => {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset');
    const announcer = document.querySelector('.announcer');
    const toggleButton = document.querySelector('#toggle-mode');
    const difficultySelect = document.querySelector('#difficulty-select');

    let board = ['', '', '', '', '', '', '', '', ''];
    let isPlayerTurn = true;
    let currentPlayer = 'X';
    let isGameActive = true;
    let vsAI = true;
    let difficulty = 'Hard';

    const PLAYERX_WON = 'PLAYERX_WON';
    const PLAYERO_WON = 'PLAYERO_WON';
    const TIE = 'TIE';

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
        for (const condition of winningConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
            isGameActive = false;
            return;
        }

        if (!board.includes('')) announce(TIE);
    }

    const announce = (type) => {
        if (vsAI) {
            switch (type) {
                case PLAYERO_WON:
                    announcer.innerText = '😵‍💫 Player Lose. 😵‍💫';
                    break;
                case PLAYERX_WON:
                    announcer.innerText = '🎉 Player Win! 🎉';
                    break;
                case TIE:
                    announcer.innerText = '🎭 It\'s a Tie! 🎭';
                    break;
            }
        } else {
            switch (type) {
                case PLAYERO_WON:
                    announcer.innerHTML = 'Player <span class="playerO">O</span> Won';
                    break;
                case PLAYERX_WON:
                    announcer.innerHTML = 'Player <span class="playerX">X</span> Won';
                    break;
                case TIE:
                    announcer.innerText = 'Tie';
                    break;
            }
        }

        announcer.classList.remove('hide');
    };

    const isValidAction = (tile) => tile.innerText === '';

    const updateBoard = index => board[index] = currentPlayer;

    const changePlayer = () => {
        playerDisplay.classList.remove(`player${currentPlayer}`);
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        playerDisplay.innerText = currentPlayer;
        playerDisplay.classList.add(`player${currentPlayer}`);

        if (vsAI && currentPlayer === 'O' && isGameActive) {
            setTimeout(aiMove, 500);
        } else if (!vsAI) {
            isPlayerTurn = true;
        }
    };

    const aiMove = () => {
        if (!isGameActive) return;

        let moveIndex;
        if (difficulty === 'Easy') {
            const empty = board.map((v, i) => v === '' ? i : null).filter(i => i !== null);
            moveIndex = empty[Math.floor(Math.random() * empty.length)];
        } else if (difficulty === 'Medium') {
            moveIndex = getMediumMove();
        } else if (difficulty === 'Hard') {
            moveIndex = minimax(board, 'O').index;
        }

        makeAIMove(moveIndex);
    };

    const getMediumMove = () => {
        for (const [a, b, c] of winningConditions) {
            const line = [board[a], board[b], board[c]];
            if (line.filter(v => v === 'O').length === 2 && line.includes('')) return [a, b, c][line.indexOf('')];
        }
        for (const [a, b, c] of winningConditions) {
            const line = [board[a], board[b], board[c]];
            if (line.filter(v => v === 'X').length === 2 && line.includes('')) return [a, b, c][line.indexOf('')];
        }
        if (board[4] === '') return 4;
        const corners = [0, 2, 6, 8].filter(i => board[i] === '');
        if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
        return board.map((v, i) => v === '' ? i : null).filter(i => i !== null)[0];
    };

    const minimax = (newBoard, player) => {
        const empty = newBoard.map((v, i) => v === '' ? i : null).filter(i => i !== null);

        if (checkWinner(newBoard, 'X')) return { score: -10 };
        if (checkWinner(newBoard, 'O')) return { score: 10 };
        if (!empty.length) return { score: 0 };

        const moves = empty.map(i => {
            const move = { index: i };
            newBoard[i] = player;
            const result = minimax(newBoard, player === 'O' ? 'X' : 'O');
            move.score = result.score;
            newBoard[i] = '';
            return move;
        });

        return player === 'O'
            ? moves.reduce((best, m) => m.score > best.score ? m : best)
            : moves.reduce((best, m) => m.score < best.score ? m : best);
    };

    const makeAIMove = index => {
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
            isPlayerTurn = false;
            changePlayer();
        }
    };

    const checkWinner = (boardState, player) => winningConditions.some(
        condition => condition.every(index => boardState[index] === player)
    );

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
        isPlayerTurn = true;
        isGameActive = true;
        announcer.classList.add('hide');
        if (currentPlayer === 'O') changePlayer();
        if (!vsAI) isPlayerTurn = true;
        tiles.forEach(tile => {
            tile.innerText = '';
            tile.classList.remove('playerX', 'playerO');
        });
    };

    tiles.forEach((tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index));
    });

    resetButton.addEventListener('click', resetBoard);

    toggleButton.addEventListener('click', () => {
        vsAI = !vsAI;
        toggleButton.innerText = vsAI ? "Mode: Player vs AI" : "Mode: Player vs Player";
        resetBoard();
    });

    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
        resetBoard();
    });
});
