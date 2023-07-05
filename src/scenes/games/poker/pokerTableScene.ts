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

  private playerPositionX = 400;

  private playerPositionY = 600;

  private cpuPositionX = 400;

  private cpuPositionY = 300;

  private cardSize = {
    x: 100,
    y: 150,
  };

  private cycleState: string;

  private actionContainer: Phaser.GameObjects.Container | undefined;

  private result: string | undefined;

  private handScoreList: HandScore[] = [];

  constructor() {
    super();
    this.players = [
      new PokerPlayer("Player", "player", 1000, 0),
      new PokerPlayer("Cpu", "cpu", 1000, 0),
    ];
    this.pot = [0];
    this.returnPot = 0;
    this.cycleState = "firstCycle";
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

  get getPlayer(): PokerPlayer {
    return this.players.find((player) => player.getPlayerType === "player") as PokerPlayer;
  }

  get getPreBet(): number {
    return this.pot[this.pot.length - 1];
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
    this.initGame();

    // アニメーション
    this.clickToUp();
  }

  update(): void {
    // gameState管理
    this.cycleControl();

    // pots更新
    this.drawPots();

    // chips更新
    this.drawChips();
  }

  private cycleEvent(player: PokerPlayer, index: number): void {
    console.log(
      `player: ${player.getName} ${player.getIsDealer ? "dealer" : "notDealer"} index: ${index} ${
        player.getState
      }`
    );
    this.drawAction();
    // playerの場合、何もしない
    if (player.getPlayerType === "player") return;

    // 前者がアクションしていないかつ自分がディーラーでない場合、何もしない。
    const prePlayer = index - 1 < 0 ? this.players.length - 1 : index - 1;
    if ((this.players[prePlayer] as PokerPlayer).getState === "notAction" && !player.getIsDealer)
      return;

    // アクションしている場合、何もしない
    if (player.getState !== "notAction") return;

    // ゲーム終了時は何もしない
    if (this.gameState === "endGame" || this.gameState === "compare") return;

    // cpu
    if (player.getPlayerType === "cpu" && (player as PokerPlayer).getIsDealer) {
      this.cpuAction(player as PokerPlayer, "dealer");
    } else if (player.getPlayerType === "cpu") {
      this.cpuAction(player as PokerPlayer);
    }
  }

  // TODO サイクル切り替えをbetが揃うまでにする。
  private cycleControl(): void {
    // 全員がアクションした
    if (this.players.every((player) => (player as PokerPlayer).getState !== "notAction")) {
      this.cycleState = "allDone";
      this.deleteDoneAction();
    }

    // 一巡目のアクション終了
    if (this.gameState === "firstCycle" && this.cycleState === "allDone") {
      // 各stateセット
      this.players.forEach((player) => {
        /* eslint-disable no-param-reassign */
        (player as PokerPlayer).setState = "notAction";
        if (player.getPlayerType === "player") {
          player.getHand?.forEach((card) => {
            card.setInteractive();
          });
        }
      });
      this.cycleState = "notAllDone";
      this.gameState = "changeCycle";
      this.drawAction();
    }

    // change
    if (this.gameState === "changeCycle" && this.cycleState === "allDone") {
      // 各stateセット
      this.players.forEach((player) => {
        /* eslint-disable no-param-reassign */
        (player as PokerPlayer).setState = "notAction";
      });
      this.cycleState = "notAllDone";
      this.gameState = "compare";
    }

    // 手札を比較し、ゲーム終了
    if (this.gameState === "compare") {
      this.gameState = "endGame";
      this.checkResult();
    }

    // リザルト表示し、リスタート
    if (this.gameState === "endGame") {
      this.time.removeAllEvents();
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

  // TODO call/bet/checkくらいはできるようにする。
  private cpuAction(player: PokerPlayer, dealer?: string): void {
    if (this.gameState === "firstCycle") {
      console.log("action!!!");
      this.setPot = player.call(100);
      this.drawDoneAction(player, "bet");
      this.drawPots();
      player.setState = "bet";
    } else if (this.gameState === "changeCycle") {
      console.log("change!!!");
      const changeList: Set<Card> = new Set();
      const changeAmount = Phaser.Math.RND.integerInRange(0, 5);
      for (let i = 0; i < changeAmount; i += 1) {
        changeList.add((player.getHand as Card[])[Phaser.Math.RND.integerInRange(0, 4)]);
      }
      if (changeList.size) {
        player.change([...changeList], this.deck?.draw(changeList.size) as Card[]);

        // phaser描画
        changeList.forEach((card) => card.destroy());
        this.dealHand();
      }

      // state更新
      player.setState = "Done";
      this.drawDoneAction(player, "change");
    }
  }

  private drawDealer(): void {
    const dealerContainer = this.add.container().setName("dealer");
    const dealerText = this.add
      .text(0, 0, "dealer")
      .setColor("black")
      .setFontSize(14)
      .setFontStyle("bold");
    const dealerTestify = this.add.graphics().fillCircle(23, 6, 30).fillStyle(0xffffff, 1.0);
    dealerContainer.add(dealerTestify);
    dealerContainer.add(dealerText);
    this.players.forEach((player) => {
      if (player.getPlayerType === "player" && (player as PokerPlayer).getIsDealer) {
        dealerContainer.setPosition(this.playerPositionX - 100, this.playerPositionY - 100);
      } else if (player.getPlayerType === "cpu" && (player as PokerPlayer).getIsDealer) {
        dealerContainer.setPosition(this.cpuPositionX - 100, this.cpuPositionY - 100);
      }
    });
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
      .text(500, 185, `pots: ${this.getTotalPot}`)
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
   * 手札配布
   */
  dealHand() {
    this.players.forEach((player) => {
      player.getHand?.forEach((card, index) => {
        this.children.bringToTop(card);
        if (player.getPlayerType === "player") {
          card.moveTo(this.playerPositionX + index * this.cardSize.x, this.playerPositionY, 500);
          setTimeout(() => card.flipToFront(), 800);
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
  changeAction(): void {
    const change = this.add
      .text(400, 700, "Change")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    (this.actionContainer as Phaser.GameObjects.Container).add(change);

    change.on(
      "pointerdown",
      function changeCard(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          if (player.getPlayerType !== "player") return;
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

          // state更新
          (player as PokerPlayer).setState = "Done";

          // action表示
          this.drawDoneAction(player as PokerPlayer, "change");
        });
      },
      this
    );
  }

  /**
   * checkを描画
   */
  private checkAction(): void {
    const check = this.add
      .text(500, 700, "Check")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    (this.actionContainer as Phaser.GameObjects.Container).add(check);

    check.on(
      "pointerdown",
      function releaseCard(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          if (player.getPlayerType === "player") {
            // playerのstate変更
            (player as PokerPlayer).setState = "Done";
            // action表示
            this.drawDoneAction(player as PokerPlayer, "check");
          }
        });
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
      function betToPot(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          if (player.getPlayerType !== "player") return;
          // 100betする
          if (player.getPlayerType === "player" && player.getChips >= 100) {
            this.setPot = (player as PokerPlayer).call(100);
            // playerのstate変更
            (player as PokerPlayer).setState = "Done";
            // action表示
            this.drawDoneAction(player as PokerPlayer, "bet");
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
      .text(900, 700, "Fold")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    (this.actionContainer as Phaser.GameObjects.Container).add(fold);

    fold.on(
      "pointerdown",
      function releaseCard(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        // カードを手放す
        this.players.forEach((player) => {
          if (player.getPlayerType === "player") {
            (player.getHand as Card[]).forEach((card) => {
              card.destroy();
            });

            (player as PokerPlayer).fold();

            // playerのstate変更
            (player as PokerPlayer).setState = "Done";
            // action表示
            this.drawDoneAction(player as PokerPlayer, "fold");
          }
        });

        this.gameState = "compare";
      },
      this
    );
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
      function releaseCard(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          // 前のbetSizeでbetする
          if (player.getPlayerType === "player" && player.getChips >= this.getPreBet) {
            this.setPot = (player as PokerPlayer).call(this.getPreBet);
            // playerのstate変更
            (player as PokerPlayer).setState = "Done";
            // action表示
            this.drawDoneAction(player as PokerPlayer, "call");
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
      function releaseCard(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          // 前のbetSizeでbetする
          if (player.getPlayerType === "player" && player.getChips >= this.getPreBet * 2) {
            this.setPot = (player as PokerPlayer).call(this.getPreBet * 2);
            // playerのstate変更
            (player as PokerPlayer).setState = "Done";
            // action表示
            this.drawDoneAction(player as PokerPlayer, "raise");
          }
        });
      },
      this
    );
  }

  /**
   * 手札を比較する
   */
  private checkResult(): void {
    const scoreList: Set<number> = new Set();

    this.players.forEach((player) => {
      const handScore: HandScore = (player as PokerPlayer).calculateHandScore();
      console.log(`${player.getName} role: ${handScore.role}`);
      console.log(handScore.highCard);
      this.handScoreList.push(handScore);
      scoreList.add(handScore.role);
    });
    console.log(this.handScoreList);

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
            `${(player as PokerPlayer).getHandScore.name}`,
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
            `${(player as PokerPlayer).getHandScore.name}`,
            {
              fontFamily: "Arial Black",
              fontSize: 12,
            }
          )
          .setName("roleName");
      }
    });
  }

  private deleteDoneAction(): void {
    this.children.list.forEach((child) => {
      if (child.name === "action") child.destroy();
    });
  }

  private drawDoneAction(player: PokerPlayer, actionType: string): void {
    const resultColor = "#ff0";
    const backgroundColor = "rgba(0,0,0,0.5)";
    const resultStyle = {
      font: "20px Arial",
      fill: resultColor,
      stroke: "#000000",
      strokeThickness: 9,
      boundsAlignH: "center",
      boundsAlignV: "middle",
      backgroundColor,
      padding: {
        top: 15,
        bottom: 15,
        left: 15,
        right: 15,
      },
      borderRadius: 10,
    };

    if (player.getPlayerType === "player") {
      const action = this.add.text(
        this.playerPositionX + 180,
        this.playerPositionY - 20,
        actionType,
        resultStyle
      );
      action.setName("action");
      this.children.bringToTop(action);
    } else {
      const action = this.add.text(
        this.cpuPositionX + 180,
        this.cpuPositionY - 20,
        actionType,
        resultStyle
      );
      action.setName("action");
      this.children.bringToTop(action);
    }
  }

  /**
   * リスタートボタンを描画
   */
  private initGame(): void {
    // カードオブジェクト削除
    const destroyList = this.children.list.filter(
      (child) =>
        child instanceof Card ||
        child.name === "result" ||
        child.name === "pots" ||
        child.name === "roleName" ||
        child.name === "actionContainer" ||
        child.name === "action" ||
        child.name === "dealer"
    );
    destroyList.forEach((element) => {
      element.destroy();
    });

    // クラス変数初期化
    this.result = undefined;
    this.pot = [];
    this.actionContainer = this.add.container(0, 0).setName("actionContainer");
    this.gameState = "firstCycle";
    this.handScoreList = [];

    // プレイヤーのデータを初期化
    this.players.forEach((player) => {
      (player as PokerPlayer).init();
    });

    // ディーラー変更
    this.players.push(this.players.shift() as PokerPlayer);
    (this.players[0] as PokerPlayer).setIsDealer = true;
    this.drawDealer();
    console.log(this.players);

    // オブジェクト表示
    this.deckReset(650, 450);
    this.dealCards();
    this.dealHand();
    this.drawPots();

    // タイマーイベント
    this.time.removeAllEvents();
    this.players.forEach((player, index) => {
      this.time.delayedCall(index * 2000, () => {
        this.time.addEvent({
          delay: 3000,
          callback: this.cycleEvent,
          callbackScope: this,
          args: [player, index],
          loop: true,
        });
      });
    });
  }

  // TODO アクション出来るもののみ表示させる
  /**
   * アクション表示
   */
  private drawAction(): void {
    this.actionContainer?.removeAll(true);

    if (this.gameState === "firstCycle" && this.getPlayer.getIsDealer) {
      this.checkAction();
      this.foldAction();
      this.betAction();
    } else if (this.gameState === "firstCycle") {
      this.checkAction();
      this.foldAction();
      this.callAction();
      this.raiseAction();
    } else if (this.gameState === "changeCycle") {
      this.changeAction();
    }
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
