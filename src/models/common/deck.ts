import Phaser from "phaser";
import Card from "./card";

const SUITS = ["heart", "diamond", "club", "spade"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export default class Deck {
  private cards: Array<Card> = [];

  constructor(
    private scene: Phaser.Scene,
    private x: number,
    private y: number,
    suits = SUITS,
    ranks = RANKS
  ) {
    suits.forEach((suit) => {
      ranks.forEach((rank) => {
        const textureKey = `${suit}${rank}`;
        this.cards.push(new Card(this.scene, x, y, rank, suit, textureKey, true));
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

  isEmpty(): boolean {
    return this.cards.length === 0;
  }
}
