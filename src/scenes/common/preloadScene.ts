import Phaser from "phaser";
import GameType from "../../constants/gameType";

class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    //this.cameras.main.setBackgroundColor(0x000020); // 背景色を灰色に設定
    // ダミーアセットの読み込み
    for (let i = 0; i < 1000; i += 1) {
      this.load.image(`dummy${i}`, "/assets/images/dummy.png");
    }

    // ゲームアセットの読み込み
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

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // プログレスバー作成
    const progressBar = this.add.graphics();

    // プログレスボックス作成
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(centerX - 300, centerY - 120, 600, 240);

    // ロードテキスト作成
    const loadingText = this.make.text({
      x: centerX,
      y: centerY + 30,
      text: "Loading...",
      style: {
        font: "26px monospace",
        color: "#ffffff",
      },
    });
    loadingText.setOrigin(0.5, 0.5);

    // パーセントテキスト作成
    const percentText = this.make.text({
      x: centerX,
      y: centerY + 70,
      text: "0%",
      style: {
        font: "26px monospace",
        color: "#ffffff",
      },
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on("progress", (value: number) => {
      percentText.setText(`${Math.floor(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(centerX - 150, centerY - 30, 300 * value, 30);
    });

    this.load.on("complete", () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0, () => {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
      });
    });
  }

  create() {
    const gameType = this.registry.get("gameType") as GameType;
    let sceneKey = "";
    if (gameType === GameType.SPEED) {
      sceneKey = "Speed";
    } else if (gameType === GameType.POKER) {
      sceneKey = "Poker";
    } else if (gameType === GameType.BLACKJACK) {
      sceneKey = "Blackjack";
    } else if (gameType === GameType.WAR) {
      sceneKey = "War";
    } else if (gameType === GameType.TEXAS) {
      sceneKey = " Texas";
    }

    // // カメラのフェードアウト
    // this.cameras.main.fadeOut(2000, 0, 0, 0); // 2秒間かけてフェードアウトします

    // フェードアウトが完了したら、コールバックでシーンを開始します
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(sceneKey);
    });
  }
}

export default PreloadScene;
