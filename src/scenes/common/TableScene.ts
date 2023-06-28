import Phaser from "phaser";
import Deck from "../../models/common/deck";
import Player from "../../models/common/player";
import Chip from "../../models/common/chip";
import Button from "../../models/common/button";
import Zone = Phaser.GameObjects.Zone;
import Text = Phaser.GameObjects.Text;
import GameObject = Phaser.GameObjects.GameObject;

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default abstract class TableScene extends Phaser.Scene {
  protected gameZone: Zone | undefined;

  protected players: Array<Player> = [];

  protected gameState: string | undefined;

  protected deck: Deck | undefined;

  protected bet = 0;

  protected turnCounter = 0;

  protected countDownText: Text | undefined;

  protected initialTime = 2;

  protected chipButtons: Array<Chip> = [];

  protected dealButton: Button;

  protected set setInitialTime(time: number) {
    this.initialTime = time;
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
      case "win":
        resultMessage = "YOU WIN!!";
        break;
      case "lose":
        resultMessage = "YOU LOSE...";
        break;
      default:
        resultMessage = "DRAW";
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
    const resultText = this.add.text(0, 0, resultMessage, resultStyle);

    Phaser.Display.Align.In.Center(
      resultText,
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
      const chip = new Chip(this, currentPosX, chipHeight, textureKey, value);
      this.chipButtons.push(chip);
      currentPosX += chipWidth + space;
    });

    // ハンドラー設定
    const playerIndex = 0;
    const player = this.players[playerIndex];
    this.chipButtons.forEach((chip) => {
      chip.setClickHandler(() => {
        this.bet += chip.getValue;
        console.log(this.bet);
      });
    });
  }

  /**
   * Dealボタン作成
   */
  protected createDealButton() {
    this.dealButton = new Button(
      this,
      this.scale.width / 2,
      this.scale.height / 2 + 250,
      "buttonRed",
      "DEAL"
    );
    this.dealButton.setClickHandler(() => {
      console.log("ゲームを開始します");
      this.gameState = "playing";
      this.dealButton.disable();
    });
  }

  /**
   * 所持金やbet額などの表示
   */
  protected createCreditField() {
    // 現在の所持金を表示
    // 現在のbet額を表示
  }

  protected disableBetItem(): void {
    this.chipButtons.forEach((chip) => {
      console.log(chip);
      chip.disable();
    });
  }
}
