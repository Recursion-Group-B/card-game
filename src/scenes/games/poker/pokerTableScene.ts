import Phaser from "phaser";
import Deck from "../../../models/common/deck";
import Card from "../../../models/common/card";
import PokerPlayer from "../../../models/games/poker/pokerPlayer";

export default class PokerTable extends Phaser.Scene {
  private deck: Deck;

  private players: PokerPlayer[];

  private pot: number[];

  private returnPot: number;

  constructor(player: PokerPlayer) {
    super({ key: "poker" });
    this.deck = new Deck();
    this.players = [player];
    this.pot = [0];
    this.returnPot = 0;
    this.deck.shuffle();
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

  /**
   * phaser3
   */
  preload() {
    this.load.setBaseURL("https://labs.phaser.io");
    this.load.atlas("cards", "assets/atlas/cards.png", "assets/atlas/cards.json");
  }

  create() {
    // phaser3 assetsからカード情報取得
    const frames = this.textures.get("cards").getFrameNames();

    // 背面とジョーカー抜き配列
    const deck = frames.filter((ele) => ele !== "back" && ele !== "joker");
    deck.forEach((cardKey) => {
      const img = this.add.image(100, 100, "cards", cardKey).setInteractive();
    });

    console.log(deck);

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

    /**
     * Deal
     */
    const draw = this.add
      .text(400, 130, "deal!")
      .setFontSize(20)
      .setFontFamily("Arial")
      .setOrigin(0.5)
      .setInteractive();

    draw.on(
      "pointerdown",
      (this: Phaser.Scene, pointer: Phaser.Input.Pointer) => {
        console.log(pointer);
      },
      this
    );
  }
}
