import GameType from "../../constants/gameType";
import Game from "./game";

export default class GameManager {
  static setGameType(gameName: GameType, diff: string) {
    switch (gameName) {
      case GameType.BLACKJACK:
        Game.CONFIG.GAME_MODE = GameType.BLACKJACK;
        break;
      case GameType.POKER:
        Game.CONFIG.GAME_MODE = GameType.POKER;
        break;
      case GameType.SPEED:
        Game.CONFIG.GAME_MODE = GameType.SPEED;
        break;
      case GameType.WAR:
        Game.CONFIG.GAME_MODE = GameType.WAR;
        break;
      default:
        // ゲームは適宜追加
        break;
    }
    Game.CONFIG.DIFFICULTY = diff;
  }
}
