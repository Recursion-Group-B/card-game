import Phaser from "phaser";

export default class Card extends Phaser.GameObjects.Image {
  private rank: string;

  private suit: string;

  private imagePath: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    rank: string,
    suit: string,
    imagePath: string
  ) {
    super(scene, x, y, `${suit}${rank}`);
    this.rank = rank;
    this.suit = suit;
    this.imagePath = imagePath;
    scene.add.existing(this);
    this.setScale(0.115);
  }

  get getSuit() {
    return this.suit;
  }

  get getRank() {
    return this.rank;
  }

  /**
   * カードの表面の画像フレーム取得
   * @returns カードの表面の画像ファイル名
   */
  getAtlasFrame(): string {
    return `card-${this.suit}-${this.rank}.png`;
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
      case "war":
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
    }
    return rankToNum[this.rank] ?? 0;
  }
}
