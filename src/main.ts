import "./style.scss";
import Home from "./page/home";
import setAnimation from "./page/home/components/setAnimation";
import setScreen from "./page/home/components/setScreen";

// html挿入
(document.querySelector("#app") as HTMLDivElement).innerHTML = `
  ${Home}
`;

/**
 * [アニメーション挿入]
 * Menu
 * Slider
 */
setAnimation();

/**
 * [画面遷移]
 */
setScreen();
