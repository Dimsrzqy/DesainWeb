document.addEventListener("DOMContentLoaded", function () {
  // Hero Scroll Button
  const scrollButton = document.querySelector("#hero .text .button");
  const bestSection = document.querySelector("#best");

  if (scrollButton && bestSection) {
    scrollButton.addEventListener("click", () => {
      const offset = bestSection.offsetTop - 60;
      window.scrollTo({ top: offset, behavior: "smooth" });
    });
  }

  // Testimonial Slider
  const testimonials = document.querySelectorAll(".testimonial");
  const navigationContainer = document.querySelector(".navigation");
  const testimonialContainer = document.querySelector(".slider-container");
  let currentIndex = 0;

  if (testimonials.length && navigationContainer && testimonialContainer) {
    function showTestimonial(index) {
      const buttons = navigationContainer.querySelectorAll("button");
      buttons.forEach((btn) => btn.classList.remove("active"));
      if (buttons[index]) buttons[index].classList.add("active");
      testimonialContainer.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextTestimonial() {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    }

    const autoplayInterval = setInterval(nextTestimonial, 3000);

    testimonials.forEach((_, index) => {
      const button = document.createElement("button");
      button.addEventListener("click", () => {
        clearInterval(autoplayInterval);
        currentIndex = index;
        showTestimonial(index);
      });
      navigationContainer.appendChild(button);
    });

    showTestimonial(currentIndex);
  }

  // Load Best Products from menu.html
  fetch("./menu.html")
    .then((response) => {
      if (!response.ok) throw new Error("Gagal mengambil menu.html");
      return response.text();
    })
    .then((data) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, "text/html");
      const menuWrap = doc.querySelector(".menu-wrap");
      const indexContainer = document.getElementById("index-container");

      if (menuWrap && indexContainer) {
        const bestProducts = menuWrap.querySelectorAll(".product.best");
        bestProducts.forEach((product) => {
          const clone = product.cloneNode(true);
          indexContainer.appendChild(clone);

          // Attach popup handler manually if function available
          clone.addEventListener("click", () => {
            if (typeof window.showProductPopup === "function") {
              window.showProductPopup(clone);
            } else {
              console.warn("Fungsi showProductPopup belum tersedia.");
            }
          });
        });

        // Load menu.js after best products added
        const script = document.createElement("script");
        script.src = "./src/js/menu.js";
        script.onload = () => console.log("menu.js loaded");
        document.body.appendChild(script);
      } else {
        console.warn("menu-wrap atau index-container tidak ditemukan.");
      }
    })
    .catch((error) => {
      console.error("Gagal memuat produk best dari menu.html:", error.message);
    });
});
