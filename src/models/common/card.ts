export default class Card {
  private rank: string;

  private suit: string;

  constructor(rank: string, suit: string) {
    this.rank = rank;
    this.suit = suit;
  }

  get getSuit() {
    return this.suit;
  }

  get getRank() {
    return this.rank;
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
