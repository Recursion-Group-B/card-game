import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
// import Card from "../../../models/common/card";
import BlackJackPlayer from "../../../models/games/blackjack/blackjackPlayer";
import Zone = Phaser.GameObjects.Zone;
import GameObject = Phaser.GameObjects.GameObject;

const D_WIDTH = 1320;
const D_HEIGHT = 920;


export default class BlackJackTableScene extends TableScene {
  // private playerDecks: Array<Deck> = [];
  // private dropZones: Array<Zone> = [];
  // private pot: number[];
  // private returnPot: number;
  private playerPositionX = 600;
  private playerPositionY = 600;
  private cpuPositionX = 600;
  private cpuPositionY = 300;
  private cardSize = {
    x: 85,
    y: 150,
  };

  // private unvisibleList: Phaser.GameObjects.Text[] = [];


  constructor() {
    super({});

    this.players = [
      new BlackJackPlayer("TestPlayer", "player", 0, 0),
      new BlackJackPlayer("TestCpu", "cpu", 0, 0),
    ];
  }

  preload(): void {
    this.load.atlas("cards", "/public/assets/images/cards.png", "/public/assets/images/cards.json");
    this.load.image("table", "/public/assets/images/tableGreen.png");
  }

  create(): void {
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table");

    this.makeDeck();
    this.dealCards();
    this.dealHand();
  }

  /**
  * 山札作成
  */
  makeDeck() {
    this.deck = new Deck(this, 1050, 450);
    this.deck.shuffle();
  }

  /**
   * 複数人へ配布
   */
  dealCards(): void {
    this.players.forEach((player) => {
      /* eslint-disable no-param-reassign */
      player.setHand = (this.deck as Deck).draw(2) as Card[];
    });
  }

  /**
   * 手札配布
   */
  dealHand() {
    this.players.forEach((player) => {
      player.getHand?.forEach((card, index) => {
        if (player.getPlayerType === "player") {
          card.moveTo(this.playerPositionX + index * this.cardSize.x, this.playerPositionY, 500);
          setTimeout(() => card.flipToFront(), 800);
          card.setInteractive();
        } else if (player.getPlayerType === "cpu") {
          // ブラックジャックはCPUの一枚目を表面にする
          if (index === 0) {
            card.moveTo(this.cpuPositionX + index * this.cardSize.x, this.cpuPositionY, 500);
            setTimeout(() => card.flipToFront(), 800);
            card.setInteractive();
          } else {
            card.moveTo(this.cpuPositionX + index * this.cardSize.x, this.cpuPositionY, 500);
          }
        }
      });
    });
  }
}


const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: D_WIDTH,
    height: D_HEIGHT,
    antialias: false,
    scene: BlackJackTableScene,
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