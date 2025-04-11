!function(){"use strict";var o=/^sect(\d)$/,i=document.querySelector(".nav-container"),e=document.querySelector(".theme-toggle"),a=document.querySelector(".navbar-burger");a.addEventListener("click",function(e){if(a.classList.contains("is-active"))return u(e);v(e);var t=document.documentElement;t.classList.add("is-clipped--nav"),a.classList.add("is-active"),i.classList.add("is-active");var n=c.getBoundingClientRect(),e=window.innerHeight-Math.round(n.top);Math.round(n.height)!==e&&(c.style.height=e+"px");t.addEventListener("click",u)}),i.addEventListener("click",v),e.addEventListener("click",v);var c,r,s,l=i.querySelector("[data-panel=menu]");function t(){var e,t,n=window.location.hash;if(n&&(n.indexOf("%")&&(n=decodeURIComponent(n)),!(e=l.querySelector('.nav-link[href="'+n+'"]')))){n=document.getElementById(n.slice(1));if(n)for(var i=n,a=document.querySelector("article.doc");(i=i.parentNode)&&i!==a;){var c=i.id;if((c=!c&&(c=o.test(i.className))?(i.firstElementChild||{}).id:c)&&(e=l.querySelector('.nav-link[href="#'+c+'"]')))break}}if(e)t=e.parentNode;else{if(!s)return;e=(t=s).querySelector(".nav-link")}t!==r&&(m(l,".nav-item.is-active").forEach(function(e){e.classList.remove("is-active","is-current-path","is-current-page")}),t.classList.add("is-current-page"),d(r=t),p(l,e))}function d(e){for(var t,n=e.parentNode;!(t=n.classList).contains("nav-menu");)"LI"===n.tagName&&t.contains("nav-item")&&t.add("is-active","is-current-path"),n=n.parentNode;e.classList.add("is-active")}function n(){var e,t,n,i;this.classList.toggle("is-active")&&(e=parseFloat(window.getComputedStyle(this).marginTop),t=this.getBoundingClientRect(),n=l.getBoundingClientRect(),0<(i=(t.bottom-n.top-n.height+e).toFixed())&&(l.scrollTop+=Math.min((t.top-n.top-e).toFixed(),i)))}function u(e){v(e);e=document.documentElement;e.classList.remove("is-clipped--nav"),a.classList.remove("is-active"),i.classList.remove("is-active"),e.removeEventListener("click",u)}function v(e){e.stopPropagation()}function p(e,t){var n=e.getBoundingClientRect(),i=n.height,a=window.getComputedStyle(c);"sticky"===a.position&&(i-=n.top-parseFloat(a.top)),e.scrollTop=Math.max(0,.5*(t.getBoundingClientRect().height-i)+t.offsetTop)}function m(e,t){return[].slice.call(e.querySelectorAll(t))}l&&(e=i.querySelector("[data-panel=explore]"),c=i.querySelector(".nav"),r=l.querySelector(".is-current-page"),(s=r)?(d(r),p(l,r.querySelector(".nav-link"))):l.scrollTop=0,m(l,".nav-item-toggle").forEach(function(e){var t=e.parentElement;e.addEventListener("click",n.bind(t));e=function(e,t){e=e.nextElementSibling;return(!e||!t||e[e.matches?"matches":"msMatchesSelector"](t))&&e}(e,".nav-text");e&&(e.style.cursor="pointer",e.addEventListener("click",n.bind(t)))}),e&&e.querySelector(".context").addEventListener("click",function(){m(c,"[data-panel]").forEach(function(e){e.classList.toggle("is-active")})}),l.addEventListener("mousedown",function(e){1<e.detail&&e.preventDefault()}),l.querySelector('.nav-link[href^="#"]')&&(window.location.hash&&t(),window.addEventListener("hashchange",t)))}();
!function(){"use strict";var e=document.querySelector("aside.toc.sidebar");if(e){if(document.querySelector("body.-toc"))return e.parentNode.removeChild(e);var t=parseInt(e.dataset.levels||2,10);if(!(t<0)){for(var o="article.doc",a=document.querySelector(o),n=[],i=0;i<=t;i++){var r=[o];if(i){for(var c=1;c<=i;c++)r.push((2===c?".sectionbody>":"")+".sect"+c);r.push("h"+(i+1)+"[id]")}else r.push("h1[id].sect0");n.push(r.join(">"))}var d,s,l,u,f,m,p,h=(d=n.join(","),s=a.parentNode,[].slice.call((s||document).querySelectorAll(d)));h.length&&(u={},f=h.reduce(function(e,t){var o=document.createElement("a");o.textContent=t.textContent,u[o.href="#"+t.id]=o;var n=document.createElement("li");return n.dataset.level=parseInt(t.nodeName.slice(1),10)-1,n.appendChild(o),e.appendChild(n),e},document.createElement("ul")),(m=e.querySelector(".toc-menu"))||((m=document.createElement("div")).className="toc-menu"),(p=document.createElement("h3")).textContent=e.dataset.title||"On this page",m.appendChild(p),m.appendChild(f),(e=!document.getElementById("toc")&&a.querySelector("h1.page ~ :not(.is-before-toc)"))&&((p=document.createElement("aside")).className="toc embedded",p.appendChild(m.cloneNode(!0)),e.parentNode.insertBefore(p,e)),window.addEventListener("load",function(){v(),window.addEventListener("scroll",v)}))}}function v(){var t,e=window.pageYOffset,o=1.15*g(document.documentElement,"fontSize")+150,n=a.offsetTop;if(e&&window.innerHeight+e+2>=document.documentElement.scrollHeight){l=Array.isArray(l)?l:Array(l||0);var i=[],r=h.length-1;return h.forEach(function(e,t){var o="#"+e.id;t===r||e.getBoundingClientRect().top+g(e,"paddingTop")>n?(i.push(o),l.indexOf(o)<0&&u[o].classList.add("is-active")):~l.indexOf(o)&&u[l.shift()].classList.remove("is-active")}),i.forEach((e,t)=>{0!==t&&u[e].classList.remove("is-active")}),f.scrollTop=f.scrollHeight-f.offsetHeight,void(l=1<i.length?i:i[0])}Array.isArray(l)&&(l.forEach(function(e){u[e].classList.remove("is-active")}),l=void 0),h.some(function(e){return e.getBoundingClientRect().top+g(e,"paddingTop")-o>n||void(t="#"+e.id)}),t?t!==l&&(l&&u[l].classList.remove("is-active"),(e=u[t]).classList.add("is-active"),f.scrollHeight>f.offsetHeight&&(f.scrollTop=Math.max(0,e.offsetTop+e.offsetHeight-f.offsetHeight)),l=t):l&&(u[l].classList.remove("is-active"),l=void 0)}function g(e,t){return parseFloat(window.getComputedStyle(e)[t])}}();
!function(){"use strict";var o=document.querySelector("article.doc"),t=document.querySelector(".toolbar");function i(e){return e&&(~e.indexOf("%")?decodeURIComponent(e):e).slice(1)}function r(e){if(e){if(e.altKey||e.ctrlKey)return;window.location.hash="#"+this.id,e.preventDefault()}window.scrollTo(0,function e(t,n){return o.contains(t)?e(t.offsetParent,t.offsetTop+n):n}(this,0)-t.getBoundingClientRect().bottom)}window.addEventListener("load",function e(t){var n,o;(n=i(window.location.hash))&&(o=document.getElementById(n))&&(r.bind(o)(),setTimeout(r.bind(o),0)),window.removeEventListener("load",e)}),Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function(e){var t,n;(t=i(e.hash))&&(n=document.getElementById(t))&&e.addEventListener("click",r.bind(n))})}();
!function(){"use strict";var t,e=document.querySelector(".page-versions .version-menu-toggle");e&&(t=document.querySelector(".page-versions"),e.addEventListener("click",function(e){t.classList.toggle("is-active"),e.stopPropagation()}),document.documentElement.addEventListener("click",function(){t.classList.remove("is-active")}))}();

