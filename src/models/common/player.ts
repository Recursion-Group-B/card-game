import Card from "./card";
import { HandScore } from "../games/poker/type";

export default abstract class Player {
  private name: string;

  private playerType: string;

  private chips: number;

  private bet: number;

  private hand: Array<Card> | null;

  constructor(name: string, playerType: string, chips: number, bet: number, hand: Array<Card>) {
    this.name = name;
    this.playerType = playerType;
    this.chips = chips;
    this.bet = bet;
    this.hand = hand;
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

  set setHand(hand: Card[] | null) {
    this.hand = hand;
  }

  get getHand() {
    return this.hand;
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

  addCardToHand(card: Card) {
    (this.hand as Card[]).push(card);
  }

  abstract calculateHandScore(): number | HandScore;
}
