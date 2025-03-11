import { connectPhantomWalletAndSend , fetchSkinPrice, buyCharacter, sendTransaction, registerSkinPurchase } from "./web3-integration.js";

let board, bufferCanvas, bufferContext;
let isDesktop;
let isGameStarted = false;
let boardWidth;
let boardHeight;
let context;
let orpeImg;
let startInterface;
let walletInterface;
let highScoresInterface;
let gameOverInterface;
let landingInterface;
let characterSelectionInterface;
let startInterfaceWidth;
let startInterfaceHeight;
let walletInterfaceWidth;
let walletInterfaceHeight;
let highScoresInterfaceWidth;
let highScoresInterfaceHeight;
let gameOverInterfaceWidth;
let gameOverInterfaceHeight;
let startButton;
let walletButton;
let highScoresButton;
let buyPumpFunButtons;
let buyDexscreenerButtons;
let fixedBackButton;
let aboutUsButton;
let chooseCharacterButton;
let testBuySkinButton;
let aboutUsIcon;
let addressInput;
let pasteButton;
let registerWalletButton;
let walletMsgDiv;
let walletMsgSpan;
let backButton;
let isRegisteredWallet = false;
let userWalletAddress = "";
let userHighestScore = 0;
let highScoresTable;
let addYourWalletSpan;
let score = 0;
let gameOver = false;
let gameOverScoreSpan;
let gameOverHighscoreSpan;
let gameOverImg;
let wingSound = new Audio("./sfx_wing.mp3");
let hitSound = new Audio("./sfx_hit.mp3");
let pointSound = new Audio("./sfx_point.mp3");
let teleportSound = new Audio("./teleport-sound.mp3");
let jeeterDetectedSound = new Audio("./sfx-jeeter-detected.mp3");
let highscoreSound = new Audio("./sfx-highscore.mp3");
let gameOverSound = new Audio("./sfx-game-over.mp3");
let bgm;
let wingSoundInstance;
let hitSoundInstance;
let pointSoundInstance;
let teleportSoundInstance;
let jeeterDetectedSoundInstance;
let highscoreSoundInstance;
let gameOverSoundInstance;
let bgmInstance;
let isBgmControlActive = true;

let backgrounds;
let defaultBackground;
let currentBackgroundIndex = 0;
let imagesLoaded;
const imageCache = {};

let orpeCharacterStartInterface;
let selectedCharacter;

// let chooseTrumpButton;
// let chooseOrpeButton;
// let chooseElonButton;

let currentIndex = 0;
let currentOffset = 300;
let leftArrow;
let rightArrow;
let container;

let chosenSkin;
let character;
let background;
let music;

const flapper = ["orpe", "trump", "elon", "milei", "abascal", "genuine", "rizo"];
let totalCharacters = flapper.length;

function changeBackground() {
    if (currentBackgroundIndex < backgrounds.length - 1) {
        currentBackgroundIndex++;
        // Obtener imagen desde la caché en memoria en lugar de localStorage
        const nextBackground = imageCache[backgrounds[currentBackgroundIndex]];
        if (nextBackground) {
            console.log('Cambiando a fondo desde caché:', backgrounds[currentBackgroundIndex]);
            board.style.backgroundImage = `url(${nextBackground.src})`;
        } else {
            console.log('Imagen no encontrada en caché, usando localStorage:', backgrounds[currentBackgroundIndex]);
            const localStorageImage = localStorage.getItem(backgrounds[currentBackgroundIndex]);
            board.style.backgroundImage = localStorageImage 
                ? `url(${localStorageImage})`
                : `url(${backgrounds[currentBackgroundIndex]})`;
        }
    } else {
        console.log('Último fondo alcanzado. No se cambiará más.');
    }
}

let bgmMuteButton;
let pauseIcon;
let playIcon;

//physics
let velocityX;
let velocityY;
let gravity;
let jumpStrength;

let orpeWidth = 70;
let orpeHeight = 70;
let orpeX;
let orpeY;
let orpeRotation;
let orpeFalled = false;
let isJumping = false;

let orpe = {};

const originalPipeWidth = 658;
const originalPipeHeight = 3981;
const aspectRatio = originalPipeHeight / originalPipeWidth;

let pipeArray = [];
let pipeInterval;
let pipeWidth; // 1/6 658 x 3981
let pipeHeight; // 1/6 658 x 3981
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;

let level = 0; // Nivel del juego
let pipeCounter = 0; // Contador de pipes creados
let placePipesVelocity; // Velocidad de creación de pipes
let openingSpace; // Espacio entre pipes
let minOpeningSpace = orpeHeight * 2; // Apertura mínima entre pipes

function adjustViewport() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}

window.addEventListener('resize', adjustViewport);
adjustViewport();

function disableVerticalScroll() {
    board.style.overflowY = "hidden";
}

function showWalletInterface() {
    walletInterface.style.display = "block";
}

function showHighScoresInterface() {
    highScoresInterface.style.display = "block";
}

function showAboutUsInterface() {
    landingInterface.style.display = "flex";
}

function showCharacterSelectionInterface() {
    characterSelectionInterface.style.display = "flex";
}

// Función para ajustar tamaños y estilos según el ancho de la pantalla
function adjustBoardSize() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    isDesktop = window.innerWidth > 768;
    boardWidth = window.innerWidth;
    boardHeight = window.innerHeight;

    adjustOrpePipesSizes();

    if (false) {
        console.log('Aplicando safe height safari', navigator.userAgent);
        const safeAreaInsetBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')) || 0;
        const adjustedHeight = boardHeight - safeAreaInsetBottom;

        startInterface.style.height = `${adjustedHeight}px`;
        startInterface.style.width = `${boardWidth}px`;
        walletInterface.style.height = `${adjustedHeight}px`;
        walletInterface.style.width = `${boardWidth}px`;
        highScoresInterface.style.height = `${adjustedHeight}px`;
        highScoresInterface.style.width = `${boardWidth}px`;
        gameOverInterface.style.height = `${adjustedHeight}px`;
        gameOverInterface.style.width = `${boardWidth}px`;
    } else {
        startInterface.style.height = `${boardHeight}px`;
        startInterface.style.width = `${boardWidth}px`;
        walletInterface.style.height = `${boardHeight}px`;
        walletInterface.style.width = `${boardWidth}px`;
        highScoresInterface.style.height = `${boardHeight}px`;
        highScoresInterface.style.width = `${boardWidth}px`;
        gameOverInterface.style.height = `${boardHeight}px`;
        gameOverInterface.style.width = `${boardWidth}px`;
    }

    board.width = boardWidth;
    board.height = boardHeight;
    bufferCanvas.width = boardWidth;
    bufferCanvas.height = boardHeight;
    bufferContext.width = boardWidth;
    bufferContext.height = boardHeight;
    context.width = boardWidth;
    context.height = boardHeight;

    // openingSpace = board.height / 4 - (level * 10);

    // Ajustar el tamaño de las interfaces
    toggleStartInterface();
}

