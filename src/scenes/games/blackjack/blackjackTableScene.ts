import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import Button from "../../../models/common/button";
import BlackJackPlayer from "../../../models/games/blackjack/blackjackPlayer";
import GameState from "../../../constants/gameState";
import GameResult from "../../../constants/gameResult";
import PlayerType from "../../../constants/playerType";
import Zone = Phaser.GameObjects.Zone;
import GameObject = Phaser.GameObjects.GameObject;
import TimeEvent = Phaser.Time.TimerEvent;
import HelpContainer from "../../common/helpContainer";
import GameRule from "../../../constants/gameRule";
import GameType from "../../../constants/gameType";

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

  private playerScoreText: Phaser.GameObjects.Text;

  private cpuScoreText: Phaser.GameObjects.Text;

  // ボタン
  private standBtn: Button | undefined;

  private hitBtn: Button | undefined;

  private doubleBtn: Button | undefined;

  private surrenderBtn: Button | undefined;

  // ここまで追加
  private cardSize = {
    x: 85,
    y: 150,
  };

  private gameStarted = false;

  constructor() {
    super(GameType.BLACKJACK);
    this.gameSceneKey = GameType.BLACKJACK;

    this.players = [
      new BlackJackPlayer("Player", PlayerType.PLAYER, 1000, 0),
      new BlackJackPlayer("Cpu", PlayerType.CPU, 0, 0),
    ];
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
    this.helpContent = new HelpContainer(this, GameRule.BLACKJACK);
    this.createHelpButton(this.helpContent);
    this.createBackHomeButton();
    this.createTutorialButton();
    this.createCommonSound();
    this.createToggleSoundButton();
    this.createActionButton();
    this.createScore();
  }

  update(): void {
    this.drawActionButtonControl();
    this.setCreditText(this.getPlayer.getChips);

    if (this.gameState === GameState.PLAYING && !this.gameStarted) {
      this.disableBetItem();
      // 手札の配布までの処理
      this.makeDeck();
      this.dealCards();
      this.dealHand();
      this.gameStarted = true;
    }

    if (this.gameState === GameState.PLAYING) {
      this.drawScore();
    }

    // ゲームが終わった際の条件
    if (this.gameState === GameState.END_GAME) {
      // ハイスコア更新
      this.saveHighScore(this.getPlayer.getChips, GameType.BLACKJACK);

      // リスタート
      this.gameZone.setInteractive();
      this.gameZone.on("pointerdown", () => {
        this.dataInit();
        this.gameZone.removeInteractive();
        this.gameZone.removeAllListeners();
      });
    }
  }

  /**
   * gameData初期化
   */
  private dataInit(): void {
    // 現状のデータを初期化させる
    this.addPlayerPositionX = 0;
    this.addCpuPositionX = 0;
    this.playerTotalhand = 0;
    this.cpuTotalhand = 0;
    this.bet = 0;
    this.setBetText();

    // フラグを更新
    this.gameStarted = false;
    this.gameState = GameState.BETTING;
    this.tableInit();

    // オブジェクト削除
    const destroyList = this.children.list.filter(
      (child) =>
        child instanceof Card ||
        child.name === "resultText" ||
        child.name === "pots" ||
        child.name === "action" ||
        child.name === "dealer"
    );
    destroyList.forEach((element) => {
      element.destroy();
    });

    // オブジェクトの非表示
    this.playerScoreText.setVisible(false);
    this.cpuScoreText.setVisible(false);
    this.setPlayerDisplayTotal();
    this.setCpuDisplayTotal();

    // betting
    this.chipButtons.forEach((chip) => {
      chip.disVisibleText();
    });
    this.clearButton?.disVisibleText();
    this.dealButton?.disVisibleText();
    this.enableBetItem();
    this.fadeInBetItem();
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
      player.getHand?.forEach((card, index) => {
        if (player.getPlayerType === "player") {
          card.moveTo(this.playerPositionX + this.addPlayerPositionX, this.playerPositionY, 500);
          this.playerTotalhand += card.getRankNumber(GameType.BLACKJACK);
          setTimeout(() => {
            this.setPlayerDisplayTotal();
            card.flipToFront();
          }, 800);
          card.setInteractive();
          // ここから追加した
          this.addPlayerPositionX += 85;
        } else if (player.getPlayerType === "cpu") {
          // ブラックジャックはCPUの一枚目を表面にする
          if (index === 0) {
            card.moveTo(this.cpuPositionX + this.addCpuPositionX, this.cpuPositionY, 500);
            this.cpuTotalhand += card.getRankNumber(GameType.BLACKJACK);
            setTimeout(() => {
              this.setCpuDisplayTotal();
              card.flipToFront();
            }, 800);
            card.setInteractive();
            this.addCpuPositionX += 85;
          } else {
            card.moveTo(this.cpuPositionX + this.addCpuPositionX, this.cpuPositionY, 500);
            this.addCpuPositionX += 85;
            setTimeout(() => {
              this.cpuTotalhand += card.getRankNumber(GameType.BLACKJACK);
            }, 800);
          }
        }
      });
    });
  }

  /**
   * プレーヤーのTotalを表示する
   */
  createScore(): void {
    // player
    this.playerScoreText = this.add
      .text(this.playerPositionX + 120, this.playerPositionY - 95, `${this.playerTotalhand}`, {
        fontFamily: "Arial Black",
        fontSize: 30,
      })
      .setName("roleName")
      .setVisible(false);

    // CPU
    this.cpuScoreText = this.add
      .text(this.cpuPositionX + 120, this.cpuPositionY + 65, `${this.cpuTotalhand}`, {
        fontFamily: "Arial Black",
        fontSize: 30,
      })
      .setName("roleName")
      .setVisible(false);
  }

  /**
   * カードの値で表示を変更する Player
   */
  setPlayerDisplayTotal(): void {
    this.playerScoreText.setText(this.playerTotalhand.toString());
  }

  /**
   * カードの値で表示を変更する Cpu
   * 現在利用できていない、一気に合計を表示している
   */
  setCpuDisplayTotal(): void {
    this.cpuScoreText.setText(this.cpuTotalhand.toString());
  }

  /**
   * score描画
   */
  private drawScore(): void {
    this.playerScoreText.setVisible(true);
    this.cpuScoreText.setVisible(true);
  }

  /**
   * プレイヤーアクション（stand）を描画
   */
  stand(): void {
    this.standBtn = new Button(this, 300, 700, "buttonRed", "stand");
    this.standBtn.setScale(0.3);
    this.standBtn.disable();

    this.standBtn.setClickHandler(() => {
      // ① CPUの手札を全てオープン、Totalを表示
      this.players[1].getHand?.forEach((card) => {
        card.flipToFront(); // 表に表示する速度を変更したい
      });

      // ② 17以上になるまでHitを行う
      while (this.cpuTotalhand < 17) {
        // カードを一枚ドロー
        console.log(this.cpuTotalhand);
        const drawCard = this.deck.draw();
        this.players[1].addCardToHand(drawCard);
        drawCard.moveTo(this.cpuPositionX + this.addCpuPositionX, this.cpuPositionY, 500);
        setTimeout(() => drawCard.flipToFront(), 800);
        drawCard.setInteractive();
        // ここから追加 ※ あとで共通化する
        this.addCpuPositionX += 85;
        this.cpuTotalhand += drawCard.getRankNumber(GameType.BLACKJACK);
      }
      this.setCpuDisplayTotal();
      // ③ CPUとPlayerで勝敗を比較する
      // ④ Player視点で勝ち負けの表示を行う
      if (this.playerTotalhand > this.cpuTotalhand || this.cpuTotalhand > 21) {
        // 勝利の表示
        this.displayResult("WIN", 0);

        // CREDITの更新
        this.players[0].setChips = this.players[0].getChips + this.bet;
      } else if (this.playerTotalhand === this.cpuTotalhand) {
        // 引き分けの表示
        this.displayResult("DRAW", 0);
      } else {
        // 負けの表示
        this.displayResult("LOSE", 0);
        // CREDITの更新
        this.players[0].setChips = this.players[0].getChips - this.bet;
      }

      // ゲームが終わったらGameStateを変更する
      this.gameState = GameState.END_GAME;
    });
  }

  /**
   * プレイヤーアクション（hit）を描画
   */
  hit(): void {
    this.hitBtn = new Button(this, 525, 700, "buttonRed", "hit");
    this.hitBtn.setScale(0.3);
    this.hitBtn.disable();

    // イベント 一枚引く
    this.hitBtn.setClickHandler(() => {
      this.players.forEach((player) => {
        if (player.getPlayerType === "player") {
          player.setHand = (this.deck as Deck).draw(1) as Card[];
          // カードを配る配置を変えたい
          player.getHand?.forEach((card) => {
            card.moveTo(this.playerPositionX + this.addPlayerPositionX, this.playerPositionY, 500);
            setTimeout(() => card.flipToFront(), 800);
            card.setInteractive();
            // 今後共通化する
            this.addPlayerPositionX += 85;
            this.playerTotalhand += card.getRankNumber(GameType.BLACKJACK);

            // 一枚引いてカードの表示を変える
            this.setPlayerDisplayTotal();
          });
        }
        this.hitBtn.disable();
      });

      // double, surrender
      this.gameState = GameState.HIT;

      // 21を超えたらBust
      if (this.playerTotalhand > 21) {
        // BUSTを表示 ※ 21を超えたら強制的に負け
        this.displayResult("BUST", 0);
        // CPUの手札も表に表示する
        this.players[1].getHand?.forEach((card) => {
          card.flipToFront();
        });

        this.players[0].setChips = this.players[0].getChips - this.bet;
        this.gameState = GameState.END_GAME;
      }
    });
  }

  /**
   * プレイヤーアクション（double）を描画
   * 課題 : 処理を共通化できていない
   */
  double(): void {
    this.doubleBtn = new Button(this, 750, 700, "buttonRed", "double");
    this.doubleBtn.setScale(0.3);
    this.doubleBtn.disable();

    this.doubleBtn.setClickHandler(() => {
      // 課題 : stand・hitのコード同じだから共通化する
      // ベット額の更新
      this.bet *= 2;
      this.setBetText();

      // １枚引く
      this.players.forEach((player) => {
        if (player.getPlayerType === "player") {
          player.setHand = (this.deck as Deck).draw(1) as Card[];
          // カードを配る配置を変えたい
          player.getHand?.forEach((card) => {
            card.moveTo(this.playerPositionX + this.addPlayerPositionX, this.playerPositionY, 500);
            setTimeout(() => card.flipToFront(), 800);
            card.setInteractive();
            // ここから追加 ※ 後ほど共通化する
            this.addPlayerPositionX += 85;
            this.playerTotalhand += card.getRankNumber(GameType.BLACKJACK);

            // 一枚引いてカードの表示を変える
            this.setPlayerDisplayTotal();
          });
        }
      });

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
          this.cpuTotalhand += card.getRankNumber(GameType.BLACKJACK);
        });
      }
      this.setCpuDisplayTotal();
      // ③ CPUとPlayerで勝敗を比較する
      // ④ Player視点で勝ち負けの表示を行う
      if (this.playerTotalhand > this.cpuTotalhand || this.cpuTotalhand > 21) {
        // 勝利の表示
        this.displayResult("WIN", 0);

        // CREDITの更新
        this.players[0].setChips = this.players[0].getChips + this.bet;
      } else if (this.playerTotalhand === this.cpuTotalhand) {
        // 引き分けの表示
        this.displayResult("DRAW", 0);
      } else {
        // 負けの表示
        this.displayResult("LOSE", 0);
        // CREDITの更新
        this.players[0].setChips = this.players[0].getChips - this.bet;
      }

      // 追加した、ゲームが終わったらGameStateを変更する
      this.gameState = GameState.END_GAME;
    });
  }

  /**
   * プレイヤーアクション（surrender）を描画
   */
  surrender(): void {
    this.surrenderBtn = new Button(this, 975, 700, "buttonRed", "surrender");
    this.surrenderBtn.setScale(0.3);
    this.surrenderBtn.disable();

    this.surrenderBtn.setClickHandler(() => {
      // 負けの表示
      this.displayResult("LOSE", 0);

      // CREDITの更新
      this.players[0].setChips = this.players[0].getChips - this.bet / 2;

      // 追加した、ゲームが終わったらGameStateを変更する
      this.gameState = GameState.END_GAME;
    });
  }

  /**
   * アクションボタンを描画
   */
  private createActionButton(): void {
    this.hit();
    this.surrender();
    this.double();
    this.stand();
  }

  /**
   * アクションボタンの描画コントロール
   */
  private drawActionButtonControl(): void {
    if (this.gameState === GameState.PLAYING) {
      this.hitBtn.enable();
      this.standBtn.enable();
      this.surrenderBtn.enable();
      this.doubleBtn.enable();
    } else if (this.gameState === GameState.HIT) {
      this.hitBtn.enable();
      this.doubleBtn.disable();
      this.surrenderBtn.disable();
    } else if (this.gameState === GameState.END_GAME) {
      this.hitBtn.disable();
      this.standBtn.disable();
      this.surrenderBtn.disable();
      this.doubleBtn.disable();
    }
  }
}
