import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import WarPlayer from "../../../models/games/war/warPlayer";
import GameState from "../../../constants/gameState";
import GameResult from "../../../constants/gameResult";
import PlayerType from "../../../constants/playerType";
import Zone = Phaser.GameObjects.Zone;
import GameObject = Phaser.GameObjects.GameObject;
import TimeEvent = Phaser.Time.TimerEvent;

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default class WarTableScene extends TableScene {
  private result: string | undefined; // WIN or LOSE or DRAW

  private gameStarted = false;

  constructor() {
    super({});

    this.players = [
      new WarPlayer("Player", PlayerType.PLAYER, 1000, 0),
      new WarPlayer("Cpu", PlayerType.CPU, 0, 0),
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
    this.createChips();
    this.createDealButton();
    this.createClearButton();
    this.createCreditField();
  }

  update(): void {
    if (this.gameState === GameState.PLAYING && !this.gameStarted) {
      this.disableBetItem();
      this.startGame();
      this.gameStarted = true;
    }

    this.checkResult();

    if (this.gameState === GameState.END_GAME) {
      // ゲームresult画面
      if (this.result) {
        this.displayResult(this.result, 0);

        // TODO result画面のBGM設定
        // TODO chipやスコアの更新
      }
    }
  }

  private startGame(): void {
    this.dealCards();
  }

  /**
   * カードの初期配置処理
   */
  dealCards(): void {
    console.log("カードの初期配置を開始します");
    this.deck = new Deck(this, this.scale.width / 2, this.scale.height / 2, [
      "hearts",
      "diamonds",
      "spades",
      "clubs",
    ]);

    // let dropZonesIndex = 0;
    // this.players.forEach((player, index) => {
    //   this.dealHandCards(player as SpeedPlayer, index);
    //   this.dealLeadCards(player as SpeedPlayer, index, this.dropZones[dropZonesIndex]);
    //   dropZonesIndex += 1;
    // });
  }

  /**
   * 勝敗判定
   */
  private checkResult(): void {
    if (this.gameState !== GameState.PLAYING) return;
    const playerScore = this.players[0].calculateHandScore();
    const cpuScore = this.players[1].calculateHandScore();
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
