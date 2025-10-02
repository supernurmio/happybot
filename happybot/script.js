// ==================== HappyBot Ultimate Advanced Script.js ====================
// English-speaking, intelligent, fun, mini-games, fuzzy matching, auto-scroll input at bottom
// ============================================================================

// ---------------- Helper: safe DOM creation ----------------
function ensureElement(id, tag = "div", parent = document.body, props = {}) {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement(tag);
        el.id = id;
        Object.assign(el, props);
        parent.appendChild(el);
    }
    return el;
}

// ---------------- UI Setup ----------------
const wrapper = ensureElement("happybot-wrapper", "div");
wrapper.style.display = "flex";
wrapper.style.flexDirection = "column";
wrapper.style.justifyContent = "space-between";
wrapper.style.height = "90vh";
wrapper.style.maxWidth = "700px";
wrapper.style.margin = "0 auto";
wrapper.style.fontFamily = "Inter, Arial, sans-serif";
wrapper.style.border = "1px solid #ccc";
wrapper.style.borderRadius = "12px";
wrapper.style.overflow = "hidden";
wrapper.style.background = "#f7f9ff";
wrapper.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";

const header = ensureElement("happybot-header", "div", wrapper);
header.innerHTML = "<h2 style='margin:6px 12px;'>🤖 HappyBot Ultimate</h2>";
header.style.background = "#4CAF50";
header.style.color = "#fff";
header.style.padding = "8px";
header.style.borderBottom = "1px solid #388E3C";

const chatBox = ensureElement("chat-container", "div", wrapper);
chatBox.style.flex = "1";
chatBox.style.overflowY = "auto";
chatBox.style.padding = "12px";
chatBox.style.display = "flex";
chatBox.style.flexDirection = "column";
chatBox.style.gap = "6px";
chatBox.style.background = "#ffffff";

const controls = ensureElement("happybot-controls", "div", wrapper);
controls.style.display = "flex";
controls.style.borderTop = "1px solid #ddd";
controls.style.padding = "8px";
controls.style.background = "#f1f1f1";

const inputEl = ensureElement("user-input", "input", controls, { type: "text", placeholder: "Type your message..." });
inputEl.style.flex = "1";
inputEl.style.padding = "10px";
inputEl.style.borderRadius = "8px";
inputEl.style.border = "1px solid #ccc";
inputEl.style.marginRight = "8px";

const sendBtn = ensureElement("send-btn", "button", controls);
sendBtn.textContent = "Send";
sendBtn.style.padding = "10px 16px";
sendBtn.style.borderRadius = "8px";
sendBtn.style.border = "none";
sendBtn.style.background = "#4CAF50";
sendBtn.style.color = "white";
sendBtn.style.cursor = "pointer";

// ---------------- Local storage settings ----------------
const SETTINGS_KEY = "happybot_ultimate_settings_v2";
function loadSettings() {
    try {
        const s = localStorage.getItem(SETTINGS_KEY);
        if (s) return JSON.parse(s);
    } catch (e) {}
    return { username: "Friend", theme: "light", fontSize: "16px" };
}
function saveSettings(s) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch(e) {}
}
let settings = loadSettings();

// ---------------- Apply Settings ----------------
function applySettings(s) {
    document.body.style.background = s.theme === "dark" ? "#121212" : "#f5f7fb";
    document.body.style.color = s.theme === "dark" ? "#eee" : "#111";
    chatBox.style.background = s.theme === "dark" ? "#1b1b1b" : "#fff";
    chatBox.style.color = s.theme === "dark" ? "#eee" : "#111";
    chatBox.style.fontSize = s.fontSize || "16px";
    inputEl.style.fontSize = s.fontSize || "16px";
}
applySettings(settings);

// ---------------- Context ----------------
let context = {
    username: settings.username,
    lastEmotion: null,
    currentGame: null,
    currentAnswer: null,
    lastMessages: []
};

