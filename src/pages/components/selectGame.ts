const selectGame = `
<div class="slider">
    <div id="imgList" class="d-none">
        <div id="poker" class="slider-item">
            <a href="src/scenes/games/poker/game.html">
                <img src="public/pokerImg.png" class="img-fit">
            </a>
        </div>
        <div id="blackjack" class="slider-item">
            <a href="#">
                <img src="public/blackjackImg.png" class="img-fit">
            </a>
        </div>
        <div id="war" class="slider-item">
            <a href="#">
                <img src="public/warImg.png" class="img-fit">
            </a>
        </div>
        <div id="speed" class="slider-item">
            <a href="#">
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
