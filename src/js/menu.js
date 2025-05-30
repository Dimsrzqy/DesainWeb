document.addEventListener("DOMContentLoaded", function () {
  // Function to load navbar HTML
  function loadNavbar() {
    fetch("./src/components/navbar/navbar.html")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("navbar").innerHTML = data;
        addActiveClass(); // Add active class to current page link
        setupToggleButton(); // Setup toggle button click event
        setupScrollBehavior(); // Setup scroll behavior
      })
      .catch((error) => console.log("Error loading navbar:", error));
  }

  // Function to add active class to current page link
  function addActiveClass() {
    var currentLocation = window.location.href;
    var navLinks = document.querySelectorAll("#navbar a");

    navLinks.forEach(function (link) {
      if (link.href === currentLocation) {
        link.classList.add("active");
      }
    });
  }

  function setupToggleButton() {
    const mobileMenu = document.querySelector("header nav .mobile-menu");
    const menu = document.querySelector("header nav .menu");
    mobileMenu.addEventListener("click", function () {
      menu.classList.toggle("show");
    });
    // Remove class kalau diklik diluar
    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target) && !mobileMenu.contains(event.target)) {
        menu.classList.remove("show");
      }
    });
  }

  function setupScrollBehavior() {
    const header = document.querySelector("header");
    window.onscroll = function () {
      if (document.documentElement.scrollTop >= 200) {
        console.log("test");
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
  }

  // Load the navbar when the DOM is ready
  loadNavbar();
});

var body = document.querySelector("body");

document.querySelector(".tab").innerHTML = `<p class="all">All Menu</p>${[...new Set([...document.querySelectorAll(".category")].map((c) => `<p class="${c.textContent.toLowerCase().replace(" ", "")}">${c.textContent}</p>`))].join("")}`;

const products = document.querySelectorAll(".product");

for (var i = 0; i < products.length; i++) {
  var product = products[i];
  var category = product.getElementsByClassName("category")[0];
  var categoryText = category.innerText.toLowerCase().replace(" ", "");
  product.classList.add(categoryText);
}

var tabs = document.querySelectorAll(".tab > p");

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    if (!this.classList.contains("active")) {
      var tabClass = this.className;
      tabs.forEach(function (tab) {
        tab.classList.remove("active");
      });
      this.classList.add("active");
      Array.from(products).forEach(function (product) {
        var productClass = product.classList;
        var shouldDisplay = tabClass === "all" || productClass.contains(tabClass);

        product.style.display = shouldDisplay ? "block" : "none";
      });
    }
  });
});

// Mengatur tab "All Menu" sebagai tab default yang aktif
tabs[0].classList.add("active");