// ---------------- Responses ----------------
const responses = {
    greetings: [
        "Hello! 😄 How are you today?",
        "Hey! 👋 Good to see you!",
        "Hi there! 😎 Ready to chat?",
        "Yo! 🌸 What's up?",
        "Greetings! 😁 How's your mood?"
    ],
    sadness: [
        "I hear you 💛 It's okay to feel sad.",
        "Take your time — I'm listening.",
        "Want to talk about it? I'm here for you.",
        "Even tough days end 💛 You're not alone."
    ],
    happiness: [
        "Yay! 😄 That’s great!",
        "Amazing! 😎 Tell me more!",
        "Love to hear that 😁",
        "Fantastic! Want to celebrate with a joke?"
    ],
    anger: [
        "I understand 💛 Let's take a deep breath together.",
        "Anger is natural. Want to vent or try a fun distraction?",
        "Whoa 😅 Let's stay calm together."
    ],
    boredom: [
        "Feeling bored? 😅 We can play a mini-game!",
        "How about a riddle or number guessing?",
        "I have some fun challenges — pick one!"
    ],
    stress: [
        "Take a deep breath with me: in... out... 💨",
        "Small steps — one thing at a time!",
        "Want a quick relaxation exercise or fun distraction?"
    ],
    calm: [
        "Nice! Calm moments are precious 🌸",
        "Feeling relaxed 😄 Want a fun fact?",
        "Peaceful vibes — shall we chat about something light?"
    ],
    confusion: [
        "Hmm 😅 Can you explain that differently?",
        "Not sure I understand — help me out?",
        "I’m a bit confused by that 🤔"
    ],
    threats: [
        "Let's stay safe — I’m here to help.",
        "Whoa — I care about you, let’s stay friendly.",
        "If you're upset, I can listen — but no harm talk."
    ],
    yesNo: [
        "Yes! 😄 Great!",
        "No worries, that's fine 👍",
        "Sure thing! 💛",
        "Okay — we can pause if needed"
    ],
    jokes: [
        "Why did the computer get cold? It left its Windows open! 😄",
        "What do you call fake spaghetti? An impasta! 🍝",
        "I told a joke to a robot once — it short-circuited 🤖😂"
    ],
    unknown: [
        "Sorry, I don’t understand 😅 Can you try another phrase?",
        "Haha 😄 That’s new — tell me more!",
        "Hmm interesting 🤔 Can you explain?"
    ],
    fallback: [
        "Bloop bloop 🤖 I need more info!",
        "HappyBot is dancing 🕺 Tell me more!",
        "🤖 Beep bop — that's puzzling!"
    ]
};

// ---------------- Keywords ----------------
const keywords = {
    greetings: ["hi","hello","hey","yo","sup","hoi","hallo"],
    sadness: ["sad","unhappy","depressed","down","lonely","cry","miserable","hurt"],
    happiness: ["happy","excited","joy","glad","love","smile","good","cheerful"],
    anger: ["angry","mad","furious","upset","hate","boos","irritated"],
    boredom: ["bored","meh","nothing","dull","tired","verveeld","saai"],
    stress: ["stressed","anxious","worried","panic","druk","overwhelmed"],
    calm: ["calm","relaxed","peaceful","ok","fine","chill","rustig"],
    confusion: ["confused","huh","what","idk","unsure"],
    threats: ["kill","die","stupid","hate you","idiot","fok","fuck"],
    yesNo: ["yes","yeah","yep","sure","ok","no","nope","nah","ja","nee"],
    jokes: ["joke","funny","lol","mop","grap"]
};

// ---------------- Mini-Games ----------------
const miniGames = [
    { id:"riddle", name:"Riddle", question:"I speak without a mouth and hear without ears. What am I?", answer:"echo" },
    { id:"math", name:"Math", question:"What is 15 + 27?", answer:"42" },
    { id:"rabbit", name:"Guess Animal", question:"I am small, fluffy, and hop around. What am I?", answer:"rabbit" },
    { id:"num", name:"Number Guess", question:"Guess a number between 1 and 10 🎲", answer: (Math.floor(Math.random()*10)+1).toString() },
    { id:"rps", name:"Rock Paper Scissors", question:"Type 'rock', 'paper' or 'scissors' ✊✋✌️", answer: null }
];

// ---------------- Helpers ----------------
function pushHistory(role,text){ context.lastMessages.push({role,text,time:Date.now()}); if(context.lastMessages.length>200) context.lastMessages.shift();}
function normalizeText(t){ return t.toLowerCase().replace(/[^\w\s\p{L}]/gu," ").trim(); }
function scrollChat(){ chatBox.scrollTop = chatBox.scrollHeight; }

function createMessageEl(text,cls="bot"){
    const el=document.createElement("div");
    el.className=cls==="bot"?"happybot-msg bot":"happybot-msg user";
    el.style.padding="8px 12px"; el.style.borderRadius="12px"; el.style.maxWidth="80%";
    el.style.lineHeight="1.3"; el.style.wordWrap="break-word"; el.style.margin="4px 0";
    if(cls==="bot"){ el.style.background=settings.theme==="dark"?"#263238":"#f1f8ff"; el.style.color=settings.theme==="dark"?"#fff":"#111"; el.style.alignSelf="flex-start"; }
    else{ el.style.background="#dff7df"; el.style.color="#043"; el.style.alignSelf="flex-end"; el.style.textAlign="right";}
    el.textContent=text; return el;
}
function appendUserMessage(text){ pushHistory("user",text); chatBox.appendChild(createMessageEl(`${context.username}: ${text}`,"user")); scrollChat();}
function appendBotMessage(text){ pushHistory("bot",text); chatBox.appendChild(createMessageEl(text,"bot")); scrollChat();}

// ---------------- Keyword matching ----------------
function findCategoryForText(text){
    const norm=normalizeText(text);
    for(const cat of Object.keys(keywords)){
        for(const key of keywords[cat]){
            if(norm.includes(key.toLowerCase())) return cat;
        }
    }
    return null;
}

