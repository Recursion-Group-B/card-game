import "../../../style.scss";
import Phaser from "phaser";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import PokerPlayer from "../../../models/games/poker/pokerPlayer";
import TableScene from "../../common/TableScene";
import { HandScore } from "../../../models/games/poker/type";

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default class PokerTableScene extends TableScene {
  private pot: number[];

  private returnPot: number;

  constructor() {
    super();
    this.players = [
      new PokerPlayer("TestPlayer", "player", 0, 0),
      new PokerPlayer("TestCpu", "cpu", 0, 0),
    ];
    this.pot = [0];
    this.returnPot = 0;
  }

  addCPU(player: PokerPlayer): void {
    this.players.push(player);
  }
  // deleteCpu():void{}

  /**
   * 複数人へ配布
   */
  dealCards(): void {
    this.players.forEach((player) => {
      /* eslint-disable no-param-reassign */
      player.setHand = (this.deck as Deck).draw(5) as Card[];
    });
  }

  get getAllHand(): Card[][] {
    return this.players.map((player) => player.getHand as Card[]);
  }

  set setPot(amount: number) {
    this.pot.push(amount);
  }

  get getPot(): number[] {
    return this.pot;
  }

  get getTotalPot(): number {
    return this.pot.reduce((pre, next) => pre + next, 0);
  }

  potReturn(): number {
    this.returnPot = this.getTotalPot;
    this.pot.length = 0;
    return this.returnPot;
  }

  /**
   * 山札作成
   */
  makeDeck() {
    this.deck = new Deck(this, 650, 450);
    this.deck.shuffle();
  }

  /**
   * phaser3 画像ロード
   */
  preload() {
    this.load.atlas("cards", "/public/assets/images/cards.png", "/public/assets/images/cards.json");
    this.load.image("table", "/public/assets/images/tableGreen.png");
  }

  /**
   * phaser3 描画
   */
  create() {
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table");

    this.makeDeck();
    this.dealCards();
    this.dealHand();

    this.clickToUp();
    this.changeCards();
    this.compareCards();
    this.init();
  }

  /**
   * 手札配布
   */
  dealHand() {
    const playerPositionX = 400;
    const playerPositionY = 600;
    const cpuPositionX = 400;
    const cpuPositionY = 300;
    const cardSize = {
      x: 100,
      y: 150,
    };

    this.players.forEach((player) => {
      console.log(player.getHand);
      player.getHand?.forEach((card, index) => {
        if (player.getPlayerType === "player") {
          card.moveTo(playerPositionX + index * cardSize.x, playerPositionY, 500);
          setTimeout(() => card.flipToFront(), 800);
          card.setInteractive();
        } else if (player.getPlayerType === "cpu") {
          card.moveTo(cpuPositionX + index * cardSize.x, cpuPositionY, 500);
        }
      });
    });
  }

  /**
   * クリック時にポップアップするアニメーション
   */
  clickToUp(): void {
    this.input.on("gameobjectdown", (pointer: Phaser.Input.Pointer, gameObject: Card) => {
      // Cardオブジェクト以外無効
      if (!(gameObject instanceof Card)) return;
      if (!gameObject.getClickStatus) {
        this.tweens.add({
          targets: gameObject,
          y: { value: gameObject.y - 10, ease: "Power4" },
        });
      } else {
        this.tweens.add({
          targets: gameObject,
          y: { value: gameObject.y + 10, ease: "Power4" },
        });
      }
      (gameObject as Card).toggleClickStatus();
    });
  }

  /**
   * プレイヤーアクション（チェンジ）を描画
   */
  changeCards(): void {
    const change = this.add
      .text(400, 700, "Change")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    change.on(
      "pointerdown",
      function changeCard(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          // data
          const changeList = (player.getHand as Card[]).filter(
            (child) => (child as Card).getClickStatus === true
          ) as Card[];
          if (changeList.length)
            (player as PokerPlayer).change(
              changeList,
              (this.deck as Deck).draw(changeList.length) as Card[]
            );

          // phaser描画
          changeList.forEach((card) => card.destroy());
          this.dealHand();
        });
      },
      this
    );
  }

  /**
   * 手札を比較するボタンを描画
   */
  compareCards(): void {
    const compare = this.add
      .text(500, 700, "Compare")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    const handScoreList: HandScore[] = [];
    const scoreList: number[] = [];

    compare.on(
      "pointerdown",
      function compareCard(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          // ハンドを表へ
          player.getHand?.forEach((card) => {
            card.flipToFront();
          });
          const handScore: HandScore = (player as PokerPlayer).calculateHandScore();
          console.log(handScore.role);
          handScoreList.push(handScore);
          scoreList.push(handScore.role);
        });

        const max = Math.max(...scoreList);
        const winner = this.players[handScoreList.findIndex((score) => score.role === max)];
        this.add
          .text(400, 400, `${winner.getName}`, { fontFamily: "Arial Black", fontSize: 80 })
          .setName("winner");
      },
      this
    );
  }

  /**
   * リスタートボタンを描画
   */
  init(): void {
    const init = this.add
      .text(600, 700, "Restart")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    init.on(
      "pointerdown",
      function initGame(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        // カードオブジェクト削除
        const destroyList = this.children.list.filter(
          (child) =>
            (child as Card) instanceof Card || (child as Phaser.GameObjects.Text).name === "winner"
        );
        destroyList.forEach((element) => {
          element.destroy();
        });

        // プレイヤーのデータを初期化
        this.players.forEach((player) => {
          (player as PokerPlayer).init();
        });

        // 新しくデッキを組む
        this.makeDeck();
        this.dealCards();
        this.dealHand();
      },
      this
    );
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: D_WIDTH,
  height: D_HEIGHT,
  antialias: false,
  scene: PokerTableScene,
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
