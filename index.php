<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport", content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="image/x-icon" href="favicon.ico">
        <title>Flappy Frog: The First SOLANA Game</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="flappyorpe.css">
        <link rel="preload" href="./characters/orpe.png" as="image">
        <link rel="preload" href="./characters/trump.png" as="image">
        <link rel="preload" href="background-1.png" as="image">
        <?php
            # PHP INICIA SESION
            session_start();
            
            # CREAMOS TOKEN Y LO GUARDAMOS EN $_SESSION
            $token = bin2hex(random_bytes(64));
            $_SESSION['csrf'] = $token;
            
            echo '<meta name="csrf-token" content="'.$token.'">';
        ?>
        <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>
        <script type="module">
            import { Buffer } from "https://cdn.jsdelivr.net/npm/buffer@6.0.3/+esm";
            window.Buffer = Buffer; // Lo hace accesible globalmente
        </script>
        <script type="module">
            import bs58 from "https://cdn.jsdelivr.net/npm/bs58/+esm";
            window.bs58 = bs58; // Lo hace accesible globalmente
        </script>
        <script src ="web3-integration.js" type="module"></script>
        <script src="flappyorpe.js" type="module"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <!-- <script src="web3-integration.js" defer></script> -->
    </head>
    <body>
        <div id="loading-screen">
            <img src="./characters/orpe.png" alt="Game Logo" class="orpe-in-rocket logo">
            <div id="loading-text">
                Loading<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>
            </div>
            <script>
                const loadingText = document.getElementById("loading-text");
                const loadingPhrases = ["Loading", "Fueling the rocket", "Identifying the jeeters", "Dousing them with gasoline", "Setting them on fire", "Pissing on their bodies", "Jumping on their graves", "Pumping the chart to the moon", "Evading the SEC", "Tracking the paper hands", "Loading the flamethrower", "Gaslighting the bears", "Counting the jeeters’ tears", "Sharpening the memes"];
                let currentPhraseIndex = 0;

                function changeLoadingPhrase() {
                    loadingText.innerHTML = loadingPhrases[currentPhraseIndex] + '<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>';
                    currentPhraseIndex = (currentPhraseIndex + 1) % loadingPhrases.length;
                }

                changeLoadingPhrase();
                let phraseInterval = setInterval(changeLoadingPhrase, 1000);
            </script>
        </div>
        <div id="start-interface" class="start-interface">
            <div id="header">
                <!-- <h6 id="orpe-games-h6">ORPE<span>
                <h6 id="orpe-games-h6">Buy $FlappyFrog<span>
                <img id="orpe-logo" src="pepepng.png" alt="orpe-logo" class="orpe-logo">
                </span>Play</h6> -->
                <button id="play-button" aria-label="Play Anthem">
                    <svg id="play-icon" width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.25 7.025C18.25 4.5992 15.4002 3.29512 13.5645 4.8809L8.84783 8.95536C8.33317 9.39995 7.67576 9.64459 6.99567 9.64459L4.79164 9.64461C2.83564 9.64462 1.25 11.2303 1.25 13.1863V17.8513C1.25 19.8073 2.83566 21.393 4.79166 21.393H6.99571C7.67582 21.393 8.33323 21.6376 8.8479 22.0822L13.5645 26.1566C15.4002 27.7424 18.25 26.4383 18.25 24.0125V15.5188V7.025Z" fill="currentColor" stroke="currentColor" stroke-width="2.125"></path>
                    </svg>
                    <svg id="pause-icon" width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:none;">
                        <path d="M18.25 7.025C18.25 4.5992 15.4002 3.29512 13.5645 4.8809L8.84783 8.95536C8.33317 9.39995 7.67576 9.64459 6.99567 9.64459L4.79164 9.64461C2.83564 9.64462 1.25 11.2303 1.25 13.1863V17.8513C1.25 19.8073 2.83566 21.393 4.79166 21.393H6.99571C7.67582 21.393 8.33323 21.6376 8.8479 22.0822L13.5645 26.1566C15.4002 27.7424 18.25 26.4383 18.25 24.0125V15.5188V7.025Z" fill="currentColor" stroke="currentColor" stroke-width="2.125"></path>
                        <line x1="4" y1="27" x2="26" y2="5" stroke="currentColor" stroke-width="2.125" stroke-linecap="round"></line>
                    </svg>
                </button>
            </div>
            <h1 id="flappy-frog-logo">Flappy Frog</h1>
            <img src="./characters/orpe.png" alt="Game Logo" class="orpe-in-rocket logo">
            <div id="parent-container">
                <div id="buttons-container">
                    <div id="startandwalletbtncontainer">
                        <button id="start-btn" class="start-btn btn btn1">Start</button>
                        <button id="wallet-btn" class="wallet-btn btn btn2">My Wallet</button>
                    </div>
                    <button id="high-scores-btn" class="high-scores-btn btn btn3">High-Scores</button>
                    <button id="pumpfun-btn" class="pumpfun-btn btn btn4">Buy on GMGN<img src="gmgn-logo.png" alt="PumpFun Logo" id="pumpfun-logo" class="pumpfun-logo"></button>
                    <button id="dexscreener-btn" class="dexscreener-btn btn btn5">Buy on dexscreener<img src="dex-logo.png" alt="PumpFun Logo" id="dexscreener-logo" class="pumpfun-logo"></button>
                </div>
            </div>
            <div id="social-container">
                <a href="https://x.com/flappyfroggame" target="_blank">
                    <i class="fa-brands fa-x-twitter" aria-hidden="true"></i>
                </a>
                <a href="https://instagram.com/" target="_blank">
                    <i class="fa-brands fa-instagram" aria-hidden="true"></i> 
                </a>
                <a href="https://t.me/flappyfroggame" target="_blank">
                    <i class="fa-brands fa-telegram" aria-hidden="true"></i>
                </a>
                <a id="about-us-icon">
                    <i class="fa-regular fa-circle-question"></i>
                </a>
            </div>
            <button class="about-us-btn" id="about-us-btn">ABOUT US</button>
        </div>
        <div id="character-selection-interface">
            <h2>Choose Your Flapper</h2>
            <button id="left-arrow" class="arrow-btn">&lt;</button>
            <div id="character-selection-container">
                <!-- <div class="character-content">
                    <span class="character-name">Flappy-Frog</span>
                    <img src="./characters/orpe.png" id="default-character" alt="default-character" class="character-img">
                    <button class="character-btn btn" id="default-character-btn" data-character="orpe" data-background="background-orpe" data-music="orpe-anthem.mp3">Select</button>
                </div>
                <div class="character-content">
                    <span class="character-name">Flappy-Trump</span>
                    <img src="./characters/trump.png" id="trump-character" alt="trump-character" class="character-img">
                    <button class="character-btn btn" id="trump-character-btn" data-character="trump" data-background="background-trump" data-music="trump-anthem.mp3">Buy Skin</button>
                    <button class="character-btn btn" id="trump-character-btn" data-character="trump" data-background="background-trump" data-music="trump-anthem.mp3">Buy (test) <img src="sol-logo.png" class="sol-logo" alt="Solana Logo"></button>
                </div>
                <div class="character-content">
                    <span class="character-name">Flappy-Elon</span>
                    <img src="./characters/elon.png" id="elon-character" alt="elon-character" class="character-img">
                    <button class="character-btn btn" id="elon-character-btn" data-character="elon" data-background="background-elon" data-music="elon-anthem.mp3">Try for free</button>
                    <button class="character-btn btn" id="elon-character-btn" data-character="elon" data-background="background-elon" data-music="elon-anthem.mp3">Buy for<br>0.1 SOL<img src="sol-logo.png" class="sol-logo" alt="Solana Logo"></button>
                </div>
                <div class="character-content">
                    <span class="character-name">Flappy-Milei</span>
                    <img src="./characters/milei.png" id="milei-character" alt="milei-character" class="character-img">
                    <button class="character-btn btn" id="milei-character-btn" data-character="milei" data-background="background-milei" data-music="milei-anthem.mp3">Try for free</button>
                    <button class="character-btn btn" id="milei-character-btn" data-character="milei" data-background="background-milei" data-music="milei-anthem.mp3">Buy for<br>0.1 SOL<img src="sol-logo.png" class="sol-logo" alt="Solana Logo"></button>
                </div>
                <div class="character-content">
                    <span class="character-name">Flappy-Abascal</span>
                    <img src="./characters/abascal.png" id="abascal-character" alt="abascal-character" class="character-img">
                    <button class="character-btn btn" id="abascal-character-btn" data-character="abascal" data-background="background-abascal" data-music="abascal-anthem.mp3">Try for free</button>
                    <button class="character-btn btn" id="abascal-character-btn" data-character="abascal" data-background="background-abascal" data-music="abascal-anthem.mp3">Buy for<br>0.1 SOL<img src="sol-logo.png" class="sol-logo" alt="Solana Logo"></button>
                </div>
                <div class="character-content kol">
                    <span class="character-name kol">Flappy-Winny</span>
                    <img src="./characters/winny.png" id="winny-character" alt="winny-character" class="character-img">
                    <button class="character-btn btn" id="winny-character-btn" data-character="winny" data-background="background-winny" data-music="winny-anthem.mp3">Choose KOL</button>
                </div>
                <div class="character-content kol">
                    <span class="character-name kol">Flappy-Genuine</span>
                    <img src="./characters/genuine.png" id="genuine-character" alt="genuine-character" class="character-img">
                    <button class="character-btn btn" id="genuine-character-btn" data-character="genuine" data-background="background-genuine" data-music="genuine-anthem.mp3">Choose KOL</button>
                </div>
                <div class="character-content rizo">
                    <span class="character-name">Flappy-Rizo</span>
                    <img src="./characters/rizo.png" id="rizo-character" alt="rizo-character" class="character-img">
                    <button class="character-btn btn" id="rizo-character-btn" data-character="rizo" data-background="background-rizo" data-music="rizo-anthem.mp3">Select</button>
                </div> -->
            </div>
            <button id="right-arrow" class="arrow-btn">&gt;</button>
        </div>
        <div id="game-over-interface">
            <img id="game-over-img" src="game-over.png" alt="Game Over Img">
            <span id="game-over-score" class="score"></span>
            <span id="game-over-highscore" class="score"></span>
        </div>
        <div id="my-wallet-interface">
            <h2>My Wallet</h2>
            <div id="my-wallet-container">
                <p>Enter your SOL wallet address to register your highscore and compete for the prize!</p>
                <label for="wallet-address-input">Wallet Address:</label>
                <div class="input-container">
                    <input type="text" id="wallet-address-input" name="wallet-address-input" placeholder="Wr1t3MyS0lAddre5sHer3...">
                    <button id="paste-btn" class="paste-btn btn" type="button">
                        <img src="paste-1.svg" alt="Paste" class="paste-icon">
                    </button>
                </div>
                <button id="register-wallet-btn" class="register-wallet-btn btn">Register</button>
            </div>
            <div id="wallet-msg-container">
                <span id="wallet-registered-msg"></span>
            </div>
            <button id="back-to-start-wallet-btn" class="back-btn btn">Back</button>
        </div>
        <div id="high-scores-interface">
            <h2>High-Scores</h2>
            <div class="trophy-container">
                <img id="trophy-img" src="trophy.png" alt="Trophy Img">
                <div class="prize-info">
                    <span id="prize-text">Weekly Prize:</span>
                    <span id="prize-ammount">1M $FLAPPYFROG</span>
                </div>
            </div>
            <div id="high-scores-container">
                <table id="high-scores-table">
                    <tr>
                        <th>Rank</th>
                        <th class="wallet-address-th">Wallet Address</th>
                        <th>Score</th>
                    </tr>
                </table>
            </div>
            <span id="add-your-wallet-span">Add your wallet in <span class="orange-text">"My Wallet"</span> to register your score!</span>
            <button id="back-to-start-highscores-btn" class="back-btn btn">Back</button>
        </div>
        <canvas id="board"></canvas>
        <div id="landing-interface">
            <div id="main-section">
                <h1 id="flappy-frog-logo">Flappy Frog</h1>
                <img src="./characters/orpe.png" alt="Game Logo" class="orpe-in-rocket logo">
                <p>Flappy Frog is the first game on the Solana ecosystem. <br>Play now and compete for the weekly prize of <span>100k $FLAPPYFROG!</span></p>
                <p id="ca">CA: Ch2Ng9gZmo4VCf9iknfm5gy1je3mxCiZBSv48W6Bpump</p>
                <div id="buybutton-container">
                    <button id="pumpfun-btn" class="pumpfun-btn btn btn4">Buy on GMGN<img src="gmgn-logo.png" alt="PumpFun Logo" id="pumpfun-logo" class="pumpfun-logo"></button>
                    <button id="dexscreener-btn" class="dexscreener-btn btn btn5">Buy on dexscreener<img src="dex-logo.png" alt="PumpFun Logo" id="dexscreener-logo" class="pumpfun-logo"></button>
                </div>
            </div>
            <hr>
            <div id="founder-section">
                <h2>About the Founder</h2>
                <div id="founder-info">
                    <img src="founder.jpg" alt="Founder Image" class="founder-image">
                    <p>	Thomas Harrington (@StvfreBTC), a marketer by profession and a developer in his spare time, has been deep in the crypto space for over eight years. <br><br>Before launching $FLAPPYFROG on Solana, he was part of the lead team of another memecoin as a web dev, so he knows what it takes to bring wild projects to life (and actually make them work). <br><br> Meet Thomas here:</p>
                </div>
                <div id="social-container" class="social-container">
                    <a href="https://x.com/stvfrebtc" target="_blank">
                        <i class="fa-brands fa-x-twitter" aria-hidden="true"></i>
                    </a>
                    <a href="https://www.instagram.com/stvfre_ok/" target="_blank">
                        <i class="fa-brands fa-instagram" aria-hidden="true"></i> 
                    </a>
                    <a href="https://t.me/stvfrebtc" target="_blank">
                        <i class="fa-brands fa-telegram" aria-hidden="true"></i>
                    </a>
                </div>
            </div>
            <hr>
            <div id="vision-section">
                <h2>Vision and Roadmap</h2>
                <section id="roadmap">
                    <div class="container">
                        <div class="timeline">
                            <div class="timeline-item left">
                                <div class="content">
                                    <h3>Phase 1</h3>
                                    <ul>
                                        <li>Develop Flappy-Frog</li>
                                        <li>Launch $FlappyFrog token on Pump.fun</li>
                                        <li>Community building</li>
                                        <li>Develop a Telegram game bot</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="timeline-item right">
                                <div class="content">
                                    <h3>Phase 2</h3>
                                    <ul>
                                        <li>Integration of SOL Payments via Phantom & Game Monetization</li>
                                        <li>New Character Development & Microtransaction Economy</li>
                                        <li>Launch iOS app with Apple Pay integration</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="timeline-item left">
                                <div class="content">
                                    <h3>Phase 3</h3>
                                    <ul>
                                        <li>Massive & scalable marketing strategy</li>
                                        <li>Partnerships with KOLs and Gaming Influencers</li>
                                        <li>Apply for CoinGecko, CoinMarketCap, and Big CEX listings</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="timeline-item right">
                                <div class="content">
                                    <h3>Phase 4</h3>
                                    <ul>
                                        <li>Launch FlappyFrog metaverse and NFT Collection</li>
                                        <li>Develop and release three new Play-to-Win games</li>
                                        <li>Integrate all games into a unified, Web3-powered play-to-win gaming hub</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <div id="back-btn-container">
                <button id="fixed-back-btn" class="back-btn btn"><i class="fas fa-arrow-left">Back and Play</i></button>
            </div>
        </div>
    </body>
</html>