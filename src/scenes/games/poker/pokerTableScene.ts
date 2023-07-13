import "../../../style.scss";
import Phaser from "phaser";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import Button from "../../../models/common/button";
import PokerPlayer from "../../../models/games/poker/pokerPlayer";
import TableScene from "../../common/TableScene";
import { HandScore } from "../../../models/games/poker/type";
import GameState from "../../../constants/gameState";
import GameResult from "../../../constants/gameResult";
import GAME from "../../../models/common/game";
import HelpContainer from "../../common/helpContainer";
import GameRule from "../../../constants/gameRule";

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

  private gameStarted: boolean;

  private cycleState: string;

  private result: string | undefined;

  private handScoreList: HandScore[] = [];

  private callBtn: Button | undefined;

  private betBtn: Button | undefined;

  private changeBtn: Button | undefined;

  private foldBtn: Button | undefined;

  private checkBtn: Button | undefined;

  private raiseBtn: Button | undefined;

  constructor() {
    super("poker");
    this.gameSceneKey = "poker";

    this.players = [
      new PokerPlayer("Player", "player", 1000, 0),
      new PokerPlayer("Cpu", "cpu", 1000, 0),
    ];
    this.pot = [0];
    this.returnPot = 0;
    this.cycleState = "notAllAction";
    this.gameStarted = false;
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
   * phaser3 描画
   */
  create() {
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table");
    this.createGameZone();

    this.helpContent = new HelpContainer(this, GameRule.POKER);
    this.createHelpButton(this.helpContent);
    this.createBackHomeButton();
    this.createTutorialButton();

    this.initGame();
    // アニメーション
    this.clickToUp();
    this.createCommonSound();
  }

  update(): void {
    // gameState管理
    this.cycleControl();

    // 所持金等の更新
    this.setBetText("poker");
    this.setCreditText(this.getPlayer.getChips);
  }

  private cycleEvent(player: PokerPlayer, index: number): void {
    this.actionControl();
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
    if (player.getPlayerType === "cpu") {
      this.cpuAction(player as PokerPlayer);
    }
  }

  // TODO サイクル切り替えをbetが揃うまでにする。
  private cycleControl(): void {
    // ベット終了
    if (this.gameState === GameState.PLAYING && !this.gameStarted) {
      this.gameState = "firstCycle";
      this.gameStarted = true;
      this.startGame();
      this.disableBetItem();
    }
    // レイズした場合、もう一周
    if (this.players.some((player) => (player as PokerPlayer).getState === "raise")) {
      this.cycleState = "raise";
      this.players.forEach((player) => {
        (player as PokerPlayer).setState = "notAction";
        this.deleteDoneAction();
      });
    }
    // 全員がアクションした
    if (
      this.players.every((player) => (player as PokerPlayer).getState !== "notAction") &&
      !this.players.some((player) => (player as PokerPlayer).getState === "raise")
    ) {
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
      this.changeBtn?.disable();
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

  private cpuAction(player: PokerPlayer): void {
    if (player.getIsDealer && this.cycleState === "notAllAction") {
      // bet
      this.setPot = player.call(this.bet);
      this.deleteDoneAction();
      this.drawDoneAction(player, "bet");
      this.drawPots();
      player.setState = "bet";
    } else if (this.cycleState === "raise" || this.gameState === "firstCycle") {
      // call
      this.setPot = player.call(this.getPreBet);
      this.deleteDoneAction();
      this.drawDoneAction(player, "call");
      this.drawPots();
      player.setState = "call";
    } else if (this.gameState === "changeCycle") {
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
  private clickToUp(): void {
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
  private changeAction(): void {
    this.changeBtn = new Button(
      this,
      this.scale.width / 12,
      this.scale.height / 2 + 250,
      "buttonRed",
      "change"
    );
    this.changeBtn.disable();
    this.changeBtn.setScale(0.3);
    this.changeBtn.once(
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
    this.checkBtn = new Button(
      this,
      (this.scale.width * 3) / 12,
      this.scale.height / 2 + 250,
      "buttonRed",
      "check"
    );
    this.checkBtn.disable();
    this.checkBtn.setScale(0.3);
    this.checkBtn.once(
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
    this.betBtn = new Button(
      this,
      (this.scale.width * 5) / 12,
      this.scale.height / 2 + 250,
      "buttonRed",
      "bet"
    );
    this.betBtn.disable();
    this.betBtn.setScale(0.3);
    this.betBtn.once(
      "pointerdown",
      function betToPot(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          if (player.getPlayerType !== "player") return;
          // 100betする
          if (player.getPlayerType === "player" && player.getChips >= this.bet) {
            this.setPot = (player as PokerPlayer).call(this.bet);
            this.drawPots();
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
    this.foldBtn = new Button(
      this,
      (this.scale.width * 7) / 12,
      this.scale.height / 2 + 250,
      "buttonRed",
      "fold"
    );
    this.foldBtn.disable();
    this.foldBtn.setScale(0.3);
    this.foldBtn.once(
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
    this.callBtn = new Button(
      this,
      (this.scale.width * 9) / 12,
      this.scale.height / 2 + 250,
      "buttonRed",
      "call"
    );
    this.callBtn.disable();
    this.callBtn.setScale(0.3);
    this.callBtn.once(
      "pointerdown",
      function releaseCard(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          // 前のbetSizeでbetする
          if (player.getPlayerType === "player" && player.getChips >= this.getPreBet) {
            this.setPot = (player as PokerPlayer).call(this.getPreBet);
            this.drawPots();
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
    this.raiseBtn = new Button(
      this,
      (this.scale.width * 11) / 12,
      this.scale.height / 2 + 250,
      "buttonRed",
      "raise"
    );
    this.raiseBtn.disable();
    this.raiseBtn.setScale(0.3);
    this.raiseBtn.once(
      "pointerdown",
      function releaseCard(this: PokerTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          // 前のbetSizeでbetする
          if (player.getPlayerType === "player" && player.getChips >= this.getPreBet * 2) {
            this.setPot = (player as PokerPlayer).call(this.getPreBet * 2);
            this.drawPots();
            // playerのstate変更
            (player as PokerPlayer).setState = "raise";
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
      this.handScoreList.push(handScore);
      scoreList.add(handScore.role);
    });
    // 同等の役の場合、カードの強い順番
    if (scoreList.size === 1) {
      for (let i = 0; i < this.handScoreList[0].highCard.length; i += 1) {
        if (this.handScoreList[0].highCard[i][0] > this.handScoreList[1].highCard[i][0])
          this.result =
            this.players[0].getPlayerType === "player" ? GameResult.WIN : GameResult.LOSE;
        else if (this.handScoreList[0].highCard[i][0] < this.handScoreList[1].highCard[i][0])
          this.result =
            this.players[1].getPlayerType === "player" ? GameResult.WIN : GameResult.LOSE;
      }
      if (this.result === "") this.result = GameResult.DRAW;
    } // 役で勝敗決定
    else {
      const max = Math.max(...scoreList);
      this.result =
        this.players[this.handScoreList.findIndex((score) => score.role === max)].getPlayerType ===
        "player"
          ? GameResult.WIN
          : GameResult.LOSE;
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
      if (this.result === GameResult.WIN && player.getPlayerType === "player") {
        player.addChips(this.potReturn());
      } else if (this.result === GameResult.LOSE && player.getPlayerType === "cpu") {
        player.addChips(this.potReturn());
      } else if (this.result === GameResult.DRAW) {
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
    this.gameState = GameState.BETTING;

    // カードオブジェクト削除
    const destroyList = this.children.list.filter(
      (child) =>
        child instanceof Card ||
        child.name === "resultText" ||
        child.name === "pots" ||
        child.name === "roleName" ||
        child.name === "action" ||
        child.name === "dealer" ||
        child.name === "playerCredit" ||
        child.name === "betSize"
    );
    destroyList.forEach((element) => {
      element.destroy();
    });

    // クラス変数初期化
    this.result = undefined;
    this.pot = [];
    this.gameState = "firstCycle";
    this.cycleState = "notAllAction";
    this.handScoreList = [];
    this.gameStarted = false;
    this.tableInit();

    // プレイヤーのデータを初期化
    this.players.forEach((player) => {
      (player as PokerPlayer).init();
    });

    // ディーラー変更
    this.players.push(this.players.shift() as PokerPlayer);
    (this.players[0] as PokerPlayer).setIsDealer = true;

    // betting
    this.createChips();
    this.createClearButton();
    this.createDealButton(true);
    this.createCreditField("poker");
  }

  private startGame(): void {
    // オブジェクト表示
    this.deckReset(650, 450);
    this.dealCards();
    this.dealHand();
    this.drawPots();
    this.drawDealer();
    this.drawAction();

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
    this.checkAction();
    this.foldAction();
    this.betAction();
    this.callAction();
    this.raiseAction();
    this.changeAction();
  }

  private actionControl(): void {
    if (this.gameState === "firstCycle" && (this.getPlayer as PokerPlayer).getIsDealer) {
      this.checkBtn?.enable();
      this.foldBtn?.enable();
      this.betBtn?.enable();
    } else if (this.gameState === "firstCycle") {
      this.checkBtn?.enable();
      this.foldBtn?.enable();
      this.callBtn?.enable();
      this.raiseBtn?.enable();
    } else if (this.gameState === "changeCycle") {
      this.checkBtn?.disable();
      this.foldBtn?.disable();
      this.betBtn?.disable();
      this.callBtn?.disable();
      this.raiseBtn?.disable();
      this.changeBtn?.enable();
    }
  }
}
