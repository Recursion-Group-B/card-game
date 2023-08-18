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
import Container = Phaser.GameObjects.Container;
import GameObject = Phaser.GameObjects.GameObject;
import HelpContainer from "./helpContainer";
import { textStyle } from "../../constants/styles";
import GameType from "../../constants/gameType";
import Size from "../../constants/size";

export default abstract class TableScene extends Phaser.Scene {
  protected gameZone: Zone | undefined;

  protected infoContainer: Container | undefined;

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

  protected betGuideText: Text | undefined;

  protected highScoreText: Text | undefined;

  protected initialTime = 2;

  protected chipButtons: Array<Chip> = [];

  protected dealButton: Button;

  protected clearButton: Button | undefined;

  protected backHomeButton: Button | undefined;

  protected tutorialButton: Button | undefined;

  protected helpButton: Button | undefined;

  protected toggleSoundButton: Button | undefined;

  protected helpContent: HelpContainer | undefined;

  protected homeElement: HTMLElement | null = document.getElementById("home");

  protected headerElement: HTMLElement | null = document.getElementById("header");

  protected gameElement: HTMLElement | null = document.getElementById("game-content");

  protected gameSceneKey: GameType;

  protected playerWinSound: Phaser.Sound.BaseSound | undefined;

  protected playerLoseSound: Phaser.Sound.BaseSound | undefined;

  protected playerDrawSound: Phaser.Sound.BaseSound | undefined;

  protected isSoundOn = true;

  protected infoContent: string | undefined;

  protected set setInitialTime(time: number) {
    this.initialTime = time;
  }

  constructor(sceneKey: string) {
    super(sceneKey);

    // TODO 共通処理はここで行う
    console.log("test");
  }

  protected get getPlayer(): Player {
    return this.players.find((player) => player.getPlayerType === "player") as Player;
  }

