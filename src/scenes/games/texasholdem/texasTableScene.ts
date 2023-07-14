import "../../../style.scss";
import Phaser from "phaser";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import TexasPlayer from "../../../models/games/texasholdem/texasPlayer";
import TableScene from "../../common/TableScene";
import { HandScore } from "../../../models/games/poker/type";
import GAME from "../../../models/common/game";
import Button from "../../../models/common/button";
import GameState from "../../../constants/gameState";
import GameResult from "../../../constants/gameResult";
import Chip from "../../../models/common/chip";
import HelpContainer from "../../common/helpContainer";
import GameRule from "../../../constants/gameRule";

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default class TexasTableScene extends TableScene {
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

  private cycleState: string | undefined;

  private checkBtn: Button | undefined;

  private betBtn: Button | undefined;

  private foldBtn: Button | undefined;

  private callBtn: Button | undefined;

  private raiseBtn: Button | undefined;

  private gameStarted: boolean;

  constructor() {
    super();
    this.players = [
      new TexasPlayer("Player", "player", 1000, 0),
      new TexasPlayer("Cpu", "cpu", 1000, 0),
    ];
    this.dealer = new TexasPlayer("Dealer", "dealer", 0, 0);
    this.pot = [0];
    this.returnPot = 0;
    this.gameState = "firstCycle";
    this.gameStarted = false;
  }

  /**
   * phaser3 画像ロード
   */
  preload() {
    this.load.atlas("cards", "/assets/images/cards.png", "/assets/images/cards.json");
    this.load.image("table", "/assets/images/tableGreen.png");
    this.load.image("chipWhite", "/assets/images/chipWhite.png");
    this.load.image("chipYellow", "/assets/images/chipYellow.png");
    this.load.image("chipBlue", "/assets/images/chipBlue.png");
    this.load.image("chipOrange", "/assets/images/chipOrange.png");
    this.load.image("chipRed", "/assets/images/chipRed.png");
    this.load.image("buttonRed", "/assets/images/buttonRed.png");
    this.load.image("uTurn", "/assets/images/uTurn.svg");
    this.load.image("tutorial", "/assets/images/tutorial.svg");
    this.load.image("help", "/assets/images/help.svg");
    this.load.image("back", "/assets/images/back.svg");
    this.load.audio("buttonClick", "/assets/sounds/buttonClick.mp3");
    this.load.audio("chipClick", "/assets/sounds/chipClick.mp3");
    this.load.audio("countdown", "/assets/sounds/countdown.mp3");
    this.load.audio("dealCard", "/assets/sounds/dealCard.mp3");
    this.load.audio("flipOver", "/assets/sounds/flipOver.mp3");
    this.load.audio("playerDraw", "/assets/sounds/playerDraw.mp3");
    this.load.audio("playerWin", "/assets/sounds/playerWin.mp3");
    this.load.audio("playerLose", "/assets/sounds/playerLose.mp3");
    this.load.image("chipWhite", "/assets/images/chipWhite.png");
    this.load.image("chipYellow", "/assets/images/chipYellow.png");
    this.load.image("chipBlue", "/assets/images/chipBlue.png");
    this.load.image("chipOrange", "/assets/images/chipOrange.png");
    this.load.image("chipRed", "/assets/images/chipRed.png");
    this.load.image("buttonRed", "/assets/images/buttonRed.png");
  }

  /**
   * phaser3 描画
   */
  create() {
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table").setName("table");
    this.createGameZone();
    (this.players[0] as TexasPlayer).setIsDealer = true;

    // オブジェクト生成
    this.createBackHomeButton();
    this.createTutorialButton();
    this.helpContent = new HelpContainer(this, GameRule.TEXAS);
    this.createHelpButton(this.helpContent);
    this.createCommonSound();
    this.createChips();
    this.createClearButton();
    this.createDealButton(true);
    this.createCreditField("texas");
  }

  /**
   * phaser3 フレーム処理
   */
  update(): void {
    // gameState管理
    this.cycleControl();

    // 所持金等の更新
    this.setBetText("texas");
    this.setCreditText(this.getPlayer.getChips);
  }

  private cycleControl(): void {
    // ベット終了
    if (this.gameState === GameState.PLAYING && !this.gameStarted) {
      this.gameState = "firstCycle";
      this.gameStarted = true;
      this.startGame();
      this.disableBetItem();
    }

    // レイズした場合、もう一周
    if (this.players.some((player: TexasPlayer) => player.getState === "raise")) {
      this.cycleState = "raise";
      this.players.forEach((player: TexasPlayer) => {
        /* eslint-disable no-param-reassign */
        if (player.getState !== "raise") {
          player.setState = "notAction";
        } else if (player.getState === "raise") {
          player.setState = "raised";
        }
      });
      this.deleteDoneAction();
    }

    // レイズの場合で全員アクションした
    if (
      this.cycleState === "raise" &&
      this.players.every((player: TexasPlayer) => player.getState !== "notAction")
    ) {
      this.cycleState = "allDone";
    }

    // 全員がアクションした
    if (
      !this.players.some((player: TexasPlayer) => player.getState === "raise") &&
      this.players.every((player: TexasPlayer) => player.getState !== "notAction")
    ) {
      this.cycleState = "allDone";
      this.deleteDoneAction();
    }

    // 一巡目のアクション終了
    if (this.gameState === "firstCycle" && this.cycleState === "allDone") {
      // 各stateセット
      this.players.forEach((player: TexasPlayer) => {
        player.setState = "notAction";
      });
      this.cycleState = "notAllAction";
      this.gameState = "secondCycle";

      // 場札配布
      this.time.delayedCall(500, () => {
        this.dealHand(this.dealer);
      });
    }

    // 二巡目のアクション終了
    if (this.gameState === "secondCycle" && this.cycleState === "allDone") {
      // 各stateセット
      this.players.forEach((player: TexasPlayer) => {
        /* eslint-disable no-param-reassign */
        player.setState = "notAction";
      });
      this.cycleState = "notAllAction";
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
      this.cycleState = "notAllAction";
      this.gameState = "compare";

      // 場札配布
      this.dealer.addCardToHand(this.deck?.draw() as Card);
      this.dealHand(this.dealer);
    }

    // 手札を比較し、ゲーム終了
    if (this.gameState === "compare") {
      this.gameState = "endGame";
      this.disableAction();
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
      this.gameZone.setInteractive();
      this.gameZone.on("pointerdown", () => {
        this.initGame();
        this.gameZone.removeInteractive();
        this.gameZone.removeAllListeners();
      });
    }
  }

  private async cycleEvent(player: TexasPlayer, index: number): Promise<void> {
    // playerの場合、何もしない
    if (player.getPlayerType === "player" && player.getState === "notAction") {
      this.actionControl();
      return;
    }

    // 前者がアクションしていないかつ自分がディーラーでない場合、何もしない。
    const prePlayer = index - 1 < 0 ? this.players.length - 1 : index - 1;
    if ((this.players[prePlayer] as TexasPlayer).getState === "notAction" && !player.getIsDealer)
      return;

    // アクションしている場合、何もしない
    if (player.getState !== "notAction") return;

    // ゲーム終了時は何もしない
    if (this.gameState === "endGame" || this.gameState === "compare") return;

    // cpu
    if (player.getPlayerType === "cpu") {
      await this.cpuAction(player);
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

  get getPot(): number[] {
    return this.pot;
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

  private cpuAction(player: TexasPlayer): Promise<void> {
    return new Promise(() => {
      setTimeout(() => {
        if (player.getIsDealer && this.cycleState === "notAllAction") {
          // bet
          this.payOut(player, this.bet);
          this.deleteDoneAction();
          this.drawDoneAction(player, "bet");
          this.drawPots();
          player.setState = "bet";
        } else if (
          this.cycleState === "raise" ||
          this.gameState === "firstCycle" ||
          this.gameState === "secondCycle" ||
          this.gameState === "thirdCycle"
        ) {
          // call
          this.payOut(player, this.getPreBet);
          this.deleteDoneAction();
          this.drawDoneAction(player, "call");
          this.drawPots();
          player.setState = "call";
        }
      }, 1000);
    });
  }

  /**
   * checkを描画
   */
  checkAction(): void {
    this.checkBtn = new Button(
      this,
      (this.scale.width * 3) / 12,
      this.scale.height / 2 + 250,
      "buttonRed",
      "check",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY
    );
    this.checkBtn.disable();
    this.checkBtn.setScale(0.3);
    this.checkBtn.setClickHandler(() => {
      // playerのstate変更
      this.players.forEach((player: TexasPlayer) => {
        if (player.getPlayerType === "player") {
          player.setState = "Done";
          this.drawDoneAction(player, "check");
        }
      });
      this.disableAction();
    });
  }

  /**
   * foldを描画
   */
  private foldAction(): void {
    this.foldBtn = new Button(
      this,
      (this.scale.width * 7) / 12,
      this.scale.height / 2 + 250,
      "buttonRed",
      "fold",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY
    );
    this.foldBtn.disable();
    this.foldBtn.setScale(0.3);
    this.foldBtn.setClickHandler(() => {
      // カードを手放す
      this.players.forEach((player: TexasPlayer) => {
        if (player.getPlayerType === "player") {
          (player.getHand as Card[]).forEach((card) => {
            card.destroy();
          });
          player.fold();
          // playerのstate変更
          player.setState = "Done";
          // action表示
          this.drawDoneAction(player, "fold");
        }
      });
      this.gameState = "compare";
      this.disableAction();
    });
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
      "bet",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY
    );
    this.betBtn.disable();
    this.betBtn.setScale(0.3);
    this.betBtn.setClickHandler(() => {
      this.players.forEach((player: TexasPlayer) => {
        // 100betする
        if (player.getPlayerType === "player" && player.getChips >= this.bet) {
          setTimeout(() => {
            this.payOut(player, this.bet);
          }, 500);
          // playerのstate変更
          player.setState = "Done";
          this.drawDoneAction(player, "bet");
        }
      });
      this.disableAction();
    });
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
      "call",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY
    );
    this.callBtn.disable();
    this.callBtn.setScale(0.3);
    this.callBtn.setClickHandler(() => {
      this.players.forEach((player: TexasPlayer) => {
        // 前のbetSizeでbetする
        if (player.getPlayerType === "player" && player.getChips >= this.getPreBet) {
          setTimeout(() => {
            this.payOut(player, this.getPreBet);
          }, 500);
          // playerのstate変更
          player.setState = "Done";
          this.drawDoneAction(player, "call");
        }
      });
      this.disableAction();
    });
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
      "raise",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY
    );
    this.raiseBtn.disable();
    this.raiseBtn.setScale(0.3);
    this.raiseBtn.setClickHandler(() => {
      this.players.forEach((player: TexasPlayer) => {
        // 前のbetSizeでbetする
        if (player.getPlayerType === "player" && player.getChips >= this.getPreBet * 2) {
          setTimeout(() => {
            this.payOut(player, this.getPreBet * 2);
          }, 500);
          // playerのstate変更
          player.setState = "raise";
          this.drawDoneAction(player, "raise");
        }
      });
      this.disableAction();
    });
  }

  /**
   * リザルトを取得
   */
  private checkResult(): void {
    // お互いの手札を比較
    const scoreList: Set<number> = new Set();
    // ディーラーハンドを取り込んで、スコアを計算
    this.players.forEach((player: TexasPlayer) => {
      if (player.getHand !== undefined) player.addCardToHand(this.dealer.getHand as Card[]);
      const handScore: HandScore = player.calculateHandScore();
      player.setHandScore = handScore;
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

  private deleteDoneAction(): void {
    this.children.list.forEach((child) => {
      if (child.name === "action") child.destroy();
    });
  }

  private drawDoneAction(player: TexasPlayer, actionType: string): void {
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
   * リスタート
   */
  private initGame(): void {
    // オブジェクト削除
    const destroyList = this.children.list.filter(
      (child) =>
        child instanceof Card ||
        child.name === "resultText" ||
        child.name === "pots" ||
        child.name === "roleName" ||
        child.name === "action" ||
        child.name === "dealer"
    );
    destroyList.forEach((element) => {
      element.destroy();
    });

    // クラス変数初期化
    this.gameState = GameState.BETTING;
    this.result = undefined;
    this.pot = [];
    this.gameState = "firstCycle";
    this.cycleState = "notAllAction";
    this.handScoreList = [];
    this.gameStarted = false;
    this.tableInit();

    // プレイヤーのデータを初期化
    this.players.forEach((player) => {
      (player as TexasPlayer).init();
    });

    // ディーラー変更
    this.players.push(this.players.shift() as TexasPlayer);
    (this.players[0] as TexasPlayer).setIsDealer = true;

    this.chipButtons.forEach((chip) => {
      chip.disVisibleText();
    });
    this.clearButton?.disVisibleText();
    this.dealButton?.disVisibleText();

    // betting
    this.enableBetItem();
    this.fadeInBetItem();
  }

  private startGame(): void {
    // オブジェクト表示
    this.deckReset(400, 450);
    this.dealCards();
    this.players.forEach((player: TexasPlayer) => {
      this.dealHand(player);
    });
    this.drawPots();
    this.drawDealer();
    this.drawAction();

    // ante支払い
    this.players.forEach((player: TexasPlayer) => {
      setTimeout(() => {
        this.payOut(player, this.getAnte);
      }, 2000);
    });

    // タイマーイベント
    this.time.removeAllEvents();
    this.players.forEach((player, index) => {
      this.time.addEvent({
        delay: 2000,
        callback: this.cycleEvent,
        callbackScope: this,
        args: [player, index],
        loop: true,
      });
    });
  }

  private drawDealer(): void {
    const dealerContainer = this.add.container().setName("dealer");
    const dealerText = this.add
      .text(0, 0, "dealer")
      .setColor("white")
      .setFontSize(14)
      .setFontStyle("bold");
    const dealerTestify = this.add.graphics().fillCircle(23, 6, 30).fillStyle(0x000000, 0.9);
    dealerContainer.add(dealerTestify);
    dealerContainer.add(dealerText);
    this.players.forEach((player: TexasPlayer) => {
      if (player.getPlayerType === "player" && player.getIsDealer) {
        dealerContainer.setPosition(this.playerPositionX - 120, this.playerPositionY - 50);
      } else if (player.getPlayerType === "cpu" && player.getIsDealer) {
        dealerContainer.setPosition(this.cpuPositionX - 120, this.cpuPositionY - 50);
      }
    });
  }

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

  private disableAction(): void {
    this.checkBtn.disable();
    this.foldBtn.disable();
    this.betBtn.disable();
    this.callBtn.disable();
    this.raiseBtn.disable();
  }

  private actionControl(): void {
    if ((this.getPlayer as TexasPlayer).getIsDealer) {
      this.checkBtn?.enable();
      this.foldBtn?.enable();
      this.betBtn?.enable();
    } else if (
      this.gameState === "firstCycle" ||
      this.gameState === "secondCycle" ||
      this.gameState === "thirdCycle"
    ) {
      this.checkBtn?.enable();
      this.foldBtn?.enable();
      this.callBtn?.enable();
      this.raiseBtn?.enable();
    }
  }
}