// ---------------- Game logic ----------------
function startRandomGame(){
    const game=miniGames[Math.floor(Math.random()*miniGames.length)];
    context.currentGame=game;
    if(game.id==="num"){ game.answer=(Math.floor(Math.random()*10)+1).toString(); context.currentAnswer=game.answer;}
    else context.currentAnswer=game.answer?String(game.answer).toLowerCase():null;
    appendBotMessage(`🎮 Mini-Game: ${game.name} — ${game.question}`);
}
function handleGameAnswer(text){
    if(!context.currentGame) return false;
    const game=context.currentGame;
    const norm=normalizeText(text);
    if(game.id==="rps"){
        const choices=["rock","paper","scissors"];
        if(!choices.includes(norm)){ appendBotMessage("Please type 'rock', 'paper' or 'scissors'."); return true;}
        const botChoice=choices[Math.floor(Math.random()*choices.length)];
        if(botChoice===norm) appendBotMessage(`I chose ${botChoice} — it's a tie!`);
        else if((norm==="rock"&&botChoice==="scissors")||(norm==="paper"&&botChoice==="rock")||(norm==="scissors"&&botChoice==="paper")) appendBotMessage(`I chose ${botChoice} — you win! 🎉`);
        else appendBotMessage(`I chose ${botChoice} — I win 😎`);
        context.currentGame=null; context.currentAnswer=null; return true;
    }
    if(context.currentAnswer&&norm.includes(context.currentAnswer)){ appendBotMessage("🎉 Correct! You got it right!"); context.currentGame=null; context.currentAnswer=null; return true;}
    else{ appendBotMessage("🤔 Not yet — try again or type 'skip'."); return true;}
}

// ---------------- Response generation ----------------
function generateResponseForText(text){
    const norm=normalizeText(text);
    if(keywords["threats"].some(k=>norm.includes(k))){ appendBotMessage("Let's stay safe — I'm here to help."); return;}
    const cat=findCategoryForText(text);
    if(cat){
        if(cat==="boredom"){ appendBotMessage(responses.boredom[Math.floor(Math.random()*responses.boredom.length)]); setTimeout(startRandomGame,600); return;}
        if(cat==="jokes"){ appendBotMessage(responses.jokes[Math.floor(Math.random()*responses.jokes.length)]); return;}
        if(cat==="yesNo"){ appendBotMessage(responses.yesNo[Math.floor(Math.random()*responses.yesNo.length)]); return;}
        appendBotMessage(responses[cat][Math.floor(Math.random()*responses[cat].length)]);
        context.lastEmotion=cat;
        return;
    }
    if(Math.random()>0.6) appendBotMessage(responses.fallback[Math.floor(Math.random()*responses.fallback.length)]);
    else appendBotMessage(responses.unknown[Math.floor(Math.random()*responses.unknown.length)]);
}

// ---------------- Input handler ----------------
let lastSentAt=0;
function handleUserInput(raw){
    const text=(raw||"").trim();
    if(!text) return;
    const now=Date.now(); if(now-lastSentAt<250) return; lastSentAt=now;
    appendUserMessage(text); inputEl.value="";
    if(context.currentGame){ if(normalizeText(text)==="skip"||normalizeText(text)==="s"){ appendBotMessage("Game skipped."); context.currentGame=null; context.currentAnswer=null; return;}
        if(handleGameAnswer(text)) return;
    }
    generateResponseForText(text);
}

// ---------------- Events ----------------
sendBtn.addEventListener("click",()=>handleUserInput(inputEl.value));
inputEl.addEventListener("keypress",(e)=>{ if(e.key==="Enter"){ e.preventDefault(); handleUserInput(inputEl.value);}});

// ---------------- Random fun interactions ----------------
function maybeRandomInteraction(){
    if(context.currentGame) return;
    if(Math.random()>0.85){ const fun=["🌸 Fun fact: Honey never spoils!","🎵 Hum your favorite song for 30 seconds!","😂 Tiny joke: ask 'joke'!","📚 Quote: 'Small steps every day!'"]; appendBotMessage(fun[Math.floor(Math.random()*fun.length)]);}
}
setInterval(maybeRandomInteraction,30000);

// ---------------- Init ----------------
function initHappyBot(){ appendBotMessage("Hi! I'm HappyBot Ultimate 😄 How are you feeling today?"); setTimeout(()=>appendBotMessage("Say 'bored' to play a mini-game, 'joke' for a laugh, or 'remember X is Y' to teach me something!"),1200);}
initHappyBot();

// ---------------- Expose helpers ----------------
window.HappyBot={ startRandomGame, getContext:()=>JSON.parse(JSON.stringify(context)), setUsername:(name)=>{ settings.username=name; saveSettings(settings); context.username=name;} };
// --- Drawing Pad ---
const canvas = document.getElementById("draw-canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let colorPicker = document.getElementById("color-picker");
let sizePicker = document.getElementById("size-picker");

// Pen style
ctx.lineJoin = "round";
ctx.lineCap = "round";

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("mousemove", draw);

function draw(event) {
    if (!drawing) return;

    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = sizePicker.value;

    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}



