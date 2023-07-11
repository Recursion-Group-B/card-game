import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import GAME from "../../../models/common/game";
import SpeedPlayer from "../../../models/games/speed/speedPlayer";
import GameState from "../../../constants/gameState";
import GameResult from "../../../constants/gameResult";
import PlayerType from "../../../constants/playerType";
import Zone = Phaser.GameObjects.Zone;
import GameObject = Phaser.GameObjects.GameObject;
import TimeEvent = Phaser.Time.TimerEvent;

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default class SpeedTableScene extends TableScene {
  private playerDecks: Array<Deck> = [];

  private dropZones: Array<Zone> = [];

  private dropZoneCards: Array<Card> = []; // [右側の台札Card, 左側の台札Card]

  private cpuPlayTimeEvent: TimeEvent | undefined;

  private stallCheckTimeEvent: TimeEvent | undefined;

  private countDownEvent: TimeEvent | undefined;

  private result: string | undefined; // WIN or LOSE or DRAW

  private gameStarted = false;

  private displayedResult = false;

  private cardsDealt = false;

  private countdownSound: Phaser.Sound.BaseSound | undefined;

  constructor() {
    super({});

    this.players = [
      new SpeedPlayer("Player", PlayerType.PLAYER, 1000, 0),
      new SpeedPlayer("Cpu", PlayerType.CPU, 0, 0),
    ];
  }

  preload(): void {
    this.load.atlas("cards", "/public/assets/images/cards.png", "/public/assets/images/cards.json");
    this.load.image("table", "/public/assets/images/tableGreen.png");
    this.load.image("chipWhite", "/public/assets/images/chipWhite.png");
    this.load.image("chipYellow", "/public/assets/images/chipYellow.png");
    this.load.image("chipBlue", "/public/assets/images/chipBlue.png");
    this.load.image("chipOrange", "/public/assets/images/chipOrange.png");
    this.load.image("chipRed", "/public/assets/images/chipRed.png");
    this.load.image("buttonRed", "/public/assets/images/buttonRed.png");

    this.load.audio("buttonClick", "/public/assets/sounds/buttonClick.mp3");
    this.load.audio("chipClick", "/public/assets/sounds/chipClick.mp3");
    this.load.audio("countdown", "/public/assets/sounds/countdown.mp3");
    this.load.audio("dealCard", "/public/assets/sounds/dealCard.mp3");
    this.load.audio("flipOver", "/public/assets/sounds/flipOver.mp3");
    this.load.audio("playerDraw", "/public/assets/sounds/playerDraw.mp3");
    this.load.audio("playerWin", "/public/assets/sounds/playerWin.mp3");
    this.load.audio("playerLose", "/public/assets/sounds/playerLose.mp3");
  }

  create(): void {
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table");
    this.gameState = GameState.BETTING;

    this.createGameZone();
    this.createDropZones();
    this.createCardDropEvent();
    this.createChips();
    this.createCommonSound();
    this.createSpeedSound();
    this.createDealButton();
    this.createClearButton();
    this.createCreditField();
  }

  update(): void {
    if (this.gameState === GameState.PLAYING && !this.gameStarted) {
      this.disableBetItem();
      this.startGame();
      this.gameStarted = true;
    }

    this.checkResult();

    if (this.gameState === GameState.END_GAME && !this.displayedResult) {
      // ゲームresult画面
      if (this.result) {
        this.payOut();
        this.displayResult(this.result, 0);

        this.cpuPlayTimeEvent?.remove();
        this.stallCheckTimeEvent?.remove();
        this.countDownEvent?.remove();
        this.time.removeAllEvents();
        this.displayedResult = true;

        this.gameZone?.setInteractive();
        this.gameZone?.on("pointerdown", () => {
          this.startBet();
        });

        // TODO result画面のBGM設定
        // TODO スコアの更新
      }
    }
  }

  private startGame(): void {
    this.createPlayerDecks();
    this.dealCards();

    // ゲームのカウントダウン
    this.time.delayedCall(3000, () => {
      this.startCountDownEvent();
    });

    // CPUのゲームループ
    // TODD 難易度によってdelayの感覚を短くする
    this.time.delayedCall(7000, () => {
      this.cpuPlayTimeEvent = this.time.addEvent({
        delay: 4000,
        callback: this.playCpu,
        callbackScope: this,
        loop: true,
      });
    });

    // ゲーム停滞時のカード配布
    this.time.delayedCall(7000, () => {
      this.stallCheckTimeEvent = this.time.addEvent({
        delay: 5000,
        callback: this.checkGameStallAndDrawCard,
        callbackScope: this,
        loop: true,
      });
    });
  }

  /**
   * ベット開始
   */
  private startBet(): void {
    if (this.gameState !== GameState.END_GAME) return;
    this.reset();
    this.enableBetItem();
    this.fadeInBetItem();
  }

  /**
   * ゲームの初期化処理
   */
  private reset(): void {
    this.gameState = GameState.BETTING;
    this.gameStarted = false;
    this.displayedResult = false;
    this.cardsDealt = false;
    this.resultText = undefined;
    this.setInitialTime = 2;
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

  /**
   * 配当の分配処理
   */
  private payOut(): void {
    let winAmount = 0;
    if (this.result === GameResult.WIN) {
      winAmount = this.bet;
    } else if (this.result === GameResult.LOSE) {
      winAmount = -this.bet;
    }

    // 所持金の更新
    this.players[0].setChips = this.players[0].getChips + winAmount;
    this.setCreditText(this.players[0].getChips);

    // ベット額の更新
    this.bet = 0;
    this.setBetText();
  }

  /**
   * カードの初期配置処理
   */
  dealCards(): void {
    let dropZonesIndex = 0;
    this.players.forEach((player, index) => {
      this.dealHandCards(player as SpeedPlayer, index);
      this.dealLeadCards(player as SpeedPlayer, index, this.dropZones[dropZonesIndex]);
      dropZonesIndex += 1;
    });
  }

  /**
   * 台札の配置
   */
  private dealLeadCards(player: SpeedPlayer, playerIndex: number, dropZone: Zone): void {
    let card: Card | undefined;
    if (!this.playerDecks[playerIndex].isEmpty()) {
      card = this.playerDecks[playerIndex].draw();
    } else {
      card = (player.getHand as Card[]).pop();
    }

    if (card) {
      const animationDuration = 600;
      card.moveTo(dropZone.x, dropZone.y, animationDuration);
      this.children.bringToTop(card);

      this.dropZoneCards[playerIndex] = card;

      // カードを裏返す
      if (card.getIsBackSide) {
        this.time.delayedCall(1500, () => {
          card?.flipToFront();
        });
      }
    }
  }

  /**
   * 手札にカードを配布
   */
  private dealHandCards(player: SpeedPlayer, playerIndex: number): void {
    // 初期位置設定
    const playerStartPosX = 480;
    const dealerStartPosX = 840;
    const playerStartPosY = 620;
    const dealerStartPosY = 295;
    const startPosX = playerIndex === 0 ? playerStartPosX : dealerStartPosX;
    const startPosY = playerIndex === 0 ? playerStartPosY : dealerStartPosY;

    // 配置方向
    const direction = playerIndex === 0 ? 1 : -1;

    // アニメーションの設定
    const cardInterval = 110;
    const animationDelay = 200;

    let i = 0;
    this.time.addEvent({
      delay: animationDelay,
      callback: () => {
        const card = this.playerDecks[playerIndex].draw();
        if (card) {
          player.addCardToHand(card);
          card.moveTo(startPosX + i * cardInterval * direction, startPosY, i * animationDelay);
        }
        i += 1;
      },
      repeat: 3,
      callbackScope: this,
    });

    // カードを裏返す
    this.time.delayedCall(1500, () => {
      this.players.forEach((currentPlayer) => {
        currentPlayer.getHand?.forEach((card) => {
          card.flipToFront();
        });
      });
    });

    this.time.delayedCall(4 * animationDelay + 1500, () => {
      this.cardsDealt = true;
    });
  }

  /**
   * カウントダウンイベントを開始
   */
  private startCountDownEvent(): void {
    this.createCountDownText();
    this.countdownSound?.play();
    this.countDownEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.countDownCallback(() => {
          if (this.countDownEvent) {
            this.countDownEvent.remove();
            this.changeCardDraggable(true);
          }
        });
      },
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * カードのドラッグを有効/無効にするメソッド。
   * プレイヤー以外には適用しない
   */
  private changeCardDraggable(draggable: boolean): void {
    this.players.forEach((player) => {
      if (player.getPlayerType === PlayerType.PLAYER) {
        player.getHand?.forEach((card) => {
          if (draggable) {
            card.makeDraggable();
          } else {
            card.setPosition(card.x, card.y);
            card.disableInteractive();
          }
        });
      }
    });
  }

  /**
   * プレイヤー毎のデッキを作成
   */
  private createPlayerDecks(): void {
    this.playerDecks = [
      new Deck(this, 920, 620, ["hearts", "diamonds"]),
      new Deck(this, 400, 295, ["spades", "clubs"]),
    ];

    this.playerDecks.forEach((deck) => {
      deck.shuffle();
    });
  }

  /**
   * カードのドロップイベント作成
   */
  private createCardDropEvent(): void {
    this.input.on("drop", (pointer: Phaser.Input.Pointer, card: Card, dropZone: Zone) => {
      if (this.canDropCard(card, dropZone)) {
        card.setPosition(dropZone.x, dropZone.y);
        card.disableInteractive();

        this.players[0].removeCardFromHand(card);
        this.replaceDroppedCard(card, 0);

        this.children.bringToTop(card);

        const dropZoneIndex = this.dropZones.indexOf(dropZone);
        if (dropZoneIndex !== -1) {
          this.dropZoneCards[dropZoneIndex] = card;
        }
      } else {
        card.returnToOrigin();
      }
    });
  }

  /**
   * カードが配置可能か判定
   */
  private canDropCard(card: Card, dropZone: Zone): boolean {
    let canDropCardFlag = false;

    this.dropZones.forEach((cardDropZone: Zone, index: number) => {
      if (dropZone === cardDropZone) {
        const isConsecutiveRank = SpeedTableScene.isConsecutiveCard(
          Number(this.dropZoneCards[index].getRankNumber("speed")),
          card.getRankNumber("speed")
        );

        if (isConsecutiveRank) {
          canDropCardFlag = true;
        }
      }
    });

    return canDropCardFlag;
  }

  /**
   * ドロップしたカードの元いた位置に新しいカードを配置
   */
  replaceDroppedCard(droppedCard: Card, playerIndex: number): void {
    if (this.playerDecks[playerIndex].getDeckSize() > 0) {
      const newCard = this.playerDecks[playerIndex].draw();
      if (newCard) {
        // カード設定
        newCard.makeDraggable();
        newCard.setIsBackSide = false;
        newCard.setTexture("cards", newCard.getTextureKey);

        this.players[playerIndex].addCardToHand(newCard);

        // 移動先の座標を取得
        const toX = droppedCard.input?.dragStartX;
        const toY = droppedCard.input?.dragStartY;
        if (toX && toY) newCard?.moveTo(toX, toY, 300);
      }
    }
  }

  /**
   * ドロップしたカードが連続したランクか判定
   */
  private static isConsecutiveCard(rank1: number, rank2: number): boolean {
    const diff = Math.abs(rank1 - rank2);
    return diff === 1 || diff === 12;
  }

  /**
   * CPUのゲーム進行
   */
  private playCpu(): void {
    if (this.canPlayCard(this.players[1])) {
      const [dropCard, toX, toY] = this.getAvailableCardAndCoordinate(this.players[1]);

      // カードを出す
      if (dropCard && toX && toY) {
        this.moveCardHandToLead(dropCard, toX, toY);
        this.checkResult();
      }
    }
  }

  /**
   * 手札に出せるカードがあるかチェック
   */
  private canPlayCard(player: SpeedPlayer): boolean {
    const hand = player.getHand as Card[];
    if (!hand) {
      return false;
    }
    return hand.some((card) =>
      this.dropZoneCards.some((dropCard) =>
        SpeedTableScene.isConsecutiveCard(
          card.getRankNumber("speed"),
          dropCard.getRankNumber("speed")
        )
      )
    );
  }

  /**
   * 配置するカードと配置する座標の取得
   */
  private getAvailableCardAndCoordinate(
    player: SpeedPlayer
  ): [Card | undefined, number | undefined, number | undefined] {
    const hand = player.getHand as Card[];
    if (hand) {
      for (let i = 0; i < hand.length; i += 1) {
        const currCard = hand[i];
        for (let dropZoneIndex = 0; dropZoneIndex < this.dropZoneCards.length; dropZoneIndex += 1) {
          if (
            SpeedTableScene.isConsecutiveCard(
              currCard.getRankNumber("speed"),
              this.dropZoneCards[dropZoneIndex].getRankNumber("speed")
            )
          ) {
            player.removeCardFromHand(currCard);
            return [currCard, this.dropZones[dropZoneIndex].x, this.dropZones[dropZoneIndex].y];
          }
        }
      }
    }

    return [undefined, undefined, undefined];
  }

  /**
   * 手札から台札にカードを移動する
   * ※基本CPUしか使わない
   */
  private moveCardHandToLead(card: Card, toX: number, toY: number): void {
    const playerDeck = this.playerDecks[1];
    const player = this.players[1];

    const beforeMoveX = card.x;
    const beforeMoveY = card.y;

    card.moveTo(toX, toY, 300);
    this.children.bringToTop(card);

    // toX座標とtoY座標に基づいてドロップゾーンを決定する
    const targetDropZone = this.dropZones.find(
      (dropZone) => dropZone.x === toX && dropZone.y === toY
    );
    if (targetDropZone) {
      const dropZoneIndex = this.dropZones.indexOf(targetDropZone);
      if (dropZoneIndex !== -1) {
        this.dropZoneCards[dropZoneIndex] = card;
      }
    }

    // カードを手札に補充する
    if (playerDeck.getDeckSize() > 0) {
      const newCard = playerDeck.draw();
      if (newCard) {
        player.addCardToHand(newCard);
        newCard.setIsBackSide = false;
        newCard.setTexture("cards", newCard.getTextureKey);

        newCard.moveTo(beforeMoveX, beforeMoveY, 300);
      }
    }
  }

  /**
   * ゲーム停滞時の挙動
   */
  private checkGameStallAndDrawCard(): void {
    if (!this.canPlayCard(this.players[0]) && !this.canPlayCard(this.players[1])) {
      // カードのドラッグ不可
      this.changeCardDraggable(false);

      // capプレイ停止
      this.cpuPlayTimeEvent?.remove();

      // 台札にカードをセット
      let dropZonesIndex = 0;
      this.players.forEach((player, index) => {
        this.dealLeadCards(player, index, this.dropZones[dropZonesIndex]);
        dropZonesIndex += 1;
      });

      this.checkResult();
      if (this.gameState === GameState.END_GAME) return;

      // インターバルの後にカウントダウン開始とCPUプレイ再開
      this.time.delayedCall(2000, () => {
        this.setInitialTime = 2;
        this.startCountDownEvent();

        // 既存の delayedCall があればクリアします
        this.cpuPlayTimeEvent?.remove();

        // cpuプレイ再開
        this.time.delayedCall(3000, () => {
          this.cpuPlayTimeEvent = this.time.addEvent({
            delay: 4000,
            callback: this.playCpu,
            callbackScope: this,
            loop: true,
          });
        });
      });
    }
  }

  /**
   * BGM設定
   */
  private createSpeedSound(): void {
    this.countdownSound = this.scene.scene.sound.add(GAME.SOUNDS_KEY.COUNTDOWN_KEY, {
      volume: 0.6,
    });
  }

  /**
   * 勝敗判定
   */
  private checkResult(): void {
    // カードが配られていない、またはゲームがプレイ中でない場合は終了
    if (!this.cardsDealt || this.gameState !== GameState.PLAYING) return;

    const playerHandScore: number = this.players[0].calculateHandScore();
    const cpuHandScore: number = this.players[1].calculateHandScore();

    // 両者のスコアが0より大きい場合はゲームを続行
    if (playerHandScore > 0 && cpuHandScore > 0) return;

    // スコアによる勝敗結果を設定
    if (playerHandScore === 0 && cpuHandScore === 0) {
      this.result = GameResult.DRAW; // 両者のスコアが0なら引き分け
    } else if (playerHandScore === 0) {
      this.result = GameResult.WIN; // プレイヤーのスコアが0なら勝ち
    } else {
      this.result = GameResult.LOSE; // CPUのスコアが0なら負け
    }

    // ゲーム終了状態を設定（勝敗が確定したので）
    this.gameState = GameState.END_GAME;
  }

  /**
   * カードの配置可能場所を作成
   */
  private createDropZones(): void {
    const PLAYER_ZONE_OFFSET = 80;

    this.dropZones = [];
    this.players.forEach((player) => {
      const dropZone = this.add.zone(0, 0, 140 * 1.5, 190 * 1.5).setRectangleDropZone(140, 190);

      // ゾーンを中心に配置
      if (player.getPlayerType === PlayerType.PLAYER) {
        Phaser.Display.Align.In.Center(dropZone, this.gameZone as GameObject, PLAYER_ZONE_OFFSET);
      } else if (player.getPlayerType === PlayerType.CPU) {
        Phaser.Display.Align.In.Center(dropZone, this.gameZone as GameObject, -PLAYER_ZONE_OFFSET);
      }
      this.dropZones.push(dropZone);
    });
  }
}
