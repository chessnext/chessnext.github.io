// js/scripts.js

const knightEnemy = '♘';
const rookEnemy = '♖';
const bishopEnemy = '♗';
var numberOfEnemies;
var gameStarted = false;
var levelFinished = false;
var playerPosition = [-1,-1];
var movingTowards = [-1,-1];
const moveTime = 1;
//public event Action OnSpawn;
//public event Action OnPlayerWin;
//IEnumerator tryingCoroutine;
//IEnumerator subscribeCoroutine;
//IEnumerator subscribeCoroutine2;

const movesArray =[
        [1,0],
        [2,0],
        [3,0],
        [4,0],
        [5,0],
        [6,0],
        [7,0],

        [-1,0],
        [-2,0],
        [-3,0],
        [-4,0],
        [-5,0],
        [-6,0],
        [-7,0],
        
        [0,1],
        [0,2],
        [0,3],
        [0,4],
        [0,5],
        [0,6],
        [0,7],
        
        [0,-1],
        [0,-2],
        [0,-3],
        [0,-4],
        [0,-5],
        [0,-6],
        [0,-7],

        [1,1],
        [2,2],
        [3,3],
        [4,4],
        [5,5],
        [6,6],
        [7,7],

        [-1,-1],
        [-2,-2],
        [-3,-3],
        [-4,-4],
        [-5,-5],
        [-6,-6],
        [-7,-7],

        [-1,1],
        [-2,2],
        [-3,3],
        [-4,4],
        [-5,5],
        [-6,6],
        [-7,7],

        [1,-1],
        [2,-2],
        [3,-3],
        [4,-4],
        [5,-5],
        [6,-6],
        [7,-7]
];

document.addEventListener('DOMContentLoaded', function() {
    
    const chessboard = document.getElementById('chessboard');
   chessboard.addEventListener('click', (event) => {
        const clickedCell = event.target;

        // Check if the clicked element is a square
        if (clickedCell.classList.contains('square')) {
            var clickedCoordinate = JSON.parse(clickedCell.id);
            if (moveIsValid(clickedCoordinate))
           makeMove(clickedCoordinate);
        }
  });
});

document.getElementById('startmessage').addEventListener('click', function() {
    gameStarted = true;
    levelFinished = false;

    this.style.zIndex = '-10';
    
    alert('Click to move player! Queen moves are valid.');
    
    initializePlayer();

    //initializeEnemySpawn();
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initializePlayer(){
    const player = document.getElementById('player');

    let spawnPosition = [getRandomInt(0,7),getRandomInt(0,7)];
    
    makeMove(spawnPosition);
    
    player.style.zIndex = 10;
}

function makeMove(movePosition){
    let idString = '['+movePosition[0]+','+movePosition[1]+']';
    let targetDiv = document.getElementById(idString);
    let parentDiv = document.getElementById('chessboard');

    let rect = targetDiv.getBoundingClientRect(idString);
    let computedStyle = window.getComputedStyle(targetDiv);
    let parentrect = parentDiv.getBoundingClientRect(parentDiv);

    let targetX = rect.x - parentrect.x + rect.width / 2 - 18;
    let targetY = rect.y - parentrect.y + rect.height / 2 - 25;

    playerPosition = movePosition;
    player.style.top = `${targetY}px`;
    player.style.left = `${targetX}px`;
    
}

function moveIsValid(moveTo) { let validMoves = []; for (let i = 0; i < movesArray.length; i++) { const newMove = [playerPosition[0] + movesArray[i][0], playerPosition[1] + movesArray[i][1]]; validMoves.push(newMove); } console.log("Valid Moves:", validMoves); console.log("Move To:", moveTo); const isValid = validMoves.some(vm => vm[0] === moveTo[0] && vm[1] === moveTo[1]); if (isValid) { console.log("Move is valid."); return true; } else { console.log("Move is not valid."); return false; } }