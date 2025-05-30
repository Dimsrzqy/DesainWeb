document.querySelector("button.submit").addEventListener("click", function () {
  var name = encodeURIComponent(document.querySelector(".name input").value);
  var email = encodeURIComponent(document.querySelector(".email input").value);
  var text = encodeURIComponent(document.querySelector(".msg textarea").value);
  var message = `Hello, Koperasi Nuris ${name}.%0A%0A${text}%0A%0ARegards, ${name}%0A%0A${email}`;
  var url = `https://api.whatsapp.com/send?phone=6285645819510&text=${message}`;
  window.open(url);
});
