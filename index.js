const API_URL = "https://azizbek1-dexora.hf.space/api/predict";

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
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [message] })
    });
    
    if (!response.ok) throw new Error("Tarmoq xatosi");
    
    const result = await response.json();
    
    if (result && result.data && result.data.length > 0) {
      botDiv.textContent = result.data[0];
    } else {
      botDiv.textContent = "Javob olinmadi.";
    }
  } catch (error) {
    botDiv.textContent = "Aloqa yo'q. Iltimos, qayta urinib ko'ring.";
    botDiv.style.color = "#ef4444";
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    chat.scrollTop = chat.scrollHeight;
  }
});