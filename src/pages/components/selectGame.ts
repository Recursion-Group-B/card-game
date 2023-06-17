const selectGame = `
<div class="slider">
    <div id="imgList" class="d-none">
        <div id="poker" class="slider-item">
            <h3>Poker</h3>
            <a href="src/scenes/games/poker/game.html">
                <img src="public/pokerImg.png" class="img-fit">
            </a>
        </div>
        <div id="blackjack" class="slider-item">
            <h3>BlackJack</h3>
            <a href="src/scenes/games/blackjack/game.html">
                <img src="public/blackjackImg.png" class="img-fit">
            </a>
        </div>
        <div id="war" class="slider-item">
            <h3>War</h3>
            <a href="src/scenes/games/war/game.html">
                <img src="public/warImg.png" class="img-fit">
            </a>
        </div>
        <div id="speed" class="slider-item">
            <h3>Speed</h3>
            <a href="src/scenes/games/speed/game.html">
                <img src="public/speedImg.png" class="img-fit">
            </a>
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