products.forEach((product) => {
  product.addEventListener("click", () => {
    const clonedContent = product.cloneNode(true);
    const popup = document.querySelector(".popup");
    const ov = document.querySelector(".overlay");

    popup.innerHTML = "";
    popup.appendChild(clonedContent);

    // Tambahkan elemen jumlah (amount)
    popup.querySelector(".price").insertAdjacentHTML(
      "beforebegin",
      `
      <div class="amount">
        <span>Amount</span>
        <div class="number">
          <div class="minus" onclick="decreaseValue()"><i class="fas fa-minus"></i></div>
          <div class="value"><input id="product-amount" value="1"/></div>
          <div class="plus" onclick="increaseValue()"><i class="fas fa-plus"></i></div>
        </div>
      </div>
    `
    );

    // Tambahkan dropdown size, type, sugar + hidden input
    popup.querySelector(".product-choice").insertAdjacentHTML(
      "beforeend",
      `
      <div class="size">
        <span>Size</span>
        <select class="fixed" onchange="stillValue(); updateHiddenInput('hiddenSizeInput', this.value)">
            <option selected>Regular</option>
            <option>Medium</option>
            <option>Large</option>
        </select>
        <input name="size" type="hidden" id="hiddenSizeInput" value="Regular" />
      </div>
      <div class="type">
        <span>Ice</span>
        <select class="fixed" onchange="stillValue(); updateHiddenInput('hiddenTypeInput', this.value)">
            <option>Less</option>
            <option selected>Normal</option>
            <option>Extra</option>
        </select>
        <input name="type" type="hidden" id="hiddenTypeInput" value="Normal" />
      </div>
      <div class="sugar">
        <span>Sugar</span>
        <select class="fixed" onchange="stillValue(); updateHiddenInput('hiddenSugarInput', this.value)">
            <option>Less</option>
            <option selected>Normal</option>
            <option>Extra</option>
        </select>
        <input name="sugar" type="hidden" id="hiddenSugarInput" value="Normal" />
      </div>
    `
    );

    // Tambahkan tombol addToCart dan close
    const addBtn = document.createElement("div");
    addBtn.className = "add";
    addBtn.innerHTML = `<span>Add to cart</span><i class="fas fa-cart-plus"></i>`;
    addBtn.onclick = addToCart;

    const closeBtn = document.createElement("div");
    closeBtn.className = "close-pop";
    closeBtn.innerHTML = `<i class="fas fa-times"></i>`;
    closeBtn.onclick = closePopup;

    popup.querySelector(".product-wrap").appendChild(addBtn);
    popup.querySelector(".product-wrap").appendChild(closeBtn);

    popup.classList.add("show");
    ov.classList.add("show");
    body.classList.add("ov");
    fadeIn(ov);
  });
});

function closePopup() {
  document.querySelector(".popup").classList.remove("show");
  document.querySelector(".overlay").classList.remove("show");
  fadeOut(document.querySelector(".overlay"));
  body.classList.remove("ov");
}

function appendHTML(selector, html) {
  var elements = document.querySelectorAll(selector);
  elements.forEach(function (element) {
    element.innerHTML += html;
  });
}

function beforeHTML(selector, html) {
  var elements = document.querySelectorAll(selector);
  elements.forEach(function (element) {
    element.insertAdjacentHTML("beforebegin", html);
  });
}

function addToCart() {
  const productName = document.querySelector(".popup h3").textContent;
  const productPrice = document.querySelector(".popup .price").textContent;
  const productQuantity = document.querySelector(".popup #product-amount").value;
  const productImage = document.querySelector(".popup .img img").getAttribute("src");
  const originalPrice = document.querySelector(".popup .price").getAttribute("value");
  const size = document.querySelector(".popup #hiddenSizeInput").value;
  const type = document.querySelector(".popup #hiddenTypeInput").value;
  const sugar = document.querySelector(".popup #hiddenSugarInput").value;

  // Initialize cartItems as an empty array
  let cartItems = [];

  // Retrieve existing cart items from localStorage
  const existingCartItems = localStorage.getItem("cartItems");

  if (existingCartItems) {
    // Parse the existing cart items from localStorage
    cartItems = JSON.parse(existingCartItems);
  }

  // Add the new product data to the existing cart items
  const newProductData = {
    name: productName,
    price: productPrice,
    image: productImage,
    quantity: productQuantity,
    originalPrice: originalPrice,
    size: size,
    type: type,
    sugar: sugar,
  };
  cartItems.push(newProductData);

  // Save the updated cart items back to localStorage
  localStorage.setItem("cartItems", JSON.stringify(cartItems));

  // Update cart count
  updateCartCount();

  // Optionally, you can provide feedback to the user
  alert("Product added to cart!");
  closePopup();
}

Array.from(document.getElementsByClassName("price")).forEach((e) => e.setAttribute("value", e.textContent.replace("Rp", "").replace(/\s/g, "").replace(/\./g, "")));

function decreaseValue() {
  const inputElement = document.getElementById("product-amount");
  let currentValue = parseInt(inputElement.value);
  if (currentValue > 1) {
    currentValue--;
    inputElement.value = currentValue;
    updatePrice(currentValue);
  }
}