document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');

function toggleStartInterface() {
    if (!isDesktop && window.innerWidth > window.innerHeight) {
        startInterface.style.display = "none";
    } else {
        startInterface.style.display = "block";
    }
}

window.addEventListener("orientationchange", function() {
    console.log("Cambio de orientación detectado");
    // adjustBoardSize();
    if(isGameStarted) {
        gameOver();
    }
});

function adjustOrpePipesSizes () {
    orpeX = boardWidth / 20;
    orpeY = boardHeight / 2;

    orpe = {
        x : orpeX,
        y : orpeY,
        width : orpeWidth,
        height : orpeHeight,
    }
    
    pipeWidth = 66;
    pipeHeight = 398 + boardHeight - 640; // 1/6 658 x 3981
    pipeX = boardWidth;
}

const InitialDesktopPhysics = {
    velocityX: -4.5,
    velocityY: 0,
    gravity: 0.5,
    jumpStrength: -8,
    placePipesVelocity: 1000,
};

const InitialMobilePhysics = {
    velocityX: -4.5,
    velocityY: 0,
    gravity: 0.5,
    jumpStrength: -8,
    placePipesVelocity: 1000,
};

let lastFrameTime; 
const BASE_FRAME_RATE = 60;
const BASE_DELTA_TIME = 1 / BASE_FRAME_RATE;

let touchInProgress = false;

function isChrome() {
    if (navigator.userAgentData) {
        return navigator.userAgentData.brands.some(brand => brand.brand === 'Google Chrome');
    } else {
        console.log('User agent:', navigator.userAgent);
        return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }
}

function adjustPhysics () {
    if (isDesktop) {
        velocityX = InitialDesktopPhysics.velocityX;
        velocityY = InitialDesktopPhysics.velocityY;
        gravity = InitialDesktopPhysics.gravity;
        jumpStrength = InitialDesktopPhysics.jumpStrength;
        placePipesVelocity = InitialDesktopPhysics.placePipesVelocity;
    } else {
        velocityX = InitialMobilePhysics.velocityX;
        velocityY = InitialMobilePhysics.velocityY;
        gravity = InitialMobilePhysics.gravity;
        jumpStrength = InitialMobilePhysics.jumpStrength;
        placePipesVelocity = InitialMobilePhysics.placePipesVelocity;
    }
    clearInterval(pipeInterval);
    pipeInterval = setInterval(placePipes, placePipesVelocity);
}


window.addEventListener("resize", adjustBoardSize);

function showStartInterface() {
    startInterface.style.display = "block";
    setTimeout(() => {
        startInterface.classList.add('show');
    }, 10);
    walletInterface.style.display = "none";
    highScoresInterface.style.display = "none";
}

function addCharacter(name, imgSrc) {
    const container = document.getElementById('character-selection-container');
    const newCharacterDiv = document.createElement('div');
    newCharacterDiv.className = 'character-content';
    newCharacterDiv.innerHTML = `
        <span class="character-name">Flappy-${name}</span>
        <img src="./characters/${name}.png" alt="${name}">
    `;
    container.appendChild(newCharacterDiv);

    // Actualizar el CSS
    const numberOfCharacters = container.children.length;
    container.style.maxWidth = `calc(100px * ${numberOfCharacters})`;

    // Añadir el nuevo personaje al array flapper
    flapper.push(name);
}

let preloadBackgroundsObject = {};

function preloadBackgrounds() {
    flapper.forEach(character => {
        const img = new Image();
        img.src = `./backgrounds/background-${character}.png`;
        preloadBackgroundsObject[character] = img;
    });
}

// Función para cambiar el personaje, fondo y música
function changeGameSettings(character, background, music) {
    const originalTransition = board.style.transition;

    board.style.transition = 'none';
    board.style.backgroundImage = `url('./backgrounds/${background}.png')`;
    board.offsetHeight; // Esta línea es necesaria para forzar el reflujo
    board.style.transition = originalTransition;
    
    selectedCharacter = character;
    orpeImg.src = `./characters/${character}.png`;
    bgmInstance.src = `./bgm/${music}`;
    bgm.loop = true;
    bgmInstance.loop = true;

    orpeCharacterStartInterface.forEach(function(element) {
        element.src = `./characters/${character}.png`;
        console.log('changed to', element.src);
    });
}

window.changeGameSettings = changeGameSettings;

function loadSkins(userWalletAddress = null) {
    console.log('Skins:', userWalletAddress);
    fetch('skin_container_generator.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: userWalletAddress ? `walletAddress=${userWalletAddress}` : ''
    })
    .then(response => response.json())
    .then(skins => {
        container.innerHTML = ''; // Limpiar antes de insertar skins
        console.log('Skins received:', skins);
        skins.forEach(skin => {
            const skinDiv = document.createElement('div');
            skinDiv.classList.add('character-content');

            skinDiv.innerHTML = `
            <span class="character-name">Flappy-${skin.name.charAt(0).toUpperCase() + skin.name.slice(1)}</span>
            <img src="./characters/${skin.name}.png" alt="${skin.name}-character" class="character-img">
            <button class="character-btn btn" 
                    id="${skin.name}-character-btn" 
                    data-character="${skin.name}" 
                    data-background="background-${skin.name}" 
                    data-music="${skin.name}-anthem.mp3"
                    data-owned="${skin.owned ? 'true' : 'false'}">
                ${skin.owned ? 'Choose' : `Buy for ${parseFloat(skin.price).toFixed(1)} SOL <img src="sol-logo.png" class="sol-logo" alt="Solana Logo">`}
            </button>
        `;

            container.appendChild(skinDiv);
        });

        chooseCharacterButton = document.querySelectorAll('.character-btn');

        chooseCharacterButton.forEach(button => {
            button.onclick = function() {
                handleCharacterButtonClick(button);
            };
        });

        attachBuyEvents();
    })
    .catch(error => console.error('Error loading skins:', error));
}

