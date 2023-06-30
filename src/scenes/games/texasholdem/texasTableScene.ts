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

  private result: string | undefined;

  private handScoreList: HandScore[] = [];

  private actionContainer: Phaser.GameObjects.Container | undefined;

  private cycleState: string | undefined;

  constructor() {
    super();
    this.players = [
      new TexasPlayer("Player", "player", 10000, 0),
      new TexasPlayer("Cpu", "cpu", 10000, 0),
    ];
    this.dealer = new TexasPlayer("Dealer", "dealer", 0, 0);
    this.pot = [0];
    this.returnPot = 0;
    this.gameState = "firstCycle";
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

    this.players.forEach((player, index) => {
      this.time.addEvent({
        delay: 3000,
        callback: this.cycleEvent,
        callbackScope: this,
        args: [player, index],
        loop: true,
      });
    });
  }

  /**
   * phaser3 フレーム処理
   */
  update(): void {
    // gameState管理
    this.cycleControl();

    // pots更新
    this.drawPots();

    // chips更新
    this.drawChips();
  }

  // TODO サイクル切り替えをbetが揃うまでにする。
  private cycleControl(): void {
    // 全員がアクションした
    if (this.players.every((player) => (player as TexasPlayer).getState === "Done")) {
      this.cycleState = "allDone";
    }

    // 一巡目のアクション終了
    if (this.gameState === "firstCycle" && this.cycleState === "allDone") {
      // 各stateセット
      this.players.forEach((player) => {
        /* eslint-disable no-param-reassign */
        (player as TexasPlayer).setState = "notAction";
      });
      this.cycleState = "notAllDone";
      this.gameState = "secondCycle";

      // 場札配布
      this.time.delayedCall(500, () => {
        this.dealHand(this.dealer);
      });
    }

    // 二巡目のアクション終了
    if (this.gameState === "secondCycle" && this.cycleState === "allDone") {
      // 各stateセット
      this.players.forEach((player) => {
        /* eslint-disable no-param-reassign */
        (player as TexasPlayer).setState = "notAction";
      });
      this.cycleState = "notAllDone";
      this.gameState = "thirdCycle";

      // 場札配布
      this.time.delayedCall(500, () => {
        this.dealer.addCardToHand(this.deck?.draw() as Card);
        this.dealHand(this.dealer);
      });
    }

    // 三巡目のアクション終了
    if (this.gameState === "thirdCycle" && this.cycleState === "allDone") {
      // 各stateセット
      this.players.forEach((player) => {
        /* eslint-disable no-param-reassign */
        (player as TexasPlayer).setState = "notAction";
      });
      this.cycleState = "notAllDone";
      this.gameState = "compare";

      // 場札配布
      this.dealer.addCardToHand(this.deck?.draw() as Card);
      this.dealHand(this.dealer);
    }

    // 手札を比較し、ゲーム終了
    if (this.gameState === "compare") {
      this.gameState = "endGame";
      this.checkResult();
    }

    // リザルト表示し、リスタート
    if (this.gameState === "endGame") {
      this.gameState = "firstCycle";

      this.time.delayedCall(2000, () => {
        this.displayResult(this.result as string, 0);
        this.resultView();
      });

      // リスタート
      this.time.delayedCall(5000, () => {
        this.initGame();
      });
    }
  }

  private cycleEvent(player: TexasPlayer, index: number): void {
    console.log(this.getTotalPot);
    // playerの場合、何もしない
    if (player.getPlayerType === "player") return;

    // 前者がアクションしていない場合、何もしない。
    if ((this.players[index - 1] as TexasPlayer).getState === "notAction") return;

    // cpu
    if (player.getPlayerType === "cpu" && (player as TexasPlayer).getIsDealer) {
      this.cpuAction(player as TexasPlayer, "dealer");
    } else if (player.getPlayerType === "cpu") {
      this.cpuAction(player as TexasPlayer);
    }
  }

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
  dealHand(player: TexasPlayer): void {
    player.getHand?.forEach((card, index) => {
      this.children.bringToTop(card);
      // player
      if (player.getPlayerType === "player") {
        card.moveTo(this.playerPositionX + index * this.cardSize.x, this.playerPositionY, 500);
        setTimeout(() => card.flipToFront(), 500);
        card.setInteractive();
      } // cpu
      else if (player.getPlayerType === "cpu") {
        card.moveTo(this.cpuPositionX + index * this.cardSize.x, this.cpuPositionY, 500);
      } // dealer
      else if (player.getPlayerType === "dealer") {
        card.moveTo(this.dealerPositionX + index * this.cardSize.x, this.dealerPositionY, 500);
        setTimeout(() => card.flipToFront(), 500);
      }
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

  // TODO call/bet/checkくらいはできるようにする。
  private cpuAction(player: TexasPlayer, dealer?: string): void {
    console.log("action!!!");
    this.setPot = player.call(100);
    this.drawPots();
    player.setState = "Done";
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

    (this.actionContainer as Phaser.GameObjects.Container).add(check);

    check.on(
      "pointerdown",
      function checkCard(this: TexasTableScene, pointer: Phaser.Input.Pointer) {
        // playerのstate変更
        this.players.forEach((player) => {
          if (player.getPlayerType === "player") {
            (player as TexasPlayer).setState = "Done";
          }
        });
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

    (this.actionContainer as Phaser.GameObjects.Container).add(fold);

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

            // playerのstate変更
            (player as TexasPlayer).setState = "Done";
          }
        });

        // リスタートする
        this.initGame();
      },
      this
    );
  }

  /**
   * betアクション
   */
  private betAction(): void {
    const bet = this.add
      .text(600, 700, "Bet")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    (this.actionContainer as Phaser.GameObjects.Container).add(bet);

    bet.on(
      "pointerdown",
      function betToPot(this: TexasTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          // 100betする
          if (player.getPlayerType === "player" && player.getChips >= 100) {
            this.setPot = (player as TexasPlayer).call(100);
            // playerのstate変更
            (player as TexasPlayer).setState = "Done";
          }
        });
      },
      this
    );
  }

  /**
   * ポットの表示
   */
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

  /**
   * 所持金表示
   */
  private drawChips(): void {
    // 以前のchipsを削除
    this.children.list.forEach((element) => {
      if (element.name === "chips") element.destroy();
    });

    this.players.forEach((player) => {
      if (player.getPlayerType === "player") {
        this.add
          .text(this.playerPositionX, this.playerPositionY + 70, `chips: ${player.getChips}`)
          .setFontSize(24)
          .setFontFamily("Arial")
          .setOrigin(0.5)
          .setName("chips");
      } else if (player.getPlayerType === "cpu") {
        this.add
          .text(this.cpuPositionX, this.cpuPositionY + 70, `chips: ${player.getChips}`)
          .setFontSize(24)
          .setFontFamily("Arial")
          .setOrigin(0.5)
          .setName("chips");
      }
    });
  }

  /**
   * callアクション
   */
  private callAction(): void {
    const call = this.add
      .text(700, 700, "Call")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    (this.actionContainer as Phaser.GameObjects.Container).add(call);

    call.on(
      "pointerdown",
      function releaseCard(this: TexasTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          // 前のbetSizeでbetする
          if (player.getPlayerType === "player" && player.getChips >= this.getPreBet) {
            this.setPot = (player as TexasPlayer).call(this.getPreBet);
            // playerのstate変更
            (player as TexasPlayer).setState = "Done";
          }
        });
      },
      this
    );
  }

  /**
   * raiseアクション
   */
  private raiseAction(): void {
    const raise = this.add
      .text(800, 700, "Raise")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    (this.actionContainer as Phaser.GameObjects.Container).add(raise);

    raise.on(
      "pointerdown",
      function releaseCard(this: TexasTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          // 前のbetSizeでbetする
          if (player.getPlayerType === "player" && player.getChips >= this.getPreBet * 2) {
            this.setPot = (player as TexasPlayer).call(this.getPreBet * 2);
            // playerのstate変更
            (player as TexasPlayer).setState = "Done";
          }
        });
      },
      this
    );
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

      // 勝敗
      if (this.result === "win" && player.getPlayerType === "player") {
        player.addChips(this.potReturn());
      } else if (this.result === "lose" && player.getPlayerType === "cpu") {
        player.addChips(this.potReturn());
      } else if (this.result === "draw") {
        player.addChips(Math.floor(this.potReturn() / 2));
      }

      // player
      if (player.getPlayerType === "player") {
        // 役を表示
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
      } else if (player.getPlayerType === "cpu") {
        // 役を表示
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
      }
    });
  }

  // TODO dealerを順繰り回すようにする
  /**
   * リスタート
   */
  private initGame(): void {
    // オブジェクト削除
    const destroyList = this.children.list.filter(
      (child) =>
        child instanceof Card ||
        child.name === "result" ||
        child.name === "pots" ||
        child.name === "roleName" ||
        child.name === "actionContainer"
    );
    destroyList.forEach((element) => {
      element.destroy();
    });

    // クラス変数初期化
    this.result = undefined;
    this.pot = [];
    this.actionContainer = this.add.container(0, 0).setName("actionContainer");
    this.gameState = "firstCycle";

    // プレイヤーのデータを初期化
    this.players.forEach((player) => {
      (player as TexasPlayer).init();
    });

    // オブジェクトの表示
    this.deckReset(400, 450);
    this.dealCards();
    this.players.forEach((player) => {
      this.dealHand(player as TexasPlayer);
    });
    this.drawPots();
    this.drawAction();
  }

  // TODO アクション出来るもののみ表示させる
  /**
   * アクション表示
   */
  private drawAction(): void {
    this.foldAction();
    this.checkAction();
    this.betAction();
    this.callAction();
    this.raiseAction();
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
