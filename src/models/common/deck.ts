import Card from "./card";

export default class Deck {
  private cards: Array<Card> = [];

  constructor() {
    const suits = ["heart", "diamond", "club", "spade"];
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    suits.forEach((suit) => {
      ranks.forEach((rank) => {
        this.cards.push(new Card(rank, suit));
      });
    });
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card | undefined {
    return this.cards.pop();
  }

  getDeckSize() {
    return this.cards.length;
  }

  getCards(): Array<Card> {
    return [...this.cards];
  }
}