window.loadSkins = loadSkins;

function handleCharacterButtonClick(button) {
    if (button.innerText !== "CHOOSE") {
        return;
    }

    character = button.getAttribute('data-character');
    background = button.getAttribute('data-background');
    music = button.getAttribute('data-music');

    localStorage.setItem('chosenSkin', character);
    localStorage.setItem('chosenBackground', background);
    localStorage.setItem('chosenMusic', music);

    chosenSkin = character;
    console.log('Chosen skin:', chosenSkin);

    characterSelectionInterface.style.display = 'none';
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.style.display = 'flex';
    
    changeGameSettings(character, background, music);

    // Esperar 1 segundo antes de ocultar la pantalla de carga y empezar el juego
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        startGame();
    }, 1500);
}

window.handleCharacterButtonClick = handleCharacterButtonClick;

async function attachBuyEvents() {
    document.querySelectorAll(".character-btn").forEach(button => {
        const character = button.dataset.character; // Obtener el nombre del personaje
        const owned = button.dataset.owned === "true"; // Estado del skin
        console.log('Skin:', character, 'Owned:', owned);

        // Añadir evento de compra solo si no es "owned"
        if (owned) {
            // Si ya está "owned", eliminamos el evento
            button.removeEventListener("click", buyCharacter);
        } else {
            // Si no está "owned", agregamos el evento de compra
            button.addEventListener("click", function() {
                buyCharacter(button);
            });
        }
    });
}

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext('2d');
    context.imageSmoothingEnabled = false;

    bgm = new Audio();
    bgmInstance = new Audio();

    backgrounds = [
        'background-1.png',
        'background-sunrise.png',
        'background-day.png',
        'background-sunshine.png',
        'background-final.png',
    ];

    imagesLoaded = 0;
    let allImagesInStorage = backgrounds.every(background => localStorage.getItem(background));

    if (allImagesInStorage) {
        console.log('Todas las imágenes ya están en localStorage.');

        // Precargar las imágenes en memoria
        backgrounds.forEach(background => {
            const imgSrc = localStorage.getItem(background);
            if (imgSrc) {
                const img = new Image();
                img.src = imgSrc;
                imageCache[background] = img;
            }
        });

        initializeBackground();
    } else {
        // Cargar imágenes faltantes en localStorage
        backgrounds.forEach(background => {
            const imgSrc = localStorage.getItem(background);
            if (!imgSrc) {
                console.log('Imagen no encontrada en localStorage:', background);
                fetch(background)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = function() {
                            localStorage.setItem(background, reader.result);

                            // Precargar en memoria
                            const img = new Image();
                            img.src = reader.result;
                            imageCache[background] = img;

                            imagesLoaded++;
                            if (imagesLoaded === backgrounds.length) {
                                // initializeBackground();
                            }
                        };
                        reader.readAsDataURL(blob);
                    });
            } else {
                imagesLoaded++;
                if (imagesLoaded === backgrounds.length) {
                    console.log('Imágenes cargadas desde localStorage:', imagesLoaded);
                    // initializeBackground();
                }
            }
        });
    }

    wingSoundInstance = new Audio(wingSound.src);
    hitSoundInstance = new Audio(hitSound.src);
    pointSoundInstance = new Audio(pointSound.src);
    teleportSoundInstance = new Audio(teleportSound.src);
    jeeterDetectedSoundInstance = new Audio(jeeterDetectedSound.src);
    highscoreSoundInstance = new Audio(highscoreSound.src);
    gameOverSoundInstance = new Audio(gameOverSound.src);
    

    startInterface = document.getElementById("start-interface");
    walletInterface = document.getElementById("my-wallet-interface");
    highScoresInterface = document.getElementById("high-scores-interface");
    gameOverInterface = document.getElementById("game-over-interface");
    landingInterface = document.getElementById("landing-interface");
    orpeCharacterStartInterface = document.querySelectorAll(".orpe-in-rocket");
    characterSelectionInterface = document.getElementById("character-selection-interface");

    startButton = document.getElementById("start-btn");
    walletButton = document.getElementById("wallet-btn");
    highScoresButton = document.getElementById("high-scores-btn");
    buyPumpFunButtons = document.getElementsByClassName("pumpfun-btn");
    for (let i = 0; i < buyPumpFunButtons.length; i++) {
        buyPumpFunButtons[i].onclick = linkToPumpfun;
    }
    buyDexscreenerButtons = document.getElementsByClassName("dexscreener-btn");
    for (let i = 0; i < buyDexscreenerButtons.length; i++) {
        buyDexscreenerButtons[i].onclick = linkToDexscreener;
    }
    fixedBackButton = document.getElementById("fixed-back-btn");
    aboutUsButton = document.getElementById("about-us-btn");

    container = document.getElementById("character-selection-container");

    leftArrow = document.getElementById("left-arrow");
    rightArrow = document.getElementById("right-arrow");

    aboutUsIcon = document.getElementById("about-us-icon");
    gameOverImg = document.getElementById("game-over-img");
    gameOverScoreSpan = document.getElementById("game-over-score");
    gameOverHighscoreSpan = document.getElementById("game-over-highscore");
    walletMsgDiv = document.getElementById("wallet-msg-container");
    walletMsgSpan = document.getElementById("wallet-registered-msg");
    highScoresTable = document.getElementById("high-scores-table");
    addYourWalletSpan = document.getElementById("add-your-wallet-span");

    function updateCarousel() {
        if (container) {
            container.style.transform = `translateX(${currentOffset}vw)`;
        }
    }

    function updateBoardBackground(currentIndex) {
        const character = flapper[currentIndex];
        if (character && preloadBackgroundsObject[character]) {
            if (currentIndex === 5) {
                characterSelectionInterface.style.backgroundPosition = '75% center';
            } else {
                characterSelectionInterface.style.backgroundPosition = 'center';
            }
            characterSelectionInterface.style.backgroundImage = `url("${preloadBackgroundsObject[character].src}")`;
        } else {
            console.error('Character or image not found:', character);
        }
    }

    updateBoardBackground(currentIndex);

    let clickCount = 0;
    
    rightArrow.addEventListener("click", () => {
        if (currentIndex < totalCharacters - 2) {
            console.log('Total characters:', totalCharacters);
            currentIndex++;
            currentOffset -= 100;
            console.log('currentIndex:', currentIndex);
            updateCarousel();
            updateBoardBackground(currentIndex);
        } else if (currentIndex === totalCharacters - 2) {
            clickCount++;
            if (clickCount === 3) {
                currentIndex++;
                currentOffset -= 100;
                console.log('currentIndex:', currentIndex);
                updateCarousel();
                updateBoardBackground(currentIndex);
            }
        }
        pointSoundInstance.currentTime = 0;
        pointSoundInstance.play();
    });
    
    leftArrow.addEventListener("click", () => {
        if (currentIndex > 0) {
            clickCount = 0;
            console.log('Total characters:', totalCharacters);
            currentIndex--;
            currentOffset += 100;
            console.log('currentIndex:', currentIndex);
            updateCarousel();
            updateBoardBackground(currentIndex);
        }
        pointSoundInstance.currentTime = 0;
        pointSoundInstance.play();
    });

    function linkToPumpfun () {
        window.open("https://gmgn.ai/sol/token/Ch2Ng9gZmo4VCf9iknfm5gy1je3mxCiZBSv48W6Bpump", "_blank");
        // alert('Not CA yet! Pump.fun launch incoming!');
    }

    function linkToDexscreener () {
        window.open("https://dexscreener.com/solana/ch2ng9gzmo4vcf9iknfm5gy1je3mxcizbsv48w6bpump", "_blank");
    }

    pasteButton = document.getElementById("paste-btn");
    addressInput = document.getElementById("wallet-address-input");
    registerWalletButton = document.getElementById("register-wallet-btn");

    bgmMuteButton = document.getElementById("play-button");
    playIcon = document.getElementById("play-icon");
    pauseIcon = document.getElementById("pause-icon");
    backButton = document.querySelectorAll(".back-btn");

    startButton.disabled = false;

    // Configurar dimensiones de la pantalla inicial
    startInterface.style.height = `${boardHeight}px`;
    startInterface.style.width = `${boardWidth}px`;
    walletInterface.style.height = `${boardHeight}px`;
    walletInterface.style.width = `${boardWidth}px`;
    highScoresInterface.style.height = `${boardHeight}px`;
    highScoresInterface.style.width = `${boardWidth}px`;
    gameOverInterface.style.height = `${boardHeight}px`;
    gameOverInterface.style.width = `${boardWidth}px`;
    characterSelectionInterface.style.height = `${boardHeight}px`;
    characterSelectionInterface.style.width = `${boardWidth}px`;

    document.documentElement.style.setProperty('--dynamic-max-width', `${boardWidth / 4}px`);

    // Aplicar estilos dinámicos a gameOverImg
    let scaledWidth = gameOverImg.width / 2;
    let scaledHeight = gameOverImg.height / 2;
    gameOverImg.style.width = `${scaledWidth}px`;
    gameOverImg.style.height = `${scaledHeight}px`;

    defaultBackground = 'url("background-1.png")';
    // board.style.backgroundImage = defaultBackground;

    function initializeBackground() {
        if (defaultBackground) {
            // board.style.backgroundImage = `url(${defaultBackground})`;
        } else {
            board.style.backgroundImage = `url(${backgrounds[0]})`;
        }
    }

    // Doble búfer
    bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = boardWidth;
    bufferCanvas.height = boardHeight;
    bufferContext = bufferCanvas.getContext('2d');
    bufferContext.imageSmoothingEnabled = false;

    // Llamar a la función al cargar la página
    adjustBoardSize();

    // Cargar imagen de Orpe
    orpeImg = new Image();
    // orpeImg.src = "./orpe-png.png";

    topPipeImg = new Image();
    topPipeImg.src = "./top-candle.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottom-candle.png";

    // Configurar evento del botón Start
    startButton.addEventListener("click", function () {
        startInterface.style.display = "none";
        // startGame();
        showCharacterSelectionInterface();
    });

    // Mostrar interfaz MyWallet
    walletButton.addEventListener("click", function () {
        startInterface.style.display = "none";
        startInterface.classList.remove('show');
        showWalletInterface();
    });

    // Mostrar interfaz HighScores
    highScoresButton.addEventListener("click", function () {
        startInterface.style.display = "none";
        startInterface.classList.remove('show');
        if (isRegisteredWallet && addYourWalletSpan.style.display === "block") {
        addYourWalletSpan.style.display = "none";
        }
        updateHighScoresTable();
        showHighScoresInterface();
    });

    // Mostrar interfaz AboutUs
    aboutUsButton.addEventListener("click", function () {
        startInterface.style.display = "none";
        startInterface.classList.remove('show');
        showAboutUsInterface();
    });
    aboutUsIcon.addEventListener("click", function () {
        startInterface.style.display = "none";
        startInterface.classList.remove('show');
        showAboutUsInterface();
    });
    
    pasteButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('wallet-address-input').value = text;
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }
    });

    backButton.forEach(button => {
        button.addEventListener('click', function() {
            walletInterface.style.display = 'none';
            highScoresInterface.style.display = 'none';
            landingInterface.style.display = 'none';
            startInterface.style.display = 'block';
            setTimeout(() => {
                startInterface.classList.add('show');
            }, 10); // Pequeño retraso para asegurar que el cambio de display se aplique antes de la transición
        });
    });

    window.addEventListener("orientationchange", function() {
        adjustBoardSize();
    });

    window.addEventListener("keydown", function (e) {
        if (isGameStarted && (e.code === "Space" || e.code === "ArrowUp")) {
            jump();
        } else if (startInterface.style.display === 'block' && e.code === "Space") {
            startInterface.style.display = "none";
            if (!selectedCharacter) {
                showCharacterSelectionInterface()
            } else {
                startGame();
            }
        }
    });

    window.addEventListener('keyup', function(event) {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            isJumping = false;
        }
    });
    
    isDesktop = window.innerWidth > 768;

    if(isDesktop) {
        window.addEventListener("mousedown", function (e) {
            if (isGameStarted && e.button === 0) {
                jump();
            }
        });
    
        window.addEventListener("mouseup", function (e) {
            if (e.button === 0) {
                isJumping = false;
            }
        });
    }

    window.addEventListener("touchstart", function (event) {
        if (isGameStarted) {
            jump();
        }
    });

    window.addEventListener("touchend", function (event) {
        isJumping = false;
    });

    // const buttons = document.querySelectorAll("button");
    const initialButtons = document.querySelectorAll("#start-btn, #wallet-btn, #high-scores-btn");

    initialButtons.forEach(button => {
        button.addEventListener("mouseenter", () => {
            pointSound.currentTime = 0;
            pointSound.play();
        });
    });

    // Registrar y validar dirección de wallet
    registerWalletButton.addEventListener("click", function () {
        let wallet = addressInput.value;

        if (isValidSolanaAddress(wallet)) {
            fetch('register_wallet.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ wallet: wallet, csrf: document.querySelector('meta[name="csrf-token"]').content })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    walletMsgDiv.style.background = "limegreen";
                    walletMsgSpan.style.fontWeight = "bold";
                    // from data.message walletMsgSpan.textContent
                    walletMsgSpan.textContent = data.message;
                    userWalletAddress = wallet;
                    // Guardar la dirección de wallet en localStorage
                    localStorage.clear();
                    localStorage.setItem("userWalletAddress", userWalletAddress);
                    localStorage.setItem("userHighestScore", userHighestScore);
                    isRegisteredWallet = true;
                    loadSkins(userWalletAddress);
                } else {
                    walletMsgDiv.style.background = "";
                    walletMsgSpan.style.fontWeight = "";
                    walletMsgDiv.style.width = "";
                    walletMsgSpan.textContent = data.error;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                walletMsgDiv.style.background = "";
                walletMsgSpan.style.fontWeight = "";
                walletMsgDiv.style.width = "";
                walletMsgSpan.textContent = "An error occurred while registering the wallet address!";
            });
        } else if (userWalletAddress === "") {
            walletMsgDiv.style.background = "";
            walletMsgSpan.style.fontWeight = "";
            walletMsgDiv.style.width = "";
            walletMsgSpan.textContent = "Please enter a valid Solana wallet address!";
        } else {
            walletMsgDiv.style.background = "";
            walletMsgSpan.style.fontWeight = "";
            walletMsgDiv.style.width = "";
            walletMsgSpan.textContent = "Invalid Solana wallet address!";
        }

            walletMsgDiv.appendChild(walletMsgSpan);
    });

    // Cargar el user userHighestScore y user wallet desde localStorage
    loadUserHighestScore();
    loadUserWalletAddress();
    updateHighScoresTable();

    preloadBackgrounds();


    // Control de musica
    playIcon.style.display === "block";
    SoundBgmControl();

    // Mover botones de inicio y wallet por responsive
    function moveButtons() {
        const startAndWalletBtnContainer = document.getElementById("startandwalletbtncontainer");
        const buttonsContainer = document.getElementById("buttons-container");
        if (window.innerWidth >= 768) {
            // Mover botones al contenedor de escritorio
            buttonsContainer.appendChild(startButton);
            buttonsContainer.appendChild(walletButton);
        } else {
            // Mover botones de vuelta al contenedor original
            startAndWalletBtnContainer.appendChild(startButton);
            startAndWalletBtnContainer.appendChild(walletButton);
        }
    }

    moveButtons();
    window.addEventListener('resize', moveButtons);

    chosenSkin = localStorage.getItem('chosenSkin');
    background = localStorage.getItem('chosenBackground');
    music = localStorage.getItem('chosenMusic');

    if (chosenSkin) {
        changeGameSettings(chosenSkin, background, music);
    }
    startInterface.classList.add('show');

    const loadingScreen = document.getElementById("loading-screen");
    setTimeout(() => {
        loadingScreen.style.display = "none";
    }, 6500);
    toggleStartInterface();
    // localStorage.removeItem('userHighestScore');
    // localStorage.removeItem('highscores');

    isRegisteredWallet = userWalletAddress !== "";

    // Cargar las puntuaciones almacenadas en localStorage
    if (isRegisteredWallet) {
        addHighScore(userWalletAddress, userHighestScore);
        addYourWalletSpan.style.display = "none";
    }

    loadSkins(userWalletAddress);
};

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let isRotatedMobile;

