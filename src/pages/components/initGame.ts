import Phaser from "phaser";
import GameManager from "../../models/common/gameManager";
import GameType from "../../constants/gameType";

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

export default async function initGame(gameType: string) {
  let gameScene;
  let tutorialScene;

  switch (gameType) {
    case "speed":
      gameScene = (await import("../../scenes/games/speed/speedTableScene")).default;
      tutorialScene = (await import("../../scenes/games/speed/speedTutorial")).default;
      break;
    case "poker":
      gameScene = (await import("../../scenes/games/poker/pokerTableScene")).default;
      tutorialScene = (await import("../../scenes/games/poker/pokerTutorial")).default;
      break;
    case "blackjack":
      gameScene = (await import("../../scenes/games/blackjack/blackjackTableScene")).default;
      tutorialScene = (await import("../../scenes/games/blackjack/blackjackTutorial")).default;
      break;
    case "war":
      gameScene = (await import("../../scenes/games/war/warTableScene")).default;
      tutorialScene = (await import("../../scenes/games/war/warTutorial")).default;
      break;
    default:
      throw new Error("Invalid game type");
  }

  // Homeを非表示
  hideHome();

  // ゲームの設定
  GameManager.setGameType(gameType as GameType);

  const D_WIDTH = 1320;
  const D_HEIGHT = 920;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: D_WIDTH,
    height: D_HEIGHT,
    antialias: false,
    scene: [gameScene, tutorialScene],
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
      target: 40,
      forceSetTimeOut: true,
    },
    physics: {
      default: "arcade",
    },
  };

  const phaser = new Phaser.Game(config);
}
