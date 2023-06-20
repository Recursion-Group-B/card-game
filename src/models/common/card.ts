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

  get getCardKey(): string {
    return this.suit + this.rank;
  }

  /**
   * gameType毎にカードのrankを返す
   */
  getRankNumber(gameType: string): number {
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
    }
    return rankToNum[this.rank] ?? 0;
  }
}
