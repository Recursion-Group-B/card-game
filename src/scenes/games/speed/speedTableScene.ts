import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import SpeedPlayer from "../../../models/games/speed/speedPlayer";
import Zone = Phaser.GameObjects.Zone;
import GameObject = Phaser.GameObjects.GameObject;

const D_WIDTH = 1320;
const D_HEIGHT = 920;
const SUITS = ["heart", "diamond", "club", "spade"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export default class SpeedTableScene extends TableScene {
  private playerDecks: Array<Deck> = [];

  private dropZones: Array<Zone> = [];

  constructor() {
    super({});

    this.players = [
      new SpeedPlayer("TestPlayer", "player", 0, 0),
      new SpeedPlayer("TestCpu", "cpu", 0, 0),
    ];
  }

  preload(): void {
    this.load.image("table", "/public/assets/images/tableGreen.png");
    this.load.image("cardBack", "/public/assets/images/card_back_red.png");

    // トランプ読み込み
    SUITS.forEach((suit) => {
      RANKS.forEach((rank) => {
        this.load.image(`${suit}${rank}`, `/public/assets/images/${suit}${rank}.png`);
      });
    });
  }

  create(): void {
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table");

    // Zoneをクリックできるように設定
    this.createGameZone();
    this.createDropZones();

    this.createCardDropEvent();

    this.createPlayerDecks();
    this.dealCards();
  }

  update(): void {
    console.log("update!!");
  }

  /**
   * カードの初期配置処理
   */
  dealCards(): void {
    let dropZonesIndex = 0;
    this.players.forEach((player, index) => {
      this.dealHandCards(player, index);
      this.dealLeadCards(player, index, this.dropZones[dropZonesIndex]);
      dropZonesIndex += 1;
    });
  }

  /**
   * 台札の配置
   */
  private dealLeadCards(player: SpeedPlayer, playerIndex: number, dropZone: Zone): void {
    let card: Card | undefined;
    if (!this.playerDecks[playerIndex].isEmpty()) {
      card = this.playerDecks[playerIndex].draw();
    } else {
      card = player.getHand.pop();
    }

    if (card) {
      const animationDuration = 600;
      card.moveTo(dropZone.x, dropZone.y, animationDuration);

      // カードを裏返す
      this.time.delayedCall(1500, () => {
        card?.flipToFront();
      });
    }
  }

  /**
   * 手札にカードを配布
   */
  private dealHandCards(player: SpeedPlayer, playerIndex: number): void {
    // 初期位置設定
    const playerStartPosX = 480;
    const dealerStartPosX = 840;
    const playerStartPosY = 620;
    const dealerStartPosY = 295;
    const startPosX = playerIndex === 0 ? playerStartPosX : dealerStartPosX;
    const startPosY = playerIndex === 0 ? playerStartPosY : dealerStartPosY;

    // 配置方向
    const direction = playerIndex === 0 ? 1 : -1;

    // アニメーションの設定
    const cardInterval = 110;
    const animationDelay = 400;

    for (let i = 0; i < 4; i += 1) {
      const card = this.playerDecks[playerIndex].draw();

      if (card) {
        if (player.getPlayerType === "player") {
          card.makeDraggable();
        }
        player.addCardToHand(card);
        card.moveTo(startPosX + i * cardInterval * direction, startPosY, i * animationDelay);

        // カードを裏返す
        this.time.delayedCall(1500, () => {
          card.flipToFront();
        });
      }
    }
  }

  /**
   * プレイヤー毎のデッキを作成
   */
  private createPlayerDecks(): void {
    this.playerDecks = [
      new Deck(this, 920, 620, ["heart", "diamond"]),
      new Deck(this, 400, 295, ["spade", "club"]),
    ];

    this.playerDecks.forEach((deck) => {
      deck.shuffle();
    });
  }

  /**
   * カードのドロップイベント作成
   */
  private createCardDropEvent(): void {
    let cardDepth = 0;

    this.input.on("drop", (pointer: Phaser.Input.Pointer, card: Card, dropZone: Zone) => {
      // カードがドロップゾーン上にあるか確認
      if (Phaser.Geom.Rectangle.Overlaps(dropZone.getBounds(), card.getBounds())) {
        card.setPosition(dropZone.x, dropZone.y);
        card.disableInteractive();

        card.setDepth((cardDepth += 1)); // カードを最前面に配置し、次のカードがさらに前面に来るようにdepth値を増やす
      } else {
        card.returnToOrigin();
      }
    });
  }

  /**
   * カードの配置可能場所を作成
   */
  private createDropZones(): void {
    const PLAYER_ZONE_OFFSET = 80;

    // Graphicsオブジェクトの作成
    const graphics = this.add.graphics();

    this.dropZones = [];
    this.players.forEach((player) => {
      const dropZone = this.add.zone(0, 0, 140 * 1.5, 190 * 1.5).setRectangleDropZone(140, 190);

      // ゾーンを中心に配置
      if (player.getPlayerType === "player") {
        Phaser.Display.Align.In.Center(dropZone, this.gameZone as GameObject, PLAYER_ZONE_OFFSET);
      } else if (player.getPlayerType === "cpu") {
        Phaser.Display.Align.In.Center(dropZone, this.gameZone as GameObject, -PLAYER_ZONE_OFFSET);
      }

      // 座標を取得
      const { x, y, width, height } = dropZone;

      dropZone.setInteractive().on("pointerdown", () => console.log("Zone clicked!"));
      this.dropZones.push(dropZone);
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: D_WIDTH,
  height: D_HEIGHT,
  antialias: false,
  scene: SpeedTableScene,
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
