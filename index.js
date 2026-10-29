// Space manzilingiz (Oxirida qiya chiziq / bo'lmasin)
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
    // Timeout qo'shamiz, chunki ZeroGPU uyg'onishi 30 soniya olishi mumkin
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 soniya kutadi

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        data: [message],
        fn_index: 0 // Gradio'dagi standart funksiya indeksi
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`Server xatosi: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result && result.data && result.data.length > 0) {
      botDiv.textContent = result.data[0];
    } else {
      botDiv.textContent = "Javob olinmadi.";
    }
  } catch (error) {
    console.error(error);
    if (error.name === 'AbortError') {
        botDiv.textContent = "Server juda uzoq uyg'ondi. Iltimos qayta yuboring.";
    } else {
        botDiv.textContent = "Xato: " + error.message;
    }
    botDiv.style.color = "#ef4444";
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    chat.scrollTop = chat.scrollHeight;
  }
});