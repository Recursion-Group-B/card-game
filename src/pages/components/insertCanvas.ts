import initGame from "./initGame";

export default function insertCanvas() {
  document.querySelectorAll(".btn[data-game]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const gameType = (event.currentTarget as Element).getAttribute("data-game");
      if (gameType) {
        await initGame(gameType);
      }
    });
  });
}
