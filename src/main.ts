import "./style.scss";
import Home from "./pages/home";
import setAnimation from "./components/setAnimation";
import setScreen from "./components/setScreen";

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
