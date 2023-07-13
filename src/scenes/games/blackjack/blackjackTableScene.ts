import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import BlackJackPlayer from "../../../models/games/blackjack/blackjackPlayer";
import GameState from "../../../constants/gameState";
import GameResult from "../../../constants/gameResult";
import PlayerType from "../../../constants/playerType";
import Zone = Phaser.GameObjects.Zone;
import GameObject = Phaser.GameObjects.GameObject;
import TimeEvent = Phaser.Time.TimerEvent;
import BlackJackHelp from "./blackjackHelp";

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default class BlackJackTableScene extends TableScene {
  private playerPositionX = 500;

  private playerPositionY = 600;

  private cpuPositionX = 500;

  private cpuPositionY = 300;

  // 追加
  private addPlayerPositionX = 0;

  private addCpuPositionX = 0;

  private playerTotalhand = 0;

  private cpuTotalhand = 0;

  // 追加 ※ 共通化できる場所
  private playerScoreTexts: Phaser.GameObjects.Text[] = [];

  private cpuScoreTexts: Phaser.GameObjects.Text[] = [];

  // ここまで追加

  private cardSize = {
    x: 85,
    y: 150,
  };

  private gameStarted = false;

  constructor() {
    super("Blackjack");

    this.players = [
      new BlackJackPlayer("Player", PlayerType.PLAYER, 1000, 0),
      new BlackJackPlayer("Cpu", PlayerType.CPU, 0, 0),
    ];
  }

  preload(): void {
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
  }

  create(): void {
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table");
    this.gameState = GameState.BETTING;
    // ベット系
    this.createGameZone();
    this.createChips();
    this.createDealButton();
    this.createClearButton();
    this.createCreditField();

    // UI
    this.createBackHomeButton();
    this.createTutorialButton();
    this.helpContent = new BlackJackHelp(this);
    this.createHelpButton(this.helpContent);
    this.createCommonSound();
  }

  update(): void {
    if (this.gameState === GameState.PLAYING && !this.gameStarted) {
      this.disableBetItem();
      // 手札の配布までの処理
      this.makeDeck();
      this.dealCards();
      this.dealHand();
      // 各機能の実装
      this.stand();
      this.hit();
      this.double(); // 課題 : hitの2回目から表示させない
      this.surrender(); // 課題 : hitの2回目から表示させない
      this.playerDisplayTotal();
      this.gameStarted = true;
    }
  }

  /**
   * 山札作成
   */
  makeDeck() {
    this.deck = new Deck(this, 1050, 450);
    this.deck.shuffle();
  }

  /**
   * 複数人へ配布
   */
  dealCards(): void {
    this.players.forEach((player) => {
      /* eslint-disable no-param-reassign */
      player.setHand = (this.deck as Deck).draw(2) as Card[];
    });
  }

  /**
   * 手札配布
   */
  dealHand() {
    this.players.forEach((player) => {
      console.log(player.getHand);
      player.getHand?.forEach((card, index) => {
        if (player.getPlayerType === "player") {
          card.moveTo(this.playerPositionX + this.addPlayerPositionX, this.playerPositionY, 500);
          setTimeout(() => card.flipToFront(), 800);
          card.setInteractive();
          // ここから追加した
          this.addPlayerPositionX += 85;
          this.playerTotalhand += card.getRankNumber("blackjack");
        } else if (player.getPlayerType === "cpu") {
          // ブラックジャックはCPUの一枚目を表面にする
          if (index === 0) {
            card.moveTo(this.cpuPositionX + this.addCpuPositionX, this.cpuPositionY, 500);
            setTimeout(() => card.flipToFront(), 800);
            card.setInteractive();
          } else {
            card.moveTo(this.cpuPositionX + this.addCpuPositionX, this.cpuPositionY, 500);
          }
          this.addCpuPositionX += 85;
          this.cpuTotalhand += card.getRankNumber("blackjack");
        }
      });
    });
  }

  /**
   * プレーヤーのTotalを表示する
   */
  playerDisplayTotal(): void {
    // プレイヤー
    const playerTotal = this.add
      .text(this.playerPositionX + 120, this.playerPositionY - 95, `${this.playerTotalhand}`, {
        fontFamily: "Arial Black",
        fontSize: 30,
      })
      .setName("roleName");

    this.playerScoreTexts.push(playerTotal);
  }

  /**
   * カードの値で表示を変更する Player
   */
  setPlayerDisplayTotal(): void {
    const playerScoreText = this.playerScoreTexts[0];
    playerScoreText.setText(this.playerTotalhand.toString());
  }

  /**
   * CPUのTotalを表示する
   */
  cpuDisplayTotal(): void {
    // CPU
    const cpuTotal = this.add
      .text(this.cpuPositionX + 120, this.cpuPositionY + 65, `${this.cpuTotalhand}`, {
        fontFamily: "Arial Black",
        fontSize: 30,
      })
      .setName("roleName");

    this.cpuScoreTexts.push(cpuTotal);
  }

  /**
   * カードの値で表示を変更する Cpu
   * 現在利用できていない、一気に合計を表示している
   */
  setCpuDisplayTotal(): void {
    const cpuScoreText = this.cpuScoreTexts[0];
    cpuScoreText.setText(this.playerTotalhand.toString());
  }

  /**
   * プレイヤーアクション（stand）を描画
   */
  stand(): void {
    const stand = this.add
      .text(500, 700, "stand")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    stand.on(
      "pointerdown",
      function standJudge(this: BlackJackTableScene) {
        // ① CPUの手札を全てオープン、Totalを表示
        this.players[1].getHand?.forEach((card) => {
          card.flipToFront(); // 表に表示する速度を変更したい
        });

        // ② 17以上になるまでHitを行う
        while (this.cpuTotalhand < 17) {
          this.players[1].setHand = (this.deck as Deck).draw(1) as Card[];
          this.players[1].getHand?.forEach((card) => {
            card.moveTo(this.cpuPositionX + this.addCpuPositionX, this.cpuPositionY, 500);
            setTimeout(() => card.flipToFront(), 800);
            card.setInteractive();
            // ここから追加 ※ あとで共通化する
            this.addCpuPositionX += 85;
            this.cpuTotalhand += card.getRankNumber("blackjack");
          });
        }
        // ③ CPUとPlayerで勝敗を比較する
        // ④ Player視点で勝ち負けの表示を行う
        this.cpuDisplayTotal(); // 最後のトータルだけ表示 ※ 課題 : CPUのトータルをDrawごとにカウントしたい

        if (this.playerTotalhand > this.cpuTotalhand || this.cpuTotalhand > 21) {
          // 勝利の表示
          this.add
            .text(this.playerPositionX, this.playerPositionY - 180, `WIN`, {
              fontFamily: "Arial Black",
              fontSize: 50,
            })
            .setName("roleName");
        } else if (this.playerTotalhand === this.cpuTotalhand) {
          // 引き分けの表示
          this.add
            .text(this.playerPositionX, this.playerPositionY - 180, `DRAW`, {
              fontFamily: "Arial Black",
              fontSize: 50,
            })
            .setName("roleName");
        } else {
          // 負けの表示
          this.add
            .text(this.playerPositionX, this.playerPositionY - 180, `LOSS`, {
              fontFamily: "Arial Black",
              fontSize: 50,
            })
            .setName("roleName");
        }
      },
      this
    );
  }

  /**
   * プレイヤーアクション（hit）を描画
   */
  hit(): void {
    const hit = this.add
      .text(600, 700, "hit")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    // イベント 一枚引く
    hit.on(
      "pointerdown",
      function drawCard(this: BlackJackTableScene, pointer: Phaser.Input.Pointer) {
        this.players.forEach((player) => {
          // playerだけに絞りたい
          if (player.getPlayerType === "player") {
            player.setHand = (this.deck as Deck).draw(1) as Card[];
            // カードを配る配置を変えたい
            player.getHand?.forEach((card) => {
              card.moveTo(
                this.playerPositionX + this.addPlayerPositionX,
                this.playerPositionY,
                500
              );
              setTimeout(() => card.flipToFront(), 800);
              card.setInteractive();
              // ここから追加 ※ 後ほど共通化する
              this.addPlayerPositionX += 85;
              this.playerTotalhand += card.getRankNumber("blackjack");

              // 一枚引いてカードの表示を変える
              this.setPlayerDisplayTotal();
            });
          }
        });

        // 21を超えたらBust
        if (this.playerTotalhand > 21) {
          // BUSTを表示 ※ 21を超えたら強制的に負け
          this.add
            .text(this.playerPositionX, this.playerPositionY - 180, `BUST`, {
              fontFamily: "Arial Black",
              fontSize: 50,
            })
            .setName("roleName");
          // CPUの手札も表に表示する
          this.players[1].getHand?.forEach((card) => {
            card.flipToFront(); // 表に表示する速度を変更したい
          });
          // 新規追加
          this.cpuDisplayTotal();
          // 課題 : ベットをする画面に遷移させる
        }
      },
      this
    );
  }

  /**
   * プレイヤーアクション（double）を描画
   */
  double(): void {
    const double = this.add
      .text(700, 700, "double")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    // 課題 : ベット機能の際に追加する ※ stand機能のベット ✖︎ ３のイメージ
  }

  /**
   * プレイヤーアクション（surrender）を描画
   */
  surrender(): void {
    const surrender = this.add
      .text(800, 700, "surrender")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    surrender.on(
      "pointerdown",
      function displaySurrender(this: BlackJackTableScene) {
        // 「Surrender」を表示
        this.add
          .text(this.playerPositionX, this.playerPositionY - 180, `Surrender`, {
            fontFamily: "Arial Black",
            fontSize: 50,
          })
          .setName("roleName");

        // 課題 : ベット機能追加後 ※ベット金額 / 2が引かれる
      },
      this
    );
  }
}