  protected get getCpu(): Player {
    return this.players.find((player) => player.getPlayerType === "cpu") as Player;
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

  protected get getAnte(): number {
    return this.bet * Size.ANTE;
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
        if (this.isSoundOn) this.playerWinSound?.play();
        resultMessage = "YOU WIN!!";
        break;
      case GameResult.LOSE:
        if (this.isSoundOn) this.playerLoseSound?.play();
        resultMessage = "YOU LOSE...";
        break;
      case GameResult.DRAW:
        if (this.isSoundOn) this.playerDrawSound?.play();
        resultMessage = "DRAW";
        break;
      case GameResult.WAR_WIN:
        if (this.isSoundOn) this.playerWinSound?.play();
        resultMessage = "YOU WIN!!";
        break;
      case GameResult.WAR_DRAW:
        if (this.isSoundOn) this.playerDrawSound?.play();
        resultMessage = "WAR DRAW";
        break;
      case GameResult.SURRENDER:
        if (this.isSoundOn) this.playerLoseSound?.play();
        resultMessage = "SURRENDER";
        break;
      case GameResult.BUST:
        if (this.isSoundOn) this.playerLoseSound?.play();
        resultMessage = "BUST";
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
   * ハイスコアを記録
   * TODO: DBを使う際はここでDBかローカルか判定し分岐させる
   */
  protected saveHighScore(resultAmount: number, gameType: GameType): void {
    if (resultAmount <= 0) return;

    const highScore = localStorage.getItem(gameType);
    if (!highScore || resultAmount > Number(highScore)) {
      localStorage.setItem(gameType, String(resultAmount));
      this.setHighScoreText(resultAmount);
    }
  }

  protected createGameZone(): void {
    this.gameZone = this.add.zone(Size.D_WIDTH / 2, Size.D_HEIGHT / 2, Size.D_WIDTH, Size.D_HEIGHT);
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
      chip.setClickHandler(() => {
        const tempBet = this.bet + chip.getValue;
        if (tempBet <= this.getPlayer.getChips) {
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
          chip.moveToLocate(chip.x, chip.y - 700, 200);
          chip.disVisibleText();
        });

        this.dealButton?.moveTo(this.dealButton.x, this.dealButton.y + 700, 200);
        this.clearButton?.moveTo(this.clearButton.x, this.clearButton.y + 700, 200);
        this.dealButton?.disVisibleText();
        this.clearButton?.disVisibleText();

        this.tweens.add({
          targets: this.betGuideText,
          x: this.betGuideText.x,
          y: this.betGuideText.y - 700,
          duration: 200,
          ease: "Linear",
        });

        this.tweens.add({
          targets: this.highScoreText,
          x: this.highScoreText.x,
          y: this.highScoreText.y - 700,
          duration: 200,
          ease: "Linear",
        });

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
  protected createCreditField(type: GameType): void;
  protected createCreditField(type?: GameType): void {
    this.createPlayerCreditText();
    this.createHighScoreText();
    this.createBetGuideText();
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
      .text(0, 0, `Credit: $${this.getPlayer.getChips.toString()}`, textStyle)
      .setName("playerCredit");

    Phaser.Display.Align.In.BottomLeft(this.creditText as Text, this.gameZone as Zone, -30, -90);
  }

  /**
   * ガイドテキスト
   */
  private createBetGuideText(): void {
    const betGuideTextStyle = {
      font: "60px Papyrus",
      color: "#FFFFFF",
      strokeThickness: 2,
    };
    this.betGuideText = this.add
      .text(0, 0, `Place Your Bet`, betGuideTextStyle)
      .setName("betGuideText");

    Phaser.Display.Align.In.Center(this.betGuideText as Text, this.gameZone as Zone, 0, -140);
  }

  /**
   * ハイスコア表示
   */
  private createHighScoreText(): void {
    const highScoreTextStyle = {
      font: "40px Papyrus",
      color: "#FFFFFF",
      strokeThickness: 2,
    };

    const highScore =
      localStorage.getItem(this.gameSceneKey) === null
        ? 0
        : localStorage.getItem(this.gameSceneKey);

    this.highScoreText = this.add
      .text(0, 0, `Your Best Record $${highScore}`, highScoreTextStyle)
      .setName("betGuideText");

    Phaser.Display.Align.In.Center(this.highScoreText as Text, this.gameZone as Zone, 0, -250);
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
  protected setBetText(type: GameType): void;
  protected setBetText(type?: GameType): void {
    if (type) this.betText?.setText(`BETSize: $${this.bet}`);
    else this.betText?.setText(`BET: $${this.bet}`);
  }

  /**
   * 現在のハイスコアテキストを画面にセット
   */
  private setHighScoreText(resultAmount: number): void {
    this.highScoreText.setText(`Your Best Record $${resultAmount.toString()}`);
  }

  /**
   * デバッグ用です
   */
  private static resetHighScore(): void {
    localStorage.clear();
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
    this.betGuideText.setVisible(true);
    this.highScoreText.setVisible(true);

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
      .fillRoundedRect(0, 0, 150, 40)
      .fillStyle(0x000000, 0.9)
      .setName("pots_background");

    // テキスト
    this.add
      .text(0, 0, ` pots: ${this.getTotalPot} `)
      .setColor("white")
      .setFontSize(24)
      .setPadding(5)
      .setFontFamily("Arial")
      .setOrigin(0, 0)
      .setName("pots_text");

    // コンテナ
    const potsChildren = this.children.list.filter(
      (child) => child.name === "pots_background" || child.name === "pots_text"
    );
    this.add.container(potsX, potsY, potsChildren).setName("pots");
  }

  /**
   * インフォメーション
   */
  protected createInfo(): void {
    // 背景
    const infoBackGround = this.add
      .graphics()
      .fillRoundedRect(0, 0, 600, 40)
      .fillStyle(0x000000, 0.9)
      .setName("info_background");

    // テキスト
    const infoText = this.add
      .text(0, 0, this.infoContent)
      .setColor("white")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setPadding(20, 8)
      .setOrigin(0, 0)
      .setName("info_text");

    this.infoContainer = this.add.container(0, 0, [infoBackGround, infoText]).setName("info");
    Phaser.Display.Align.In.TopCenter(this.infoContainer, this.gameZone as Zone, -300, -5);

    this.drawInfo();
  }

  /**
   * インフォメーションの更新
   */
  protected drawInfo(): void {
    let timeout = 0;
    switch (this.gameState) {
      case GameState.COMPARE:
        this.infoContent = "勝敗の確認中です。";
        break;
      case GameState.END_GAME:
      case GameState.INIT_GAME:
        this.infoContent = "画面をクリックしてベットに戻ります。";
        timeout = 2000;
        break;
      case GameState.BETTING:
        this.infoContent = "ベットサイズを決めてください。";
        break;
      case GameState.SELECT_ACE_VALUE:
        this.infoContent = "Aceの大きさを決めてください。";
        break;
      default:
        this.infoContent = "プレイ中です。";
    }
    setTimeout(() => {
      (this.infoContainer.getByName("info_text") as Text).setText(this.infoContent);
    }, timeout);
  }

  /**
   * 現在の所持金を画面にセット
   */
  protected setCreditText(displayCredit: number): void {
    this.creditText?.setText(`Credit: $${displayCredit}`);
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
    this.betGuideText.setVisible(false);
    this.highScoreText.setVisible(false);
  }

  /**
   * betフェーズに使うUIをフェードインさせる
   */
  protected fadeInBetItem(): void {
    // UIをフェードインさせる
    this.chipButtons.forEach((chip) => {
      chip.moveToLocate(chip.x, chip.y + 700, 200);
    });

    this.dealButton?.moveTo(this.dealButton.x, this.dealButton.y - 700, 200);
    this.clearButton?.moveTo(this.clearButton.x, this.clearButton.y - 700, 200);

    this.tweens.add({
      targets: this.betGuideText,
      x: this.betGuideText.x,
      y: this.betGuideText.y + 700,
      duration: 200,
      ease: "Linear",
    });

    this.tweens.add({
      targets: this.highScoreText,
      x: this.highScoreText.x,
      y: this.highScoreText.y + 700,
      duration: 200,
      ease: "Linear",
    });
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
    this.gameElement.classList.remove("d-block");
    this.gameElement.classList.add("d-none");

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
      if (this.scene.key !== "tutorial") {
        this.drawHomePage();
        this.scene.remove(this.scene.key);
      } else if (this.scene.key === "tutorial") {
        this.scene.switch(this.gameSceneKey);
      }
    });
  }

  protected createTutorialButton(): void {
    this.tutorialButton = new Button(this, this.scale.width - 80, 10, "tutorial", "");
    this.tutorialButton.setOrigin(1, 0);
    this.tutorialButton.setClickHandler(() => {
      // 現在のシーンのキーを保存する
      this.registry.set("gameSceneKey", this.gameSceneKey);
      this.scene.switch("tutorial");
    });
  }

  protected createHelpButton(content: HelpContainer): void {
    this.helpButton = new Button(this, this.scale.width - 10, 10, "help", "");
    this.helpButton.setOrigin(1, 0);
    this.helpButton.setClickHandler(() => {
      this.time.paused = true;
      const helpEle: HelpContainer | undefined = this.children.list
        .filter((child) => child.name === "help")
        .pop() as HelpContainer | undefined;

      if (helpEle === undefined) {
        this.add.existing(content);
        content.createContent();
      } else if (helpEle.list.length === 0) content.createContent();
    });
  }

  protected payOutAnimation(amount: number): void {
    const startLocation = (
      this.children.list
        .filter((child) => child.name === "playerCredit")
        .pop() as Phaser.GameObjects.Text
    ).getCenter();
    const endLocation = this.children.list
      .filter((child) => child.name === "pots")
      .pop() as Phaser.GameObjects.Container;
    const ante = new Chip(this, startLocation.x, startLocation.y, "chipRed", amount, "chipClick");
    ante.setScale(0.25);
    ante.moveToLocate(endLocation.x, endLocation.y, 1000, 0);
    ante.getSound.play();
  }

  protected payOutToPots(player: Player, amount: number): void {
    this.setPot = player.call(amount);
    this.drawPots();
    if (player.getPlayerType === "player") this.payOutAnimation(amount);
  }

  /**
   * サウンドのオンオフの切り替え
   */
  protected createToggleSoundButton(): void {
    this.toggleSoundButton = new Button(
      this,
      this.scale.width - 50,
      this.scale.height - 70,
      "soundOn",
      "",
      ""
    );
    this.toggleSoundButton.setScale(0.5);
    this.toggleSoundButton.disableClickAnimation();

    this.toggleSoundButton.setClickHandler(() => {
      // オンオフ切り替え
      this.isSoundOn = !this.isSoundOn;

      // ミュート
      this.sound.mute = !this.isSoundOn;

      // ボタンのテクスチャを切り替え
      this.toggleSoundButton.setTexture(this.isSoundOn ? "soundOn" : "soundOff");
    });
  }
}
