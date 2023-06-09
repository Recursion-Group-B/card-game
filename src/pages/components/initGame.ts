import Phaser from "phaser";
import GameManager from "../../models/common/gameManager";
import GameType from "../../constants/gameType";
import PreloadScene from "../../scenes/common/preloadScene";
import Tutorial from "../../scenes/common/tutorial";

/**
 * home画面非表示
 */
function hideHome() {
  const homeElement = document.getElementById("home");
  const headerElement = document.getElementById("header");

  if (homeElement) {
    homeElement.classList.add("d-none");
  }

  if (headerElement) {
    headerElement.classList.add("d-none");
  }
}

export default async function initGame(gameType: string, diff: string) {
  let gameScene;

  switch (gameType) {
    case "speed":
      gameScene = (await import("../../scenes/games/speed/speedTableScene")).default;
      break;
    case "poker":
      gameScene = (await import("../../scenes/games/poker/pokerTableScene")).default;
      break;
    case "blackjack":
      gameScene = (await import("../../scenes/games/blackjack/blackjackTableScene")).default;
      break;
    case "war":
      gameScene = (await import("../../scenes/games/war/warTableScene")).default;
      break;
    default:
      throw new Error("Invalid game type");
  }

  // Homeを非表示
  hideHome();

  // ゲームの設定
  GameManager.setGameType(gameType as GameType, diff);

  const D_WIDTH = 1320;
  const D_HEIGHT = 920;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: D_WIDTH,
    height: D_HEIGHT,
    scale: {
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
    },
    scene: [PreloadScene, gameScene, Tutorial],
    physics: {
      arcade: {
        debug: true,
      },
    },
    fps: {
      target: 40,
      forceSetTimeOut: true,
    },
  };

  const phaser = new Phaser.Game(config);

  phaser.registry.set("gameType", gameType);
}
