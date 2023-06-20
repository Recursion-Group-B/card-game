import Phaser from "phaser";

const CARD_SCALE_FRONT = 0.115;
const CARD_SCALE_BACK = 0.6;

export default class Card extends Phaser.GameObjects.Image {
  private rank: string;

  private suit: string;

  private textureKey: string;

  private isBackSide: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    rank: string,
    suit: string,
    textureKey: string,
    isBackSide: boolean
  ) {
    super(scene, x, y, "cardBack");
    this.rank = rank;
    this.suit = suit;
    this.textureKey = textureKey;
    this.isBackSide = isBackSide;
    scene.add.existing(this);
    this.setScale(CARD_SCALE_BACK);
  }

  get getSuit() {
    return this.suit;
  }

  get getRank() {
    return this.rank;
  }

  get getTextureKey() {
    return this.textureKey;
  }

  /**
   * 指定の位置まで移動するアニメーション
   */
  moveTo(toX: number, toY: number, delay: number): void {
    this.scene.tweens.add({
      targets: this,
      x: toX,
      y: toY,
      duration: delay,
      ease: "Linear",
    });
  }

  /**
   * カードを表面にするアニメーション
   */
  flipToFront(): void {
    if (this.isBackSide) {
      this.setTexture(this.textureKey);
      this.isBackSide = false;
      this.setScale(CARD_SCALE_FRONT);
    }
  }

  /**
   * ドラッグ可能状態への設定とドラッグ時のイベント設定
   */
  makeDraggable(): void {
    this.setDraggable();
    this.setDragEvents();
  }

  /**
   * ドラッグ可能な状態に設定
   */
  private setDraggable(): void {
    this.setInteractive();
    this.scene.input.setDraggable(this);
  }

  /**
   * ドラッグ時のイベント設定
   */
  private setDragEvents(): void {
    let startX: number;
    let startY: number;

    // ドラッグ開始時のイベント
    this.on("dragstart", () => {
      this.setDepth(Number.MAX_SAFE_INTEGER);
      startX = this.x;
      startY = this.y;
    });

    // ドラッグ中のイベント
    this.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      this.x = dragX;
      this.y = dragY;
    });

    // ドラッグ終了時のイベント
    this.on("dragend", () => {
      this.returnToOrigin();
    });
  }

  /**
   * カードを元の位置に戻す関数
   */
  returnToOrigin(): void {
    this.setPosition(this.input?.dragStartX, this.input?.dragStartY);
  }

  /**
   * gameType毎にカードのrankを返す
   */
  getRankNumber(gameType: string): number {
    let rankToNum;
    switch (gameType) {
      case "blackjack":
        rankToNum = {
          A: 11,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
          J: 10,
          Q: 10,
          K: 10,
        };
        break;
      case "poker":
        rankToNum = {
          A: 14,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
          J: 11,
          Q: 12,
          K: 13,
        };
        break;
      default:
        rankToNum = {
          A: 1,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
          J: 11,
          Q: 12,
          K: 13,
        };
        break;
    }
    return rankToNum[this.rank] ?? 0;
  }
}
