// Configuration de la fenêtre
const WIDTH = 800;
const HEIGHT = 600;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Position et taille du personnage
const playerSize = 50;
let playerX = WIDTH / 2;
let playerY = HEIGHT / 2;
const playerSpeed = 5;

// Configuration des ennemis
const enemySize = 50;
const maxEnemies = 10;
const enemies = [
  { x: 100, y: 100, speedX: 3, speedY: 2, direction: 'right', frame: 0 },
  { x: 300, y: 200, speedX: -2, speedY: 3, direction: 'left', frame: 0 },
  { x: 500, y: 400, speedX: 4, speedY: -3, direction: 'right', frame: 0 },
];

// Attaque
let isAttacking = false;
const attackRange = 80  ;
let stamina = 100;
const maxStamina = 100;
const staminaCost = 25;
const staminaRegenRate = 5;
const staminaRegenInterval = 100;

// Images pour le joueur
const playerImages = {
  idle: new Image(),
  moveUp: new Image(),
  moveDown: new Image(),
  moveLeft: new Image(),
  moveRight: new Image(),
  attack: new Image(),
};

playerImages.idle.src = "Pablo/player.png";
playerImages.moveUp.src = "Pablo/right.png";
playerImages.moveDown.src = "Pablo/left.png";
playerImages.moveLeft.src = "Pablo/left.png";
playerImages.moveRight.src = "Pablo/right.png";
playerImages.attack.src = "Pablo/Attack.png";

// Images des ennemis
const enemyImages = {
  right: new Image(),
  left: new Image(),
};

enemyImages.right.src = "Pablo/enemy.png";
enemyImages.left.src = "Pablo/enemy2.png";

// Gestion des entrées clavier
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false };
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") { keys.ArrowUp = true; playerState = "moveUp"; }
  if (event.key === "ArrowDown") { keys.ArrowDown = true; playerState = "moveDown"; }
  if (event.key === "ArrowLeft") { keys.ArrowLeft = true; playerState = "moveLeft"; }
  if (event.key === "ArrowRight") { keys.ArrowRight = true; playerState = "moveRight"; }
  if (event.key === " " && stamina >= staminaCost) {
    keys.Space = true; playerState = "attack"; isAttacking = true; stamina -= staminaCost;
  }
});
document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowUp") { keys.ArrowUp = false; }
  if (event.key === "ArrowDown") { keys.ArrowDown = false; }
  if (event.key === "ArrowLeft") { keys.ArrowLeft = false; }
  if (event.key === "ArrowRight") { keys.ArrowRight = false; }
  if (event.key === " ") { keys.Space = false; isAttacking = false; }
  
  if (!keys.ArrowUp && !keys.ArrowDown && !keys.ArrowLeft && !keys.ArrowRight && !keys.Space) {
    playerState = "idle";
  }
});

// Stamina
setInterval(() => {
  if (stamina < maxStamina) {
    stamina = Math.min(maxStamina, stamina + staminaRegenRate);
  }
}, staminaRegenInterval);

// Variables de l'état du joueur
let playerState = "idle";  // Etat initial (idle)

// Fonction pour ajouter un nouvel ennemi aléatoirement
function addEnemy() {
  if (enemies.length < maxEnemies) {
    const x = Math.random() * (WIDTH - enemySize);  // Position aléatoire en X
    const y = Math.random() * (HEIGHT - enemySize);  // Position aléatoire en Y
    const speedX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 1);  // Vitesse en X aléatoire
    const speedY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 1);  // Vitesse en Y aléatoire
    enemies.push({ x, y, speedX, speedY, direction: 'right', frame: 0, createdAt: Date.now() });
  }
}

// Fonction pour gérer l'élimination d'un ennemi
function handleEnemyElimination(index) {
  // Enlever l'ennemi de la liste
  enemies.splice(index, 1);

  // Ajouter un nouvel ennemi après 10 secondes
  setTimeout(() => {
    addEnemy();  // Ajouter un nouvel ennemi
  }, 10000);  // 10 secondes
}

// Fonction pour afficher la vidéo de fin de jeu
function showGameOver() {
  // Masquer le canevas de jeu
  canvas.style.display = "none";
  
  // Afficher la vidéo de fin de jeu
  const video = document.getElementById("gameOverVideo");
  video.style.display = "block";
  video.play();  // Lancer la vidéo
}

// Boucle de jeu
function gameLoop() {
  // Déplacements du joueur
  if (keys.ArrowUp) playerY -= playerSpeed;
  if (keys.ArrowDown) playerY += playerSpeed;
  if (keys.ArrowLeft) playerX -= playerSpeed;
  if (keys.ArrowRight) playerX += playerSpeed;

  // Limiter le joueur dans les bordures
  playerX = Math.max(0, Math.min(WIDTH - playerSize, playerX));
  playerY = Math.max(0, Math.min(HEIGHT - playerSize, playerY));

  // Mise à jour de la direction des ennemis et gestion des animations
  for (let enemy of enemies) {
    enemy.x += enemy.speedX;
    enemy.y += enemy.speedY;

    // Si l'ennemi atteint les bords, il change de direction
    if (enemy.x <= 0 || enemy.x + enemySize >= WIDTH) {
      enemy.speedX *= -1;
      enemy.direction = (enemy.speedX > 0) ? 'right' : 'left';
    }

    if (enemy.y <= 0 || enemy.y + enemySize >= HEIGHT) {
      enemy.speedY *= -1;
    }

    // Animation de déplacement (alterner entre 2 sprites)
    enemy.frame = (enemy.frame + 1) % 2;  // Alterne entre 0 et 1
  }

  // Gestion des attaques
  if (isAttacking) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      const distance = Math.hypot(
        enemy.x + enemySize / 2 - (playerX + playerSize / 2),
        enemy.y + enemySize / 2 - (playerY + playerSize / 2)
      );
      if (distance <= attackRange) {
        enemies.splice(i, 1 ); // Supprimer l'ennemi
      }
    }
    isAttacking = false; // Attaque terminée
  }

  // Affichage
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Affichage du joueur avec l'image correspondant à son état
  ctx.drawImage(playerImages[playerState], playerX, playerY, playerSize, playerSize);

  // Affichage des ennemis avec animation de déplacement
  for (let enemy of enemies) {
    // Alterner les sprites des ennemis en fonction de leur direction
    const enemyImageToDraw = (enemy.direction === 'right') ? enemyImages.right : enemyImages.left;
    ctx.drawImage(enemyImageToDraw, enemy.x, enemy.y, enemySize, enemySize);
  }

  // Affichage de la barre de stamina
  const barWidth = 200, barHeight = 20, barX = WIDTH - barWidth - 20, barY = 20;
  ctx.fillStyle = "#000"; ctx.fillRect(barX, barY, barWidth, barHeight);
  const staminaWidth = (stamina / maxStamina) * barWidth;
  ctx.fillStyle = "#00FF00"; ctx.fillRect(barX, barY, staminaWidth, barHeight);
  ctx.strokeStyle = "#000"; ctx.strokeRect(barX, barY, barWidth, barHeight);


  // Détection des collisions avec les ennemis
  for (let enemy of enemies) {
    if (
      playerX < enemy.x + enemySize &&
      playerX + playerSize > enemy.x &&
      playerY < enemy.y + enemySize &&
      playerY + playerSize > enemy.y
    ) {
      showGameOver();
      return;
    }
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