!function(){"use strict";var s=/^\$ (\S[^\\\n]*(\\\n(?!\$ )[^\\\n]*)*)(?=\n|$)/gm,l=/( ) *\\\n *|\\\n( ?) */g,d=/ +$/gm,r=(document.getElementById("site-script")||{dataset:{}}).dataset;[].slice.call(document.querySelectorAll(".doc pre.highlight, .doc .literalblock pre")).forEach(function(e){var t,n,c,i,a;if(e.classList.contains("highlight"))(c=(t=e.querySelector("code")).dataset.lang)&&"console"!==c&&((i=document.createElement("span")).className="source-lang",i.appendChild(document.createTextNode(c)));else{if(!e.innerText.startsWith("$ "))return;var o=e.parentNode.parentNode;o.classList.remove("literalblock"),o.classList.add("listingblock"),e.classList.add("highlightjs","highlight"),(t=document.createElement("code")).className="language-console hljs",t.dataset.lang="console",t.appendChild(e.firstChild),e.appendChild(t)}(c=document.createElement("div")).className="source-toolbox",i&&c.appendChild(i),window.navigator.clipboard&&((n=document.createElement("button")).className="copy-button",n.setAttribute("title","Copy to clipboard"),"svg"===r.svgAs?((o=document.createElementNS("http://www.w3.org/2000/svg","svg")).setAttribute("class","copy-icon"),(i=document.createElementNS("http://www.w3.org/2000/svg","use")).setAttribute("href",window.uiRootPath+"/img/octicons-16.svg#icon-clippy"),o.appendChild(i),n.appendChild(o)):((a=document.createElement("img")).src=window.uiRootPath+"/img/octicons-16.svg#view-clippy",a.alt="copy icon",a.className="copy-icon",n.appendChild(a)),(a=document.createElement("span")).className="copy-toast",a.appendChild(document.createTextNode("Copied!")),n.appendChild(a),c.appendChild(n)),e.appendChild(c),n&&n.addEventListener("click",function(e){var t=e.innerText.replace(d,"");"console"===e.dataset.lang&&t.startsWith("$ ")&&(t=function(e){var t,n=[];for(;t=s.exec(e);)n.push(t[1].replace(l,"$1$2"));return n.join(" && ")}(t));window.navigator.clipboard.writeText(t).then(function(){this.classList.add("clicked"),this.offsetHeight,this.classList.remove("clicked")}.bind(this),function(){})}.bind(n,t))})}();
console.log("Chatbot script loaded");const CONFIG={API_URL:"https://backend.agent.starknet.id/api",WS_URL:"wss://backend.agent.starknet.id/ws",MAX_RECONNECT_ATTEMPTS:10,MAX_HISTORY_LENGTH:10,HEARTBEAT_INTERVAL:3e4,RECONNECT_BASE_DELAY:1e3,MAX_RECONNECT_DELAY:3e4,HEARTBEAT_TIMEOUT:5e3},style=document.createElement("style");style.textContent=`
  #chat-window {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 400px;
    height: 600px;
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: none;
    flex-direction: column;
    z-index: 1000;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  #chat-window.visible {
    opacity: 1;
    transform: translateY(0);
  }

  #chat-header {
    padding: 10px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  #connection-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  #connection-status.connected {
    background-color: #4CAF50;
  }

  #connection-status.disconnected {
    background-color: #f44336;
  }

  .chat-title {
    font-weight: bold;
    font-size: 14px;
  }

  .header-right {
    display: flex;
    gap: 8px;
  }

  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-button:hover {
    color: var(--links);
  }

  #chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .message {
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    max-width: 80%;
    font-size: 14px;
    line-height: 1.4;
    width: fit-content;
    overflow-x: auto;
    max-width: 90%;
  }

  .message .content {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .message pre {
    font-size: 13px;
    margin: 8px 0;
    background: rgba(0, 0, 0, 0.05);
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    max-width: 100%;
  }

  .message code {
    font-size: 13px;
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 3px;
    word-break: break-all;
  }

  .message.user {
    background: #0C0C4F;
    color: #FFFFFF;
    margin-left: auto;
  }

  .message.ai {
    background: #F5F5F5;
    color: #333333;
    margin-right: auto;
    border: 1px solid #E0E0E0;
  }

  .message.loading {
    background: #F5F5F5;
    color: #333333;
    margin-right: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    opacity: 0.8;
    width: fit-content;
    border: 1px solid #E0E0E0;
  }

  .loading-dots {
    display: flex;
    gap: 4px;
  }

  .loading-dots span {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
  .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  #chat-input {
    padding: 10px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 8px;
  }

  #message-input {
    flex: 1;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: #F5F5F5;
    color: #666666;
    font-size: 14px;
  }

  #message-input::placeholder {
    color: #999999;
  }

  #chat-toasts {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chat-toast {
    padding: 10px;
    border-radius: 4px;
    color: #FFFFFF;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
    transition: opacity 0.5s ease;
  }

  .chat-toast.error {
    background: #f44336;
  }

  .chat-toast.warning {
    background: #ff9800;
  }

  @keyframes slideIn {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`.trim(),document.head.appendChild(style);const chatButton=document.createElement("div");chatButton.id="chat-button",chatButton.innerHTML="💬",Object.assign(chatButton.style,{position:"fixed",bottom:"20px",right:"20px",width:"50px",height:"50px",backgroundColor:"#E77787",color:"#FFFFFF",borderRadius:"50%",display:"flex",justifyContent:"center",alignItems:"center",cursor:"pointer",fontSize:"24px",boxShadow:"0 2px 10px rgba(0, 0, 0, 0.2)",zIndex:"1000",transition:"transform 0.3s ease"}),document.body.appendChild(chatButton);const chatWindow=document.createElement("div");chatWindow.id="chat-window",chatWindow.innerHTML=`
  <div id="chat-header">
    <div class="header-left">
      <div id="connection-status" class="disconnected" title="Disconnected from server"></div>
      <span class="chat-title">Starknet Assistant</span>
    </div>
    <div class="header-right">
      <button id="clear-history" class="icon-button" title="Clear History">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      </button>
      <button id="close-chat" class="icon-button" title="Close Chat">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
        </svg>
      </button>
    </div>
  </div>
  <div id="chat-messages"></div>
  <div id="chat-input">
    <input type="text" id="message-input" placeholder="Ask anything about Starknet...">
    <button id="send-message" class="icon-button" title="Send Message">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
      </svg>
    </button>
  </div>
  <div id="chat-toasts"></div>
`.trim(),document.body.appendChild(chatWindow);const breadcrumbContainer=document.createElement("div");breadcrumbContainer.id="breadcrumb-container",breadcrumbContainer.style.position="fixed",breadcrumbContainer.style.bottom="20px",breadcrumbContainer.style.left="20px",breadcrumbContainer.style.zIndex="1001",breadcrumbContainer.style.display="flex",breadcrumbContainer.style.flexDirection="column",document.body.appendChild(breadcrumbContainer);class ChatManager{constructor(){this.state={chatSocket:null,chatId:this.generateUniqueId(),reconnectAttempts:0,currentMessageId:null,currentSources:[],currentMessageContent:"",messageHistory:[],isConnecting:!1,lastHeartbeat:null,heartbeatTimeout:null,connectionQuality:"good"},this.initializeDOMElements(),this.attachEventListeners(),this.loadChatHistory(),this.initializeChat()}initializeDOMElements(){this.elements={chatButton:document.getElementById("chat-button"),chatWindow:document.getElementById("chat-window"),messageInput:document.getElementById("message-input"),sendButton:document.getElementById("send-message"),closeButton:document.getElementById("close-chat"),clearButton:document.getElementById("clear-history"),messagesContainer:document.getElementById("chat-messages"),connectionStatus:document.getElementById("connection-status")}}attachEventListeners(){this.elements.chatButton.addEventListener("click",()=>this.toggleChatWindow()),this.elements.closeButton.addEventListener("click",()=>this.closeChatWindow()),this.elements.sendButton.addEventListener("click",()=>this.sendMessage()),this.elements.messageInput.addEventListener("keypress",e=>{"Enter"===e.key&&this.sendMessage()}),this.elements.clearButton.addEventListener("click",()=>this.clearChatHistory())}async initializeChat(){try{await this.fetchModels(),this.connectWebSocket()}catch(e){throw console.error("Error initializing chat:",e),new Error("Failed to initialize chat. Please try again later.")}}async fetchModels(){try{const e=await fetch(`${CONFIG.API_URL}/models`);return e.json()}catch(e){throw console.error("Error fetching models:",e),new Error("Failed to fetch models. Please try again later.")}}connectWebSocket(){if(!this.state.isConnecting){const e=new URL(CONFIG.WS_URL);e.search=new URLSearchParams(CONFIG.WS_PARAMS).toString();try{this.state.isConnecting=!0,this.state.chatSocket=new WebSocket(e.toString()),this.setupWebSocketHandlers(),this.setupHeartbeat()}catch(e){console.error("Error creating WebSocket:",e),this.handleWebSocketError(e),this.state.isConnecting=!1}}}setupWebSocketHandlers(){const e=this.state.chatSocket;e.onopen=()=>{console.log("WebSocket connection opened successfully"),this.handleWebSocketOpen(),this.state.isConnecting=!1,this.state.connectionQuality="good",this.state.lastHeartbeat=Date.now()},e.onclose=e=>{console.log("WebSocket connection closed:",{code:e.code,reason:e.reason,wasClean:e.wasClean,timestamp:(new Date).toISOString()}),this.handleWebSocketClose(e),this.state.isConnecting=!1},e.onerror=e=>{console.error("WebSocket error:",e),this.handleWebSocketError(e),this.state.isConnecting=!1},e.onmessage=e=>{try{this.handleWebSocketMessage(e),this.updateConnectionQuality()}catch(e){console.error("Error processing message:",e),this.handleErrorMessage({data:"Error processing message"})}}}setupHeartbeat(){this.heartbeatInterval&&clearInterval(this.heartbeatInterval),this.heartbeatInterval=setInterval(()=>{if(this.state.chatSocket?.readyState===WebSocket.OPEN)try{var e={type:"ping",timestamp:Date.now()};this.state.chatSocket.send(JSON.stringify(e)),this.state.lastHeartbeat=Date.now(),this.state.heartbeatTimeout&&clearTimeout(this.state.heartbeatTimeout),this.state.heartbeatTimeout=setTimeout(()=>{this.handleHeartbeatTimeout()},CONFIG.HEARTBEAT_TIMEOUT)}catch(e){console.error("Error sending heartbeat:",e),this.handleWebSocketError(e)}},CONFIG.HEARTBEAT_INTERVAL)}handleHeartbeatTimeout(){console.warn("Heartbeat timeout - connection might be unstable"),this.state.connectionQuality="poor",this.updateConnectionStatus(),this.state.chatSocket?.readyState===WebSocket.OPEN&&this.state.chatSocket.close()}updateConnectionQuality(){var e;this.state.lastHeartbeat&&((e=Date.now()-this.state.lastHeartbeat)>CONFIG.HEARTBEAT_TIMEOUT?this.state.connectionQuality="poor":e>CONFIG.HEARTBEAT_TIMEOUT/2?this.state.connectionQuality="fair":this.state.connectionQuality="good",this.updateConnectionStatus())}updateConnectionStatus(){const e=this.elements.connectionStatus;if(e)switch(this.state.connectionQuality){case"good":e.className="connected",e.title="Connected to server (Good connection)";break;case"fair":e.className="connected fair",e.title="Connected to server (Fair connection)";break;case"poor":e.className="connected poor",e.title="Connected to server (Poor connection)";break;default:e.className="disconnected",e.title="Disconnected from server"}}handleWebSocketMessage(e){try{const t=JSON.parse(e.data);if(!t||"object"!=typeof t)throw new Error("Invalid message format: message must be an object");if(!t.type)throw new Error("Invalid message format: message must have a type");const s={error:()=>this.handleErrorMessage(t),sources:()=>this.handleSourcesMessage(t),message:()=>this.handleContentMessage(t),messageEnd:()=>this.handleMessageEnd(),pong:()=>{this.state.lastHeartbeat=Date.now(),this.updateConnectionQuality()}}[t.type];s?s():console.warn("Unknown message type:",t.type)}catch(e){console.error("Error processing WebSocket message:",e),this.handleErrorMessage({data:"Error processing message"})}}handleErrorMessage(e){throw console.error("Received error message:",e.data),this.removeLoadingIndicator(),new Error(e.data)}handleSourcesMessage(e){this.state.currentSources=e.data,this.state.currentMessageId=e.messageId}handleContentMessage(e){this.state.currentMessageId!==e.messageId&&(this.state.currentMessageId=e.messageId,this.state.currentMessageContent="",this.appendStreamingMessage(this.state.currentMessageId)),this.state.currentMessageContent+=e.data,this.updateStreamingMessage(this.state.currentMessageId,this.state.currentMessageContent,this.state.currentSources)}handleMessageEnd(){this.removeLoadingIndicator(),this.updateStreamingMessage(this.state.currentMessageId,this.state.currentMessageContent,this.state.currentSources),this.state.messageHistory.push(["ai",this.state.currentMessageContent]),this.trimMessageHistory(),this.saveChatHistory(),this.resetCurrentMessageState()}sendMessage(){var e=this.elements.messageInput.value.trim();if(e){if(this.state.chatSocket?.readyState!==WebSocket.OPEN)throw new Error("Not connected to the chat server. Please try again later.");this.elements.messageInput.value="",this.sendMessageToServer(e),this.showLoadingIndicator()}}sendMessageToServer(e){var t=this.generateUniqueId(),s={type:"message",message:{messageId:t,chatId:this.state.chatId,content:e},copilot:!1,focusMode:"docChatMode",history:this.state.messageHistory};this.state.chatSocket.send(JSON.stringify(s)),this.state.messageHistory.push(["human",e]),this.trimMessageHistory(),this.appendMessage("user",e,t)}saveChatHistory(){localStorage.setItem("chatHistory",JSON.stringify(this.state.messageHistory)),localStorage.setItem("chatId",this.state.chatId)}loadChatHistory(){var e=localStorage.getItem("chatHistory"),t=localStorage.getItem("chatId");e&&(this.state.messageHistory=JSON.parse(e),this.state.chatId=t||this.generateUniqueId(),this.elements.messagesContainer.innerHTML="",this.state.messageHistory.forEach(([e,t])=>{this.appendMessage("human"===e?"user":"ai",t)}))}generateUniqueId(){return`${Date.now().toString(36)}${Math.random().toString(36).substr(2)}`}trimMessageHistory(){this.state.messageHistory.length>CONFIG.MAX_HISTORY_LENGTH&&(this.state.messageHistory=this.state.messageHistory.slice(-CONFIG.MAX_HISTORY_LENGTH))}resetCurrentMessageState(){this.state.currentSources=[],this.state.currentMessageId=null,this.state.currentMessageContent=""}showLoadingIndicator(){const e=document.createElement("div");e.className="message loading",e.innerHTML=`
      Thinking
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
    `,this.elements.messagesContainer.appendChild(e),this.scrollToBottom()}removeLoadingIndicator(){const e=document.querySelector(".message.loading");e&&e.remove()}scrollToBottom(){this.elements.messagesContainer.scrollTop=this.elements.messagesContainer.scrollHeight}toggleChatWindow(){var e="flex"===this.elements.chatWindow.style.display;e?(this.elements.chatWindow.classList.remove("visible"),this.elements.chatButton.innerHTML="💬",setTimeout(()=>{this.elements.chatWindow.style.display="none"},300)):(this.elements.chatWindow.style.display="flex",this.elements.chatWindow.classList.add("visible"),this.elements.chatButton.innerHTML="❌"),document.body.classList.toggle("chat-open",!e)}closeChatWindow(){this.elements.chatWindow.classList.remove("visible"),this.elements.chatButton.innerHTML="💬",setTimeout(()=>{this.elements.chatWindow.style.display="none",document.body.classList.remove("chat-open"),this.saveChatHistory()},300)}appendMessage(e,t,s=null){const a=document.createElement("div");a.className=`message ${e}`,s&&(a.id=`message-${s}`);const n=document.createElement("div");n.className="content",n.innerHTML=this.processMarkdown(t),a.appendChild(n),this.elements.messagesContainer.appendChild(a),this.scrollToBottom(),this.saveChatHistory()}appendStreamingMessage(e){const t=document.createElement("div");t.className="message ai streaming",t.id=`message-${e}`;const s=document.createElement("div");return s.className="content",t.appendChild(s),this.elements.messagesContainer.appendChild(t),this.scrollToBottom(),t}updateStreamingMessage(e,t,s){let a=document.getElementById(`message-${e}`);a=a||this.appendStreamingMessage(e);const n=a.querySelector(".content");n&&(s=this.processMarkdown(t,s),n.innerHTML=s,this.highlightCodeBlocks(),this.scrollToBottom())}highlightCodeBlocks(){window.Prism&&Prism.highlightAll()}processMarkdown(e,a=[]){let t=e.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/\[(\d+)\]/g,(e,t)=>{var s=parseInt(t)-1;return a[s]?.metadata?.url?`<a href="${a[s].metadata.url}" target="_blank">[${t}]</a>`:e});return t=t.replace(/```(\w+)?\n([\s\S]*?)```/g,(e,t,s)=>`<pre><code class="language-${t||"plaintext"}">${this.escapeHtml(s.trim())}</code></pre>`),0<a.length&&(e=a.map((e,t)=>`[${t+1}] <a href="${e.metadata.url}" target="_blank">${e.metadata.title||"Untitled"}</a>`).join("\n"),t+=`\n\nRelevant pages:\n${e}`),t}escapeHtml(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}handleWebSocketOpen(){console.log("WebSocket connection opened"),this.setWSReady(!0),this.state.reconnectAttempts=0,this.setupHeartbeat()}handleWebSocketClose(e){console.log("WebSocket connection closed:",e),this.setWSReady(!1),this.heartbeatInterval&&clearInterval(this.heartbeatInterval),this.state.heartbeatTimeout&&clearTimeout(this.state.heartbeatTimeout),1e3!==e.code&&1001!==e.code&&this.attemptReconnect()}handleWebSocketError(e){console.error("WebSocket error:",e),this.state.chatSocket?.readyState===WebSocket.OPEN&&this.state.chatSocket.close(),this.showBreadcrumbError("WebSocket connection error occurred")}setWSReady(e){this.elements.connectionStatus.className=e?"connected":"disconnected",this.elements.connectionStatus.title=e?"Connected to server":"Disconnected from server"}attemptReconnect(){var e;this.state.reconnectAttempts++,this.state.reconnectAttempts<=CONFIG.MAX_RECONNECT_ATTEMPTS?(e=Math.min(CONFIG.RECONNECT_BASE_DELAY*Math.pow(2,this.state.reconnectAttempts-1),CONFIG.MAX_RECONNECT_DELAY)+1e3*Math.random(),console.log(`Reconnect attempt ${this.state.reconnectAttempts} in ${Math.round(e)}ms`),setTimeout(()=>this.connectWebSocket(),e)):console.error("Max reconnection attempts reached")}clearChatHistory(){this.state.messageHistory=[],this.elements.messagesContainer.innerHTML="",this.state.chatId=this.generateUniqueId()}showToast(e,t){const s=document.getElementById("chat-toasts");if(s){const a=document.createElement("div");a.className=`chat-toast ${t}`,a.textContent=e,s.appendChild(a),setTimeout(()=>{a.style.opacity="0",setTimeout(()=>{a.remove()},500)},3e3)}}showBreadcrumbError(e){const t=document.createElement("div");t.className="breadcrumb-error",t.textContent=e,t.style.backgroundColor="#f44336",t.style.color="#FFFFFF",t.style.padding="10px",t.style.borderRadius="4px",t.style.marginBottom="5px",t.style.transition="opacity 0.5s ease",breadcrumbContainer.appendChild(t),setTimeout(()=>{t.style.opacity="0",setTimeout(()=>{t.remove()},500)},3e3)}}document.addEventListener("DOMContentLoaded",()=>{window.chatManager=new ChatManager}),window.addEventListener("beforeunload",()=>{window.chatManager&&window.chatManager.saveChatHistory()});