function startGame() {
    // preloadBackgrounds();
    if (selectedCharacter === "orpe") {
        currentBackgroundIndex = -1;
        changeBackground();
    }
    characterSelectionInterface.style.display = "none";
    isRotatedMobile = isMobile && window.innerWidth > window.innerHeight;
    if (isRotatedMobile) {
        GameOver();
        return;
    }
    adjustPhysics();
    isGameStarted = true;
    
    if (isRegisteredWallet) {
        const csrf = document.querySelector('meta[name="csrf-token"]').content;
        fetch('start_game.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wallet_address: userWalletAddress,
                csrf: csrf
            })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Error al iniciar el juego:', data.error);
                // permitimos que juegue pero no se guardará registro!!!
                //return;
            }
        })
        .catch(error => {
            console.error('Error, no se guardará el score al finalizar.', error);
        });
        
    }
    orpe.y = orpeY;
    orpe.x = orpeX;
    pipeArray = [];
    score = 0;
    level = 0;
    pipeCounter = 0;
    gameOver = false;
    orpeFalled = false;
    openingSpace = board.height / 4 - (level * 10);

    board.style.animation = "none"; // Detenemos cualquier animación existente
    void board.offsetWidth; // Forzamos el reflow
    board.style.animation = "moveBackgroundFromZero 60s linear infinite"; // Aplicamos la nueva animación

    if (isBgmControlActive && bgm.paused) {
        bgmInstance.play();
    }

    lastFrameTime = performance.now();

    if (isDesktop || !isSafari) {
        console.log('User agent:', navigator.userAgent);
        console.log("isDesktop || Android update");
        requestAnimationFrame(updateDesktop);
    } else {
        console.log('User agent:', navigator.userAgent);
        console.log("isMobile update");
        requestAnimationFrame(updateMobile)
    }
}

