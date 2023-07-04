import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import WarPlayer from "../../../models/games/war/warPlayer";
import GameState from "../../../constants/gameState";
import GameResult from "../../../constants/gameResult";
import PlayerType from "../../../constants/playerType";
import Button from "../../../models/common/button";

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default class WarTableScene extends TableScene {
  private result: string | undefined; // WIN or LOSE or DRAW

  private gameStarted = false;

  private displayedResult = false;

  constructor() {
    super({});

    this.players = [
      new WarPlayer("Player", PlayerType.PLAYER, 1000, 0),
      new WarPlayer("Dealer", PlayerType.DEALER, 0, 0),
    ];
  }

  preload(): void {
    this.load.atlas("cards", "/public/assets/images/cards.png", "/public/assets/images/cards.json");
    this.load.image("table", "/public/assets/images/tableGreen.png");
    this.load.image("chipWhite", "/public/assets/images/chipWhite.png");
    this.load.image("chipYellow", "/public/assets/images/chipYellow.png");
    this.load.image("chipBlue", "/public/assets/images/chipBlue.png");
    this.load.image("chipOrange", "/public/assets/images/chipOrange.png");
    this.load.image("chipRed", "/public/assets/images/chipRed.png");
    this.load.image("buttonRed", "/public/assets/images/buttonRed.png");
  }

  create(): void {
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table");
    this.gameState = GameState.BETTING;
    this.createGameZone();
    this.createBetItem();
  }

  update(): void {
    if (this.gameState === GameState.PLAYING && !this.gameStarted) {
      this.disableBetItem();
      this.startGame();
      this.gameStarted = true;
    }

    if (this.gameState === GameState.END_GAME && !this.displayedResult) {
      // ゲームresult画面
      if (this.result) {
        this.displayResult(this.result, 0);

        // TODO result画面のBGM設定
        // TODO chipやスコアの更新
        this.displayedResult = true;
      }
    }
  }

  private startGame(): void {
    this.createDeck();
    this.dealCards();
    this.time.delayedCall(2700, this.checkResult, [], this);

    this.gameZone?.setInteractive();
    this.gameZone?.on("pointerdown", () => {
      this.startBet();
    });
  }

  private startBet(): void {
    if (this.gameState !== GameState.END_GAME) return;
    this.reset();
    this.enableBetItem();
    this.fadeInBetItem();
  }

  private reset(): void {
    this.gameState = GameState.BETTING;
    this.gameStarted = false;
    this.displayedResult = false;
    this.resultText = undefined;

    this.chipButtons.forEach((chip) => {
      chip.disVisibleText();
    });

    this.clearButton.disVisibleText();
    this.dealButton.disVisibleText();

    // オブジェクト削除
    const destroyList = this.children.list.filter(
      (child) =>
        (child as Card) instanceof Card || (child as Phaser.GameObjects.Text).name === "resultText"
    );

    destroyList.forEach((element) => {
      element.destroy();
    });
  }

  private createDeck() {
    this.deck = new Deck(this, this.scale.width, -100);
    this.deck.shuffle();
  }

  createBetItem(): void {
    this.createChips();
    this.createDealButton();
    this.createClearButton();
    this.createCreditField();
  }

  /**
   * カードの初期配置処理
   */
  dealCards(): void {
    const centerWidth = this.scale.width / 2;
    const centerHeight = this.scale.height / 2;

    this.players.forEach((player) => {
      const newCard = this.deck?.draw();
      if (newCard) {
        player.addCardToHand(newCard);
        if (player.getPlayerType === PlayerType.PLAYER) {
          newCard.moveTo(centerWidth, centerHeight + 170, 200);
        } else if (player.getPlayerType === PlayerType.DEALER) {
          newCard.moveTo(centerWidth, centerHeight - 170, 200);
        }
        // カードを裏返す
        this.time.delayedCall(1500, () => {
          newCard.flipToFront();
        });
      }
    });
  }

  /**
   * 勝敗判定
   */
  private checkResult(): void {
    if (this.gameState !== GameState.PLAYING) return;
    const playerScore = this.players[0].calculateHandScore();
    const dealerScore = this.players[1].calculateHandScore();

    if (dealerScore === playerScore) {
      this.result = GameResult.DRAW;
      this.gameState = GameState.END_GAME;
    } else if (playerScore > dealerScore) {
      this.result = GameResult.WIN;
      this.gameState = GameState.END_GAME;
    } else {
      this.result = GameResult.LOSE;
      this.gameState = GameState.END_GAME;
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: D_WIDTH,
  height: D_HEIGHT,
  antialias: false,
  scene: WarTableScene,
  mode: Phaser.Scale.FIT,
  parent: "game-content",
  autoCenter: Phaser.Scale.CENTER_BOTH,
  min: {
    width: 720,
    height: 345,
  },
  max: {
    width: 1920,
    height: 920,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  physics: {
    default: "arcade",
  },
};

const phaser = new Phaser.Game(config);
