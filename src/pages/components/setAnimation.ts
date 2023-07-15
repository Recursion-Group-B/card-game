import Swiper from "swiper";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function setAnimation() {
  const swiper = new Swiper(".swiper", {
    // Optional parameters
    loop: true,
    slidesPerView: 2,
    spaceBetween: 100,
    centeredSlides: true,
    effect: "coverflow",
    pagination: {
      el: ".swiper-pagination",
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    modules: [EffectCoverflow, Pagination, Navigation],
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