function SoundBgmControl() {
    bgmMuteButton.addEventListener("click", function () {
        // Intentar reproducir el audio solo cuando se haya tocado el botón
        if (pauseIcon.style.display === "none") {
            playIcon.style.display = "none";
            pauseIcon.style.display = "block";
            bgmMuteButton.setAttribute("aria-label", "Pause bgm");
            isBgmControlActive = false;
        } else {
            playIcon.style.display = "block";
            pauseIcon.style.display = "none";
            bgmMuteButton.setAttribute("aria-label", "Play bgm");
            isBgmControlActive = true;
        }
    });
}

function isSafariOnIOS() {
    return /iP(ad|hone|od).+Version\/[\d.]+.*Safari/i.test(navigator.userAgent);
}

const isSafari = isSafariOnIOS();

let textGradient; // Variable global para almacenar el gradiente

function initializeBufferContext() {
    bufferCanvas = document.createElement('canvas');
    bufferContext = bufferCanvas.getContext('2d');

    // Establecer dimensiones del bufferCanvas para evitar problemas con clearRect()
    bufferCanvas.width = boardWidth;
    bufferCanvas.height = boardHeight;

    // Crear el gradiente y almacenarlo en una variable global
    textGradient = bufferContext.createLinearGradient(0, 0, 0, 45);
    textGradient.addColorStop(0, "#ffc700");
    textGradient.addColorStop(1, "#ff5e00");
}

