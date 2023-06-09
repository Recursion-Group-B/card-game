import Phaser from "phaser";
import Card from "./card";
import GAME from "./game";

const SUITS = ["hearts", "diamonds", "clubs", "spades"];
const RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

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
        this.cards.push(
          new Card(
            this.scene,
            x,
            y,
            rank,
            suit,
            textureKey,
            true,
            GAME.SOUNDS_KEY.DEAL_CARD_KEY,
            GAME.SOUNDS_KEY.FLIP_OVER_KEY
          )
        );
      });
    });
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card | undefined;
  draw(amount: number): Card[] | undefined;
  draw(amount?: number): Card | Card[] | undefined {
    // 複数枚ドロー
    if ((amount as number) > 0) {
      const cardList = Array(amount)
        .fill(null)
        .map(() => this.cards.pop());
      return cardList as Card[];
    }

    // 1枚ドロー
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

  /**
   * WAR DRAWのチェック用デッキ
   * デバッグ用です
   * 開発終わったら消すかも
   */
  createDrawDeck(rank: string): void {
    this.cards = []; // Clear the current deck

    // Create new deck with all cards of the specified rank
    SUITS.forEach((suit) => {
      const textureKey = `${suit}${rank}`;
      this.cards.push(new Card(this.scene, this.x, this.y, rank, suit, textureKey, true));
    });
  }

  /**
   * WAR WINのチェック用デッキ
   * デバッグ用です
   * 開発終わったら消すかも
   */
  createPlayerWarWinDeck(): void {
    this.cards = []; // Clear the current deck

    // Dealer's war loss card
    const dealerWarLossCardTextureKey = `clubs2`;
    this.cards.push(
      new Card(this.scene, this.x, this.y, "2", "clubs", dealerWarLossCardTextureKey, true)
    );

    // Player's war win card
    const playerWarWinCardTextureKey = `heartsKing`;
    this.cards.push(
      new Card(this.scene, this.x, this.y, "King", "hearts", playerWarWinCardTextureKey, true)
    );

    // Player's draw card
    const playerDrawCardTextureKey = `diamondsQueen`;
    this.cards.push(
      new Card(this.scene, this.x, this.y, "Queen", "diamonds", playerDrawCardTextureKey, true)
    );

    // Dealer's draw card
    const dealerDrawCardTextureKey = `spadesQueen`;
    this.cards.push(
      new Card(this.scene, this.x, this.y, "Queen", "spades", dealerDrawCardTextureKey, true)
    );
  }
}