function increaseValue() {
  const inputElement = document.getElementById("product-amount");
  let currentValue = parseInt(inputElement.value);
  currentValue++;
  inputElement.value = currentValue;
  updatePrice(currentValue);
}

function stillValue() {
  const inputElement = document.getElementById("product-amount");
  let currentValue = parseInt(inputElement.value);
  inputElement.value = currentValue;
  updatePrice(currentValue);
}

// Function to update the hidden input based on the selected option
function updateHiddenInput(inputId, value) {
  const hiddenInput = document.getElementById(inputId);
  hiddenInput.value = value;
  console.log(`Hidden input ${inputId} updated to:`, hiddenInput.value);
}

function updatePrice(quantity) {
  const priceElement = document.querySelector(".price");
  const price = parseInt(priceElement.getAttribute("value"));
  const sizeSelect = document.querySelector(".popup .size select");
  if (sizeSelect) {
    const calculateTotalPrice = () => {
      let multiplier = 1;
      if (sizeSelect && sizeSelect.value === "Medium") {
        multiplier = 1.25;
      } else if (sizeSelect && sizeSelect.value === "Large") {
        multiplier = 1.5;
      }
      const totalPrice = price * multiplier * quantity;
      priceElement.textContent = "Rp " + totalPrice.toLocaleString("id-ID");
      priceElement.setAttribute("priceValue", totalPrice);
    };
    sizeSelect.addEventListener("change", calculateTotalPrice);
    calculateTotalPrice();
  } else {
    const totalPrice = price * quantity;
    priceElement.textContent = "Rp " + totalPrice.toLocaleString("id-ID");
    priceElement.setAttribute("priceValue", totalPrice);
    // priceElement.setAttribute("value", totalPrice);
  }
}

function fadeOut(el) {
  el.style.opacity = 1;
  (function fade() {
    if ((el.style.opacity -= 0.08) < 0) {
      el.style.display = "none";
    } else {
      requestAnimationFrame(fade);
    }
  })();
}

function fadeIn(el, display) {
  el.style.opacity = 0;
  el.style.display = display || "block";
  (function fade() {
    var val = parseFloat(el.style.opacity);
    if (!((val += 0.08) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
}

// Cart and Payment System
document.addEventListener("DOMContentLoaded", function () {
  // Initialize cart data
  window.cartData = {
    items: [],
    pickupMethod: "Dine In",
    paymentMethod: "Bayar Sekarang",
    paymentType: "tunai",
  };

  // Load cart items from localStorage
  loadCartItems();

  // Setup payment method dropdown
  const paymentDropbtn = document.getElementById("payment-dropbtn");
  const paymentDropdownContent = document.getElementById("payment-dropdown-content");
  const payNowSection = document.getElementById("pay-now");
  const payLaterSection = document.getElementById("pay-later");

  paymentDropdownContent.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const value = this.getAttribute("data-value");
      paymentDropbtn.textContent = value;
      window.cartData.paymentMethod = value;

      // Show/hide payment sections
      if (value === "Bayar Sekarang") {
        payNowSection.style.display = "block";
        payLaterSection.style.display = "none";
      } else {
        payNowSection.style.display = "none";
        payLaterSection.style.display = "block";
        // Set payment due date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        document.getElementById("payment-due-date").textContent = dueDate.toLocaleDateString("id-ID");
      }
    });
  });

  // Setup payment type radio buttons
  document.querySelectorAll('input[name="payment-type"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      const tunaiDetails = document.getElementById("tunai-details");
      const transferDetails = document.getElementById("transfer-details");

      if (this.value === "tunai") {
        tunaiDetails.style.display = "block";
        transferDetails.style.display = "none";
      } else {
        tunaiDetails.style.display = "none";
        transferDetails.style.display = "block";
      }

      window.cartData.paymentType = this.value;
    });
  });

  // Calculate change for cash payment
  const cashAmountInput = document.getElementById("cash-amount");
  if (cashAmountInput) {
    cashAmountInput.addEventListener("input", function () {
      const total = calculateTotal();
      const cashAmount = parseFloat(this.value) || 0;
      const change = cashAmount - total;
      const changeAmount = document.getElementById("change-amount");
      if (change >= 0) {
        changeAmount.textContent = `Rp ${change.toLocaleString("id-ID")}`;
        changeAmount.style.color = "#4CAF50";
      } else {
        changeAmount.textContent = `Rp 0`;
        changeAmount.style.color = "#ff0000";
      }
    });
  }

  // Checkout button handler
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (!validateCheckout()) {
        return;
      }

      // Process checkout based on payment method
      if (window.cartData.paymentMethod === "Bayar Sekarang") {
        processPayNow();
      } else {
        processPayLater();
      }
    });
  }
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

