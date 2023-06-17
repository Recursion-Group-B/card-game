import Example from "./draw";

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  scene: [Example],
};

const game = new Phaser.Game(config);
