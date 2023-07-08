import Phaser from "phaser";

export default async function initGame(gameType: string) {
  let gameScene;

  switch (gameType) {
    case "speed":
      gameScene = (await import("../../scenes/games/speed/speedTableScene")).default;
      break;
    case "poker":
      gameScene = (await import("../../scenes/games/poker/pokerTableScene")).default;
      break;
    case "blackjack":
      gameScene = (await import("../../scenes/games/poker/pokerTableScene")).default;
      break;
    case "war":
      gameScene = (await import("../../scenes/games/poker/pokerTableScene")).default;
      break;
    default:
      throw new Error("Invalid game type");
  }

  const D_WIDTH = 1320;
  const D_HEIGHT = 920;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: D_WIDTH,
    height: D_HEIGHT,
    antialias: false,
    scene: gameScene,
    mode: Phaser.Scale.FIT,
    parent: "game-content",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 720,
      height: 345,
    },
    max: {
      width: 1920,
      height: 920,
    },
    fps: {
      target: 60,
      forceSetTimeOut: true,
    },
    physics: {
      default: "arcade",
    },
  };

  const phaser = new Phaser.Game(config);
}
