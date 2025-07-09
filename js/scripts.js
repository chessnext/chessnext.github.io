// js/scripts.js

var currentLevel = 1;
const knightEnemy = '♘';
const rookEnemy = '♖';
const bishopEnemy = '♗';
var enemyType = "Knight";
var gameStarted = false;
var levelFinished = false;
var playerPosition = [-1,-1];
var playerSpawnPosition = [-1,-1];
var playerDead = false;
const moveTime = 1;
//public event Action OnSpawn;
//public event Action OnPlayerWin;
//IEnumerator tryingCoroutine;
//IEnumerator subscribeCoroutine;
//IEnumerator subscribeCoroutine2;

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static get back() {
        return new Vector2(0, -1);
    }

    static get invalidMove() {
        return new Vector2(-1, -1);
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    equals(v) {
        return this.x === v.x && this.y === v.y;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

class Node {
  constructor(position, gCost, hCost, parent = null) {
    this.position = position; // {x, y}
    this.gCost = gCost; // távolság kezdettől
    this.hCost = hCost; // heuristics (becsült távolság a célhoz)
    this.parent = parent;
  }

  get fCost() {
    return this.gCost + this.hCost;
  }
}

// Segédfüggvények
function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function getDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan távolság
}

function isOnBoard(pos) {
  return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
}

// Például Knight, Rook, Bishop típusokra egyszerű heuristikák
function getHCostKnight(target, start) {
  // Érvényes pozíciók ellenőrzése
  
  if (
    start.x < 0 || start.x > 7 || start.y < 0 || start.y > 7 ||
    target.x < 0 || target.x > 7 || target.y < 0 || target.y > 7
  ) {
    console.warn("getHCostKnight: Érvénytelen pozíció!", start, target);
    return 1000; // Nagy érték ha hibás input
   
  }
 
  try {
    const cost = moveCountsKnight[start.x][start.y][target.x][target.y];
    if (typeof cost !== "number" || isNaN(cost)) {
      throw new Error("Érvénytelen érték a tömbben");
    }
    return cost;
  } catch (e) {
    console.error("getHCostKnight: Hiba a tömb indexelésénél:", e, start, target);
    return 1000;
  }
}

function getHCostRook(target, start) {
  // Rook vízszintes/függőleges
  return Math.abs(target.x - start.x) + Math.abs(target.y - start.y);
}

function getHCostBishop(target, start) {
  // Bishop átlós mozgás: max abszolút különbség x és y között
  return Math.abs(target.x - start.x) === Math.abs(target.y - start.y)
    ? Math.abs(target.x - start.x)
    : 1000; // nagy érték ha nem átlós
}

// GetNeighbours egyszerűen 8 irányban (vagy tetszőlegesen testre szabható)
function getNeighbours(current, enemyType) {
  const directions = [];
  switch (enemyType) {
    case "Knight":
      // Knight lépések
      directions.push(
        { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: -1 }, { x: 1, y: -2 },
        { x: -1, y: -2 }, { x: -2, y: -1 }, { x: -2, y: 1 }, { x: -1, y: 2 }
      );
      break;
    case "Rook":
      // Vízszintes és függőleges lépések (1 mező)
      directions.push(
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
      );
      break;
    case "Bishop":
      // Átlós lépések (1 mező)
      directions.push(
        { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
      );
      break;
    default:
      // Alap 4 irány
      directions.push(
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
      );
      break;
  }

  const neighbours = [];
  for (const dir of directions) {
    const newPos = { x: current.position.x + dir.x, y: current.position.y + dir.y };
    if (isOnBoard(newPos)) {
      neighbours.push(new Node(newPos, 0, 0, current));
    }
  }
  return neighbours;
}

function nodeLowestFCost(nodes) {
  let lowest = nodes[0];
  for (const node of nodes) {
    if (node.fCost < lowest.fCost || (node.fCost === lowest.fCost && node.hCost < lowest.hCost)) {
      lowest = node;
    }
  }
  return lowest;
}

function getNodeByPosition(list, pos) {
  return list.find(node => positionsEqual(node.position, pos));
}

function getFirstMove(startNode, endNode) {
  let current = endNode;
  let prev = null;

  while (current !== startNode) {
    prev = current;
    current = current.parent;
  }

  return prev ? prev.position : startNode.position;
}

// InvalidMove konstans
const invalidMove = null;

// Az Enemy osztály része lehet a következő metódus:


// Példa használat:
//const enemyType = "Knight";
//const startPos = { x: 0, y: 0 };
//const targetPos = { x: 4, y: 5 };

//const firstStep = findMoveAStar(enemyType, //startPos, targetPos);

//console.log("First move towards target:", firstStep);



class Enemy {
    constructor() {
    this.dead=true;
        this.position = new Vector2();
        this.enemyType = "Knight";
        this.paralyzed = false;
        this.movingTowards = Vector2.invalidMove;
        this.spawnPosition = new Vector2();
        this.rotation = Vector2.back;
        this.timer = 1;

        this.ProgressBar = null;
        this.projectile = null;
        this.initProjectile = null;

        // Event listeners
        this.onAttackListeners = [];
        this.onDeathListeners = [];
        this.onHitListeners = [];
        this.onMoveListeners = [];

        // Async placeholder methods simulating coroutines
        this.moveCoroutine = null;
        this.subscribeCoroutine = null;
        this.subscribeCoroutine2 = null;
        this.flyInCoroutine = null;
        this.flyOutCoroutine = null;
        this.attackAnimated = null;
    }
    
    die() {
    this.dead = true;
    
    if (this.domElement) {
        this.domElement.style.zIndex = '-10';
        this.domElement.style.opacity = '0.2'; // vagy display = 'none'
        // opcionálisan: this.domElement.remove(); teljes törléshez
    }

    this.position.x = -10;
    this.position.y = -10;
}

    
    makeEnemyMove(movePosition){
    let idString = '['+movePosition[0]+','+movePosition[1]+']';
    let targetDiv = document.getElementById(idString);
    let parentDiv = document.getElementById('chessboard');

    let rect = targetDiv.getBoundingClientRect(idString);
    let computedStyle = window.getComputedStyle(targetDiv);
    let parentrect = parentDiv.getBoundingClientRect(parentDiv);

    let targetX = rect.x - parentrect.x + rect.width / 2 - 18;
    let targetY = rect.y - parentrect.y + rect.height / 2 - 25;

    this.position.x = movePosition[0];
    this.position.y = movePosition[1];
    this.domElement.style.top = `${targetY}px`;
    this.domElement.style.left = `${targetX}px`;
    
}

    
      async waitAndMove() {
    let i=0;
    while (i<500) {

      this.timer = Math.random() * 2 + 1;
      
      // Várakozás a timer idejéigb
      await new Promise(resolve => setTimeout(resolve, this.timer*1000));
      
      let b;
      
      b = this.findMoveAStar(enemyType,this.position,new Vector2(playerPosition[0],playerPosition[1]));
    
      let temp = [b.x,b.y]
      
      this.makeEnemyMove(temp);
      if (temp[0]==playerPosition[0] && temp[1]==playerPosition[1])
      {
      //todo
      if (!checkLevelEnd() && !this.dead){
         alert("Game Over");
         playerDies();
        }
      }
      
      i++;
      
}

function playerDies(){
     const params = new URLSearchParams(window.location.search);
    const currentLevel = parseInt(params.get('level'));
    const safeLevel = !isNaN(currentLevel) && currentLevel > 0 ? currentLevel : 1;
    const nextLevel = 1;

    const newUrl = `${window.location.origin}${window.location.pathname}?level=${nextLevel}`;
    window.location.href = newUrl;
}
    
}
    static get moveTime() {
        return 1.0;
    }

    // Event subscription methods
    onAttack(callback) {
        this.onAttackListeners.push(callback);
    }

    onDeath(callback) {
        this.onDeathListeners.push(callback);
    }

    onHit(callback) {
        this.onHitListeners.push(callback);
    }

    onMove(callback) {
        this.onMoveListeners.push(callback);
    }

    // Event trigger methods
    triggerAttack() {
        this.onAttackListeners.forEach(cb => cb());
    }

    triggerDeath() {
        this.onDeathListeners.forEach(cb => cb());
    }

    triggerHit(position) {
        this.onHitListeners.forEach(cb => cb(position));
    }

    triggerMove(position) {
        this.onMoveListeners.forEach(cb => cb(position));
    }
    
  
  
findMoveAStar(enemyType, startPos, targetPos) {
  

  // Koordinátaellenőrzés
  if (
    startPos.x > 7 || startPos.y > 7 || startPos.x < 0 || startPos.y < 0 ||
    targetPos.x > 7 || targetPos.y > 7 || targetPos.x < 0 || targetPos.y < 0
  ) {
    
    return invalidMove;
  }

  let open = [];
  let closed = [];

  // Kezdő node létrehozása megfelelő heuristikával
  switch (enemyType) {
    case "Knight": {
      
      const hCost = getHCostKnight(targetPos, startPos);
      open.push(new Node(startPos, 0, hCost));
      break;
    }
    case "Rook": {
      open.push(new Node(startPos, 0, getHCostRook(targetPos, startPos)));
      break;
    }
    case "Bishop": {
      open.push(new Node(startPos, 0, getHCostBishop(targetPos, startPos)));
      break;
    }
    default: {
      open.push(new Node(startPos, 0, getHCostRook(targetPos, startPos)));
      break;
    }
  }

  // A* fő ciklus
  while (open.length > 0) {
    let current = nodeLowestFCost(open);
    open = open.filter(n => n !== current); // eltávolítás
    closed.push(current);

    // Ha elértük a célt, visszatérünk az első lépéssel
    if (positionsEqual(current.position, targetPos)) {
      let startNode = getNodeByPosition(closed, startPos);
      let endNode = getNodeByPosition(closed, targetPos);
      const result = getFirstMove(startNode, endNode);
      
      return result;
    }

    // Szomszédok bejárása
    let neighbours = getNeighbours(current, enemyType);
    for (let neighbour of neighbours) {
      if (
        closed.some(c => positionsEqual(c.position, neighbour.position)) ||
        !isOnBoard(neighbour.position)
      ) continue;

      let tentativeGCost = current.gCost + 1;

      let openNode = getNodeByPosition(open, neighbour.position);
      let heuristicFunc = enemyType === "Knight" ? getHCostKnight :
                          enemyType === "Rook"   ? getHCostRook :
                          getHCostBishop;

      if (openNode) {
        if (tentativeGCost < openNode.gCost) {
          openNode.gCost = tentativeGCost;
          openNode.hCost = heuristicFunc(targetPos, neighbour.position);
          openNode.parent = current;
        }
      } else {
        neighbour.gCost = tentativeGCost;
        neighbour.hCost = heuristicFunc(targetPos, neighbour.position);
        neighbour.parent = current;
        open.push(neighbour);
      }
    }
  }

  
  return invalidMove;
}

  
randomMove() {
    const directions = [
        { x: 1, y: 2 },  
        { x: 2, y: 1},  
        { x: -2, y: 1 }, 
        { x: 1, y: -2}, 
        { x: -1, y: -2},  
        { x: 2, y: -1},  
        { x: -2, y: -1 },
        { x: -1, y: 2}
    ];

    const validMoves = directions
        .map(dir => ({
            x: this.position.x + dir.x,
            y: this.position.y + dir.y
        }))
        .filter(pos => pos.x >= 0 && pos.x <= 7 && pos.y >= 0 && pos.y <= 7);

    if (validMoves.length === 0) {
        return { x: this.position.x, y: this.position.y };
    }

    const chosen = validMoves[Math.floor(Math.random() * validMoves.length)];
    return chosen;
}

  isPositionTaken(pos) {
    // Ellenőrizd, hogy a pozíció foglalt-e
    return false; // pl. nincs akadály
  }

  isPlayerInAttackRange(pos, player) {
    return (
      (pos.x === player.position.x && pos.z === player.position.z) ||
      (pos.x === player.movingTowards.x && pos.z === player.movingTowards.z)
    );
  }

  onHit(pos, player) {
    if (!player.dead) {
      console.log("Hit player at", pos);
   }
}

}

const movesKnight = [
    [1,2],
    [-1,2],
    [2,1],
    [-2,1],
    [1,-2],
    [-1,-2],
    [2,-1],
    [-2,-1]
];

const movesRook = [ [ 1, 0, 0], [ 2, 0, 0], [ 3, 0, 0], [ 4, 0, 0], [ 5, 0, 0], [ 6, 0, 0], [ 7, 0, 0], [-1, 0, 0], [-2, 0, 0], [-3, 0, 0], [-4, 0, 0], [-5, 0, 0], [-6, 0, 0], [-7, 0, 0], [ 0, 0, 1], [ 0, 0, 2], [ 0, 0, 3], [ 0, 0, 4], [ 0, 0, 5], [ 0, 0, 6], [ 0, 0, 7], [ 0, 0, -1], [ 0, 0, -2], [ 0, 0, -3], [ 0, 0, -4], [ 0, 0, -5], [ 0, 0, -6], [ 0, 0, -7] ];

const movesBishop = [
    [ 1,  1],
    [ 2,  2],
    [ 3,  3],
    [ 4,  4],
    [ 5,  5],
    [ 6,  6],
    [ 7,  7],

    [-1, -1],
    [-2, -2],
    [-3, -3],
    [-4, -4],
    [-5, -5],
    [-6, -6],
    [-7, -7],

    [-1,  1],
    [-2,  2],
    [-3,  3],
    [-4,  4],
    [-5,  5],
    [-6,  6],
    [-7,  7],

    [ 1, -1],
    [ 2, -2],
    [ 3, -3],
    [ 4, -4],
    [ 5, -5],
    [ 6, -6],
    [ 7, -7]
];

const moveCountsKnightRaw =
    [
        [
            [[0,3,2,3,2,3,4,5],[3,4,1,2,3,4,3,4],[2,1,4,3,2,3,4,5],[3,2,3,2,3,4,3,4],[2,3,2,3,4,3,4,5],[3,4,3,4,3,4,5,4],[4,3,4,3,4,5,4,5],[5,4,5,4,5,4,5,6]],
            [[3,0,3,2,3,2,3,4],[2,3,2,1,2,3,4,3],[1,2,1,4,3,2,3,4],[2,3,2,3,2,3,4,3],[3,2,3,2,3,4,3,4],[4,3,4,3,4,3,4,5],[3,4,3,4,3,4,5,4],[4,5,4,5,4,5,4,5]],
            [[2,3,0,3,2,3,2,3],[1,2,3,2,1,2,3,4],[4,1,2,1,4,3,2,3],[3,2,3,2,3,2,3,4],[2,3,2,3,2,3,4,3],[3,4,3,4,3,4,3,4],[4,3,4,3,4,3,4,5],[5,4,5,4,5,4,5,4]],
            [[3,2,3,0,3,2,3,2],[2,1,2,3,2,1,2,3],[3,4,1,2,1,4,3,2],[2,3,2,3,2,3,2,3],[3,2,3,2,3,2,3,4],[4,3,4,3,4,3,4,3],[3,4,3,4,3,4,3,4],[4,5,4,5,4,5,4,5]],
            [[2,3,2,3,0,3,2,3],[3,2,1,2,3,2,1,2],[2,3,4,1,2,1,4,3],[3,2,3,2,3,2,3,2],[4,3,2,3,2,3,2,3],[3,4,3,4,3,4,3,4],[4,3,4,3,4,3,4,3],[5,4,5,4,5,4,5,4]],
            [[3,2,3,2,3,0,3,2],[4,3,2,1,2,3,2,1],[3,2,3,4,1,2,1,4],[4,3,2,3,2,3,2,3],[3,4,3,2,3,2,3,2],[4,3,4,3,4,3,4,3],[5,4,3,4,3,4,3,4],[4,5,4,5,4,5,4,5]],
            [[4,3,2,3,2,3,0,3],[3,4,3,2,1,2,3,2],[4,3,2,3,4,1,2,1],[3,4,3,2,3,2,3,2],[4,3,4,3,2,3,2,3],[5,4,3,4,3,4,3,4],[4,5,4,3,4,3,4,3],[5,4,5,4,5,4,5,4]],
            [[5,4,3,2,3,2,3,0],[4,3,4,3,2,1,4,3],[5,4,3,2,3,4,1,2],[4,3,4,3,2,3,2,3],[5,4,3,4,3,2,3,2],[4,5,4,3,4,3,4,3],[5,4,5,4,3,4,3,4],[6,5,4,5,4,5,4,5]]
        ],
        [
            [[3,2,1,2,3,4,3,4],[0,3,2,3,2,3,4,5],[3,2,1,2,3,4,3,4],[2,1,4,3,2,3,4,5],[3,2,3,2,3,4,3,4],[2,3,2,3,4,3,4,5],[3,4,3,4,3,4,5,4],[4,3,4,3,4,5,4,5]],
            [[4,3,2,1,2,3,4,3],[3,0,3,2,3,2,3,4],[2,3,2,1,2,3,4,3],[1,2,1,4,3,2,3,4],[2,3,2,3,2,3,4,3],[3,2,3,2,3,4,3,4],[4,3,4,3,4,3,4,5],[3,4,3,4,3,4,5,4]],
            [[1,2,3,2,1,2,3,4],[2,3,0,3,2,3,2,3],[1,2,3,2,1,2,3,4],[4,1,2,1,4,3,2,3],[3,2,3,2,3,2,3,4],[2,3,2,3,2,3,4,3],[3,4,3,4,3,4,3,4],[4,3,4,3,4,3,4,5]],
            [[2,1,2,3,2,1,2,3],[3,2,3,0,3,2,3,2],[2,1,2,3,2,1,2,3],[3,4,1,2,1,4,3,2],[2,3,2,3,2,3,2,3],[3,2,3,2,3,2,3,4],[4,3,4,3,4,3,4,3],[3,4,3,4,3,4,3,4]],
            [[3,2,1,2,3,2,1,2],[2,3,2,3,0,3,2,3],[3,2,1,2,3,2,1,2],[2,3,4,1,2,1,4,3],[3,2,3,2,3,2,3,2],[4,3,2,3,2,3,2,3],[3,4,3,4,3,4,3,4],[4,3,4,3,4,3,4,3]],
            [[4,3,2,1,2,3,2,1],[3,2,3,2,3,0,3,2],[4,3,2,1,2,3,2,1],[3,2,3,4,1,2,1,4],[4,3,2,3,2,3,2,3],[3,4,3,2,3,2,3,2],[4,3,4,3,4,3,4,3],[5,4,3,4,3,4,3,4]],
            [[3,4,3,2,1,2,3,4],[4,3,2,3,2,3,0,3],[3,4,3,2,1,2,3,2],[4,3,2,3,4,1,2,1],[3,4,3,2,3,2,3,2],[4,3,4,3,2,3,2,3],[5,4,3,4,3,4,3,4],[4,5,4,3,4,3,4,3]],
            [[4,3,4,3,2,1,2,3],[5,4,3,2,3,2,3,0],[4,3,4,3,2,1,2,3],[5,4,3,2,3,4,1,2],[4,3,4,3,2,3,2,3],[5,4,3,4,3,2,3,2],[4,5,4,3,4,3,4,3],[5,4,5,4,3,4,3,4]]
        ],
        [
            [[2,1,4,3,2,3,4,5],[3,2,1,2,3,4,3,4],[0,3,2,3,2,3,4,5],[3,2,1,2,3,4,3,4],[2,1,4,3,2,3,4,5],[3,2,3,2,3,4,3,4],[2,3,2,3,4,3,4,5],[3,4,3,4,3,4,5,4]],
            [[1,2,1,4,3,2,3,4],[2,3,2,1,2,3,4,3],[3,0,3,2,3,2,3,4],[2,3,2,1,2,3,4,3],[1,2,1,4,3,2,3,4],[2,3,2,3,2,3,4,3],[3,2,3,2,3,4,3,4],[4,3,4,3,4,3,4,5]],
            [[4,1,2,1,4,3,2,3],[1,2,3,2,1,2,3,4],[2,3,0,3,2,3,2,3],[1,2,3,2,1,2,3,4],[4,1,2,1,4,3,2,3],[3,2,3,2,3,2,3,4],[2,3,2,3,2,3,4,3],[3,4,3,4,3,4,3,4]],
            [[3,4,1,2,1,4,3,2],[2,1,2,3,2,1,2,3],[3,2,3,0,3,2,3,2],[2,1,2,3,2,1,2,3],[3,4,1,2,1,4,3,2],[2,3,2,3,2,3,2,3],[3,2,3,2,3,2,3,4],[4,3,4,3,4,3,4,3]],
            [[2,3,4,1,2,1,4,3],[3,2,1,2,3,2,1,2],[2,3,2,3,0,3,2,3],[3,2,1,2,3,2,1,2],[2,3,4,1,2,1,4,3],[3,2,3,2,3,2,3,2],[4,3,2,3,2,3,2,3],[3,4,3,4,3,4,3,4]],
            [[3,2,3,4,1,2,1,4],[4,3,2,1,2,3,2,1],[3,2,3,2,3,0,3,2],[4,3,2,1,2,3,2,1],[3,2,3,4,1,2,1,4],[4,3,2,3,2,3,2,3],[3,4,3,2,3,2,3,2],[4,3,4,3,4,3,4,3]],
            [[4,3,2,3,4,1,2,1],[3,4,3,2,1,2,3,2],[4,3,2,3,2,3,0,3],[3,4,3,2,1,2,3,2],[4,3,2,3,4,1,2,1],[3,4,3,2,3,2,3,2],[4,3,4,3,2,3,2,3],[5,4,3,4,3,4,3,4]],
            [[5,4,3,2,3,4,1,2],[4,3,4,3,2,1,2,3],[5,4,3,2,3,2,3,0],[4,3,4,3,2,1,2,3],[5,4,3,2,3,4,1,2],[4,3,4,3,2,3,2,3],[5,4,3,4,3,2,3,2],[4,5,4,3,4,3,4,3]]
        ],
        [
            [[3,2,3,2,3,4,3,4],[2,1,4,3,2,3,4,5],[3,2,1,2,3,4,3,4],[0,3,2,3,2,3,4,5],[3,2,1,2,3,4,3,4],[2,1,4,3,2,3,4,5],[3,2,3,2,3,4,3,4],[2,3,2,3,4,3,4,5]],
            [[2,3,2,3,2,3,4,3],[1,2,1,4,3,2,3,4],[2,3,2,1,2,3,4,3],[3,0,3,2,3,2,3,4],[2,3,2,1,2,3,4,3],[1,2,1,4,3,2,3,4],[2,3,2,3,2,3,4,3],[3,2,3,2,3,4,3,4]],
            [[3,2,3,2,3,2,3,4],[4,1,2,1,4,3,2,3],[1,2,3,2,1,2,3,4],[2,3,0,3,2,3,2,3],[1,2,3,2,1,2,3,4],[4,1,2,1,4,3,2,3],[3,2,3,2,3,2,3,4],[2,3,2,3,2,3,4,3]],
            [[2,3,2,3,2,3,2,3],[3,4,1,2,1,4,3,2],[2,1,2,3,2,1,2,3],[3,2,3,0,3,2,3,2],[2,1,2,3,2,1,2,3],[3,4,1,2,1,4,3,2],[2,3,2,3,2,3,2,3],[3,2,3,2,3,2,3,4]],
            [[3,2,3,2,3,2,3,2],[2,3,4,1,2,1,4,3],[3,2,1,2,3,2,1,2],[2,3,2,3,0,3,2,3],[3,2,1,2,3,2,1,2],[2,3,4,1,2,1,4,3],[3,2,3,2,3,2,3,2],[4,3,2,3,2,3,2,3]],
            [[4,3,2,3,2,3,2,3],[3,2,3,4,1,2,1,4],[4,3,2,1,2,3,2,1],[3,2,3,2,3,0,3,2],[4,3,2,1,2,3,2,1],[3,2,3,4,1,2,1,4],[4,3,2,3,2,3,2,3],[3,4,3,2,3,2,3,2]],
            [[3,4,3,2,3,2,3,2],[4,3,2,3,4,1,2,1],[3,4,3,2,1,2,3,2],[4,3,2,3,2,3,0,3],[3,4,3,2,1,2,3,2],[4,3,2,3,4,1,2,1],[3,4,3,2,3,2,3,2],[4,3,4,3,2,3,2,3]],
            [[4,3,4,3,2,3,2,3],[5,4,3,2,3,4,1,2],[4,3,4,3,2,1,2,3],[5,4,3,2,3,2,3,0],[4,3,4,3,2,1,2,3],[5,4,3,2,3,4,1,2],[4,3,4,3,2,3,2,3],[5,4,3,4,3,2,3,2]]
        ],
        [
            [[2,3,2,3,4,3,4,5],[3,2,3,2,3,4,3,4],[2,1,4,3,2,3,4,5],[3,2,1,2,3,4,3,4],[0,3,2,3,2,3,4,5],[3,2,1,2,3,4,3,4],[2,1,4,3,2,3,4,5],[3,2,3,2,3,4,3,4]],
            [[3,2,3,2,3,4,3,4],[2,3,2,3,2,3,4,3],[1,2,1,4,3,2,3,4],[2,3,2,1,2,3,4,3],[3,0,3,2,3,2,3,4],[2,3,2,1,2,3,4,3],[1,2,1,4,3,2,3,4],[2,3,2,3,2,3,4,3]],
            [[2,3,2,3,2,3,4,3],[3,2,3,2,3,2,3,4],[4,1,2,1,4,3,2,3],[1,2,3,2,1,2,3,4],[2,3,0,3,2,3,2,3],[1,2,3,2,1,2,3,4],[4,1,2,1,4,3,2,3],[3,2,3,2,3,2,3,4]],
            [[3,2,3,2,3,2,3,4],[2,3,2,3,2,3,2,3],[3,4,1,2,1,4,3,2],[2,1,2,3,2,1,2,3],[3,2,3,0,3,2,3,2],[2,1,2,3,2,1,2,3],[3,4,1,2,1,4,3,2],[2,3,2,3,2,3,2,3]],
            [[4,3,2,3,2,3,2,3],[3,2,3,2,3,2,3,2],[2,3,4,1,2,1,4,3],[3,2,1,2,3,2,1,2],[2,3,2,3,0,3,2,3],[3,2,1,2,3,2,1,2],[2,3,4,1,2,1,4,3],[3,2,3,2,3,2,3,2]],
            [[3,4,3,2,3,2,3,2],[4,3,2,3,2,3,2,3],[3,2,3,4,1,2,1,4],[4,3,2,1,2,3,2,1],[3,2,3,2,3,0,3,2],[4,3,2,1,2,3,2,1],[3,2,3,4,1,2,1,4],[4,3,2,3,2,3,2,3]],
            [[4,3,4,3,2,3,2,3],[3,4,3,2,3,2,3,2],[4,3,2,3,4,1,2,1],[3,4,3,2,1,2,3,2],[4,3,2,3,2,3,0,3],[3,4,3,2,1,2,3,2],[4,3,2,3,4,1,2,1],[3,4,3,2,3,2,3,2]],
            [[5,4,3,4,3,2,3,2],[4,3,4,3,2,3,2,3],[5,4,3,2,3,4,1,2],[4,3,4,3,2,1,2,3],[5,4,3,2,3,2,3,0],[4,3,4,3,2,1,2,3],[5,4,3,2,3,4,1,2],[4,3,4,3,2,3,2,3]]
        ],
        [
            [[3,4,3,4,3,4,5,4],[2,3,2,3,4,3,4,5],[3,2,3,2,3,4,3,4],[2,1,4,3,2,3,4,5],[3,2,1,2,3,4,3,4],[0,3,2,3,2,3,4,5],[3,2,1,2,3,4,3,4],[2,1,4,3,2,3,4,5]],
            [[4,3,4,3,4,3,4,5],[3,2,3,2,3,4,3,4],[2,3,2,3,2,3,4,3],[1,2,1,4,3,2,3,4],[2,3,2,1,2,3,4,3],[3,0,3,2,3,2,3,4],[2,3,2,1,2,3,4,3],[1,2,1,4,3,2,3,4]],
            [[3,4,3,4,3,4,3,4],[2,3,2,3,2,3,4,3],[3,2,3,2,3,2,3,4],[4,1,2,1,4,3,2,3],[1,2,3,2,1,2,3,4],[2,3,0,3,2,3,2,3],[1,2,3,2,1,2,3,4],[4,1,2,1,4,3,2,3]],
            [[4,3,4,3,4,3,4,3],[3,2,3,2,3,2,3,4],[2,3,2,3,2,3,2,3],[3,4,1,2,1,4,3,2],[2,1,2,3,2,1,2,3],[3,2,3,0,3,2,3,2],[2,1,2,3,2,1,2,3],[3,4,1,2,1,4,3,2]],
            [[3,4,3,4,3,4,3,4],[4,3,2,3,2,3,2,3],[3,2,3,2,3,2,3,2],[2,3,4,1,2,1,4,3],[3,2,1,2,3,2,1,2],[2,3,2,3,0,3,2,3],[3,2,1,2,3,2,1,2],[2,3,4,1,2,1,4,3]],
            [[4,3,4,3,4,3,4,3],[3,4,3,2,3,2,3,2],[4,3,2,3,2,3,2,3],[3,2,3,4,1,2,1,4],[4,3,2,1,2,3,2,1],[3,2,3,2,3,0,3,2],[4,3,2,1,2,3,2,1],[3,2,3,4,1,2,1,4]],
            [[5,4,3,4,3,4,3,4],[4,3,4,3,2,3,2,3],[3,4,3,2,3,2,3,2],[4,3,2,3,4,1,2,1],[3,4,3,2,1,2,3,2],[4,3,2,3,2,3,0,3],[3,4,3,2,1,2,3,2],[4,3,2,3,4,1,2,1]],
            [[4,5,4,3,4,3,4,3],[5,4,3,4,3,2,3,2],[4,3,4,3,2,3,2,3],[5,4,3,2,3,4,1,2],[4,3,4,3,2,1,2,3],[5,4,3,2,3,2,3,0],[4,3,4,3,2,1,2,3],[5,4,3,2,3,4,1,2]]
        ],
        [
            [[4,3,4,3,4,5,4,5],[3,4,3,4,3,4,5,4],[2,3,2,3,4,3,4,5],[3,2,3,2,3,4,3,4],[2,1,4,3,2,3,4,5],[3,2,1,2,3,4,3,4],[0,3,2,3,2,3,4,5],[3,2,1,2,3,4,3,4]],
            [[3,4,3,4,3,4,5,4],[4,3,4,3,4,3,4,5],[3,2,3,2,3,4,3,4],[2,3,2,3,2,3,4,3],[1,2,1,4,3,2,3,4],[2,3,2,1,2,3,4,3],[3,0,3,2,3,2,3,4],[4,3,2,1,2,3,4,3]],
            [[4,3,4,3,4,3,4,5],[3,4,3,4,3,4,3,4],[2,3,2,3,2,3,4,3],[3,2,3,2,3,2,3,4],[4,1,2,1,4,3,2,3],[1,2,3,2,1,2,3,4],[2,3,0,3,2,3,2,3],[1,2,3,2,1,2,3,4]],
            [[3,4,3,4,3,4,3,4],[4,3,4,3,4,3,4,3],[3,2,3,2,3,2,3,4],[2,3,2,3,2,3,2,3],[3,4,1,2,1,4,3,2],[2,1,2,3,2,1,2,3],[3,2,3,0,3,2,3,2],[2,1,2,3,2,1,2,3]],
            [[4,3,4,3,4,3,4,3],[3,4,3,4,3,4,3,4],[4,3,2,3,2,3,2,3],[3,2,3,2,3,2,3,2],[2,3,4,1,2,1,4,3],[3,2,1,2,3,2,1,2],[2,3,2,3,0,3,2,3],[3,2,1,2,3,2,1,2]],
            [[5,4,3,4,3,4,3,4],[4,3,4,3,4,3,4,3],[3,4,3,2,3,2,3,2],[4,3,2,3,2,3,2,3],[3,2,3,4,1,2,1,4],[4,3,2,1,2,3,2,1],[3,2,3,2,3,0,3,2],[4,3,2,1,2,3,2,1]],
            [[4,5,4,3,4,3,4,3],[5,4,3,4,3,4,3,4],[4,3,4,3,2,3,2,3],[3,4,3,2,3,2,3,2],[4,3,2,3,4,1,2,1],[3,4,3,2,1,2,3,2],[4,3,2,3,2,3,0,3],[3,4,3,2,1,2,3,4]],
            [[5,4,5,4,3,4,3,4],[4,5,4,3,4,3,4,3],[5,4,3,4,3,2,3,2],[4,3,4,3,2,3,2,3],[5,4,3,2,3,4,1,2],[4,3,4,3,2,1,2,3],[5,4,3,2,3,2,3,0],[4,3,4,3,2,1,2,3]]
        ],
        [
            [[5,4,5,4,5,4,5,6],[4,3,4,3,4,5,4,5],[3,4,3,4,3,4,5,4],[2,3,2,3,4,3,4,5],[3,2,3,2,3,4,3,4],[2,1,4,3,2,3,4,5],[3,4,1,2,3,4,3,4],[0,3,2,3,2,3,4,5]],
            [[4,5,4,5,4,5,4,5],[3,4,3,4,3,4,5,4],[4,3,4,3,4,3,4,5],[3,2,3,2,3,4,3,4],[2,3,2,3,2,3,4,3],[1,2,1,4,3,2,3,4],[2,3,2,1,2,3,4,3],[3,0,3,2,3,2,3,4]],
            [[5,4,5,4,5,4,5,4],[4,3,4,3,4,3,4,5],[3,4,3,4,3,4,3,4],[2,3,2,3,2,3,4,3],[3,2,3,2,3,2,3,4],[4,1,2,1,4,3,2,3],[1,2,3,2,1,2,3,4],[2,3,0,3,2,3,2,3]],
            [[4,5,4,5,4,5,4,5],[3,4,3,4,3,4,3,4],[4,3,4,3,4,3,4,3],[3,2,3,2,3,2,3,4],[2,3,2,3,2,3,2,3],[3,4,1,2,1,4,3,2],[2,1,2,3,2,1,2,3],[3,2,3,0,3,2,3,2]],
            [[5,4,5,4,5,4,5,4],[4,3,4,3,4,3,4,3],[3,4,3,4,3,4,3,4],[4,3,2,3,2,3,2,3],[3,2,3,2,3,2,3,2],[2,3,4,1,2,1,4,3],[3,2,1,2,3,2,1,2],[2,3,2,3,0,3,2,3]],
            [[4,5,4,5,4,5,4,5],[5,4,3,4,3,4,3,4],[4,3,4,3,4,3,4,3],[3,4,3,2,3,2,3,2],[4,3,2,3,2,3,2,3],[3,2,3,4,1,2,1,4],[4,3,2,1,2,3,2,1],[3,2,3,2,3,0,3,2]],
            [[5,4,5,4,5,4,5,4],[4,5,4,3,4,3,4,3],[5,4,3,4,3,4,3,4],[4,3,4,3,2,3,2,3],[3,4,3,2,3,2,3,2],[4,3,2,3,4,1,2,1],[3,4,3,2,1,2,3,2],[4,3,2,3,2,3,0,3]],
            [[6,5,4,5,4,5,4,5],[5,4,5,4,3,4,3,4],[4,5,4,3,4,3,4,3],[5,4,3,4,3,2,3,2],[4,3,4,3,2,3,2,3],[5,4,3,2,3,4,1,2],[4,3,4,3,2,1,4,3],[5,4,3,2,3,2,3,0]]
        ]
    ];

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

let moveCountsKnight = new Array(8);





document.addEventListener('DOMContentLoaded', function() {

for (let x1 = 0; x1 < 8; x1++) {
  moveCountsKnight[x1] = new Array(8);
  for (let y1 = 0; y1 < 8; y1++) {
    moveCountsKnight[x1][y1] = new Array(8);
    for (let x2 = 0; x2 < 8; x2++) {
      moveCountsKnight[x1][y1][x2] = new Array(8).fill(0); // vagy null / 1000 stb.
    }
  }
}

    const chessboard = document.getElementById('chessboard');
    const startmessage = document.getElementById('startmessage');









document.querySelectorAll('.square, .knightEnemy, .rookEnemy, .bishopEnemy').forEach(cell => {
  cell.addEventListener('click', (e) => {
    let target;

         if (cell.classList.contains('square')) {
      // ID alapján koordináta
      const id = cell.id;
      try {
        target = JSON.parse(id); // az id pl. "[3,2]"
      } catch {
        return;
      }
    } else {
      
      let matchingEnemy = allEnemies.find(enemy => enemy.domElement === cell);
      if (!matchingEnemy || matchingEnemy.dead) return;

      target = [matchingEnemy.position.x, matchingEnemy.position.y];
    }
if (moveIsValid(target))
    makePlayerMove(target);
  });
});
          
    // Játék indítása
    startmessage.addEventListener('click', function() {
        
        this.style.zIndex = '-10';
        
        initializeLevel();
        initializeEnemies();
        spawnEnemiesForLevel(currentLevel);
        initializePlayer();
        enemiesWaitAndMove();
    });
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var enemy = document.getElementById('knightEnemy');


function convertTo4D(raw) {
  const result = new Array(8).fill(0).map(() =>
    new Array(8).fill(0).map(() =>
      new Array(8).fill(0).map(() =>
        new Array(8).fill(0)
      )
    )
  );

  for (let sx = 0; sx < 8; sx++) {
    for (let sy = 0; sy < 8; sy++) {
      for (let tx = 0; tx < 8; tx++) {
        for (let ty = 0; ty < 8; ty++) {
          result[sx][sy][tx][ty] = raw[sx][sy][tx][ty];
        }
      }
    }
  }

  return result;
}

let myEnemy;
let enemies = [];

function initializeLevel(){
    const params = new URLSearchParams(window.location.search);
const levelFromURL = parseInt(params.get('level'));
if (!isNaN(levelFromURL) && levelFromURL > 0) {
    currentLevel = levelFromURL;
}
}

function initializeEnemies() {

for (let i = 0; i <= 62; i++) {
    const element = document.getElementById(`knightEnemy${i}`);
    if (element) {
        let enemy = new Enemy();             // saját Enemy osztályod
        enemy.enemyType = "Knight";
        enemy.domElement = element;          // opcionális: DOM referencia
        enemies.push(enemy);
    }
}

}

function spawnEnemiesForLevel(currentLevel) {
    const usedPositions = new Set();
    for (let i = 0; i < currentLevel; i++) {
        const enemy = enemies[i]; // a korábban létrehozott Enemy példányok tömbje
        if (!enemy) continue;

        let x, y, key;
        let attempts = 0;

        // Addig próbálkozunk, amíg nem találunk szabad mezőt
        do {
            x = Math.floor(Math.random() * 8);
            y = Math.floor(Math.random() * 8);
            key = `${x},${y}`;
            attempts++;
            if (attempts > 1000) {
                console.warn("Nem található több szabad mező!");
                break;
            }
        } while (usedPositions.has(key));

        usedPositions.add(key);

        // beállítjuk az enemy állapotát
        enemy.dead = false;
        enemy.position = new Vector2(x, y);
        if (enemy.domElement) {
      let idString = '['+x+','+y+']';
    let targetDiv = document.getElementById(idString);
    let parentDiv = document.getElementById('chessboard');

    let rect = targetDiv.getBoundingClientRect(idString);
    let computedStyle = window.getComputedStyle(targetDiv);
    let parentrect = parentDiv.getBoundingClientRect(parentDiv);

    let targetX = rect.x - parentrect.x + rect.width / 2 - 18;
    let targetY = rect.y - parentrect.y + rect.height / 2 - 25;
    enemy.domElement.style.top = `${targetY}px`;
    enemy.domElement.style.left = `${targetX}px`;
    enemy.domElement.style.zIndex = 10;
        }
    }
}

function enemiesWaitAndMove() {
    enemies.forEach(enemy => {
        if (!enemy.dead) {
            enemy.waitAndMove();
        }
    });
}

function initializeEnemySpawn() {
    
    moveCountsKnight = convertTo4D(moveCountsKnightRaw);
    
    let spawnPosition = [getRandomInt(0,7),getRandomInt(0,7)];
    
    while (spawnPosition[0] === playerSpawnPosition[0] && spawnPosition[1] === playerSpawnPosition[1])
    spawnPosition = [getRandomInt(0,7),getRandomInt(0,7)];
   
    if (!gameStarted)
    this.makeEnemyMove(spawnPosition);
}

function initializePlayer(){
    const player = document.getElementById('player');

    playerSpawnPosition = [getRandomInt(0,7),getRandomInt(0,7)];
    
    makePlayerMove(playerSpawnPosition);
    playerDead=false;
    player.style.zIndex = 10;
    
    
}



function makePlayerMove(movePosition){
 const player = document.getElementById('player');
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
    
    checkPlayerHitsEnemy();
    
    if(checkLevelEnd())
     levelEnd();
}


function levelEnd() {
    const params = new URLSearchParams(window.location.search);
    const currentLevel = parseInt(params.get('level'));
    const safeLevel = !isNaN(currentLevel) && currentLevel > 0 ? currentLevel : 1;
    const nextLevel = safeLevel + 1;

    const newUrl = `${window.location.origin}${window.location.pathname}?level=${nextLevel}`;
    window.location.href = newUrl;
}


function checkLevelEnd() {
    const aliveEnemies = enemies.filter(enemy => !enemy.dead).length;
    return aliveEnemies === 0;
}

function checkPlayerHitsEnemy() {
    enemies.forEach(enemy => {
        if (!enemy.dead &&
            enemy.position.x == playerPosition[0] &&
            enemy.position.y == playerPosition[1]) {
            enemy.die();
             if(checkLevelEnd())
               levelEnd();
        }
    });
}

function moveIsValid(moveTo) { let validMoves = []; for (let i = 0; i < movesArray.length; i++) { const newMove = [playerPosition[0] + movesArray[i][0], playerPosition[1] + movesArray[i][1]]; validMoves.push(newMove); } console.log("Valid Moves:", validMoves); console.log("Move To:", moveTo); const isValid = validMoves.some(vm => vm[0] === moveTo[0] && vm[1] === moveTo[1]); if (isValid) { console.log("Move is valid."); return true; } else { console.log("Move is not valid."); return false; } }