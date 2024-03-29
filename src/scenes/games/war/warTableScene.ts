import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import WarPlayer from "../../../models/games/war/warPlayer";
import GameState from "../../../constants/gameState";
import GameResult from "../../../constants/gameResult";
import PlayerType from "../../../constants/playerType";
import Button from "../../../models/common/button";
import HelpContainer from "../../common/helpContainer";
import GameRule from "../../../constants/gameRule";
import GameType from "../../../constants/gameType";

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default class WarTableScene extends TableScene {
  private result: string | undefined; // WIN or LOSE or DRAW

  private gameStarted = false;

  private displayedResult = false;

  private warButton: Button | undefined;

  private surrenderButton: Button | undefined;

  private didWar = false;

  constructor() {
    super(GameType.WAR);
    this.gameSceneKey = GameType.WAR;

    this.players = [
      new WarPlayer("Player", PlayerType.PLAYER, 1000, 0),
      new WarPlayer("Dealer", PlayerType.DEALER, 0, 0),
    ];
  }

  create(): void {
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table");
    this.gameState = GameState.BETTING;
    this.createGameZone();
    this.createBetItem();

    // UI
    this.createBackHomeButton();
    this.createTutorialButton();
    this.helpContent = new HelpContainer(this, GameRule.WAR);
    this.createHelpButton(this.helpContent);
    this.createCommonSound();
    this.createToggleSoundButton();
    this.createInfo();
  }

  update(): void {
    this.drawInfo();

    if (this.gameState === GameState.PLAYING && !this.gameStarted) {
      this.disableBetItem();
      this.startGame();
      this.gameStarted = true;
    }

    if (this.gameState === GameState.END_GAME && !this.displayedResult) {
      // ゲームresult画面
      if (this.result) {
        this.payOut();

        this.displayResult(this.result, 0);

        this.saveHighScore(this.players[0].getChips, GameType.WAR);

        this.displayedResult = true;
      }
    }
  }

  private payOut(): void {
    let winAmount = 0;
    if (this.result === GameResult.WAR_DRAW) {
      winAmount = this.bet * 2;
    } else if (this.result === GameResult.WAR_WIN) {
      winAmount = this.bet * 1.5;
    } else if (this.result === GameResult.WIN) {
      winAmount = this.bet;
    } else if (this.result === GameResult.SURRENDER) {
      winAmount = -this.bet * 0.5;
    } else {
      winAmount = -this.bet;
    }

    // 所持金の更新
    this.players[0].setChips = this.players[0].getChips + winAmount;
    this.setCreditText(this.players[0].getChips);

    // ベット額の更新
    this.bet = 0;
    this.setBetText();
  }

  private startGame(): void {
    if (!this.didWar) this.createDeck();

    this.dealCards();

    new Promise<void>((resolve) => {
      this.time.delayedCall(2700, () => {
        this.checkResult();
        resolve();
      });
    }).then(() => {
      if (this.result === GameResult.DRAW && !this.didWar) {
        if (this.canWar()) {
          this.createWarButton();
        }
        this.createSurrenderButton();
      }

      this.gameZone?.setInteractive();
      this.gameZone?.on("pointerdown", () => {
        this.startBet();
      });
    });
  }

  private canWar(): boolean {
    return this.players[0].getChips >= this.bet * 2;
  }

  private createWarButton(): void {
    this.warButton = new Button(
      this,
      this.scale.width / 2 + 150,
      this.scale.height / 2,
      "buttonRed",
      "WAR"
    );

    this.warButton.setClickHandler(() => {
      this.bet *= 2;
      this.setBetText();
      this.setCreditText(this.players[0].getChips - this.bet);

      this.warButton?.disable();
      this.surrenderButton?.disable();

      this.didWar = true;
      this.startGame();
    });
  }

  private createSurrenderButton(): void {
    this.surrenderButton = new Button(
      this,
      this.scale.width / 2 - 150,
      this.scale.height / 2,
      "buttonRed",
      "SURRENDER"
    );

    this.surrenderButton.setClickHandler(() => {
      this.gameState = GameState.END_GAME;
      this.result = GameResult.SURRENDER;

      this.warButton?.disable();
      this.surrenderButton?.disable();
    });
  }

  private startBet(): void {
    if (this.gameState !== GameState.END_GAME) return;
    this.reset();
    this.enableBetItem();
    this.fadeInBetItem();
  }

  private reset(): void {
    this.gameState = GameState.BETTING;
    this.gameStarted = false;
    this.displayedResult = false;
    this.didWar = false;
    this.resultText = undefined;
    this.warButton = undefined;
    this.surrenderButton = undefined;
    this.players.forEach((player) => {
      player.resetHand();
    });

    this.chipButtons.forEach((chip) => {
      chip.disVisibleText();
    });

    this.clearButton?.disVisibleText();
    this.dealButton?.disVisibleText();

    // オブジェクト削除
    const destroyList = this.children.list.filter(
      (child) =>
        (child as Card) instanceof Card || (child as Phaser.GameObjects.Text).name === "resultText"
    );

    destroyList.forEach((element) => {
      element.destroy();
    });
  }

  private createDeck() {
    this.deck = new Deck(this, this.scale.width, -100);
    this.deck.shuffle();
  }

  createBetItem(): void {
    this.createChips();
    this.createDealButton();
    this.createClearButton();
    this.createCreditField();
  }

  /**
   * カードの配布
   */
  dealCards(): void {
    const centerWidth = this.scale.width / 2;
    const centerHeight = this.scale.height / 2;

    this.players.forEach((player) => {
      player.resetHand();
      const newCard = this.deck?.draw();
      if (newCard) {
        player.addCardToHand(newCard);
        if (player.getPlayerType === PlayerType.PLAYER) {
          newCard.moveTo(centerWidth, centerHeight + 170, 200);
          newCard.setTexture("cards", newCard.getTextureKey);
        } else if (player.getPlayerType === PlayerType.DEALER) {
          newCard.moveTo(centerWidth, centerHeight - 170, 200);
          // カードを裏返す
          this.time.delayedCall(1500, () => {
            newCard.flipToFront();
          });
        }
        this.children.bringToTop(newCard);
      }
    });
  }

  /**
   * 勝敗判定
   */
  private checkResult(): void {
    if (this.gameState !== GameState.PLAYING) return;
    const playerScore = this.players[0].calculateHandScore() as number;
    const dealerScore = this.players[1].calculateHandScore() as number;

    if (this.isWin(playerScore, dealerScore)) {
      this.result = GameResult.WIN;
      this.gameState = GameState.END_GAME;
    } else if (WarTableScene.isLose(playerScore, dealerScore)) {
      this.result = GameResult.LOSE;
      this.gameState = GameState.END_GAME;
    } else if (this.isWarWin(playerScore, dealerScore)) {
      this.result = GameResult.WAR_WIN;
      this.gameState = GameState.END_GAME;
    } else if (this.isWarDraw(playerScore, dealerScore)) {
      this.result = GameResult.WAR_DRAW;
      this.gameState = GameState.END_GAME;
    } else {
      // 初回ドロー
      this.result = GameResult.DRAW;
    }
  }

  /**
   * プレイヤーの勝利条件
   */
  private isWin(playerScore: number, dealerScore: number): boolean {
    return playerScore > dealerScore && !this.didWar;
  }

  /**
   * プレイヤーの敗北条件
   */
  private static isLose(playerScore: number, dealerScore: number): boolean {
    return playerScore < dealerScore;
  }

  /**
   * ウォー挑戦時の勝利条件
   */
  private isWarWin(playerScore: number, dealerScore: number): boolean {
    return playerScore > dealerScore && this.didWar;
  }

  /**
   * ウォー挑戦時も引き分け
   */
  private isWarDraw(playerScore: number, dealerScore: number): boolean {
    return playerScore === dealerScore && this.didWar;
  }
}