// Update item quantity
function updateQuantity(itemName, change) {
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const itemIndex = cartItems.findIndex((item) => item.name === itemName);

  if (itemIndex !== -1) {
    cartItems[itemIndex].quantity += change;
    if (cartItems[itemIndex].quantity <= 0) {
      cartItems.splice(itemIndex, 1);
    }
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    loadCartItems();
  }
}

// Calculate total
function calculateTotal() {
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  return cartItems.reduce((total, item) => {
    const price = parseInt(item.originalPrice) || parseInt(item.price.replace(/[^0-9]/g, ""));
    return total + price * item.quantity;
  }, 0);
}

// Update cart summary
function updateCartSummary() {
  const total = calculateTotal();
  document.getElementById("subtotal").textContent = `Rp ${total.toLocaleString("id-ID")}`;
  document.getElementById("total-price").textContent = `Rp ${total.toLocaleString("id-ID")}`;

  // Update change amount if cash amount is already input
  const cashAmount = parseFloat(document.getElementById("cash-amount").value) || 0;
  const change = cashAmount - total;
  const changeAmount = document.getElementById("change-amount");
  if (change >= 0) {
    changeAmount.textContent = `Rp ${change.toLocaleString("id-ID")}`;
    changeAmount.style.color = "#4CAF50";
  } else {
    changeAmount.textContent = `Rp 0`;
    changeAmount.style.color = "#ff0000";
  }
}

// Validate checkout
function validateCheckout() {
  if (window.cartData.paymentMethod === "Bayar Sekarang") {
    if (window.cartData.paymentType === "tunai") {
      const cashAmount = parseFloat(document.getElementById("cash-amount").value) || 0;
      if (cashAmount < calculateTotal()) {
        alert("Jumlah uang tidak mencukupi");
        return false;
      }
    } else {
      const transferProof = document.getElementById("transfer-proof").files[0];
      if (!transferProof) {
        alert("Silakan upload bukti transfer");
        return false;
      }
    }
  } else {
    const studentName = document.getElementById("student-name").value;
    const studentClass = document.getElementById("student-class").value;
    const studentDorm = document.getElementById("student-dorm").value;
    const parentPhone = document.getElementById("parent-phone").value;

    if (!studentName || !studentClass || !studentDorm || !parentPhone) {
      alert("Silakan lengkapi data santri");
      return false;
    }
  }
  return true;
}

// Process pay now
function processPayNow() {
  // Here you would typically send the order to your backend
  alert("Pesanan berhasil! Silakan ambil barang Anda.");
  localStorage.removeItem("cartItems");
  window.location.reload();
}

// Process pay later
function processPayLater() {
  const studentData = {
    name: document.getElementById("student-name").value,
    class: document.getElementById("student-class").value,
    dorm: document.getElementById("student-dorm").value,
    parentPhone: document.getElementById("parent-phone").value,
    dueDate: document.getElementById("payment-due-date").textContent,
  };

  // Here you would typically send the order to your backend
  alert(`Pesanan berhasil! Silakan bayar sebelum ${studentData.dueDate}`);
  localStorage.removeItem("cartItems");
  window.location.reload();
}