initializeBufferContext();

function updateDesktop() {
    if (gameOver) {
        return;
    }
    requestAnimationFrame(updateDesktop);

    // Calcular el tiempo transcurrido desde el último frame
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000; // Convertir a segundos
    lastFrameTime = currentTime;
    const normalizedDeltaTime = deltaTime / BASE_DELTA_TIME;


    velocityY += gravity * normalizedDeltaTime;
    orpe.y += velocityY * normalizedDeltaTime;

    // Lógica de actualización
    orpe.y = Math.max(orpe.y, 0 - orpeHeight);

    bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    bufferContext.drawImage(orpeImg, orpe.x, orpe.y, orpe.width, orpe.height);

    // Optimización: Usar un bucle for inverso para eliminar pipes fuera de pantalla
    for (let i = pipeArray.length - 1; i >= 0; i--) {
        let pipe = pipeArray[i];
        pipe.x += velocityX * normalizedDeltaTime;

        bufferContext.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        if (!pipe.passed && (orpe.x + orpe.width / 4) > (pipe.x + pipe.width / 3) && orpe.y < pipe.y) {
            score += 1;
            pipe.passed = true;
            if (!pointSoundInstance.paused) {pointSoundInstance.currentTime = 0};
            pointSoundInstance.play();
        }
        if (pixelPerfectCollision(orpe, pipe)) {
            hitSoundInstance.play();
            GameOver();
            return;
        }
        if (pipe.x < -pipe.width) {
            pipeArray.splice(i, 1);
        }
    }
    if (orpe.y > boardHeight) {
        teleportSoundInstance.play();
        orpe.y = -30;
        velocityY = 0;
    }
    if (orpe.y + orpeHeight <= 0) {
        teleportSoundInstance.play();
        orpe.y = boardHeight;
    }

    bufferContext.fillStyle = textGradient;
    bufferContext.font = "700 45px Nunito";
    bufferContext.fillText(Math.floor(score), 25, 45);

    context.clearRect(0, 0, boardWidth, boardHeight);
    context.drawImage(bufferCanvas, 0, 0);
}

function updateMobile() {
    if (gameOver) {
        return;
    }
    requestAnimationFrame(updateMobile);

    // Calcular el tiempo transcurrido desde el último frame
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000; // Convertir a segundos
    lastFrameTime = currentTime;
    const normalizedDeltaTime = deltaTime / BASE_DELTA_TIME;

    velocityY += gravity;
    orpe.y += velocityY;

    // Lógica de actualización
    orpe.y = Math.max(orpe.y, 0 - orpeHeight);

    bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    bufferContext.imageSmoothingEnabled = false;
    bufferContext.drawImage(orpeImg, orpe.x, orpe.y, orpe.width, orpe.height);

    // Optimización: Usar un bucle for inverso para eliminar pipes fuera de pantalla
    for (let i = pipeArray.length - 1; i >= 0; i--) {
        console.log(pipeArray.length);
        let pipe = pipeArray[i];
        pipe.x += velocityX * normalizedDeltaTime;
        
        bufferContext.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        if (!pipe.passed && (orpe.x + orpe.width / 4) > (pipe.x + pipe.width / 3) && orpe.y < pipe.y) {
            score += 1;
            pipe.passed = true;
            if (!pointSoundInstance.paused) {pointSoundInstance.currentTime = 0};
            pointSoundInstance.play();
        }
        if (pixelPerfectCollision(orpe, pipe)) {
            hitSoundInstance.play();
            GameOver();
            return;
        }
        if (pipe.x < -pipe.width) {
            pipeArray.splice(i, 1);
        }
    }
    if (orpe.y > boardHeight) {
        teleportSoundInstance.play();
        orpe.y = -30;
        velocityY = 0;
    }
    if (orpe.y + orpeHeight <= 0) {
        teleportSoundInstance.play();
        orpe.y = boardHeight;
    }
    
    bufferContext.fillStyle = textGradient;
    bufferContext.font = "700 45px Nunito";
    bufferContext.fillText(Math.floor(score), 25, 45);

    context.clearRect(0, 0, boardWidth, boardHeight);
    context.imageSmoothingEnabled = false;
    context.drawImage(bufferCanvas, 0, 0);
}

