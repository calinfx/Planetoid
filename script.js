// - - - >> 1.00 - Canvas Setup and Scene Objects
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let isDragging = false;
let draggedObject = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// An array to hold all the objects (our "chess pieces")
const pieces = [];

// Function to create a new piece
function createPiece(x, y, size, color) {
    return { x, y, size, color, isDragging: false };
}

// Create the 8 pieces in two rows of four
// 1.00.00
const pieceSize = 40;
const startX = canvas.width / 2 - 150;
const startY1 = canvas.height / 2 - 100;
const startY2 = canvas.height / 2 + 50;

for (let i = 0; i < 4; i++) {
    // Left row of objects
    pieces.push(createPiece(startX + i * 100, startY1, pieceSize, 'white'));
    // Right row of objects
    pieces.push(createPiece(startX + i * 100, startY2, pieceSize, 'black'));
}

// - - - >> 2.00 - Event Listeners
canvas.addEventListener('mousedown', (event) => {
    // 2.00.00
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;

    for (let i = pieces.length - 1; i >= 0; i--) {
        const piece = pieces[i];
        if (
            mouseX > piece.x &&
            mouseX < piece.x + piece.size &&
            mouseY > piece.y &&
            mouseY < piece.y + piece.size
        ) {
            isDragging = true;
            draggedObject = piece;
            dragOffsetX = mouseX - piece.x;
            dragOffsetY = mouseY - piece.y;
            break;
        }
    }
});
// 2.00.01
canvas.addEventListener('mousemove', (event) => {
    if (isDragging && draggedObject) {
        draggedObject.x = event.clientX - canvas.offsetLeft - dragOffsetX;
        draggedObject.y = event.clientY - canvas.offsetTop - dragOffsetY;
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedObject = null;
});

// - - - >> 3.00 - Drawing and Animation Loop
function draw() {
    // Clear the canvas on each frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3.00.00
    // Draw each piece
    pieces.forEach(piece => {
        ctx.fillStyle = piece.color;
        ctx.fillRect(piece.x, piece.y, piece.size, piece.size);
    });

    // Request the next animation frame
    requestAnimationFrame(draw);
}

// 3.00.01
// Initial setup and start of the animation loop
function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

init();

// Handle window resizing
window.addEventListener('resize', init);
