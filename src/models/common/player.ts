import Card from "./card";

export default abstract class Player {
  private name: string;

  private playerType: string;

  private chips: number;

  private bet: number;

  private hand: Array<Card> = [];

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
    this.hand.push(card);
  }

  abstract calculateHandScore(): number;
}
