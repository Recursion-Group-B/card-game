import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
// import Card from "../../../models/common/card";
import BlackJackPlayer from "../../../models/games/blackjack/blackjackPlayer";
import Zone = Phaser.GameObjects.Zone;
import GameObject = Phaser.GameObjects.GameObject;

const D_WIDTH = 1320;
const D_HEIGHT = 920;


export default class BlackJackTableScene extends TableScene {
  private playerDecks: Array<Deck> = [];
  private dropZones: Array<Zone> = [];

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

    // 配置する
    this.createGameZone(); // これはなぜ必要？
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