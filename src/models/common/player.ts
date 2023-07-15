import Card from "./card";
import { HandScore } from "../games/poker/type";

export default abstract class Player {
  private name: string;

  private playerType: string;

  private chips: number;

  private bet: number | undefined;

  private hand: Array<Card> | undefined = [];

  constructor(name: string, playerType: string, chips: number, bet: number) {
    this.name = name;
    this.playerType = playerType;
    this.chips = chips;
    this.bet = bet;
  }

  get getName() {
    return this.name;
  }

  get getPlayerType() {
    return this.playerType;
  }

  get getChips() {
    return this.chips;
  }

  set setHand(cards: Card[] | undefined) {
    (this.hand as Card[] | undefined) = cards;
  }

  get getHand() {
    return this.hand;
  }

  get getHandSize() {
    return this.hand?.length;
  }

  get getBet() {
    return this.bet;
  }

  set setChips(chips: number) {
    this.chips = chips;
  }

  set setBet(bet: number) {
    this.bet = bet;
  }

  addChips(chips: number): void {
    this.chips += chips;
  }

  /**
   * this.handにcardを追加
   * @param card: Card
   * @param cards: Card[]
   */
  addCardToHand(card: Card): void;
  addCardToHand(cards: Card[]): void;
  addCardToHand(card: Card | Card[]): void {
    if (card instanceof Card) (this.hand as Card[]).push(card);
    else (this.hand as Card[]).push(...card);
  }

  /**
   * this.handからcardsを削除
   * @param cards: Card[]
   */
  deleteCardsToHand(cards: Card[]): void {
    this.hand = this.hand?.filter((card) => !cards.includes(card));
  }

  removeCardFromHand(card: Card): void {
    if (this.hand) {
      const index = this.hand.findIndex((handCard) => handCard === card);
      if (index !== -1) {
        this.hand?.splice(index, 1);
      } else {
        throw new Error("Card not found in hand.");
      }
    }
  }

  /**
   * 手札のリセット
   */
  resetHand(): void {
    this.hand = [];
  }

  /**
   * プレイヤーアクション（ベット/コール/レイズ）: this.chipsからamountを引く
   * @param amount : number
   * @returns : number
   */
  call(amount: number): number {
    const currentChips: number = this.getChips - amount;
    this.setChips = currentChips;
    return amount;
  }

  abstract calculateHandScore(): number | HandScore;
}
