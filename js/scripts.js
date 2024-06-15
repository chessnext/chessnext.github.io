// js/scripts.js

const knightEnemy = '♘';
const rookEnemy = '♖';
const bishopEnemy = '♗';
var numberOfEnemies;
var gameStarted = false;
var levelFinished = false;
//public event Action OnSpawn;
//public event Action OnPlayerWin;
//IEnumerator tryingCoroutine;
//IEnumerator subscribeCoroutine;
//IEnumerator subscribeCoroutine2;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Document is ready!');
});

document.getElementById('startmessage').addEventListener('click', function() {
    gameStarted = true;
    levelFinished = false;

    this.style.zIndex = '-10';

    alert('Initializing Player on a random position.');
    initializePlayer();

    //initializeEnemySpawn();
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initializePlayer(){
    const player = document.getElementById('player');

    let spawnPosition = {x: getRandomInt(0,7), y: getRandomInt(0,7)};
    let idString = `[${spawnPosition.x},${spawnPosition.y}]`;
    let targetDiv = document.getElementById(idString);
    let parentDiv = document.getElementById('chessboard');

    let rect = targetDiv.getBoundingClientRect(idString);
    let computedStyle = window.getComputedStyle(targetDiv);
    let parentrect = targetDiv.getBoundingClientRect(parentDiv);

    let targetX = rect.left + rect.width / 2 - 36 - 2;
    let targetY = rect.top + rect.height / 2 - 28 - parentrect.top;

    player.style.top = `${targetY}px`;
    player.style.left = `${targetX}px`;
    player.style.zIndex = 10;
}
