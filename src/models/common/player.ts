import Card from "./card";

export default abstract class Player {
  private name: string;

  private playerType: string;

  private chips: number;

  private bet: number;

  private hand: Array<Card>;

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

  get getHand() {
    return this.hand;
  }

  get getBet() {
    return this.bet;
  }

  abstract calculateHandScore(): number;
}
