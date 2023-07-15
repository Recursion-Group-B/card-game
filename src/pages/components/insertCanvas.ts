import initGame from "./initGame";

export default function insertCanvas() {
  let diff;
  document.querySelector("#diff").addEventListener("change", (ele) => {
    diff = (ele.target as HTMLSelectElement).value;
  });

  document.querySelectorAll(".btn[data-game]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      if (diff === undefined) {
        alert("難易度を選択してください！");
        event.preventDefault();
      } else if (diff) {
        const gameType = (event.currentTarget as Element).getAttribute("data-game");
        if (gameType) {
          await initGame(gameType, diff);
        }
      }
    });
  });
}
