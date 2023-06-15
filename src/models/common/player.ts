import Card from "./card";
import { HandScore } from "../games/poker/type";

export default abstract class Player {
  private name: string;

  private playerType: string;

  private chips: number;

  private hand: Array<Card> | null;

  constructor(name: string, playerType: string, chips: number, hand: Array<Card>) {
    this.name = name;
    this.playerType = playerType;
    this.chips = chips;
    this.hand = hand;
  }

  get getName() {
    return this.name;
  }

  get getPlayerType() {
    return this.playerType;
  }

  set setChips(amount: number) {
    this.chips = amount;
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

  abstract calculateHandScore(): number | HandScore;
}
