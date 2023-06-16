import Deck from "../../common/deck";
import Card from "../../common/card";
import PokerPlayer from "./pokerPlayer";

export default class PokerTable {
  private deck: Deck;

  private players: PokerPlayer[];

  private pot: number[];

  private returnPot: number;

  constructor(player: PokerPlayer) {
    this.deck = new Deck();
    this.players = [player];
    this.pot = [0];
    this.returnPot = 0;
    this.deck.shuffle();
  }

  addPlayer(player: PokerPlayer): void {
    this.players.push(player);
  }
  // deleteCpu():void{}

  /**
   * 複数人へ配布
   */
  dealCards(): void {
    this.players.forEach((player) => {
      /* eslint-disable no-param-reassign */
      player.setHand = this.deck.draw(5);
    });
  }

  change(amount: number): Card[] | undefined {
    return this.deck.draw(amount);
  }

  get getAllHand(): Card[][] {
    return this.players.map((player) => player.getHand as Card[]);
  }

  get getPlayers(): PokerPlayer[] {
    return this.players;
  }

  set setPot(amount: number) {
    this.pot.push(amount);
  }

  get getPot(): number[] {
    return this.pot;
  }

  get getTotalPot(): number {
    return this.pot.reduce((pre, next) => pre + next, 0);
  }

  potReturn(): number {
    this.returnPot = this.getTotalPot;
    this.pot.length = 0;
    return this.returnPot;
  }
}
