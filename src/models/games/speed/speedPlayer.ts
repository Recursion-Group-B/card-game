import Card from "../../common/card";
import Player from "../../common/player";

export default class SpeedPlayer extends Player {
  calculateHandScore(): number {
    return (this.getHand as Card[]).length;
  }
}
