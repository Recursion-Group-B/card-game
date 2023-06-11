export default function setAnimation() {
  /**
   * selectGameスライダー
   * */
  const target = document.getElementById("target");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  const sliderItems = document.querySelectorAll("#imgList .slider-item");

  const sliderShow = document.createElement("div");
  const main = document.createElement("div");
  const extra = document.createElement("div");

  sliderShow.classList.add("col-12", "d-flex", "flex-nowrap", "overflow-hiddens");
  main.classList.add("main");
  extra.classList.add("extra");

  main.append(sliderItems[0]);
  main.setAttribute("data-index", "0");

  sliderShow.append(main);
  sliderShow.append(extra);
  (target as HTMLDivElement).append(sliderShow);

  // アニメーションタイプによって要素を付け替えする
  function toggleElement(
    currentElement: HTMLDivElement,
    nextElement: HTMLDivElement,
    animationType: string
  ) {
    main.innerHTML = "";
    main.append(nextElement);

    extra.innerHTML = "";
    extra.append(currentElement);

    main.classList.add("expand-animation");
    extra.classList.add("deplete-animation");

    if (animationType === "right") {
      sliderShow.innerHTML = "";
      sliderShow.append(extra);
      sliderShow.append(main);
    } else if (animationType === "left") {
      sliderShow.innerHTML = "";
      sliderShow.append(main);
      sliderShow.append(extra);
    }
  }

  // 要素のスライド
  function slideJump(steps: number, animationType: string) {
    let index = parseInt(main.getAttribute("data-index") as string, 10);
    const currentElement = sliderItems.item(index) as HTMLDivElement;

    index += steps;

    if (index < 0) index = sliderItems.length - 1;
    else if (index >= sliderItems.length) index = 0;

    const nextElement = sliderItems.item(index) as HTMLDivElement;

    main.setAttribute("data-index", index.toString());

    toggleElement(currentElement, nextElement, animationType);
  }

  // 右ボタンをクリックした時に右方向へスライドし、左ボタンをクリックすると左方向へスライドする
  (leftBtn as HTMLElement).addEventListener("click", () => {
    slideJump(-1, "left");
  });

  (rightBtn as HTMLElement).addEventListener("click", () => {
    slideJump(1, "right");
  });

  /**
   *  menuBtnアニメーション
   */
  const nav = document.querySelector("#navArea");
  const toggleBtn = document.querySelector(".toggleBtn");
  const mask = document.querySelector("#mask");

  (toggleBtn as HTMLDivElement).onclick = () => {
    nav?.classList.toggle("open");
  };

  (mask as HTMLDivElement).onclick = () => {
    nav?.classList.toggle("open");
  };
}
