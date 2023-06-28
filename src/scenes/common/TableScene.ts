import Phaser from "phaser";
import Deck from "../../models/common/deck";
import Player from "../../models/common/player";
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

  protected bets: number | undefined;

  protected turnCounter = 0;

  protected countDownText: Text | undefined;

  protected initialTime = 2;

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
    const resultText = this.add.text(0, 0, resultMessage, resultStyle).setName("result");

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
}
