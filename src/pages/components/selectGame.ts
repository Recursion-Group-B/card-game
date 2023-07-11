const selectGame = `
<div class="slider">
    <div id="imgList" class="d-none">
        <div id="poker" class="slider-item">
            <h3>Poker</h3>
            <button class="btn btn-link text-reset" data-game="poker">
                <img src="public/pokerImg.png" class="img-fit">
            </button>
        </div>
        <div id="texas" class="slider-item">
            <h3>Texas Hold'em Poker</h3>
            <a href="src/pages/texasholdem.html">
                <img src="public/texasImg.png" class="img-fit">
            </a>
        </div>
        <div id="blackjack" class="slider-item">
            <h3>BlackJack</h3>
            <button class="btn btn-link text-reset" data-game="blackjack">
                <img src="public/blackjackImg.png" class="img-fit">
            </button>
        </div>
        <div id="war" class="slider-item">
            <h3>War</h3>
            <button class="btn btn-link text-reset" data-game="war">
                <img src="public/warImg.png" class="img-fit">
            </button>
        </div>
        <div id="speed" class="slider-item">
            <h3>Speed</h3>
            <button class="btn btn-link text-reset" data-game="speed">
                <img src="public/speedImg.png" class="img-fit">
            </button>
        </div>
    </div>
    <div class="slides d-flex justify-content-around">
        <button id="leftBtn" class="btn btn-link text-reset">
            <ion-icon name="chevron-back-outline" size="large"></ion-icon>
        </button>

        <div id="target"></div>

        <button id="rightBtn" class="btn btn-link text-reset">
            <ion-icon name="chevron-forward-outline" size="large"></ion-icon>
        </button>
    </div>
</div>
`;

export default selectGame;
