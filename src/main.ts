import "./style.scss";
import * as bootstrap from "bootstrap";
import Home from "./page/home";
import slider from "./page/home/components/slider";

// home挿入
(document.querySelector("#app") as HTMLDivElement).innerHTML = `
  ${Home}
`;

// selectGameスライダー
slider();

// menuBtnアニメーション
const nav = document.querySelector("#navArea");
const toggleBtn = document.querySelector(".toggleBtn");
const mask = document.querySelector("#mask");

(toggleBtn as HTMLDivElement).onclick = () => {
  nav?.classList.toggle("open");
};

(mask as HTMLDivElement).onclick = () => {
  nav?.classList.toggle("open");
};