function GameOver() {
    gameOver = true;
    isGameStarted = false;
    console.log('Score actual:', Math.floor(score));
    console.log('User highest score actual:', userHighestScore);

    // Pausar música y reiniciar
    bgmInstance.pause();
    bgmInstance.currentTime = 0;

    setUserHighestScore();

    // Mostrar score y highscore personal
    setTimeout(function() {
        // Verifica la selección de elementos
        gameOverInterface.style.display = 'flex';
        if (!score) {
            jeeterDetectedSoundInstance.play();
            gameOverHighscoreSpan.textContent = "";
            gameOverScoreSpan.textContent = 'Jeeter detected.';
        } else if (userHighestScore === score) {
            gameOverScoreSpan.textContent = "";
            gameOverHighscoreSpan.textContent = 'Highscore: ' + userHighestScore;
            highscoreSoundInstance.play();
        } else {
            gameOverHighscoreSpan.textContent = "";
            gameOverScoreSpan.textContent = 'Score: ' + Math.floor(score);
            gameOverSoundInstance.play();
        }
        }, 300);

        // Mostrar la interfaz de inicio después de un retraso
        setTimeout(function() {
            if (userHighestScore === score) {
                highScoresInterface.style.display = "block";
            }
            else {
                startInterface.style.display = "block";
            }
            gameOverInterface.style.display = "none";
            // board.style.backgroundImage = defaultBackground;
            currentBackgroundIndex = 0;
            context.clearRect(0, 0, boardWidth, boardHeight);
        }, 3000);
}

function allPipesOffScreen() {
    return pipeArray.every(pipe => pipe.x + pipe.width < 0);
}

let isFirstLevel = true;

// colocar obstáculos
function placePipes() {
    if(gameOver) {
        return;
    }

    isRotatedMobile = isMobile && window.innerWidth > window.innerHeight;
    if (isRotatedMobile) {
        gameOver();
        return;
    }

    // Cada vez que se crea un nuevo pipe, se incrementa el contador
    pipeCounter++;
    if (pipeCounter % 22 === 0 && selectedCharacter === 'orpe') {
        changeBackground();
    }
    // Cada x pipes, aumentamos el nivel y reducimos la apertura entre los pipes
    if (pipeCounter % 10 === 0) {
        level++;
        placePipesVelocity = Math.max(500, placePipesVelocity - 100); // Reducir la velocidad con un límite mínimo de 500ms
        clearInterval(pipeInterval);

        // Reiniciar el intervalo de colocación de pipes con el nuevo valor de placePipesVelocity
        setTimeout(() => {
            velocityX -= 1;
            pipeInterval = setInterval(placePipes, placePipesVelocity);
            isFirstLevel = false;
        }, isFirstLevel ? 4500 : 3000);
    }

    // Calculamos la apertura entre pipes en función del nivel
    openingSpace = board.height / 4 - (level * 10);
    openingSpace = Math.max(openingSpace, minOpeningSpace); // Aseguramos que no baje de la apertura mínima

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };

    pipeArray.push(topPipe, bottomPipe);
}

// Colisión de píxeles perfecta basada en la transparencia
function pixelPerfectCollision(orpe, pipe) {
    let adjustedOrpeX = orpe.x + (orpe.width / 3);
    let adjustedOrpeWidth = orpe.width * (2 / 3);

    let intersectionX = Math.max(adjustedOrpeX, pipe.x);
    let intersectionY = Math.max(orpe.y, pipe.y);
    let intersectionWidth = Math.min(adjustedOrpeX + adjustedOrpeWidth, pipe.x + pipe.width) - intersectionX;
    let intersectionHeight = Math.min(orpe.y + orpe.height, pipe.y + pipe.height) - intersectionY;

    if (intersectionWidth <= 0 || intersectionHeight <= 0) {
        return false;
    }

    let tempCanvas = document.createElement("canvas");
    let tempContext = tempCanvas.getContext("2d", { willReadFrequently: true });
    tempCanvas.width = Math.max(intersectionWidth, 1);
    tempCanvas.height = Math.max(intersectionHeight, 1);

    try {
        tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempContext.drawImage(orpeImg, adjustedOrpeX - intersectionX, orpe.y - intersectionY, adjustedOrpeWidth, orpe.height);
        let orpeData = tempContext.getImageData(0, 0, intersectionWidth, intersectionHeight).data;

        tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempContext.drawImage(pipe.img, pipe.x - intersectionX, pipe.y - intersectionY, pipe.width, pipe.height);

        let pipeData = tempContext.getImageData(0, 0, intersectionWidth, intersectionHeight).data;

        for (let i = 0; i < orpeData.length; i += 4) {
            if (orpeData[i + 3] !== 0 && pipeData[i + 3] !== 0) {
                return true;
            }
        }
    } catch (e) {
        console.error("Error during collision detection:", e);
        return false;
    }

    return false;
}


function jump() {
    if (!isJumping) {
        wingSoundInstance.play();
        velocityY = jumpStrength;  // Impulsar a Orpe hacia arriba
        isJumping = true;
        // console.log('Jumping');
    }
}


// USER DATA STORAGE

// Función para validar una dirección de wallet de Solana
function isValidSolanaAddress(addressInput) {
    // Expresión regular para validar una dirección de wallet de Solana
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return solanaAddressRegex.test(addressInput);
};

// Función para registrar una dirección de wallet
// async function registerWallet() {
//     isRegisteredWallet = true;
//     userWalletAddress = addressInput.value;

//     // Verificar si la wallet ya existe en la base de datos
//     await checkWalletExistsInDatabase(userWalletAddress);
//     updateHighScoresTable();

//     setTimeout(() => {
//         walletMsgSpan.textContent = "Wallet already registered.";
//         walletMsgDiv.style.background = "";
//         walletMsgDiv.style.fontWeight = "";
//     }, 2100);
// };

// Función para verificar si la wallet existe en la base de datos
async function checkWalletExistsInDatabase(walletAddress) {
    try {
        const response = await fetch(`check_wallet_score.php?wallet_address=${walletAddress}`);
        if (!response.ok) {
            throw new Error('Error al verificar la wallet');
        }
        const highScore = await response.json();
        if (highScore !== null) {
            await loadUserWalletData(walletAddress);
        } else {
            userHighestScore = 0; 
            localStorage.setItem("userWalletAddress", walletAddress);
            localStorage.setItem("userHighestScore", userHighestScore);
            addHighScore(walletAddress, userHighestScore);
        }
    } catch (error) {
        console.error('Error al verificar la wallet:', error);
        return null;
    }
}

