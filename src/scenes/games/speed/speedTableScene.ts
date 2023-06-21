import TableScene from "../../common/TableScene";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import SpeedPlayer from "../../../models/games/speed/speedPlayer";
import Zone = Phaser.GameObjects.Zone;
import GameObject = Phaser.GameObjects.GameObject;
import Player from "../../../models/common/player";

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default class SpeedTableScene extends TableScene {
  private playerDecks: Array<Deck> = [];

  private dropZones: Array<Zone> = [];

  private dropZoneCards: Array<Card> = []; // [右側の台札Card, 左側の台札Card]

  constructor() {
    super({});

    this.players = [
      new SpeedPlayer("TestPlayer", "player", 0, 0),
      new SpeedPlayer("TestCpu", "cpu", 0, 0),
    ];
  }

  preload(): void {
    this.load.atlas("cards", "/public/assets/images/cards.png", "/public/assets/images/cards.json");
    this.load.image("table", "/public/assets/images/tableGreen.png");
  }

  create(): void {
    this.add.image(D_WIDTH / 2, D_HEIGHT / 2, "table");
    this.createGameZone();
    this.createDropZones();
    this.createCardDropEvent();
    this.createPlayerDecks();
    this.dealCards();

    // CPUのゲームループ
    // TODD 難易度によってdelayの感覚を短くする
    this.time.delayedCall(7000, () => {
      this.time.addEvent({
        delay: 5000,
        callback: this.playCpu,
        callbackScope: this,
        loop: true,
      });
    });
  }

  // update(): void {
  //   console.log("update!!");
  // }

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

      this.dropZoneCards.push(card);

      // カードを裏返す
      this.time.delayedCall(1500, () => {
        card?.flipToFront();
      });
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
    const animationDelay = 400;

    for (let i = 0; i < 4; i += 1) {
      const card = this.playerDecks[playerIndex].draw();

      if (card) {
        if (player.getPlayerType === "player") {
          card.makeDraggable();
        }
        player.addCardToHand(card);
        card.moveTo(startPosX + i * cardInterval * direction, startPosY, i * animationDelay);

        // カードを裏返す
        this.time.delayedCall(1500, () => {
          card.flipToFront();
        });
      }
    }
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
    // CPUが出せるカードがあるかチェック
    if (this.canPlayCard(this.players[1])) {
      console.log("CPUは出せるカードがあります");

      // 出せるカードを取得
      // 移動先の台札の座標を取得
      const [dropCard, toX, toY] = this.getAvailableCardAndCoordinate(this.players[1]);

      // カードを出す
      if (dropCard && toX && toY) {
        console.log(this.players[1].getHand);
        this.moveCardHandToLead(dropCard, toX, toY);
        console.log(this.players[1].getHand);
      }
    }
  }

  /**
   * 手札に出せるカードがあるかチェック
   */
  private canPlayCard(player: SpeedPlayer): boolean {
    const hand = player.getHand;
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
    const hand = player.getHand;
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

    // Determine the dropZone based on toX and toY coordinates
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

        // TODO dropZoneCardsを更新する
        console.log(this.dropZoneCards[0].getRank);
        console.log(this.dropZoneCards[1].getRank);
      }
    }
  }

  /**
   * カードの配置可能場所を作成
   */
  private createDropZones(): void {
    const PLAYER_ZONE_OFFSET = 80;

    // Graphicsオブジェクトの作成
    const graphics = this.add.graphics();

    this.dropZones = [];
    this.players.forEach((player) => {
      const dropZone = this.add.zone(0, 0, 140 * 1.5, 190 * 1.5).setRectangleDropZone(140, 190);

      // ゾーンを中心に配置
      if (player.getPlayerType === "player") {
        Phaser.Display.Align.In.Center(dropZone, this.gameZone as GameObject, PLAYER_ZONE_OFFSET);
      } else if (player.getPlayerType === "cpu") {
        Phaser.Display.Align.In.Center(dropZone, this.gameZone as GameObject, -PLAYER_ZONE_OFFSET);
      }

      dropZone.setInteractive().on("pointerdown", () => console.log("Zone clicked!"));
      this.dropZones.push(dropZone);
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: D_WIDTH,
  height: D_HEIGHT,
  antialias: false,
  scene: SpeedTableScene,
  mode: Phaser.Scale.FIT,
  parent: "game-content",
  autoCenter: Phaser.Scale.CENTER_BOTH,
  min: {
    width: 720,
    height: 345,
  },
  max: {
    width: 1920,
    height: 920,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  physics: {
    default: "arcade",
  },
};

const phaser = new Phaser.Game(config);
