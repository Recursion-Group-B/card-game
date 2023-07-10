import "./style.scss";
import Home from "./pages/home";
import setAnimation from "./pages/components/setAnimation";
import setScreen from "./pages/components/setScreen";
import insertCanvas from "./pages/components/insertCanvas";

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

/**
 * canvasを埋め込む
 */
insertCanvas();
