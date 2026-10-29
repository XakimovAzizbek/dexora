import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  if (text === "...") {
    div.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  } else {
    div.textContent = text;
  }
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  addMessage("user", message);
  input.value = "";
  input.disabled = true;
  sendBtn.disabled = true;

  const botDiv = addMessage("bot", "...");

  try {
    // Serverga ulanish
    const app = await Client.connect("azizbek1/dexora");
    
    // MANA SHU YERDA /predict QILINDI
    const result = await app.predict("/predict", [message]);
    
    if (result && result.data && result.data.length > 0) {
      botDiv.textContent = result.data[0];
    } else {
      botDiv.textContent = "Javob bo'sh keldi.";
    }

  } catch (error) {
    console.error("To'liq xato:", error);
    botDiv.textContent = "Xato: " + error.message;
    botDiv.style.color = "#ef4444";
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    chat.scrollTop = chat.scrollHeight;
  }
});