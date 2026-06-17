const key = "carmen-balloon-one-shot-v2";
const balloon = document.querySelector("#balloon");
const message = document.querySelector("#message .big");
const reset = document.querySelector("#reset");

function showFailed() {
  document.body.classList.add("failed");
  balloon.querySelector(".face").textContent = "😵";
  message.textContent = "Blocked. Balloon survived. Carmen failed. Buy me a drink for another try 🍹";
}

if (localStorage.getItem(key) === "failed") {
  showFailed();
}

balloon.addEventListener("click", () => {
  if (localStorage.getItem(key) === "failed") return;
  localStorage.setItem(key, "failed");
  showFailed();
});

reset.addEventListener("click", () => {
  localStorage.removeItem(key);
  document.body.classList.remove("failed");
  balloon.querySelector(".face").textContent = "😌";
  message.textContent = "Balloon intact. Destiny pending.";
});
