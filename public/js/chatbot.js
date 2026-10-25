/**
 * VentureBot – AI eCommerce Advisor Widget
 * Powered by Groq · Injected via footer.php
 * Zero interference with existing VentureIQ code.
 */
(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────
 const API_URL = window.VENTUREBOT_API || '/ventureiq/public/api/chatbot.php';

  const SUGGESTED = [
    '📋 What documents do I need to start?',
    '🏪 How to register on Flipkart/Amazon?',
    '💰 What is GST registration process?',
    '🚀 How to start with ₹10,000 budget?',
    '📦 How to find product suppliers?',
    '🔒 Do I need trademark registration?',
  ];

  // ── Inject Styles ────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* VentureBot Widget – scoped with vb- prefix */
    #vb-toggle {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      width: 58px; height: 58px; border-radius: 50%;
      background: var(--grad-main, linear-gradient(135deg,#7c6dfa,#4f9fff));
      border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(124,109,250,.5);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    #vb-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(124,109,250,.7); }
    #vb-toggle svg { width:26px; height:26px; }

    #vb-bubble {
      position: fixed; bottom: 100px; right: 28px; z-index: 9998;
      width: 370px; max-height: 580px;
      display: flex; flex-direction: column;
      background: var(--bg2, #0f0f1a);
      border: 1px solid var(--border2, rgba(255,255,255,.14));
      border-radius: 20px; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,.6);
      transform: scale(0); transform-origin: bottom right;
      transition: transform .25s cubic-bezier(.4,0,.2,1), opacity .25s;
      opacity: 0; pointer-events: none;
    }
    #vb-bubble.vb-open {
      transform: scale(1); opacity: 1; pointer-events: all;
    }
    @media(max-width:480px){
      #vb-bubble { width: calc(100vw - 24px); right: 12px; bottom: 90px; }
    }

    .vb-header {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px; border-bottom: 1px solid var(--border, rgba(255,255,255,.07));
      background: var(--bg3, #141420);
    }
    .vb-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--grad-main, linear-gradient(135deg,#7c6dfa,#4f9fff));
      display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink:0;
    }
    .vb-header-text h4 { font-size: .9rem; color: var(--text,#f0f0f9); margin:0; font-weight:600; }
    .vb-header-text p  { font-size: .72rem; color: var(--cyan,#00d4aa); margin:0; }
    .vb-close {
      margin-left:auto; background:none; border:none; cursor:pointer;
      color:var(--text2,#9898b8); font-size:1.2rem; padding:4px; line-height:1;
    }
    .vb-close:hover { color:var(--text,#f0f0f9); }

    .vb-messages {
      flex:1; overflow-y:auto; padding:14px 12px; display:flex;
      flex-direction:column; gap:10px; min-height:200px; max-height:340px;
    }
    .vb-messages::-webkit-scrollbar { width:4px; }
    .vb-messages::-webkit-scrollbar-track { background:transparent; }
    .vb-messages::-webkit-scrollbar-thumb { background:var(--bg5,#1e1e35); border-radius:4px; }

    .vb-msg { display:flex; gap:8px; align-items:flex-end; max-width:90%; }
    .vb-msg.vb-user  { align-self:flex-end; flex-direction:row-reverse; }
    .vb-msg.vb-bot   { align-self:flex-start; }
    .vb-msg-icon { width:28px; height:28px; border-radius:50%; flex-shrink:0;
      background:var(--grad-main,linear-gradient(135deg,#7c6dfa,#4f9fff));
      display:flex; align-items:center; justify-content:center; font-size:14px; }
    .vb-msg-icon.vb-user-icon { background:var(--bg5,#1e1e35); }
    .vb-bubble-text {
      padding: 9px 13px; border-radius: 14px; font-size:.82rem;
      line-height:1.5; color:var(--text,#f0f0f9);
    }
    .vb-bot  .vb-bubble-text { background:var(--bg4,#1a1a2e); border-bottom-left-radius:4px; }
    .vb-user .vb-bubble-text {
      background:var(--grad-main,linear-gradient(135deg,#7c6dfa,#4f9fff));
      color:#fff; border-bottom-right-radius:4px;
    }
    .vb-bubble-text ul { padding-left:16px; margin:4px 0; }
    .vb-bubble-text li { margin:2px 0; }
    .vb-bubble-text strong { color:var(--purple3,#c4b8ff); }
    .vb-bubble-text code { background:var(--bg5,#1e1e35); padding:1px 5px; border-radius:4px; font-size:.78rem; }

    .vb-typing { display:flex; gap:4px; align-items:center; padding:10px 14px; }
    .vb-typing span {
      width:7px; height:7px; border-radius:50%;
      background:var(--purple,#7c6dfa); animation: vbdot 1.2s infinite;
    }
    .vb-typing span:nth-child(2) { animation-delay:.2s; }
    .vb-typing span:nth-child(3) { animation-delay:.4s; }
    @keyframes vbdot { 0%,80%,100%{transform:scale(.8);opacity:.4} 40%{transform:scale(1.1);opacity:1} }

    .vb-suggestions {
      display:flex; flex-wrap:wrap; gap:6px; padding:8px 12px 4px;
    }
    .vb-suggestion {
      font-size:.72rem; padding:5px 10px; border-radius:20px;
      background:var(--bg4,#1a1a2e); border:1px solid var(--border2,rgba(255,255,255,.14));
      color:var(--text2,#9898b8); cursor:pointer; transition:all .18s;
      white-space:nowrap;
    }
    .vb-suggestion:hover { background:var(--bg5,#1e1e35); color:var(--purple2,#9b8dff); border-color:var(--purple,#7c6dfa); }

    .vb-input-area {
      display:flex; gap:8px; align-items:center;
      padding:10px 12px; border-top:1px solid var(--border,rgba(255,255,255,.07));
      background:var(--bg3,#141420);
    }
    .vb-input {
      flex:1; background:var(--bg4,#1a1a2e); border:1px solid var(--border2,rgba(255,255,255,.14));
      border-radius:10px; padding:9px 12px; color:var(--text,#f0f0f9); font-size:.82rem;
      outline:none; resize:none; font-family:inherit; line-height:1.4;
      transition:border-color .18s;
    }
    .vb-input::placeholder { color:var(--text3,#5a5a7a); }
    .vb-input:focus { border-color:var(--purple,#7c6dfa); }
    .vb-send {
      width:38px; height:38px; border-radius:10px; flex-shrink:0;
      background:var(--grad-main,linear-gradient(135deg,#7c6dfa,#4f9fff));
      border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
      transition:opacity .18s; color:#fff;
    }
    .vb-send:hover { opacity:.85; }
    .vb-send:disabled { opacity:.4; cursor:default; }
    .vb-send svg { width:16px; height:16px; }

    .vb-clear-btn {
      font-size:.68rem; color:var(--text3,#5a5a7a); background:none; border:none;
      cursor:pointer; padding:2px 4px; transition:color .15s;
    }
    .vb-clear-btn:hover { color:var(--red,#ff6b6b); }
  `;
  document.head.appendChild(style);

  // ── Build HTML ───────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- Toggle Button -->
    <button id="vb-toggle" title="Ask VentureBot" aria-label="Open VentureBot">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>

    <!-- Chat Bubble -->
    <div id="vb-bubble" role="dialog" aria-label="VentureBot chat">
      <div class="vb-header">
        <div class="vb-avatar">⚡</div>
        <div class="vb-header-text">
          <h4>VentureBot</h4>
          <p>🟢 eCommerce AI Advisor</p>
        </div>
        <button class="vb-close" id="vb-close" aria-label="Close chat">✕</button>
      </div>

      <div class="vb-messages" id="vb-messages"></div>

      <div class="vb-suggestions" id="vb-suggestions"></div>

      <div class="vb-input-area">
        <textarea
          class="vb-input" id="vb-input"
          rows="1" placeholder="Ask about starting your eCommerce business…"
          aria-label="Your message"
        ></textarea>
        <button class="vb-send" id="vb-send" aria-label="Send" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // ── State ────────────────────────────────────────────────────
  let history = [];   // [{role, content}]
  let isOpen  = false;
  let loading = false;

  const $ = id => document.getElementById(id);
  const toggle  = $('vb-toggle');
  const bubble  = $('vb-bubble');
  const closeBtn= $('vb-close');
  const msgs    = $('vb-messages');
  const input   = $('vb-input');
  const sendBtn = $('vb-send');
  const suggs   = $('vb-suggestions');

  // ── Suggestions ──────────────────────────────────────────────
  SUGGESTED.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'vb-suggestion';
    btn.textContent = text;
    btn.onclick = () => { input.value = text; sendMessage(); };
    suggs.appendChild(btn);
  });

  // ── Toggle open/close ────────────────────────────────────────
  function openChat() {
    isOpen = true;
    bubble.classList.add('vb-open');
    if (msgs.children.length === 0) addBotMessage(
      "👋 Hi! I'm **VentureBot**, your AI eCommerce advisor.\n\nI can help you with:\n- 📋 Legal documents & registrations\n- 🏪 Platform setup (Amazon, Flipkart, Shopify)\n- 💰 GST, business registration, licenses\n- 🚀 Starting on any budget\n\nWhat would you like to know?"
    );
    setTimeout(() => input.focus(), 100);
  }
  function closeChat() { isOpen = false; bubble.classList.remove('vb-open'); }

  toggle.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  // Close on outside click
  document.addEventListener('mousedown', e => {
    if (isOpen && !bubble.contains(e.target) && e.target !== toggle) closeChat();
  });

  // ── Render messages ──────────────────────────────────────────
  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n•\s/g, '\n• ')
      .replace(/\n- /g, '\n• ')
      .split('\n').map(line => {
        if (line.startsWith('• ')) return `<li>${line.slice(2)}</li>`;
        return line;
      }).join('\n')
      .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
      .replace(/\n/g, '<br>');
  }

  function addBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'vb-msg vb-bot';
    div.innerHTML = `
      <div class="vb-msg-icon">⚡</div>
      <div class="vb-bubble-text">${renderMarkdown(text)}</div>
    `;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'vb-msg vb-user';
    div.innerHTML = `
      <div class="vb-msg-icon vb-user-icon">👤</div>
      <div class="vb-bubble-text">${text.replace(/</g,'&lt;')}</div>
    `;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'vb-msg vb-bot'; div.id = 'vb-typing';
    div.innerHTML = `<div class="vb-msg-icon">⚡</div><div class="vb-bubble-text"><div class="vb-typing"><span></span><span></span><span></span></div></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function removeTyping() { const t = $('vb-typing'); if(t) t.remove(); }

  // ── Send message ─────────────────────────────────────────────
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || loading) return;

    loading = true;
    sendBtn.disabled = true;
    input.value = '';
    input.style.height = 'auto';
    suggs.style.display = 'none';

    addUserMessage(text);
    showTyping();

    history.push({ role: 'user', content: text });

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-10) })
      });
      const data = await res.json();
      removeTyping();

      if (data.error) {
        addBotMessage('⚠️ ' + data.error);
      } else {
        addBotMessage(data.reply);
        history.push({ role: 'assistant', content: data.reply });
      }
    } catch (err) {
      removeTyping();
      addBotMessage('⚠️ Network error. Please check your connection and try again.');
    }

    loading = false;
    sendBtn.disabled = false;
    input.focus();
  }

  // ── Input auto-resize & Enter key ───────────────────────────
  input.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    sendBtn.disabled = this.value.trim() === '';
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  sendBtn.addEventListener('click', sendMessage);

  // ── Clear chat ───────────────────────────────────────────────
  // Expose global clear for optional use: ventureBot.clear()
  window.ventureBot = {
    open:  openChat,
    close: closeChat,
    clear: () => { history = []; msgs.innerHTML = ''; openChat(); }
  };

})();