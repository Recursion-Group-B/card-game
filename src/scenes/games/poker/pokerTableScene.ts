import Phaser from "phaser";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import PokerPlayer from "../../../models/games/poker/pokerPlayer";

export default class PokerTable extends Phaser.Scene {
  private deck: Deck;

  private players: PokerPlayer[];

  private pot: number[];

  private returnPot: number;

  private deckObject: Phaser.GameObjects.Image[];

  constructor(player: PokerPlayer) {
    super({ key: "poker" });
    this.deck = new Deck();
    this.players = [player];
    this.pot = [0];
    this.returnPot = 0;
    this.deck.shuffle();
    this.deckObject = [];
  }

  addCPU(player: PokerPlayer): void {
    this.players.push(player);
  }
  // deleteCpu():void{}

  /**
   * 複数人へ配布
   */
  dealCards(): void {
    this.players.forEach((player) => {
      /* eslint-disable no-param-reassign */
      player.setHand = this.deck.draw(5) as Card[];
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

  /**
   * phaser3
   */
  preload() {
    this.load.setBaseURL("https://labs.phaser.io");
    this.load.atlas("cards", "assets/atlas/cards.png", "assets/atlas/cards.json");
  }

  create() {
    // deck
    this.deck.getCards().forEach((card) => {
      const img = this.add.image(100, 100, "cards", card.getCardKey).setInteractive();
      this.deckObject.push(img);
      console.log(img.frame.name);
    });
    console.log(this.deckObject);

    /**
     * Deal
     */
    const deal = this.add
      .text(400, 130, "deal!")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    deal.on(
      "pointerdown",
      function (this: PokerTable, pointer: Phaser.Input.Pointer) {
        console.log(pointer);
        this.dealCards();
        this.players.forEach((player) => {
          console.log(player.getHand);
        });
      },
      this
    );

    this.input.on(
      "gameobjectdown",
      function click(
        this: Phaser.Scene,
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Image
      ) {
        this.tweens.add({
          targets: gameObject,
          x: 600,
          y: 500,
          ease: "Power1",
        });
        this.children.bringToTop(gameObject);
      },
      this
    );
  }
}
