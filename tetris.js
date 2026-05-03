// --- 0. INICIALIZACIÓN DE CANVAS ---
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
nextContext.scale(20, 20);

// --- 1. CONFIGURACIÓN DE PIEZAS Y COLORES ---
function createPiece(type) {
    if (type === 'I') return [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
    if (type === 'L') return [[0, 2, 0], [0, 2, 0], [0, 2, 2]];
    if (type === 'J') return [[0, 3, 0], [0, 3, 0], [3, 3, 0]];
    if (type === 'O') return [[4, 4], [4, 4]];
    if (type === 'Z') return [[5, 5, 0], [0, 5, 5], [0, 0, 0]];
    if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    if (type === 'T') return [[0, 7, 0], [7, 7, 7], [0, 0, 0]];
}

const colors = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // L
    '#0DFF72', // J
    '#F538FF', // O
    '#FF8E0D', // Z
    '#FFE138', // S
    '#3877FF', // T
];

// --- 2. SISTEMA DE PARTÍCULAS ---
let particles = [];

function createParticles(y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: Math.random() * 12,
            y: y,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            life: 1.0,
            color: isHardcore ? '#ff4500' : '#0DFF72' 
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    particles.forEach(p => {
        context.globalAlpha = p.life;
        context.fillStyle = p.color;
        context.fillRect(p.x, p.y, 0.1, 0.1);
    });
    context.globalAlpha = 1.0;
}

// --- 3. LÓGICA DE LA ARENA ---
function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function arenaSweep() {
    let rowCount = 1;
    let linesCleared = 0;

    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        createParticles(y);
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y; 
        player.score += rowCount * 10;
        rowCount *= 2;
        linesCleared++;
    }

    if (linesCleared > 0) {
        updateScore();
        animateScore(); 
        const container = document.querySelector('.main-container');
        if (container) {
            container.classList.remove('shake-effect');
            void container.offsetWidth;
            container.style.setProperty('--shake-intensity', '15px');
            container.classList.add('shake-effect');
        }
    }
}

function animateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.classList.remove('score-animate');
        void scoreElement.offsetWidth;
        scoreElement.classList.add('score-animate');
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0) {
                if (arena[y + o.y] === undefined || 
                    arena[y + o.y][x + o.x] === undefined || 
                    arena[y + o.y][x + o.x] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const arenaY = y + player.pos.y;
                const arenaX = x + player.pos.x;
                if (arena[arenaY] !== undefined && arena[arenaY][arenaX] !== undefined) {
                    arena[arenaY][arenaX] = value;
                }
            }
        });
    });
}

// --- 4. ACCIONES Y REINICIO ---
let nextPiece = createPiece('TJLOSZI'[Math.random() * 7 | 0]);

function toggleHardcore() {
    isHardcore = !isHardcore;
    const btn = document.getElementById('btn-hardcore');
    const canvasEl = document.getElementById('tetris');
    const leaderboardEl = document.querySelector('.leaderboard');
    const statsEl = document.querySelector('.stats');

    if (isHardcore) {
        btn.innerText = "¡MODO HARDCORE ACTIVO!";
        btn.style.background = "#fff";
        btn.style.color = "#ff4500";
        
        canvasEl.classList.add('hardcore-active');
        leaderboardEl.classList.add('hardcore-active');
        if (statsEl) statsEl.classList.add('score-hardcore');
        
        dropInterval = 200; 
    } else {
        btn.innerText = "ACTIVAR MODO HARDCORE";
        btn.style.background = "#ff4500";
        btn.style.color = "white";
        
        canvasEl.classList.remove('hardcore-active');
        leaderboardEl.classList.remove('hardcore-active');
        if (statsEl) statsEl.classList.remove('score-hardcore');
        
        dropInterval = originalInterval;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = nextPiece;
    nextPiece = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        gameOver();
    }
    drawNext();
}

function drawNext() {
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    const xOffset = nextPiece.length === 2 ? 1 : 0.5; 
    drawMatrix(nextPiece, {x: xOffset, y: 1}, nextContext);
}

function gameOver() {
    const finalScore = player.score;
    setTimeout(() => {
        const nombre = prompt("GAME OVER! Puntos: " + finalScore + "\nTu nombre:");
        if (nombre) {
            enviarPuntaje(nombre, finalScore);
            setTimeout(() => location.reload(), 500);
        } else {
            arena.forEach(row => row.fill(0));
            player.score = 0;
            updateScore();
            playerReset();
        }
    }, 10);
}

function playerHardDrop() {
    const startY = player.pos.y;
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    const distance = player.pos.y - startY;
    merge(arena, player);
    arenaSweep();
    playerReset();
    updateScore();
    dropCounter = 0;

    const container = document.querySelector('.main-container');
    if (container && distance > 0) {
        container.classList.remove('shake-effect');
        void container.offsetWidth;
        const intensity = Math.min(distance * 5, 50); 
        container.style.setProperty('--shake-intensity', `${intensity}px`);
        container.classList.add('shake-effect');
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        arenaSweep();
        playerReset();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir;
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// --- 5. COMUNICACIÓN Y DIBUJADO ---
function enviarPuntaje(nombre, puntos) {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('puntos', puntos);
    fetch('save_score.php', { method: 'POST', body: formData })
    .catch(err => console.error("Error al guardar:", err));
}

function drawMatrix(matrix, offset, ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = isHardcore ? '#ff4500' : colors[value]; 
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0}, context);
    
    const ghostPos = { x: player.pos.x, y: player.pos.y };
    while (!collide(arena, { pos: ghostPos, matrix: player.matrix })) {
        ghostPos.y++;
    }
    ghostPos.y--;

    context.globalAlpha = 0.3;
    drawMatrix(player.matrix, ghostPos, context);
    context.globalAlpha = 1.0;

    drawMatrix(player.matrix, player.pos, context);
    updateParticles();
    drawParticles();
}

function updateScore() {
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.innerText = player.score;
}

// --- 6. CONTROLADOR DE TIEMPO Y ENTRADA ---
let dropCounter = 0;
let dropInterval = 1000;
let originalInterval = 1000;
let lastTime = 0;
let isHardcore = false;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) playerMove(-1);
    else if (event.keyCode === 39) playerMove(1);
    else if (event.keyCode === 40) playerDrop();
    else if (event.keyCode === 38) playerRotate(1);
    else if (event.keyCode === 32) {
        event.preventDefault();
        playerHardDrop();
    }
});

playerReset();
updateScore();
update();
