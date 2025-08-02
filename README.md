# TicTacToe
MiniGame with LINE LIFF Integration

## Setup Instructions

### LIFF Configuration
1. Create a LIFF app in your LINE Developers Console
2. Get your LIFF ID from the console
3. Replace `'YOUR_LIFF_ID'` in `index.js` with your actual LIFF ID

### Features
- Tic-Tac-Toe game with AI opponent
- Multiple difficulty levels (Easy, Medium, Hard)
- Player vs Player mode
- LINE user authentication and profile display
- User's display name and profile picture integration

### Usage
1. Open the app in LINE browser or LIFF-enabled environment
2. The app will automatically initialize LIFF and fetch user profile
3. User's name and profile picture will be displayed at the top
4. Play Tic-Tac-Toe with customizable settings

### LIFF Features Implemented
- User profile fetching (`liff.getProfile()`)
- User display name display
- User profile picture display
- Authentication status handling
- Error handling for LIFF initialization
