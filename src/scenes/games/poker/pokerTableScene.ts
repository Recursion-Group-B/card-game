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
import { resultStyle } from "../../../constants/styles";
import Size from "../../../constants/size";
import GameType from "../../../constants/gameType";

export default class PokerTableScene extends TableScene {
  private playerPositionX = 450;

  private playerPositionY = 600;

  private cpuPositionX = 450;

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
    super(GameType.POKER);
    this.gameSceneKey = GameType.POKER;

    this.players = [
      new PokerPlayer("Player", "player", 1000, 0),
      new PokerPlayer("Cpu", "cpu", 1000, 0),
    ];
    this.pot = [0];
    this.returnPot = 0;
    this.gameState = GameState.BETTING;
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
    this.add.image(Size.D_WIDTH / 2, Size.D_HEIGHT / 2, "table");
    this.createGameZone();

    (this.players[0] as PokerPlayer).setIsDealer = true;

    this.helpContent = new HelpContainer(this, GameRule.POKER);
    this.createHelpButton(this.helpContent);
    this.createBackHomeButton();
    this.createTutorialButton();
    this.createChips();
    this.createClearButton();
    this.createDealButton(true);
    this.createCreditField(GameType.POKER);
    this.createInfo();
    this.drawAction();

    // アニメーション
    this.clickToUp();
    this.createCommonSound();
    this.createToggleSoundButton();
  }

  update(): void {
    // gameState管理
    this.cycleControl();

    // 更新
    this.setBetText(GameType.POKER);
    this.setCreditText(this.getPlayer.getChips);
    this.drawInfo();
  }

  private async cycleEvent(player: PokerPlayer, index: number): Promise<void> {
    // playerが何もしていない場合、アクション表示
    if (player.getPlayerType === "player" && player.getState === "notAction") {
      return;
    }

    // 前者がアクションしていないかつ自分がディーラーでない場合、何もしない。
    const prePlayer = index - 1 < 0 ? this.players.length - 1 : index - 1;
    if ((this.players[prePlayer] as PokerPlayer).getState === "notAction" && !player.getIsDealer)
      return;

    // アクションしている場合、何もしない
    if (player.getState !== "notAction") return;

    // ゲーム終了時は何もしない
    if (this.gameState === GameState.END_GAME || this.gameState === GameState.COMPARE) return;

    // cpu
    if (player.getPlayerType === "cpu") {
      await this.cpuAction(player, index);
    }
  }

  private cycleControl(): void {
    this.actionControl();

    // ベット終了
    if (this.gameState === GameState.PLAYING && !this.gameStarted) {
      this.gameState = GameState.FIRST_CYCLE;
      this.gameStarted = true;
      this.startGame();
      this.disableBetItem();
    }
    // レイズした場合、もう一周
    if (this.players.some((player: PokerPlayer) => player.getState === "raise")) {
      this.cycleState = "raise";
      this.players.forEach((player: PokerPlayer) => {
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
      this.players.every((player: PokerPlayer) => player.getState !== "notAction")
    ) {
      this.cycleState = "allDone";
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
    if (this.gameState === GameState.FIRST_CYCLE && this.cycleState === "allDone") {
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
      this.gameState = GameState.CHANGE_CYCLE;
      this.deleteDoneAction();
    }

    // change
    if (this.gameState === GameState.CHANGE_CYCLE && this.cycleState === "allDone") {
      // 各stateセット
      this.players.forEach((player) => {
        /* eslint-disable no-param-reassign */
        (player as PokerPlayer).setState = "notAction";
      });
      this.cycleState = "notAllDone";
      this.gameState = GameState.COMPARE;
    }

    // 手札を比較し、ゲーム終了
    if (this.gameState === GameState.COMPARE) {
      this.deleteDoneAction();
      this.disableBtn();
      this.time.delayedCall(500, () => {
        this.checkResult();
        this.gameState = GameState.END_GAME;
      });
    }

    // リザルト表示し、リスタート
    if (this.gameState === GameState.END_GAME && this.gameStarted) {
      this.time.removeAllEvents();
      this.gameStarted = false;

      this.time.delayedCall(1500, () => {
        this.displayResult(this.result as string, 0);
        this.resultView();
        this.saveHighScore(this.getPlayer.getChips, GameType.POKER);

        // リスタート
        this.gameZone.setInteractive();
        this.gameZone.on("pointerdown", () => {
          this.initGame();
          this.gameZone.removeInteractive();
          this.gameZone.removeAllListeners();
        });
      });
    }
  }

  private cpuAction(player: PokerPlayer, index: number): Promise<PokerPlayer> {
    return new Promise(() => {
      setTimeout(() => {
        if (player.getIsDealer && this.cycleState === "notAllAction") {
          // bet
          this.setPot = player.call(this.bet);
          this.drawDoneAction(player, "bet");
          this.drawPots();
          player.setState = "bet";
        } else if (this.cycleState === "raise" || this.gameState === GameState.FIRST_CYCLE) {
          // call
          this.setPot = player.call(this.getPreBet);
          this.drawDoneAction(player, "call");
          this.drawPots();
          player.setState = "call";
        } else if (this.gameState === GameState.CHANGE_CYCLE) {
          const changeList: Set<Card> = new Set();
          const changeAmount = Phaser.Math.RND.integerInRange(0, 5);
          for (let i = 0; i < changeAmount; i += 1) {
            changeList.add((player.getHand as Card[])[Phaser.Math.RND.integerInRange(0, 4)]);
          }
          if (changeList.size) {
            player.change([...changeList], this.deck?.draw(changeList.size) as Card[]);
            // phaser描画
            changeList.forEach((card) => card.destroy());
            this.dealHand(index);
          }
          // state更新
          player.setState = "Done";
          this.drawDoneAction(player, "change");
        }
      }, 1000);
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
    this.players.forEach((player) => {
      if (player.getPlayerType === "player" && (player as PokerPlayer).getIsDealer) {
        dealerContainer.setPosition(this.playerPositionX - 120, this.playerPositionY - 50);
      } else if (player.getPlayerType === "cpu" && (player as PokerPlayer).getIsDealer) {
        dealerContainer.setPosition(this.cpuPositionX - 120, this.cpuPositionY - 50);
      }
    });
  }

  /**
   * 手札配布
   */
  private dealHand(): void;
  private dealHand(playerIndex: number): void;
  private dealHand(playerIndex?: number) {
    const flipTime = 800;
    let cpuTime;
    switch (this.gameState) {
      case GameState.FIRST_CYCLE:
        cpuTime = 1000;
        break;
      default:
        cpuTime = 0;
    }

    const deal = (player: PokerPlayer) => {
      player.getHand?.forEach((card, index) => {
        this.children.bringToTop(card);
        if (player.getPlayerType === "player") {
          card.moveTo(this.playerPositionX + index * this.cardSize.x, this.playerPositionY, 500);
          setTimeout(() => {
            card.flipToFront();
          }, flipTime);
        } else if (player.getPlayerType === "cpu") {
          setTimeout(() => {
            card.moveTo(this.cpuPositionX + index * this.cardSize.x, this.cpuPositionY, 500);
          }, cpuTime);
        }
      });
    };

    if (playerIndex === undefined) this.players.forEach((player: PokerPlayer) => deal(player));
    else deal(this.players[playerIndex] as PokerPlayer);
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
      "change",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    this.changeBtn.disable();
    this.changeBtn.setClickHandler(() => {
      this.players.forEach((player: PokerPlayer, index: number) => {
        if (player.getPlayerType !== "player") return;
        // data
        const changeList = player.getHand.filter(
          (child: Card) => child.getClickStatus === true
        ) as Card[];
        if (changeList.length) {
          (player as PokerPlayer).change(
            changeList,
            (this.deck as Deck).draw(changeList.length) as Card[]
          );
          changeList.forEach((card) => card.destroy());
          this.dealHand(index);
        }
        // state更新
        (player as PokerPlayer).setState = "Done";
        // action表示
        this.drawDoneAction(player as PokerPlayer, "change");
      });
    });
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
      "check",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    this.checkBtn.disable();
    this.checkBtn.setClickHandler(() => {
      this.players.forEach((player) => {
        if (player.getPlayerType === "player") {
          // playerのstate変更
          (player as PokerPlayer).setState = "Done";
          // action表示
          this.drawDoneAction(player as PokerPlayer, "check");
        }
      });
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
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    this.betBtn.disable();
    this.betBtn.setClickHandler(() => {
      this.players.forEach((player: PokerPlayer) => {
        if (player.getPlayerType !== "player") return;
        // 100betする
        if (player.getPlayerType === "player" && player.getChips >= this.bet) {
          setTimeout(() => {
            this.payOutToPots(player, this.bet);
          }, 500);
          // playerのstate変更
          player.setState = "Done";
          // action表示
          this.drawDoneAction(player, "bet");
        }
      });
    });
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
      "fold",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    this.foldBtn.disable();
    this.foldBtn.setClickHandler(() => {
      // カードを手放す
      this.players.forEach((player: PokerPlayer) => {
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
      this.gameState = GameState.COMPARE;
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
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    this.callBtn.disable();
    this.callBtn.setClickHandler(() => {
      this.players.forEach((player: PokerPlayer) => {
        // 前のbetSizeでbetする
        if (player.getPlayerType === "player" && player.getChips >= this.getPreBet) {
          setTimeout(() => {
            this.payOutToPots(player, this.getPreBet);
          }, 500);
          // playerのstate変更
          player.setState = "Done";
          // action表示
          this.drawDoneAction(player, "call");
        }
      });
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
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    this.raiseBtn.disable();
    this.raiseBtn.setClickHandler(() => {
      this.players.forEach((player: PokerPlayer) => {
        // 前のbetSizeでbetする
        if (player.getPlayerType === "player" && player.getChips >= this.getPreBet * 2) {
          setTimeout(() => {
            this.payOutToPots(player, this.getPreBet * 2);
          }, 500);
          // playerのstate変更
          player.setState = "raise";
          // action表示
          this.drawDoneAction(player, "raise");
        }
      });
    });
  }

  /**
   * 手札を比較する
   */
  private checkResult(): void {
    const scoreList: Set<number> = new Set();

    this.players.forEach((player: PokerPlayer) => {
      const handScore: HandScore = player.calculateHandScore();
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
    setTimeout(() => {
      this.children.list.forEach((child) => {
        if (child.name === "action") child.destroy();
      });
    }, 300);
  }

  private drawDoneAction(player: PokerPlayer, actionType: string): void {
    let positionX;
    let positionY;
    if (player.getPlayerType === "player") {
      positionX = this.playerPositionX + 180;
      positionY = this.playerPositionY - 20;
    } else {
      positionX = this.cpuPositionX + 180;
      positionY = this.cpuPositionY - 20;
    }
    const action = this.add.text(positionX, positionY, actionType, resultStyle);
    action.setName("action");
    this.children.bringToTop(action);
  }

  /**
   * リスタートボタンを描画
   */
  private initGame(): void {
    // オブジェクト削除
    const destroyList = this.children.list.filter(
      (child) =>
        child instanceof Card ||
        child.name === "resultText" ||
        child.name === "pots" ||
        child.name === "roleName" ||
        child.name === "dealer"
    );
    destroyList.forEach((element) => {
      element.destroy();
    });

    // クラス変数初期化
    this.gameState = GameState.BETTING;
    this.result = undefined;
    this.pot = [];
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
    this.chipButtons.forEach((chip) => {
      chip.disVisibleText();
    });
    this.clearButton?.disVisibleText();
    this.dealButton?.disVisibleText();
    this.enableBetItem();
    this.fadeInBetItem();
  }

  private startGame(): void {
    // オブジェクト表示
    this.deckReset(650, 450);
    this.dealCards();
    this.drawPots();
    this.drawDealer();
    this.dealHand();

    // ante支払い
    this.players.forEach((player: PokerPlayer) => {
      setTimeout(() => {
        this.payOutToPots(player, this.getAnte);
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

  private disableBtn(): void {
    setTimeout(() => {
      this.checkBtn.disable();
      this.changeBtn.disable();
      this.foldBtn.disable();
      this.betBtn.disable();
      this.callBtn.disable();
      this.raiseBtn.disable();
    }, 100);
  }

  private actionControl(): void {
    if (
      (this.getPlayer as PokerPlayer).getState === "Done" ||
      this.gameState === GameState.COMPARE ||
      this.gameState === GameState.END_GAME
    ) {
      this.disableBtn();
    } else if (
      this.gameState === GameState.FIRST_CYCLE &&
      (this.getPlayer as PokerPlayer).getIsDealer
    ) {
      this.checkBtn?.enable();
      this.foldBtn?.enable();
      this.betBtn?.enable();
    } else if (this.gameState === GameState.FIRST_CYCLE) {
      this.checkBtn?.enable();
      this.foldBtn?.enable();
      this.callBtn?.enable();
      this.raiseBtn?.enable();
    } else if (this.gameState === GameState.CHANGE_CYCLE) {
      this.checkBtn?.disable();
      this.foldBtn?.disable();
      this.betBtn?.disable();
      this.callBtn?.disable();
      this.raiseBtn?.disable();
      this.changeBtn?.enable();
    }
  }
}
