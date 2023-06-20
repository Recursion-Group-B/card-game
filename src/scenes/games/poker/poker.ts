import PokerPlayer from "../../../models/games/poker/pokerPlayer";
import "../../../style.scss";
import PokerTable from "./pokerTableScene";

const player = new PokerPlayer("motsu", "player", 1000, 0, undefined);

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  width: 1200,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  scene: [new PokerTable(player)],
};

const game = new Phaser.Game(config);
