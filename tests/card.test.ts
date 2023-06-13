import Card from "../src/models/common/card";

describe("Card", () => {
  test("should construct correctly", () => {
    const card = new Card("A", "spade");
    expect(card).toBeInstanceOf(Card);
  });

  test("should return the correct suit", () => {
    const card = new Card("A", "spade");
    expect(card.getSuit).toEqual("spade");
  });

  test("should return the correct rank", () => {
    const card = new Card("A", "spade");
    expect(card.getRank).toEqual("A");
  });

  describe("getRankNumber", () => {
    test("should return the correct rank number for blackjack", () => {
      const card = new Card("A", "spade");
      expect(card.getRankNumber("blackjack")).toEqual(11);
    });

    test("should return the correct rank number for war", () => {
      const card = new Card("A", "spade");
      expect(card.getRankNumber("war")).toEqual(14);
    });

    test("should return the correct rank number for other games", () => {
      const card = new Card("A", "spade");
      expect(card.getRankNumber("speed")).toEqual(1);
    });

    test("should return 0 if the rank does not exist", () => {
      const card = new Card("Nonexistent Rank", "spade");
      expect(card.getRankNumber("blackjack")).toEqual(0);
    });
  });
});
