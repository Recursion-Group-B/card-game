import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import Button from "../../../models/common/button";
import BlackJackPlayer from "../../../models/games/blackjack/blackjackPlayer";
import GameState from "../../../constants/gameState";
import PlayerType from "../../../constants/playerType";
import HelpContainer from "../../common/helpContainer";
import GameRule from "../../../constants/gameRule";
import GameType from "../../../constants/gameType";
import GAME from "../../../models/common/game";
import GameResult from "../../../constants/gameResult";

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

  private playerTotalHand = 0;

  private cpuTotalHand = 0;

  private playerScoreText: Phaser.GameObjects.Text;

  private cpuScoreText: Phaser.GameObjects.Text;

  // ボタン
  private standBtn: Button | undefined;

  private hitBtn: Button | undefined;

  private doubleBtn: Button | undefined;

  private surrenderBtn: Button | undefined;

  private actionButtons: Button[] = [];

  private result: GameResult | undefined;

  private aceCards: Card[] = [];

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
    this.createInfo();
  }

  update(): void {
    this.drawActionButtonControl();
    this.drawInfo();
    this.setCreditText(this.getPlayer.getChips);

    if (this.gameState === GameState.PLAYING && !this.gameStarted) {
      this.disableBetItem();
      // 手札の配布までの処理
      this.makeDeck();
      this.dealCards();
      this.dealHand();
      this.gameStarted = true;
    }

    if (this.gameState === GameState.SELECT_ACE_VALUE) this.drawAceValueButton();

    if (this.gameState === GameState.PLAYING) this.drawScore();

    if (this.gameState === GameState.COMPARE) {
      this.compareHands();
      this.gameState = GameState.END_GAME;
    }

    // ゲームが終わった際の条件
    if (this.gameState === GameState.END_GAME && this.gameStarted) {
      // ハイスコア更新
      this.saveHighScore(this.getPlayer.getChips, GameType.BLACKJACK);
      this.gameStarted = false;

      this.time.delayedCall(1500, () => {
        // リザルト
        this.displayResult(this.result, 0);
        this.payOut();

        // リスタート
        this.gameZone.setInteractive();
        this.gameZone.on("pointerdown", () => {
          this.dataInit();
          this.gameZone.removeInteractive();
          this.gameZone.removeAllListeners();
        });
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
    this.playerTotalHand = 0;
    this.cpuTotalHand = 0;
    this.bet = 0;
    this.setBetText();

    // フラグを更新
    this.gameStarted = false;
    this.gameState = GameState.BETTING;
    this.tableInit();

    // オブジェクトの更新
    const destroyList = this.children.list.filter(
      (child) => child instanceof Card || child.name === "resultText"
    );
    destroyList.forEach((element) => {
      element.destroy();
    });
    this.playerScoreText.setVisible(false);
    this.cpuScoreText.setVisible(false);
    this.setDisplayTotal();
    this.resetButtonsSize();

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
          setTimeout(() => {
            if (card.getRank === "Ace") {
              this.createAceValueButton(card);
            } else {
              this.playerTotalHand += card.getRankNumber(GameType.BLACKJACK);
            }
            this.setDisplayTotal(PlayerType.PLAYER);
            card.flipToFront();
          }, 800);
          card.setInteractive();
          // ここから追加した
          this.addPlayerPositionX += 85;
        } else if (player.getPlayerType === "cpu") {
          // ブラックジャックはCPUの一枚目を表面にする
          if (index === 0) {
            card.moveTo(this.cpuPositionX + this.addCpuPositionX, this.cpuPositionY, 500);
            this.cpuTotalHand += card.getRankNumber(GameType.BLACKJACK);
            setTimeout(() => {
              this.setDisplayTotal(PlayerType.CPU);
              card.flipToFront();
            }, 800);
            card.setInteractive();
            this.addCpuPositionX += 85;
          } else {
            card.moveTo(this.cpuPositionX + this.addCpuPositionX, this.cpuPositionY, 500);
            this.addCpuPositionX += 85;
            setTimeout(() => {
              this.cpuTotalHand += card.getRankNumber(GameType.BLACKJACK);
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
      .text(this.playerPositionX + 120, this.playerPositionY - 95, `${this.playerTotalHand}`, {
        fontFamily: "Arial Black",
        fontSize: 30,
      })
      .setName("roleName")
      .setVisible(false);

    // CPU
    this.cpuScoreText = this.add
      .text(this.cpuPositionX + 120, this.cpuPositionY + 65, `${this.cpuTotalHand}`, {
        fontFamily: "Arial Black",
        fontSize: 30,
      })
      .setName("roleName")
      .setVisible(false);
  }

  /**
   * スコアを更新する
   * 引数がundefinedの場合、プレイヤー、CPU両者を更新
   * @param PlayerType
   */
  private setDisplayTotal(): void;
  private setDisplayTotal(playerType: PlayerType): void;
  private setDisplayTotal(playerType?: PlayerType): void {
    switch (playerType) {
      case PlayerType.CPU:
        this.cpuScoreText.setText(this.cpuTotalHand.toString());
        break;
      case PlayerType.PLAYER:
        this.playerScoreText.setText(this.playerTotalHand.toString());
        break;
      default:
        this.cpuScoreText.setText(this.cpuTotalHand.toString());
        this.playerScoreText.setText(this.playerTotalHand.toString());
        break;
    }
  }

  /**
   * score描画
   */
  private drawScore(): void {
    this.playerScoreText.setVisible(true);
    this.cpuScoreText.setVisible(true);
  }

  /**
   * CPUとの手札を比較する
   */
  private compareHands = (): void => {
    if (this.result === GameResult.SURRENDER) return;
    if (this.playerTotalHand > 21) {
      this.result = GameResult.BUST;
    } else if (this.playerTotalHand > this.cpuTotalHand || this.cpuTotalHand > 21) {
      this.result = GameResult.WIN;
    } else if (this.playerTotalHand === this.cpuTotalHand) {
      this.result = GameResult.DRAW;
    } else {
      this.result = GameResult.LOSE;
    }
  };

  /**
   * 配当を反映
   */
  private payOut(): void {
    switch (this.result) {
      case GameResult.WIN:
        this.getPlayer.setChips = this.getPlayer.getChips + this.bet;
        break;
      case GameResult.LOSE:
      case GameResult.BUST:
      case GameResult.DRAW:
        this.getPlayer.setChips = this.getPlayer.getChips - this.bet;
        break;
      case GameResult.SURRENDER:
        this.getPlayer.setChips = this.getPlayer.getChips - this.bet / 2;
        break;
      default:
        break;
    }
  }

  private cpuAction(): void {
    // ① CPUの手札を全てオープン
    this.players[1].getHand?.forEach((card) => {
      card.flipToFront(); // 表に表示する速度を変更したい
    });

    // ② 17以上になるまでHitを行う
    while (this.cpuTotalHand < 17) {
      // カードを一枚ドロー
      this.drawCard(PlayerType.CPU);
    }
    this.setDisplayTotal(PlayerType.CPU);
  }

  /**
   *
   * @param playerType
   */
  private drawCard(playerType: PlayerType): void {
    let player;
    let positionX;
    let positionY;
    let addPositionX;

    switch (playerType) {
      case PlayerType.CPU:
        player = this.getCpu;
        positionX = this.cpuPositionX;
        positionY = this.cpuPositionY;
        addPositionX = this.addCpuPositionX;
        break;
      case PlayerType.PLAYER:
        positionX = this.playerPositionX;
        positionY = this.playerPositionY;
        player = this.getPlayer;
        addPositionX = this.addPlayerPositionX;
        break;
      default:
        player = PlayerType.DEALER;
        break;
    }

    // 引いたカードを所定の位置に移動
    const drawCard = this.deck.draw();
    this.children.bringToTop(drawCard);
    player.addCardToHand(drawCard);
    drawCard.moveTo(positionX + addPositionX, positionY, 500);
    setTimeout(() => drawCard.flipToFront(), 800);

    // 次のカードに渡す情報 / 現在のトータルスコアを更新
    if (playerType === PlayerType.CPU) {
      this.addCpuPositionX += 85;
      this.cpuTotalHand += drawCard.getRankNumber(GameType.BLACKJACK);
    } else if (playerType === PlayerType.PLAYER && drawCard.getRank === "Ace") {
      this.addPlayerPositionX += 85;
      setTimeout(() => {
        this.createAceValueButton(drawCard);
      }, 600);
    } else if (this.gameState === GameState.HIT || this.gameState === GameState.PLAYING) {
      this.addPlayerPositionX += 85;
      this.playerTotalHand += drawCard.getRankNumber(GameType.BLACKJACK);
      this.gameState = GameState.HIT;
    } else if (this.gameState === GameState.DOUBLE) {
      this.addPlayerPositionX += 85;
      this.playerTotalHand += drawCard.getRankNumber(GameType.BLACKJACK);
      this.gameState = GameState.COMPARE;
    }

    // スコア更新
    this.setDisplayTotal(playerType);
  }

  /**
   * プレイヤーアクション（stand）を描画
   */
  private stand(): void {
    this.standBtn = new Button(
      this,
      300,
      700,
      "buttonRed",
      "stand",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    this.standBtn.disable();
    this.actionButtons.push(this.standBtn);

    this.standBtn.setClickHandler(() => {
      this.cpuAction();
      this.gameState = GameState.COMPARE;
    });
  }

  /**
   * プレイヤーアクション（hit）を描画
   */
  private hit(): void {
    this.hitBtn = new Button(
      this,
      525,
      700,
      "buttonRed",
      "hit",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    this.hitBtn.disable();
    this.actionButtons.push(this.hitBtn);

    // イベント 一枚引く
    this.hitBtn.setClickHandler(() => {
      // 一枚引いてカードの表示を変える
      this.drawCard(PlayerType.PLAYER);
      this.setDisplayTotal(PlayerType.PLAYER);
      this.gameState = GameState.HIT;

      if (this.playerTotalHand > 21) this.gameState = GameState.COMPARE;
    });
  }

  /**
   * プレイヤーアクション（double）を描画
   */
  private double(): void {
    this.doubleBtn = new Button(
      this,
      750,
      700,
      "buttonRed",
      "double",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    this.doubleBtn.disable();
    this.actionButtons.push(this.doubleBtn);

    this.doubleBtn.setClickHandler(() => {
      this.bet *= 2;
      this.setBetText();
      this.gameState = GameState.DOUBLE;

      // １枚引く
      this.cpuAction();
      this.drawCard(PlayerType.PLAYER);
    });
  }

  /**
   * プレイヤーアクション（surrender）を描画
   */
  private surrender(): void {
    this.surrenderBtn = new Button(
      this,
      975,
      700,
      "buttonRed",
      "surrender",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    this.surrenderBtn.disable();
    this.actionButtons.push(this.surrenderBtn);

    this.surrenderBtn.setClickHandler(() => {
      this.result = GameResult.SURRENDER;
      this.gameState = GameState.COMPARE;
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
   * 各ボタンの大きさをリセットする
   */
  private resetButtonsSize(): void {
    this.actionButtons.forEach((btn) => btn.setScale(0.3));
  }

  /**
   * アクションボタンの描画コントロール
   */
  private drawActionButtonControl = (): void => {
    if (this.gameState === GameState.PLAYING) {
      this.hitBtn.enable();
      this.standBtn.enable();
      this.surrenderBtn.enable();
      this.doubleBtn.enable();
    } else if (
      this.gameState === GameState.END_GAME ||
      this.gameState === GameState.SELECT_ACE_VALUE
    ) {
      this.hitBtn.disable();
      this.standBtn.disable();
      this.surrenderBtn.disable();
      this.doubleBtn.disable();
    } else if (this.gameState === GameState.HIT) {
      this.standBtn.enable();
      this.hitBtn.enable();
      this.doubleBtn.disable();
      this.surrenderBtn.disable();
    }

    if (this.getPlayer.getChips < this.bet * 2) this.doubleBtn.disable();
  };

  /**
   * Aceボタンの表示管理
   */
  private drawAceValueButton(): void {
    if (this.children.list.some((child: Button) => child.visible && child.type === "ace")) return;

    const card = this.aceCards.pop();
    this.children.list
      .filter((child) => child.name === card.getCardKey)
      .forEach((ele: Button) => ele.enable());
    this.children.bringToTop(card);
    card.moveTo(card.x, card.y - 10, 100);
    card.preFX.addGlow(0xff6347);
  }

  /**
   * Aの大きさを選択するボタンを生成
   */
  private createAceValueButton(aceCard: Card): void {
    // Aceを強調表示
    const preGameState = this.gameState;

    // Aceを保存
    this.aceCards.unshift(aceCard);

    const clickAction = (type: GameType) => () => {
      this.playerTotalHand += aceCard.getRankNumber(type);
      aceCard.moveTo(aceCard.getX, aceCard.getY + 10, 100);
      aceCard.preFX.clear();
      this.setDisplayTotal(PlayerType.PLAYER);
      this.removeAceValueButton(aceCard);
      if (this.playerTotalHand > 21) this.gameState = GameState.COMPARE;
      else if (!this.aceCards.length)
        this.gameState = preGameState === GameState.DOUBLE ? GameState.COMPARE : GameState.HIT;
    };

    // Aceの大きさを選択するボタンを生成
    const oneBtn = new Button(
      this,
      aceCard.getX - 100,
      aceCard.getY + 100,
      "buttonRed",
      "1",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    oneBtn.type = "ace";
    oneBtn.disable();
    oneBtn.setName(aceCard.getCardKey);
    oneBtn.setClickHandler(clickAction(GameType.BLACKJACK_ACE));

    const elevenBtn = new Button(
      this,
      aceCard.getX + 100,
      aceCard.getY + 100,
      "buttonRed",
      "11",
      GAME.SOUNDS_KEY.BUTTON_CLICK_KEY,
      0.3
    );
    elevenBtn.type = "ace";
    elevenBtn.disable();
    elevenBtn.setName(aceCard.getCardKey);
    elevenBtn.setClickHandler(clickAction(GameType.BLACKJACK));

    this.gameState = GameState.SELECT_ACE_VALUE;
  }

  /**
   * AceValueButtonを削除する
   */
  private removeAceValueButton(card: Card): void {
    this.children.list
      .filter((child) => child.name === card.getCardKey)
      .forEach((ele: Button) => ele.removeAll());
  }
}
