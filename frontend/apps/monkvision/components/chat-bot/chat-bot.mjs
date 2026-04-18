/**
 * chatbot - AI Assistant chat component for Monkvision.
 * (C) 2024 TekMonks. All rights reserved.
 */
import {apimanager as apiman} from "/framework/js/apimanager.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const CHATBOT_API = `${APP_CONSTANTS.API_PATH}/chatbot`;
const MAX_HISTORY = 20;
const WELCOME_MESSAGE = `Hi! How can I help you today?\n\nI can help you understand alerts, diagnose incidents, and suggest recovery actions.`;

async function elementRendered(element, initialRender) {
    // Block framework auto-refresh from wiping the chat — only wire up on first render
    if (!initialRender) return;

    const shadowRoot = chatbot.getShadowRootByHost(element);
    const input    = shadowRoot.getElementById("chatbot-input");
    const sendBtn  = shadowRoot.getElementById("chatbot-send");
    const clearBtn = shadowRoot.getElementById("chatbot-clear");

    input.addEventListener("input", () => _autoResize(input));
    input.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); _send(shadowRoot); }
    });
    sendBtn.addEventListener("click", () => _send(shadowRoot));
    clearBtn.addEventListener("click", () => _clear(shadowRoot));

    _appendMessage(shadowRoot, "assistant", WELCOME_MESSAGE);
}

async function _send(shadowRoot) {
    const input   = shadowRoot.getElementById("chatbot-input");
    const sendBtn = shadowRoot.getElementById("chatbot-send");
    const message = input.value.trim();
    if (!message) return;

    input.value = "";
    input.style.height = "auto";
    sendBtn.disabled = true;

    _appendMessage(shadowRoot, "user", message);
    const thinkingBubble = _appendMessage(shadowRoot, "assistant", "Thinking...", true);

    // Get or initialise session from component memory
    const memory = chatbot.getMemory(shadowRoot.host.id);
    if (!memory.session) memory.session = { chatHistory: [], phase: "idle", shownAlerts: [] };

    try {
        const resp = await apiman.rest(CHATBOT_API, "POST", { message, session: memory.session }, true, false);
        const reply = (resp && resp.result && resp.reply) ? resp.reply : "Sorry, I could not process that.";

        thinkingBubble.parentElement.classList.remove("thinking");
        thinkingBubble.innerHTML = _renderMarkdown(reply);

        // Save updated session back from backend response
        if (resp && resp.session) memory.session = resp.session;

        // Keep chatHistory bounded to MAX_HISTORY (backend also enforces this,
        // but guard here too in case of stale session)
        if (memory.session.chatHistory && memory.session.chatHistory.length > MAX_HISTORY)
            memory.session.chatHistory = memory.session.chatHistory.slice(-MAX_HISTORY);

    } catch (e) {
        thinkingBubble.parentElement.classList.remove("thinking");
        thinkingBubble.textContent = "Error: could not reach the assistant.";
    }

    sendBtn.disabled = false;
    shadowRoot.getElementById("chatbot-messages").scrollTop = 999999;
    input.focus();
}

function _appendMessage(shadowRoot, role, text, isThinking) {
    const feed    = shadowRoot.getElementById("chatbot-messages");
    const wrapper = document.createElement("div");
    wrapper.className = "chat-msg " + role + (isThinking ? " thinking" : "");
    const label = document.createElement("div");
    label.className = "chat-label";
    label.textContent = role === "user" ? "You" : "Assistant";
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.innerHTML = _renderMarkdown(text);
    wrapper.appendChild(label);
    wrapper.appendChild(bubble);
    feed.appendChild(wrapper);
    feed.scrollTop = feed.scrollHeight;
    return bubble;
}

function _clear(shadowRoot) {
    // Reset full session — new chat starts completely fresh
    chatbot.getMemory(shadowRoot.host.id).session = { chatHistory: [], phase: "idle", shownAlerts: [] };
    shadowRoot.getElementById("chatbot-messages").innerHTML = "";
    _appendMessage(shadowRoot, "assistant", WELCOME_MESSAGE);
    shadowRoot.getElementById("chatbot-input").focus();
}

function _renderMarkdown(text) {
    return text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/((?:^- .+$\n?)+)/gm, block =>
            "<ul>" + block.replace(/^- (.+)$/gm, "<li>$1</li>") + "</ul>")
        .replace(/\n/g, "<br>");
}

function _autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
}

export const chatbot = {trueWebComponentMode: true, elementRendered};
monkshu_component.register("chatbot-box", `${APP_CONSTANTS.APP_PATH}/components/chatbot/chatbot.html`, chatbot);