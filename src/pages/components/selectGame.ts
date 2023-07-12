const selectGame = `
<div class="swiper mySwiper">
    <div class="swiper-wrapper">
        <div id="poker" class="swiper-slide">
            <div class="slider-item">
                <button class="btn btn-link text-reset" data-game="poker">
                    <img src="/pokerImg.png" class="img-fit">
                </button>
                <h3>Poker</h3>
            </div>
        </div>
        <div id="texas" class="swiper-slide">
            <div class="slider-item">
                <button class="btn btn-link text-reset" data-game="texas">
                    <img src="/texasImg.png" class="img-fit">
                </button>
                <h3>Texas Hold'em Poker</h3>
            </div>
        </div>
        <div id="blackjack" class="swiper-slide">
            <div class="slider-item">
                <button class="btn btn-link text-reset" data-game="blackjack">
                    <img src="/blackjackImg.png" class="img-fit">
                </button>
                <h3>BlackJack</h3>
            </div>
        </div>
        <div id="war" class="swiper-slide">
            <div class="slider-item">
                <button class="btn btn-link text-reset" data-game="war">
                    <img src="/warImg.png" class="img-fit">
                </button>
                <h3>War</h3>
            </div>
        </div>
        <div id="speed" class="swiper-slide">
            <div class="slider-item">
                <button class="btn btn-link text-reset" data-game="speed">
                    <img src="/speedImg.png" class="img-fit">
                </button>
                <h3>Speed</h3>
            </div>
        </div>
    </div>
    <div class="swiper-pagination"></div>
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>
</div>
`;

export default selectGame;
