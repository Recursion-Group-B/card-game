import Phaser from "phaser";
import Deck from "../../models/common/deck";
import Player from "../../models/common/player";
import Chip from "../../models/common/chip";
import Button from "../../models/common/button";
import GameState from "../../constants/gameState";
import GameResult from "../../constants/gameResult";
import GAME from "../../models/common/game";
import Zone = Phaser.GameObjects.Zone;
import Text = Phaser.GameObjects.Text;
import GameObject = Phaser.GameObjects.GameObject;
import HelpContainer from "./helpContainer";
import { textStyle } from "../../constants/styles";

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default abstract class TableScene extends Phaser.Scene {
  protected gameZone: Zone | undefined;

  protected pot: number[];

  protected returnPot;

  protected players: Array<Player> = [];

  protected gameState: string | undefined;

  protected deck: Deck | undefined;

  protected bet = 0;

  protected turnCounter = 0;

  protected countDownText: Text | undefined;

  protected creditText: Text | undefined;

  protected betText: Text | undefined;

  protected resultText: Text | undefined;

  protected initialTime = 2;

  protected chipButtons: Array<Chip> = [];

  protected dealButton: Button;

  protected clearButton: Button | undefined;

  protected backHomeButton: Button | undefined;

  protected tutorialButton: Button | undefined;

  protected helpButton: Button | undefined;

  protected backButton: Button | undefined;

  protected helpContent: HelpContainer | undefined;

  protected homeElement: HTMLElement | null = document.getElementById("home");

  protected headerElement: HTMLElement | null = document.getElementById("header");

  protected gameElement: HTMLElement | null = document.getElementById("game-content");

  protected set setInitialTime(time: number) {
    this.initialTime = time;
  }

  constructor() {
    super({ key: "game" });
  }

  protected playerWinSound: Phaser.Sound.BaseSound | undefined;

  protected playerLoseSound: Phaser.Sound.BaseSound | undefined;

  protected playerDrawSound: Phaser.Sound.BaseSound | undefined;

  protected get getPlayer(): Player {
    return this.players.find((player) => player.getPlayerType === "player") as Player;
  }

  protected set setPot(amount: number) {
    this.pot.push(amount);
  }

  protected get getPreBet(): number {
    return this.pot[this.pot.length - 1];
  }

  protected get getPot(): number[] {
    return this.pot;
  }

  protected get getTotalPot(): number {
    return this.pot.reduce((pre, next) => pre + next, 0);
  }

  protected potReturn(): number {
    this.returnPot = this.getTotalPot;
    this.pot.length = 0;
    return this.returnPot;
  }

  /**
   * ゲーム開始時のカード配布
   */
  abstract dealCards(): void;

  /**
   * deckをリセットしシャッフルする
   */
  protected deckReset(x?: number, y?: number): void {
    this.deck = undefined;
    this.deck = new Deck(this, x ?? 0, y ?? 0);
    this.deck.shuffle();
  }

  /**
   * カウントダウン時に表示するテキスト作成
   */
  protected createCountDownText(): void {
    const timerConfig = {
      font: "bold 200px Arial",
      fill: "#ff0000",
      stroke: "#000000",
      strokeThickness: 9,
    };

    this.countDownText = this.add.text(0, 0, "", timerConfig);
    this.setCountDownText(`${String(this.initialTime)}`);
    Phaser.Display.Align.In.Center(this.countDownText as Text, this.gameZone as GameObject, 0, -20);
  }

  /**
   * 表示するカウントダウンテキストを設定
   */
  protected setCountDownText(time: string): void {
    if (this.countDownText) this.countDownText.setText(time);
  }

  /**
   * カウントダウン用コールバック
   */
  protected countDownCallback(callback: () => void) {
    this.initialTime -= 1;
    if (this.initialTime > 0) {
      this.setCountDownText(`${String(this.initialTime)}`);
    } else if (this.initialTime === 0) {
      this.setCountDownText("Play!!");
      Phaser.Display.Align.In.Center(
        this.countDownText as Text,
        this.gameZone as GameObject,
        0,
        -20
      );
    } else {
      this.setCountDownText("");
      callback();
    }
  }

  /**
   * リザルト画面表示
   * TODO 取得したお金も表示できた方が良いかも
   * TODO デザインも後々直したい
   */
  protected displayResult(result: string, winAmount: number): void {
    const resultColor = "#ff0";
    const backgroundColor = "rgba(0,0,0,0.5)";

    let resultMessage = "";
    switch (result) {
      case GameResult.WIN:
        this.playerWinSound?.play();
        resultMessage = "YOU WIN!!";
        break;
      case GameResult.LOSE:
        this.playerLoseSound?.play();
        resultMessage = "YOU LOSE...";
        break;
      case GameResult.DRAW:
        this.playerDrawSound?.play();
        resultMessage = "DRAW";
        break;
      case GameResult.WAR_WIN:
        this.playerWinSound?.play();
        resultMessage = "YOU WIN!!";
        break;
      case GameResult.WAR_DRAW:
        this.playerDrawSound?.play();
        resultMessage = "WAR DRAW";
        break;
      case GameResult.SURRENDER:
        this.playerLoseSound?.play();
        resultMessage = "SURRENDER";
        break;
      default:
        resultMessage = "GAME OVER";
    }

    const resultStyle = {
      font: "bold 60px Arial",
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

    // テキストオブジェクトを作成
    this.resultText = this.add.text(0, 0, resultMessage, resultStyle);
    this.resultText.name = "resultText";

    Phaser.Display.Align.In.Center(
      this.resultText,
      this.add.zone(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height
      )
    );
  }

  /**
   * TODO ゲームサイズなどは後々決めましょう
   */
  protected createGameZone(): void {
    this.gameZone = this.add.zone(D_WIDTH / 2, D_HEIGHT / 2, D_WIDTH, D_HEIGHT);
  }

  get getGameZone(): Phaser.GameObjects.Zone {
    return this.gameZone as Phaser.GameObjects.Zone;
  }

  /**
   * チップオブジェクトの作成
   */
  protected createChips(): void {
    const chipHeight = Number(920 / 2);

    const chipsMap = {
      chipWhite: 10,
      chipBlue: 50,
      chipYellow: 100,
      chipOrange: 500,
      chipRed: 1000,
    };

    const numChips = Object.keys(chipsMap).length;
    const chipWidth = 60;
    const totalWidth = numChips * chipWidth;
    const space = (this.scale.width - totalWidth) / (numChips + 1);
    const startPosX = space;

    // チップの生成
    let currentPosX = startPosX;
    Object.entries(chipsMap).forEach(([textureKey, value]) => {
      const chip = new Chip(
        this,
        currentPosX,
        chipHeight,
        textureKey,
        value,
        GAME.SOUNDS_KEY.CHIP_CLICK_KEY
      );
      this.chipButtons.push(chip);
      currentPosX += chipWidth + space;
    });

    // ハンドラー設定
    this.chipButtons.forEach((chip) => {
      const player = this.players[0];
      chip.setClickHandler(() => {
        const tempBet = this.bet + chip.getValue;
        if (tempBet <= player.getChips) {
          this.bet = tempBet;
        }

        this.setBetText();
      });
    });
  }

  /**
   * Dealボタン作成
   */
  protected createDealButton(): void;
  protected createDealButton(startBet: boolean): void;
  protected createDealButton(startBet?: boolean): void {
    this.dealButton = new Button(
      this,
      this.scale.width / 2 + 150,
      this.scale.height / 2 + 250,
      "buttonRed",
      "DEAL",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY
    );
    this.dealButton.setClickHandler(() => {
      if (this.bet > 0) {
        const displayCredit = startBet
          ? this.getPlayer.getChips
          : this.getPlayer.getChips - this.bet;
        this.setCreditText(displayCredit);

        // UIをフェードアウトさせる
        this.chipButtons.forEach((chip) => {
          chip.moveTo(chip.x, chip.y - 700, 200);
          chip.disVisibleText();
        });

        this.dealButton?.moveTo(this.dealButton.x, this.dealButton.y + 700, 200);
        this.clearButton?.moveTo(this.clearButton.x, this.clearButton.y + 700, 200);
        this.dealButton?.disVisibleText();
        this.clearButton?.disVisibleText();

        setTimeout(() => {
          this.gameState = GameState.PLAYING;
        }, 1000);
      }
    });
  }

  /**
   * クリアボタンを表示
   */
  protected createClearButton(): void {
    this.clearButton = new Button(
      this,
      this.scale.width / 2 - 150,
      this.scale.height / 2 + 250,
      "buttonRed",
      "CLEAR",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY
    );

    this.clearButton.setClickHandler(() => {
      this.bet = 0;
      this.setBetText();
    });
  }

  /**
   * 所持金やbet額などの表示
   */
  protected createCreditField(): void;
  protected createCreditField(type: string): void;
  protected createCreditField(type?: string): void {
    this.createPlayerCreditText();
    if (type) {
      this.createPlayerBetText(type);
    } else {
      this.createPlayerBetText();
    }
  }

  /**
   * 所持金を表示
   */
  private createPlayerCreditText(): void {
    this.creditText = this.add
      .text(0, 0, `CREDIT: $${this.getPlayer.getChips.toString()}`, textStyle)
      .setName("playerCredit");

    Phaser.Display.Align.In.BottomLeft(this.creditText as Text, this.gameZone as Zone, -30, -90);
  }

  /**
   * 現在のベット額を表示
   */
  private createPlayerBetText(): void;
  private createPlayerBetText(type: string): void;
  private createPlayerBetText(type?: string): void {
    const bet = type ? "BetSize" : "Bet";
    this.betText = this.add
      .text(90, this.scale.height / 2 + 400, `${bet}: $${this.bet.toString()}`, textStyle)
      .setName("betSize");

    Phaser.Display.Align.In.BottomLeft(this.betText as Text, this.gameZone as Zone, -30, -40);
  }

  /**
   * 現在のベット額を画面にセット
   */
  protected setBetText(): void;
  protected setBetText(type: string): void;
  protected setBetText(type?: string): void {
    if (type) this.betText?.setText(`BETSize: $${this.bet}`);
    else this.betText?.setText(`BET: $${this.bet}`);
  }

  /**
   * betフェーズに使うUIを表示する
   */
  protected enableBetItem() {
    this.chipButtons.forEach((chip) => {
      chip.enable();
    });

    // テキストは時間差で表示する
    this.time.delayedCall(200, () => {
      this.chipButtons.forEach((chip) => {
        chip.visibleText();
      });
    });

    this.dealButton?.enable();
    this.clearButton?.enable();

    // テキストは時間差で表示する
    this.time.delayedCall(200, () => {
      this.dealButton?.visibleText();
      this.clearButton?.visibleText();
    });
  }

  /**
   * ポットの表示
   */
  protected drawPots(): void {
    // 以前のpotsを削除
    const potsX = 580;
    const potsY = 170;
    this.children.list.forEach((element) => {
      if (element.name === "pots") element.destroy(true);
    });

    // 背景
    this.add
      .graphics()
      .fillRoundedRect(potsX, potsY, 150, 40)
      .fillStyle(0x000000, 0.9)
      .setName("pots");

    // テキスト
    this.add
      .text(potsX, potsY, ` pots: ${this.getTotalPot} `)
      .setColor("white")
      .setFontSize(24)
      .setPadding(5)
      .setFontFamily("Arial")
      .setOrigin(0, 0)
      .setName("pots");
  }

  /**
   * 現在の所持金を画面にセット
   */
  protected setCreditText(displayCredit: number): void {
    this.creditText?.setText(`CREDIT: $${displayCredit}`);
  }

  /**
   * betフェーズのみ使うUIを非表示にする
   */
  protected disableBetItem(): void {
    this.chipButtons.forEach((chip) => {
      chip.disable();
    });
    this.dealButton?.disable();
    this.clearButton?.disable();
    this.dealButton?.disable();
  }

  /**
   * betフェーズに使うUIをフェードインさせる
   */
  protected fadeInBetItem(): void {
    // UIをフェードインさせる
    this.chipButtons.forEach((chip) => {
      chip.moveTo(chip.x, chip.y + 700, 200);
    });

    this.dealButton?.moveTo(this.dealButton.x, this.dealButton.y - 700, 200);
    this.clearButton?.moveTo(this.clearButton.x, this.clearButton.y - 700, 200);
  }

  /**
   * 共通のサウンドを設定
   */
  protected createCommonSound(): void {
    this.playerWinSound = this.scene.scene.sound.add(GAME.SOUNDS_KEY.PLAYER_WIN_KEY, {
      volume: 0.6,
    });

    this.playerLoseSound = this.scene.scene.sound.add(GAME.SOUNDS_KEY.PLAYER_LOSE_KEY, {
      volume: 0.6,
    });

    this.playerDrawSound = this.scene.scene.sound.add(GAME.SOUNDS_KEY.PLAYER_DRAW_KEY, {
      volume: 0.6,
    });
  }

  /**
   * １ゲームでの情報をリセットする
   */
  protected tableInit(): void {
    this.bet = 0;
  }

  private drawHomePage(): void {
    // game-content
    (this.gameElement as HTMLElement).innerHTML = "";

    // home
    this.homeElement?.classList.remove("d-none");
    this.homeElement?.classList.add("d-block");

    // header
    this.headerElement?.classList.remove("d-none");
    this.headerElement?.classList.add("d-block");
  }

  protected createBackHomeButton(): void {
    this.backHomeButton = new Button(this, 10, 10, "uTurn", "");
    this.backHomeButton.setOrigin(0);
    this.backHomeButton.setClickHandler(() => {
      if (this.scene.key === "game") this.drawHomePage();
      else if (this.scene.key === "tutorial") this.scene.start("game");
    });
  }

  protected createTutorialButton(): void {
    this.tutorialButton = new Button(this, this.scale.width - 80, 10, "tutorial", "");
    this.tutorialButton.setOrigin(1, 0);
    this.tutorialButton.setClickHandler(() => {
      this.scene.start("tutorial");
    });
  }

  protected createHelpButton(content: HelpContainer): void {
    this.helpButton = new Button(this, this.scale.width - 10, 10, "help", "");
    this.helpButton.setOrigin(1, 0);
    this.helpButton.setClickHandler(() => {
      this.add.existing(content);
      content.createContent();
    });
  }
}
