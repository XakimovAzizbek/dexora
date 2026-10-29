// Gradio'ning rasmiy mijozini yuklaymiz
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

// Hugging Face'dagi Space manzili (Faqat username/space_nomi)
const SPACE_NAME = "azizbek1/dexora"; 

const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

let client = null;
let isConnected = false;

// Ulanish funksiyasi
async function connectToDexora() {
  try {
    // Server uxlab yotgan bo'lsa, bu qator uni uyg'otadi
    client = await Client.connect(SPACE_NAME);
    isConnected = true;
    console.log("Dexora serveriga muvaffaqiyatli ulandik!");
  } catch (err) {
    console.error("Ulanishda xato:", err);
    isConnected = false;
  }
}

// Xabarni ekranga chiqarish
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

// Forma yuborilganda
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const message = input.value.trim();
  if (!message) return;

  // 1. Foydalanuvchi xabarini chiqarish
  addMessage("user", message);
  input.value = "";
  input.disabled = true;
  sendBtn.disabled = true;

  // 2. Bot yozmoqda animatsiyasi
  const botDiv = addMessage("bot", "...");

  try {
    // Agar oldin ulanmagan bo'lsak, hozir ulanamiz
    if (!isConnected) {
      botDiv.textContent = "Server uyg'onmoqda, kuting...";
      await connectToDexora();
    }

    if (isConnected && client) {
      botDiv.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
      
      // Gradio'ga so'rov yuborish (/predict - bu standart API manzili)
      const result = await client.predict("/predict", [message]);
      
      // Javobni olish
      if (result && result.data && result.data.length > 0) {
        botDiv.textContent = result.data[0];
      } else {
        botDiv.textContent = "Javob bo'sh keldi.";
      }
    } else {
      throw new Error("Server bilan aloqa yo'q");
    }

  } catch (error) {
    console.error(error);
    botDiv.textContent = "Server uyg'onishda xato berdi. Iltimos, 10 soniya kutib qayta urining.";
    botDiv.style.color = "#ef4444";
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    chat.scrollTop = chat.scrollHeight;
  }
});

// Sayt ochilishi bilan orqa fonda serverga ulanib qo'yamiz (uxlab qolmasligi uchun)
connectToDexora();