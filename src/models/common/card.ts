import Phaser from "phaser";
import GameType from "../../constants/gameType";

const CARD_SCALE_FRONT = 0.6;
const CARD_SCALE_BACK = 0.6;

export default class Card extends Phaser.GameObjects.Image {
  private rank: string;

  private suit: string;

  private textureKey: string;

  private isBackSide: boolean;

  private clickStatus: boolean;

  private dealSound: Phaser.Sound.BaseSound | undefined;

  private flipOverSound: Phaser.Sound.BaseSound | undefined;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    rank: string,
    suit: string,
    textureKey: string,
    isBackSide: boolean,
    dealSoundKey = "",
    flipOverSoundKey = ""
  ) {
    super(scene, x, y, "cards", "back");
    this.rank = rank;
    this.suit = suit;
    this.textureKey = textureKey;
    this.isBackSide = isBackSide;
    scene.add.existing(this);
    this.setScale(CARD_SCALE_BACK);
    this.clickStatus = false;

    if (dealSoundKey) {
      this.dealSound = this.scene.sound.add(dealSoundKey, { volume: 0.6 });
    }

    if (flipOverSoundKey) {
      this.flipOverSound = this.scene.sound.add(flipOverSoundKey, { volume: 0.6 });
    }
  }

  get getX(): number {
    return this.x;
  }

  get getY(): number {
    return this.y;
  }

  get getSuit() {
    return this.suit;
  }

  get getRank() {
    return this.rank;
  }

  get getCardKey(): string {
    return this.suit + this.rank;
  }

  get getTextureKey() {
    return this.textureKey;
  }

  get getIsBackSide(): boolean {
    return this.isBackSide;
  }

  set setIsBackSide(isBackSideVisible: boolean) {
    this.isBackSide = isBackSideVisible;
  }

  /**
   * 指定の位置まで移動するアニメーション
   */
  moveTo(toX: number, toY: number, delay: number): void {
    this.dealSound?.play();
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
    this.flipOverSound?.play();
    if (this.isBackSide) {
      this.setTexture("cards", this.textureKey);
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

  setClickHandler(pushHandler: () => void): void {
    this.on(
      "pointerdown",
      () => {
        pushHandler();
      },
      this
    );
  }

  /**
   * ドラッグ時のイベント設定
   */
  private setDragEvents(): void {
    let startX: number;
    let startY: number;

    // ドラッグ開始時のイベント
    this.on("dragstart", () => {
      startX = this.x;
      startY = this.y;
      this.scene.children.bringToTop(this);
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
   * clickStatus変更
   */
  toggleClickStatus(): void {
    this.clickStatus = !this.clickStatus;
  }

  /**
   * clickStatus取得
   */
  get getClickStatus(): boolean {
    return this.clickStatus;
  }

  /**
   * gameType毎にカードのrankを返す
   */
  getRankNumber(gameType: GameType): number {
    let rankToNum;
    switch (gameType) {
      case "blackjack":
        rankToNum = {
          Ace: 11,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
          Jack: 10,
          Queen: 10,
          King: 10,
        };
        break;
      case "blackjackAce":
        rankToNum = {
          Ace: 1,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
          Jack: 10,
          Queen: 10,
          King: 10,
        };
        break;
      case "poker":
        rankToNum = {
          Ace: 14,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
          Jack: 11,
          Queen: 12,
          King: 13,
        };
        break;
      case "war":
        rankToNum = {
          Ace: 14,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
          Jack: 11,
          Queen: 12,
          King: 13,
        };
        break;
      default:
        rankToNum = {
          Ace: 1,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
          Jack: 11,
          Queen: 12,
          King: 13,
        };
        break;
    }
    return rankToNum[this.rank] ?? 0;
  }
}
