export default function setScreen() {
  function toggleScreen(previousEle: HTMLDivElement, nextEle: HTMLDivElement) {
    previousEle.classList.add("d-none");
    previousEle.classList.remove("d-block");
    nextEle.classList.add("d-block");
    nextEle.classList.remove("d-none");
  }
  let previousEle: HTMLDivElement | null;

  /**
   * 画面遷移
   */
  const title = document.getElementById("header")?.querySelector("h1");
  const home = document.getElementById("home");
  const signup = document.getElementById("signup");
  const forgot = document.getElementById("forgot");
  const login = document.getElementById("login");
  const myPage = document.getElementById("myPage");
  const navHome = document.getElementById("nav-home");
  const navSignUp = document.getElementById("nav-signup");
  const navLogin = document.getElementById("nav-login");
  const nav = document.querySelector("#navArea");
  const navMyPage = document.getElementById("nav-myPage");

  // title to Home
  (title as HTMLDivElement).onclick = () => {
    // 現在の表示Page
    previousEle = document.querySelector<HTMLDivElement>("#app .d-block");
    toggleScreen(previousEle as HTMLDivElement, home as HTMLDivElement);
  };

  // navHome to Home
  (navHome as HTMLDivElement).onclick = () => {
    // 現在の表示Page
    previousEle = document.querySelector<HTMLDivElement>("#app .d-block");
    toggleScreen(previousEle as HTMLDivElement, home as HTMLDivElement);
    nav?.classList.toggle("open");
  };

  // navSignUp to signup
  (navSignUp as HTMLDivElement).onclick = () => {
    previousEle = document.querySelector<HTMLDivElement>("#app .d-block");
    toggleScreen(previousEle as HTMLDivElement, signup as HTMLDivElement);
    // menu close
    nav?.classList.toggle("open");
  };

  // navLogin to login
  (navLogin as HTMLDivElement).onclick = () => {
    previousEle = document.querySelector<HTMLDivElement>("#app .d-block");
    toggleScreen(previousEle as HTMLDivElement, login as HTMLDivElement);
    nav?.classList.toggle("open");
  };

  // navMyPage to myPage
  (navMyPage as HTMLDivElement).onclick = () => {
    previousEle = document.querySelector<HTMLDivElement>("#app .d-block");
    toggleScreen(previousEle as HTMLDivElement, myPage as HTMLDivElement);
    nav?.classList.toggle("open");
  };

  // forgot to signup
  (forgot as HTMLDivElement).onclick = () => {
    previousEle = document.querySelector<HTMLDivElement>("#app .d-block");
    toggleScreen(previousEle as HTMLDivElement, signup as HTMLDivElement);
  };

  /**
   * タブ遷移
   */
  const pokerBtn = document.getElementById("pokerBtn");
  const blackjackBtn = document.getElementById("blackjackBtn");
  const warBtn = document.getElementById("warBtn");
  const speedBtn = document.getElementById("speedBtn");
  const pokerRecord = document.getElementById("pokerRecord");
  const blackjackRecord = document.getElementById("blackjackRecord");
  const warRecord = document.getElementById("warRecord");
  const speedRecord = document.getElementById("speedRecord");

  // pokerRecord
  (pokerBtn as HTMLDivElement).onclick = () => {
    previousEle = document.querySelector("#record .d-block");
    toggleScreen(previousEle as HTMLDivElement, pokerRecord as HTMLDivElement);
  };
  // blackjackRecord
  (blackjackBtn as HTMLDivElement).onclick = () => {
    previousEle = document.querySelector("#record .d-block");
    toggleScreen(previousEle as HTMLDivElement, blackjackRecord as HTMLDivElement);
  };
  // pokerRecord
  (warBtn as HTMLDivElement).onclick = () => {
    previousEle = document.querySelector("#record .d-block");
    toggleScreen(previousEle as HTMLDivElement, warRecord as HTMLDivElement);
  };
  // pokerRecord
  (speedBtn as HTMLDivElement).onclick = () => {
    previousEle = document.querySelector("#record .d-block");
    toggleScreen(previousEle as HTMLDivElement, speedRecord as HTMLDivElement);
  };
}
