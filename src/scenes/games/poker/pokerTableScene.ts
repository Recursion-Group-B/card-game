import "../../../style.scss";
import Phaser from "phaser";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import PokerPlayer from "../../../models/games/poker/pokerPlayer";
import TableScene from "../../common/TableScene";
import { HandScore } from "../../../models/games/poker/type";
import Game from "../../../models/common/game";

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default class PokerTableScene extends TableScene {
  private pot: number[];

  private returnPot: number;

  private playerPositionX = 400;

  private playerPositionY = 600;

  private cpuPositionX = 400;

  private cpuPositionY = 300;

  private cardSize = {
    x: 100,
    y: 150,
  };

  private unvisibleList: Phaser.GameObjects.Text[] = [];

  constructor() {
    super();
    this.players = [new PokerPlayer("Player", "player", 0, 0), new PokerPlayer("Cpu", "cpu", 0, 0)];
    this.pot = [0];
    this.returnPot = 0;

    console.log("aaaaaaaaaaaaaaaa");
    console.log(Game.CONFIG.DIFFICULTY);
    console.log(Game.CONFIG.GAME_MODE);
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
    this.players.forEach((player) => {
      player.getHand?.forEach((card, index) => {
        if (player.getPlayerType === "player") {
          card.moveTo(this.playerPositionX + index * this.cardSize.x, this.playerPositionY, 500);
          setTimeout(() => card.flipToFront(), 800);
          card.setInteractive();
        } else if (player.getPlayerType === "cpu") {
          card.moveTo(this.cpuPositionX + index * this.cardSize.x, this.cpuPositionY, 500);
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

          change.visible = false;
          this.unvisibleList.push(change);
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

    compare.on(
      "pointerdown",
      function compareCard(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        const handScoreList: HandScore[] = [];
        const scoreList: Set<number> = new Set();
        let winner = "";
        this.players.forEach((player) => {
          // ハンドを表へ
          player.getHand?.forEach((card) => {
            card.flipToFront();
          });
          const handScore: HandScore = (player as PokerPlayer).calculateHandScore();
          console.log(`${player.getName} role: ${handScore.role}`);
          handScoreList.push(handScore);
          scoreList.add(handScore.role);

          // 役を表示
          if (player.getPlayerType === "player")
            this.add
              .text(this.playerPositionX, this.playerPositionY - 80, `${handScore.name}`, {
                fontFamily: "Arial Black",
                fontSize: 12,
              })
              .setName("roleName");
          else if (player.getPlayerType === "cpu")
            this.add
              .text(this.cpuPositionX, this.cpuPositionY - 80, `${handScore.name}`, {
                fontFamily: "Arial Black",
                fontSize: 12,
              })
              .setName("roleName");
        });

        // 同等の役の場合、カードの強い順番
        if (scoreList.size === 1) {
          for (let i = 0; i < handScoreList[0].highCard.length; i += 1) {
            if (handScoreList[0].highCard[i][0] > handScoreList[1].highCard[i][0])
              winner = this.players[0].getName;
            else if (handScoreList[0].highCard[i][0] < handScoreList[1].highCard[i][0])
              winner = this.players[1].getName;
          }
          if (winner === "") winner = "Draw";
        } else {
          const max = Math.max(...scoreList);
          winner = this.players[handScoreList.findIndex((score) => score.role === max)].getName;
        }
        this.add
          .text(400, 400, `${winner}`, { fontFamily: "Arial Black", fontSize: 80 })
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
            (child as Card) instanceof Card ||
            (child as Phaser.GameObjects.Text).name === "winner" ||
            (child as Phaser.GameObjects.Text).name === "roleName"
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

        // 非表示リストを可視化
        this.unvisibleList.forEach((ele) => {
          ele.visible = true;
        });
      },
      this
    );
  }
}
