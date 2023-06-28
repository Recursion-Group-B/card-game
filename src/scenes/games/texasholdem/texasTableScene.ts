import "../../../style.scss";
import Phaser from "phaser";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import TexasPlayer from "../../../models/games/texasholdem/texasPlayer";
import TableScene from "../../common/TableScene";
import { HandScore } from "../../../models/games/poker/type";

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default class TexasTableScene extends TableScene {
  private pot: number[];

  private returnPot: number;

  private playerPositionX = 400;

  private playerPositionY = 600;

  private cpuPositionX = 400;

  private cpuPositionY = 300;

  private dealerPositionX = 500;

  private dealerPositionY = 450;

  private dealer: TexasPlayer;

  private cardSize = {
    x: 100,
    y: 150,
  };

  private checkCount: number;

  private unvisibleList: Phaser.GameObjects.Text[] = [];

  private result: string | undefined;

  private handScoreList: HandScore[] = [];

  constructor() {
    super();
    this.players = [
      new TexasPlayer("Player", "player", 1000, 0),
      new TexasPlayer("Cpu", "cpu", 1000, 0),
    ];
    this.dealer = new TexasPlayer("Dealer", "dealer", 0, 0);
    this.pot = [0];
    this.returnPot = 0;
    this.result = undefined;
    this.checkCount = 0;
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
    // init
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table");
    this.initGame();

    // アニメーション
    this.clickToUp();

    // アクション
    this.checkAction();
    this.foldAction();
    this.betAction();
    this.callAction();
    this.raiseAction();
  }

  /**
   * phaser3 フレーム処理
   */
  // update(): void {
  // }

  addCPU(player: TexasPlayer): void {
    this.players.push(player);
  }
  // deleteCpu():void{}

  /**
   * 複数人へ配布
   */
  dealCards(): void {
    this.players.forEach((player) => {
      /* eslint-disable no-param-reassign */
      player.setHand = (this.deck as Deck).draw(2) as Card[];
    });
    this.dealer.setHand = this.deck?.draw(3);
  }

  get getAllHand(): Card[][] {
    return this.players.map((player) => player.getHand as Card[]);
  }

  set setPot(amount: number) {
    this.pot.push(amount);
  }

  get getPot(): number {
    return this.pot.reduce((pre, next) => pre + next, 0);
  }

  get getPreBet(): number {
    return this.pot[this.pot.length - 1];
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
   * 手札配布
   */
  dealHand() {
    // プレイヤー手札配布
    this.players.forEach((player) => {
      player.getHand?.forEach((card, index) => {
        if (player.getPlayerType === "player") {
          card.moveTo(this.playerPositionX + index * this.cardSize.x, this.playerPositionY, 500);
          setTimeout(() => card.flipToFront(), 500);
          card.setInteractive();
        } else if (player.getPlayerType === "cpu") {
          card.moveTo(this.cpuPositionX + index * this.cardSize.x, this.cpuPositionY, 500);
        }
      });

      // ディーラー手札配布
      this.dealer.getHand?.forEach((card, index) => {
        card.moveTo(this.dealerPositionX + index * this.cardSize.x, this.dealerPositionY, 500);
        setTimeout(() => card.flipToFront(), 500);
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
   * checkを描画
   */
  checkAction(): void {
    const check = this.add
      .text(400, 700, "Check")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    check.on(
      "pointerdown",
      function checkCard(this: TexasTableScene, pointer: Phaser.Input.Pointer) {
        // ディーラーカード配布
        this.dealer.addCardToHand(this.deck?.draw() as Card);
        this.dealHand();
        console.log(this.dealer.getHandSize);

        // カウント数で非表示
        this.checkCount += 1;
        if (this.checkCount === 2) {
          // compare非表示
          check.visible = false;
          this.unvisibleList.push(check);
        }

        // 場札が5枚の場合、手札を比較しリザルトを表示
        if (this.dealer.getHandSize === 5) this.compareHands();
      },
      this
    );
  }

  // TODO 現状リスタートになっている。要改善
  /**
   * foldを描画
   */
  private foldAction(): void {
    const fold = this.add
      .text(500, 700, "Fold")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    fold.on(
      "pointerdown",
      function releaseCard(this: TexasTableScene, pointer: Phaser.Input.Pointer) {
        // カードを手放す
        this.players.forEach((player) => {
          if (player.getPlayerType === "player") {
            (player.getHand as Card[]).forEach((card) => {
              card.destroy();
            });
            (player as TexasPlayer).fold();
          }
        });

        // リスタートする
        this.initGame();
      },
      this
    );
  }

  // TODO bet追加
  private betAction(): void {
    const bet = this.add
      .text(600, 700, "Bet")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    bet.on(
      "pointerdown",
      function releaseCard(this: TexasTableScene, pointer: Phaser.Input.Pointer) {
        // 100betする
        this.players.forEach((player) => {
          if (player.getPlayerType === "player" && player.getChips >= 100) {
            this.setPot = (player as TexasPlayer).call(100);
          }
        });

        // potsを更新する
        this.drawPots();
      },
      this
    );
  }

  // TODO pot表示
  private drawPots(): void {
    // 以前のpotsを削除
    this.children.list.forEach((element) => {
      if (element.name === "pots") element.destroy();
    });

    this.add
      .text(500, 185, `pots: ${this.getPot}`)
      .setFontSize(50)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setName("pots");
  }

  // TODO call追加
  private callAction(): void {
    const call = this.add
      .text(700, 700, "Call")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    call.on(
      "pointerdown",
      function releaseCard(this: TexasTableScene, pointer: Phaser.Input.Pointer) {
        // 前のbetSizeでbetする
        this.players.forEach((player) => {
          if (player.getPlayerType === "player" && player.getChips >= this.getPreBet) {
            this.setPot = (player as TexasPlayer).call(this.getPreBet);
          }
        });

        // potsを更新する
        this.drawPots();
      },
      this
    );
  }

  // TODO raise追加
  private raiseAction(): void {
    const raise = this.add
      .text(800, 700, "Raise")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    raise.on(
      "pointerdown",
      function releaseCard(this: TexasTableScene, pointer: Phaser.Input.Pointer) {
        // 前のbetSizeでbetする
        this.players.forEach((player) => {
          if (player.getPlayerType === "player" && player.getChips >= this.getPreBet * 2) {
            this.setPot = (player as TexasPlayer).call(this.getPreBet * 2);
          }
        });

        // potsを更新する
        this.drawPots();
      },
      this
    );
  }

  /**
   * 手札を比較し、リザルトを表示
   */
  private compareHands(): void {
    this.checkResult();

    if (this.gameState === "endGame") {
      setTimeout(() => {
        this.displayResult(this.result as string, 0);
        this.resultView();
      }, 1000);

      // リスタート
      setTimeout(() => {
        this.initGame();
      }, 5000);
    }
  }

  /**
   * リザルトを取得
   */
  private checkResult(): void {
    // 場札が5枚でない場合、プレイ続行
    if (this.dealer.getHandSize !== 5) return;

    // お互いの手札を比較
    const scoreList: Set<number> = new Set();
    // ディーラーハンドを取り込んで、スコアを計算
    this.players.forEach((player) => {
      player.addCardToHand(this.dealer.getHand as Card[]);
      const handScore: HandScore = (player as TexasPlayer).calculateHandScore();
      (player as TexasPlayer).setHandScore = handScore;
      this.handScoreList.push(handScore);
      scoreList.add(handScore.role);
      console.log((player as TexasPlayer).getHandScore.highCard);
    });

    // 同等の役の場合、カードの強い順番
    if (scoreList.size === 1) {
      for (let i = 0; i < this.handScoreList[0].highCard.length; i += 1) {
        if (this.handScoreList[0].highCard[i][0] > this.handScoreList[1].highCard[i][0])
          this.result = this.players[0].getPlayerType === "player" ? "win" : "lose";
        else if (this.handScoreList[0].highCard[i][0] < this.handScoreList[1].highCard[i][0])
          this.result = this.players[1].getPlayerType === "player" ? "win" : "lose";
      }
      if (this.result === "") this.result = "draw";
    } // 役で勝敗決定
    else {
      const max = Math.max(...scoreList);
      this.result =
        this.players[this.handScoreList.findIndex((score) => score.role === max)].getPlayerType ===
        "player"
          ? "win"
          : "lose";
    }

    this.gameState = "endGame";
  }

  /**
   * リザルトを描画
   */
  private resultView(): void {
    this.players.forEach((player) => {
      // ハンドを表へ
      player.getHand?.forEach((card) => {
        card.flipToFront();
      });

      // 役を表示
      if (player.getPlayerType === "player")
        this.add
          .text(
            this.playerPositionX,
            this.playerPositionY - 80,
            `${(player as TexasPlayer).getHandScore.name}`,
            {
              fontFamily: "Arial Black",
              fontSize: 12,
            }
          )
          .setName("roleName");
      else if (player.getPlayerType === "cpu")
        this.add
          .text(
            this.cpuPositionX,
            this.cpuPositionY - 80,
            `${(player as TexasPlayer).getHandScore.name}`,
            {
              fontFamily: "Arial Black",
              fontSize: 12,
            }
          )
          .setName("roleName");
    });
  }

  /**
   * リスタート
   */
  private initGame(): void {
    // クラス変数初期化
    this.checkCount = 0;
    this.result = undefined;
    this.pot = [];

    // オブジェクト削除
    const destroyList = this.children.list.filter(
      (child) =>
        child instanceof Card ||
        child.name === "result" ||
        child.name === "pots" ||
        child.name === "roleName"
    );
    destroyList.forEach((element) => {
      element.destroy();
    });

    // プレイヤーのデータを初期化
    this.players.forEach((player) => {
      (player as TexasPlayer).init();
    });

    // 新しくデッキを組む
    this.deckReset(400, 450);
    this.dealCards();
    this.dealHand();
    this.drawPots();

    // 非表示リストを可視化
    this.unvisibleList.forEach((ele) => {
      ele.visible = true;
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: D_WIDTH,
  height: D_HEIGHT,
  antialias: false,
  scene: TexasTableScene,
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
