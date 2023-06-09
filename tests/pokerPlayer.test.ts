import PokerPlayer from "../src/models/games/poker/pokerPlayer";
import Card from "../src/models/common/card";

describe("pokerPlayer", () => {
  const deck = [
    new Card("10", "clubs"),
    new Card("Jack", "clubs"),
    new Card("Queen", "clubs"),
    new Card("King", "clubs"),
    new Card("Ace", "clubs"),
  ];
  const player = new PokerPlayer("motsu", "player", 1000, 10);

  test("should construct correctly", () => {
    expect(player).toBeInstanceOf(PokerPlayer);
  });

  test("should return amount and should change chips", () => {
    expect(player.call(100)).toBe(100);
    expect(player.getChips).toBe(900);
  });

  test("should suitDict size 1 and rankDict size 5", () => {
    expect(player.getSuitDict.size).toBe(1);
    expect(player.getRankDict.size).toBe(5);
  });

  test("should return sort Dict", () => {
    expect(player.getHandList).toEqual([
      [10, 1],
      [11, 1],
      [12, 1],
      [13, 1],
      [14, 1],
    ]);
  });

  test("hasPair() should return false", () => {
    expect(player.hasPair(2)).toBe(false);
  });

  test("hasChainRank() should return true", () => {
    expect(player.hasChainRank()).toBe(true);
  });

  test("should return role 9", () => {
    expect(player.calculateHandScore()).toEqual({ role: 9, highCard: 0 });
  });

  test("should hand undefined", () => {
    player.fold();
    expect(player.getHand).toBe(undefined);
  });
});
