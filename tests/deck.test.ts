import Card from "../src/models/common/card";
import Deck from "../src/models/common/deck";

describe("Deck", () => {
  let deck: Deck;

  beforeEach(() => {
    deck = new Deck();
  });

  test("should contain 52 cards", () => {
    expect(deck.getDeckSize()).toBe(52);
  });

  test("should return a Card instance when drawing", () => {
    expect(deck.draw()).toBeInstanceOf(Card);
  });

  test("should decrease deck size by 1 when drawing", () => {
    const initialSize = deck.getDeckSize();
    deck.draw();
    expect(deck.getDeckSize()).toBe(initialSize - 1);
  });

  test("should be able to shuffle cards", () => {
    const initialDeckOrder = [...deck.getCards()];
    deck.shuffle();
    const shuffledDeckOrder = [...deck.getCards()];

    // シャッフルした結果偶然デッキが同じになる時があるので注意
    expect(shuffledDeckOrder).not.toEqual(initialDeckOrder);
  });
});
