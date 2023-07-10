import headers from "./components/header";
import selectDiff from "./components/selectDiff";
import selectGame from "./components/selectGame";
import { signup, login } from "./components/login";
import myPage from "./components/myPage";

const Home = `
    <div id="header" class="d-flex justify-content-between ps-2 pe-3">
        ${headers}
    </div>
    <div id="home" class="d-block page">
        <div class="container-fluid d-flex flex-column justify-content-center">
            <img src="public/homeImg.jpeg" class="img-fit">
            ${selectDiff}
            ${selectGame}
        </div>
    </div>
    <div id="signup" class="d-none page">
        ${signup}
    </div>
    <div id="login" class="d-none page">
        ${login}
    </div>
    <div id="myPage" class="d-none page">
        ${myPage}
    </div>
    <div id="game-content">
    </div>
`;

export default Home;