// Función para cargar los datos de la wallet desde la base de datos
async function loadUserWalletData(walletAddress) {
    try {
        const response = await fetch(`check_wallet_score.php?wallet_address=${walletAddress}`);
        if (!response.ok) {
            throw new Error('Error al obtener el highscore');
        }
        const highScore = await response.json();
        userHighestScore = highScore.score;
        localStorage.setItem("userWalletAddress", walletAddress);
        localStorage.setItem("userHighestScore", userHighestScore);
    } catch (error) {
        console.error('Error al obtener el highscore:', error);
    }
}

// Función para cargar la dirección de wallet desde localStorage
function loadUserWalletAddress() {
    const storedAddress = localStorage.getItem("userWalletAddress");
    if (storedAddress !== null) {
        userWalletAddress = storedAddress;
        addressInput.value = userWalletAddress;
        walletMsgSpan.style.display = "block";
        walletMsgDiv.style.display = "block";
        walletMsgSpan.textContent = "Wallet already registered.";
    } else {
        userWalletAddress = "";
    }
}

// Función para registrar el userHighestScore
function setUserHighestScore() {
    if (score > 0 && (!userHighestScore || isNaN(userHighestScore) || score > userHighestScore)) {
        userHighestScore = score;
        localStorage.setItem("userHighestScore", userHighestScore);
        console.log('userHighestScore actualizado:', userHighestScore);
        if (isRegisteredWallet) {
            addHighScore(userWalletAddress, userHighestScore, chosenSkin);
        }
    }
};

// Función para cargar el userHighestScore desde localStorage
function loadUserHighestScore() {
    const storedScore = localStorage.getItem('userHighestScore');
    if (storedScore !== null) {
        userHighestScore = parseInt(storedScore, 10);
    } else {
        userHighestScore = 0;
    }
};

function addHighScore(address, highScore, skin) {
    // Cargar los highScores existentes desde localStorage
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Encontrar el índice del usuario en el array de highScores
    const index = highScores.findIndex(score => score.address === address);

    if (index !== -1) {
        // Si el usuario ya existe, actualiza su highScore
        highScores[index].highScore = highScore;
        highScores[index].skin = skin;
    } else {
        // Si el usuario no existe, agrega un nuevo objeto con su address y highScore
        highScores.push({ address: address, highScore: highScore, skin: skin});
    }

    // Guardar los highScores actualizados en localStorage
    localStorage.setItem('highScores', JSON.stringify(highScores));
    //obtener valor de csrf token
    const csrf = document.querySelector('meta[name="csrf-token"]').content;
    // Enviar los datos al servidor
    fetch('add_high_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: address, highScore: highScore , skin: skin, csrf: csrf})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Puntuación agregada/actualizada exitosamente');
            updateHighScoresTable();
        } else {
            console.error('Error al agregar/actualizar la puntuación');
        }
    })
    .catch(error => console.error('Error:', error));
}

const maxChars = 30;

async function updateHighScoresTable() {
    const highScores = await fetchHighScoresFromDatabase();
    // Ordenar las puntuaciones de mayor a menor
    highScores.sort((a, b) => b.score - a.score);

    // Limpiar la tabla antes de actualizarla
    highScoresTable.innerHTML = `
        <tr>
            <th>Rank</th>
            <th>Wallet Address</th>
            <th>Score</th>
            <th>Skin</th>
        </tr>
    `;

    // Crear filas con las puntuaciones almacenadas
    highScores.forEach((highScore, index) => {
        const newRow = highScoresTable.insertRow();
        const rankCell = newRow.insertCell(0);
        const walletCell = newRow.insertCell(1);
        const scoreCell = newRow.insertCell(2);
        const skinCell = newRow.insertCell(3);

        rankCell.innerText = index + 1;
        walletCell.innerText = highScore.wallet_address.length > maxChars 
            ? highScore.wallet_address.substring(0, maxChars) + '...' 
            : highScore.wallet_address;
        scoreCell.innerText = highScore.score;

        const skin = highScore.skin === 'default' ? 'orpe' : highScore.skin;

        // Asignar la imagen o icono basado en el valor de skin
        const img = document.createElement('img');
        img.src = `./characters/${skin}.png`; // Ajusta la ruta según sea necesario
        img.alt = highScore.skin;
        img.classList.add('skin-icon'); // Añadir clase para estilos CSS
        skinCell.appendChild(img);

        walletCell.classList.add('wallet-address-th');
        if (highScore.wallet_address === userWalletAddress) {
            walletCell.classList.add('user-current-address'); // Añadir clase a walletCell
        }

        // Asignar clases a los primeros 3 puestos
        if (index === 0) {
            newRow.classList.add('first-place');
            walletCell.classList.add('first-place-label');
            if (highScore.wallet_address === userWalletAddress) {
                walletCell.classList.add('first-place');
            }
        } else if (index === 1) {
            newRow.classList.add('second-place');
            if (highScore.wallet_address === userWalletAddress) {
                walletCell.classList.add('second-place');
            }
        } else if (index === 2) {
            newRow.classList.add('third-place');
            if (highScore.wallet_address === userWalletAddress) {
                walletCell.classList.add('third-place');
            }
        }
    });

    // Cambiar innerText de la celda con clase 'user-current-address'
    const userCurrentAddressCell = document.querySelector('.user-current-address');
    if (userCurrentAddressCell) {
        userCurrentAddressCell.innerText = 'Your Wallet';
    }
}


async function fetchHighScoresFromDatabase() {
    try {
        const response = await fetch('get_highscores.php'); // Llamada al nuevo endpoint PHP
        if (!response.ok) {
            throw new Error('Error al obtener los highscores');
        }
        const highScores = await response.json();
        return highScores;
    } catch (error) {
        console.error('Error al obtener los highscores:', error);
        return [];
    }
}

