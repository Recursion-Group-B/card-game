import Player from "../../common/player";

export default class WarPlayer extends Player {
  calculateHandScore(): number {
    if (!this.getHand || this.getHand.length === 0) return 0;
    return this.getHand[0].getRankNumber("war");
  }
}
