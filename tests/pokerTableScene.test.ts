import PokerPlayer from "../src/models/games/poker/pokerPlayer";
import Card from "../src/models/common/card";
import PokerTable from "../src/scenes/games/poker/pokerTableScene";

describe("pokerTable", () => {
  const deck = [
    new Card("10", "club"),
    new Card("J", "club"),
    new Card("Q", "club"),
    new Card("K", "club"),
    new Card("A", "club"),
  ];
  const player = new PokerPlayer("motsu", "player", 1000, 10, deck);
  const player2 = new PokerPlayer("CPU", "CPU", 1000, 10, deck);
  const table = new PokerTable(player);

  test("should construct correctly", () => {
    expect(table).toBeInstanceOf(PokerTable);
  });

  test("should return amount and should change chips", () => {
    table.addPlayer(player2);
    expect(table.getPlayers).toHaveLength(2);
    expect(table.getAllHand).toEqual([deck, deck]);
  });
});
