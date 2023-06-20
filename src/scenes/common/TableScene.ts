import Phaser from "phaser";
import Deck from "../../models/common/deck";
import Player from "../../models/common/player";
import Zone = Phaser.GameObjects.Zone;

const D_WIDTH = 1320;
const D_HEIGHT = 920;

export default abstract class TableScene extends Phaser.Scene {
  protected gameZone: Zone | undefined;

  protected players: Array<Player> = [];

  protected gameState: string | undefined;

  protected deck: Deck | undefined;

  protected bets: number | undefined;

  protected turnCounter = 0;

  /**
   * ゲーム開始時のカード配布
   */
  abstract dealCards(): void;

  /**
   * deckをリセットしシャッフルする
   */
  protected deckReset(x?: number, y?: number): void {
    this.deck = undefined;
    this.deck = new Deck(this, x ?? 0, y ?? 0);
    this.deck.shuffle();
  }

  /**
   * TODO ゲームサイズなどは後々決めましょう
   */
  protected createGameZone(): void {
    this.gameZone = this.add.zone(D_WIDTH / 2, D_HEIGHT / 2, D_WIDTH, D_HEIGHT);
  }
}
