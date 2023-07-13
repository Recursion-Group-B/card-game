import GameType from "../../constants/gameType";
import Game from "./game";

export default class GameManager {
  static setGameType(gameName: GameType) {
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
      case GameType.TEXAS:
        Game.CONFIG.GAME_MODE = GameType.TEXAS;
        break;
      default:
        // ゲームは適宜追加
        break;
    }
  }
}
