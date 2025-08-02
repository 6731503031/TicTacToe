window.addEventListener('DOMContentLoaded', () => {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const playerDisplay = document.querySelector('.display-player');
    const announcer = document.querySelector('.announcer');
    const userProfile = document.getElementById('user-profile');
    const userPicture = document.getElementById('user-picture');
    const userName = document.getElementById('user-name');
    const liffStatus = document.getElementById('liff-status');
    const loginButton = document.getElementById('login-button');
    const currentPlayerName = document.getElementById('current-player-name');
    const exitButton = document.getElementById('exit-button');
    const openWindowButton = document.getElementById('open-window-button');

    let board = ['', '', '', '', '', '', '', '', ''];
    let isPlayerTurn = true;
    let currentPlayer = 'X';
    let isGameActive = true;
    let difficulty = 'Hard';
    let liffInitialized = false;
    let userInfo = null;

    const PLAYERX_WON = 'PLAYERX_WON';
    const PLAYERO_WON = 'PLAYERO_WON';
    const TIE = 'TIE';

    const initializeLiff = async () => {
        try {
            // Replace 'YOUR_LIFF_ID' with your actual LIFF ID
            const liffId = '2007866055-KVkZeq0J'; // You need to replace this with your actual LIFF ID
            
            liffStatus.textContent = 'Initializing LIFF...';
            
            await liff.init({ liffId: liffId });
            liffInitialized = true;
            
            if (liff.isLoggedIn()) {
                await getUserProfile();
            } else {
                liffStatus.textContent = 'Please login to LINE';
                loginButton.classList.remove('hide');
                loginButton.addEventListener('click', () => {
                    liff.login();
                });
            }
        } catch (error) {
            console.error('LIFF initialization failed:', error);
            liffStatus.textContent = 'LIFF initialization failed. Playing as guest.';
            setTimeout(() => {
                liffStatus.style.display = 'none';
            }, 3000);
        }
    };

    // Get user profile from LIFF
    const getUserProfile = async () => {
        try {
            liffStatus.textContent = 'Getting user profile...';
            
            userInfo = await liff.getProfile();
            
            // Display user information
            userName.textContent = userInfo.displayName || 'LINE User';
            if (userInfo.pictureUrl) {
                userPicture.src = userInfo.pictureUrl;
                userPicture.style.display = 'block';
            }
            
            // Show user profile and hide status
            userProfile.classList.remove('hide');
            liffStatus.style.display = 'none';
            
            console.log('User profile:', userInfo);
        } catch (error) {
            console.error('Failed to get user profile:', error);
            liffStatus.textContent = 'Failed to get user profile. Playing as guest.';
            setTimeout(() => {
                liffStatus.style.display = 'none';
            }, 3000);
        }
    };

    // Initialize LIFF when page loads
    if (typeof liff !== 'undefined') {
        initializeLiff();
    } else {
        liffStatus.textContent = 'LIFF SDK not loaded. Playing as guest.';
        setTimeout(() => {
            liffStatus.style.display = 'none';
        }, 3000);
    }

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
        const playerName = userInfo?.displayName || 'Player';
        switch (type) {
            case PLAYERO_WON:
                announcer.innerText = `😵‍💫 ${playerName} Lose. 😵‍💫`;
                break;
            case PLAYERX_WON:
                announcer.innerText = `🎉 ${playerName} Win! 🎉`;
                break;
            case TIE:
                announcer.innerText = '🎭 It\'s a Tie! 🎭';
                break;
        }
        announcer.classList.remove('hide');
    };

    const isValidAction = (tile) => {
        if (tile.innerText === 'X' || tile.innerText === 'O') {
            return false;
        }

        return true;
    };

    const updateBoard = (index) => {
        board[index] = currentPlayer;
    }

    const changePlayer = () => {
        playerDisplay.classList.remove(`player${currentPlayer}`);
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        playerDisplay.innerText = currentPlayer;
        playerDisplay.classList.add(`player${currentPlayer}`);
        updateCurrentPlayerName();

        if (currentPlayer === 'O' && isGameActive) {
            setTimeout(aiMove, 500);}
    };

    const updateCurrentPlayerName = () => {
        if (currentPlayer === 'X') {
            currentPlayerName.innerText = userInfo?.displayName || 'Player';
        } else {
            currentPlayerName.innerText = 'AI';
        }
    };

    const aiMove = () => {
        if (!isGameActive) return;

        let moveIndex;

        if (difficulty === 'Easy') {
            const emptyIndexes = board
                .map((val, idx) => val === '' ? idx : null)
                .filter(idx => idx !== null);
            moveIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

        } else if (difficulty === 'Medium') {
            moveIndex = getMediumMove();
        } else if (difficulty === 'Hard') {
            moveIndex = minimax(board, 'O').index;
        }

        makeAIMove(moveIndex);
    };

    const getMediumMove = () => {
        // 1. Try to win
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            const values = [board[a], board[b], board[c]];
            if (values.filter(v => v === 'O').length === 2 && values.includes('')) {
                return condition[values.indexOf('')];
            }
        }

        // 2. Try to block player X
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            const values = [board[a], board[b], board[c]];
            if (values.filter(v => v === 'X').length === 2 && values.includes('')) {
                return condition[values.indexOf('')];
            }
        }

        // 3. Pick center
        if (board[4] === '') return 4;

        // 4. Pick a corner
        const corners = [0, 2, 6, 8].filter(i => board[i] === '');
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }

        // 5. Pick any empty
        const emptyIndexes = board
            .map((val, idx) => val === '' ? idx : null)
            .filter(idx => idx !== null);

        return emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    };

    const minimax = (newBoard, player) => {
        const availSpots = newBoard
            .map((val, i) => val === '' ? i : null)
            .filter(i => i !== null);

        // Check for terminal states
        if (checkWinner(newBoard, 'X')) {
            return { score: -10 };
        } else if (checkWinner(newBoard, 'O')) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];

        for (let i = 0; i < availSpots.length; i++) {
            const move = {};
            move.index = availSpots[i];

            newBoard[availSpots[i]] = player;

            if (player === 'O') {
                const result = minimax(newBoard, 'X');
                move.score = result.score;
            } else {
                const result = minimax(newBoard, 'O');
                move.score = result.score;
            }

            newBoard[availSpots[i]] = '';
            moves.push(move);
        }

        // Choose best move
        let bestMove;
        if (player === 'O') {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
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

    const checkWinner = (boardState, player) => {
        return winningConditions.some(condition => {
            return condition.every(index => boardState[index] === player);
        });
    };

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
        isPlayerTurn = true;
        isGameActive = true;
        announcer.classList.add('hide');

        if (currentPlayer === 'O') {
            changePlayer(); // Always start with X
        }

        updateCurrentPlayerName();

        tiles.forEach(tile => {
            tile.innerText = '';
            tile.classList.remove('playerX');
            tile.classList.remove('playerO');
        });
    };

    tiles.forEach((tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index));
    });


    updateCurrentPlayerName();

    const difficultySelect = document.querySelector('#difficulty-select');
    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
        resetBoard();
    });

    exitButton.addEventListener('click', () => {
        if (liffInitialized && liff.isInClient()) {
            liff.closeWindow();
        } else {
            // Fallback for when not in LINE app
            window.close();
        }
    });
    openWindowButton.addEventListener('click', () => {
        if (liffInitialized) {
            // Open a new window with a URL (you can change this URL as needed)
            const url = 'https://line.me';
            liff.openWindow({
                url: url,
                external: true
            });
        } else {
            // Fallback for when LIFF is not initialized
            window.open('https://line.me', '_blank');
        }
    });
});