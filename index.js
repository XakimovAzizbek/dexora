import * as webllm from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm";

const $ = (id) => document.getElementById(id);
const chat = $("chat"), input = $("input"), send = $("send"), status = $("status");
const SYSTEM = "Sen Dexora ismli AI yordamchisan. Foydalanuvchi qaysi tilda yozsa, shu tilda javob ber. O'zbekcha yozilganda sodda, to'g'ri o'zbek tilida (lotin yozuvi) javob ber. Qisqa va aniq bo'l.";
let engine = null, busy = false;
const history = [{ role: "system", content: SYSTEM }];

if (!navigator.gpu) {
  status.textContent = "Bu qurilmada WebGPU yo'q. Yangi Android Chrome'da oching.";
  $("load").disabled = true;
} else {
  status.textContent = "WebGPU bor. Modelni tanlab yuklang.";
}

$("load").onclick = async () => {
  $("load").disabled = true; $("model").disabled = true; $("bar").hidden = false;
  try {
    engine = await webllm.CreateMLCEngine($("model").value, {
      initProgressCallback: (p) => {
        $("fill").style.width = Math.round(p.progress * 100) + "%";
        status.textContent = p.text;
      },
    });
    status.textContent = "Model tayyor. Savol bering.";
    $("bar").hidden = true; $("tests").hidden = false;
    input.disabled = false; send.disabled = false; input.focus();
  } catch (e) {
    status.textContent = "Yuklashda xato: " + e.message;
    $("load").disabled = false; $("model").disabled = false;
  }
};

function add(role, text) {
  const d = document.createElement("div");
  d.className = "msg " + role; d.textContent = text;
  chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
  return d;
}

async function ask(q) {
  if (!engine || busy || !q) return;
  busy = true; send.disabled = true;
  add("user", q); history.push({ role: "user", content: q });
  const out = add("bot", "...");
  let full = "";
  try {
    const stream = await engine.chat.completions.create({
      messages: history, stream: true, temperature: 0.6, max_tokens: 400,
    });
    for await (const c of stream) {
      full += c.choices[0]?.delta?.content || "";
      out.textContent = full; chat.scrollTop = chat.scrollHeight;
    }
    history.push({ role: "assistant", content: full });
  } catch (e) { out.textContent = "Xato: " + e.message; }
  busy = false; send.disabled = false;
}

$("form").onsubmit = (e) => { e.preventDefault(); const q = input.value.trim(); input.value = ""; ask(q); };
$("tests").onclick = (e) => { if (e.target.dataset.q) ask(e.target.dataset.q); };
