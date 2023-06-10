export default function setScreen() {
  /**
   * HTMLElement
   */
  const title = document.getElementById("header")?.querySelector("h1");
  const home = document.getElementById("home");
  const signup = document.getElementById("signup");
  const forgot = document.getElementById("forgot");
  const login = document.getElementById("login");
  const navSignUp = document.getElementById("nav-signup");
  const navLogin = document.getElementById("nav-login");
  const nav = document.querySelector("#navArea");
  //   const navMyPage = document.getElementById("nav-mypage");

  function toggleScreen(previousEle: HTMLDivElement, nextEle: HTMLDivElement) {
    previousEle.classList.add("d-none");
    previousEle.classList.remove("d-block");
    nextEle.classList.add("d-block");
    nextEle.classList.remove("d-none");
  }

  // title to Home
  (title as HTMLDivElement).onclick = () => {
    const previousEle = document.querySelector<HTMLDivElement>("#app .d-block");
    toggleScreen(previousEle as HTMLDivElement, home as HTMLDivElement);
  };

  // navSignUp to signup
  (navSignUp as HTMLDivElement).onclick = () => {
    const previousEle = document.querySelector<HTMLDivElement>("#app .d-block");
    toggleScreen(previousEle as HTMLDivElement, signup as HTMLDivElement);
    // menu close
    nav?.classList.toggle("open");
  };

  // navLogin to login
  (navLogin as HTMLDivElement).onclick = () => {
    const previousEle = document.querySelector<HTMLDivElement>("#app .d-block");
    toggleScreen(previousEle as HTMLDivElement, login as HTMLDivElement);
    // menu close
    nav?.classList.toggle("open");
  };

  // forgot to signup
  (forgot as HTMLDivElement).onclick = () => {
    const previousEle = document.querySelector<HTMLDivElement>("#app .d-block");
    toggleScreen(previousEle as HTMLDivElement, signup as HTMLDivElement);
  };
}
