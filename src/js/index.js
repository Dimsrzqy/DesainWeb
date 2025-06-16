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

  // Initialize cart data
  window.cartData = {
    items: [],
    pickupMethod: "Diambil Sendiri",
  };

  // Load cart items from localStorage
  loadCartItems();

  // Setup delivery method dropdown
  const deliveryDropbtn = document.getElementById("delivery-dropbtn");
  const deliveryDropdownContent = document.getElementById("delivery-dropdown-content");
  const pickupSection = document.getElementById("pickup");
  const deliverySection = document.getElementById("delivery");

  deliveryDropdownContent.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const value = this.getAttribute("data-value");
      deliveryDropbtn.textContent = value;
      window.cartData.pickupMethod = value;

      // Show/hide delivery sections
      if (value === "Diambil Sendiri") {
        pickupSection.style.display = "block";
        deliverySection.style.display = "none";
      } else {
        pickupSection.style.display = "none";
        deliverySection.style.display = "block";
      }
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.matches(".dropbtn")) {
      deliveryDropdownContent.style.display = "none";
    }
  });

  // Toggle dropdown
  deliveryDropbtn.addEventListener("click", function () {
    deliveryDropdownContent.style.display = deliveryDropdownContent.style.display === "block" ? "none" : "block";
  });

  // Checkout button click handler
  const checkoutBtn = document.querySelector(".checkout-btn");
  checkoutBtn.addEventListener("click", function () {
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    if (cartItems.length === 0) {
      alert("Keranjang belanja kosong!");
      return;
    }

    if (window.cartData.pickupMethod === "Diantar") {
      // Validate delivery form
      const studentName = document.getElementById("student-name").value;
      const dorm = document.getElementById("dorm").value;
      const institution = document.getElementById("institution").value;
      const phone = document.getElementById("phone").value;

      if (!studentName || !dorm || !institution || !phone) {
        alert("Mohon lengkapi semua data pengiriman!");
        return;
      }

      // Show delivery confirmation popup
      const totalPrice = document.getElementById("total-price").textContent;
      const deliveryInfo = `
        Nama Santri: ${studentName}
        Asrama: ${dorm}
        Lembaga: ${institution}
        No. HP: ${phone}
        Total Pembayaran: ${totalPrice}
      `;
      alert(`Pesanan akan diantar ke asrama Anda.\n\n${deliveryInfo}`);
    } else {
      // Validate pickup form
      const pickupName = document.getElementById("pickup-student-name").value;
      const pickupDorm = document.getElementById("pickup-dorm").value;
      if (!pickupName || !pickupDorm) {
        alert("Mohon isi Nama Santri dan Asrama untuk pengambilan!");
        return;
      }
      // Show pickup confirmation popup
      const totalPrice = document.getElementById("total-price").textContent;
      alert(`Silahkan ambil pesanan Anda di Koperasi Nuris.\nNama: ${pickupName}\nAsrama: ${pickupDorm}\nTotal yang harus dibayar: ${totalPrice}`);
    }

    // Clear cart data
    localStorage.removeItem("cartItems");
    document.querySelector(".cart-count").textContent = "0";

    // Clear delivery & pickup form if it exists
    document.getElementById("pickup-student-name").value = "";
    document.getElementById("pickup-dorm").value = "";
    if (window.cartData.pickupMethod === "Diantar") {
      document.getElementById("student-name").value = "";
      document.getElementById("dorm").value = "";
      document.getElementById("institution").value = "";
      document.getElementById("phone").value = "";
    }

    // Reset delivery method
    window.cartData.pickupMethod = "Diambil Sendiri";
    deliveryDropbtn.textContent = "Diambil Sendiri";
    pickupSection.style.display = "block";
    deliverySection.style.display = "none";

    // Reset cart summary
    document.getElementById("total-price").textContent = "Rp 0";

    // Clear cart items container
    document.getElementById("cartItemsContainer").innerHTML = "";

    // Close modal
    const modal = document.getElementById("cartModal");
    modal.style.display = "none";
  });
});

// Load cart items from localStorage
function loadCartItems() {
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const container = document.getElementById("cartItemsContainer");
  container.innerHTML = "";

  cartItems.forEach((item) => {
    const itemElement = createCartItemElement(item);
    container.appendChild(itemElement);
  });

  updateCartSummary();
}

// Create cart item element
function createCartItemElement(item) {
  const div = document.createElement("div");
  div.className = "cart-item";
  div.innerHTML = `
    <img src="${item.image}" alt="${item.name}">
    <div class="cart-item-details">
      <div class="cart-item-title">${item.name}</div>
      <div class="cart-item-price">Rp ${parseInt(item.price).toLocaleString("id-ID")}</div>
      <div class="cart-item-quantity">
        <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
        <span>${item.quantity}</span>
        <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
      </div>
    </div>
  `;
  return div;
}

// Update cart summary
function updateCartSummary() {
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  let total = 0;

  cartItems.forEach((item) => {
    total += parseInt(item.price) * item.quantity;
  });

  document.getElementById("total-price").textContent = `Rp ${total.toLocaleString("id-ID")}`;
}

// Update item quantity
function updateQuantity(itemName, change) {
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const itemIndex = cartItems.findIndex((item) => item.name === itemName);

  if (itemIndex !== -1) {
    cartItems[itemIndex].quantity = Math.max(1, cartItems[itemIndex].quantity + change);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    loadCartItems();
    updateCartCount();
  }
}

// Update cart count
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector(".cart-count").textContent = totalItems;
}
