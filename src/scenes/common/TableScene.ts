import Phaser from "phaser";
import Deck from "../../models/common/deck";
import Player from "../../models/common/player";

export default abstract class TableScene extends Phaser.Scene {
  protected players: Array<Player> = [];

  protected gameState: string | undefined;

  protected deck: Deck | undefined;

  protected bets: number | undefined;

  protected turnCounter = 0;
}
