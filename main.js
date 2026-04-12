(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* 乱码解码效果（scramble / decode），非安全意义上的混淆 */
  var MARK_TARGET = "qwertlexi";
  var SCRAMBLE_POOL =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*█░▒▓?/\\";

  function runMarkScramble() {
    var el = document.getElementById("mark-text");
    if (!el) return;
    var n = MARK_TARGET.length;
    var state = [];
    var locked = [];
    var i;
    for (i = 0; i < n; i++) {
      state.push(SCRAMBLE_POOL.charAt(Math.floor(Math.random() * SCRAMBLE_POOL.length)));
      locked.push(false);
    }
    var frame = 0;
    var maxFrames = 52 + n * 7;

    function tick() {
      frame++;
      var j;
      var all = true;
      for (j = 0; j < n; j++) {
        if (!locked[j]) {
          all = false;
          if (frame > 10 + j * 5 && Math.random() < 0.38) {
            locked[j] = true;
            state[j] = MARK_TARGET.charAt(j);
          } else {
            state[j] = SCRAMBLE_POOL.charAt(Math.floor(Math.random() * SCRAMBLE_POOL.length));
          }
        }
      }
      if (frame >= maxFrames) {
        for (j = 0; j < n; j++) {
          locked[j] = true;
          state[j] = MARK_TARGET.charAt(j);
        }
        all = true;
      }
      el.textContent = state.join("");
      if (!all) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = MARK_TARGET;
      }
    }

    requestAnimationFrame(tick);
  }

  runMarkScramble();

  /* 主界面空闲读数：时钟 / tick / 伪十六进制流 */
  var clockEl = document.getElementById("chrome-clock");
  var tickEl = document.getElementById("chrome-tick");
  var hexEl = document.getElementById("chrome-hex");
  var tickN = 0;

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function updateChromeClock() {
    if (!clockEl) return;
    var d = new Date();
    clockEl.textContent = pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
  }

  updateChromeClock();
  setInterval(updateChromeClock, 1000);

  setInterval(function () {
    tickN++;
    if (tickEl) tickEl.textContent = "tick " + tickN;
  }, 380);

  function randomHexLine() {
    var parts = [];
    var p;
    for (p = 0; p < 5; p++) {
      var w = 6 + Math.floor(Math.random() * 6);
      var s = "";
      var z;
      for (z = 0; z < w; z++) {
        s += "0123456789abcdef".charAt(Math.floor(Math.random() * 16));
      }
      parts.push(s);
    }
    return parts.join("  ");
  }

  function updateChromeHex() {
    if (!hexEl) return;
    var lines = [];
    var h;
    for (h = 0; h < 8; h++) {
      lines.push(randomHexLine());
    }
    hexEl.textContent = lines.join("\n");
  }

  updateChromeHex();
  setInterval(updateChromeHex, 420 + Math.random() * 380);

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* Live sidebar metrics */
  var NOISE_POOL = ["low", "Δ", "hiss", "· · ·", "████", "~", "??", "null"];
  var MODE_POOL = ["idle", "drift", "scan", "ghost", "wait", "??", "void"];

  function tickMetrics() {
    document.querySelectorAll("[data-metric]").forEach(function (el) {
      var k = el.getAttribute("data-metric");
      if (k === "noise") el.textContent = pick(NOISE_POOL);
      else if (k === "latency") el.textContent = "~" + Math.floor(4 + Math.random() * 140) + "ms";
      else if (k === "mode") el.textContent = pick(MODE_POOL);
    });
  }

  tickMetrics();
  setInterval(tickMetrics, 1600 + Math.random() * 2400);

  /* Stage parallax for orbit */
  var stage = document.getElementById("main");
  if (stage) {
    stage.addEventListener(
      "mousemove",
      function (e) {
        var rect = stage.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
        var y = ((e.clientY - rect.top) / rect.height - 0.5) * 24;
        stage.style.setProperty("--parallax-x", x + "px");
        stage.style.setProperty("--parallax-y", y + "px");
      },
      { passive: true }
    );
  }

  var portal = document.getElementById("portal");
  var backdrop = document.getElementById("stage-backdrop");
  var closeBtn = document.querySelector(".portal-close");
  var titleEl = document.getElementById("portal-title-active");
  var entries = document.querySelectorAll(".entry[data-open-panel]");
  var panels = document.querySelectorAll(".panel[data-panel-id]");

  var titles = {
    photos: "摄影 · PHOTOS",
    cats: "猫 · CATS",
    notes: "手记 · NOTES",
    about: "关于 · ABOUT",
    links: "书签 · LINKS",
    signal: "信号 · SIGNAL",
    relay: "中继 · RELAY",
    tarot: "塔罗 · TAROT",
    music: "音乐 · MUSIC",
  };

  function setEntryActive(id) {
    entries.forEach(function (btn) {
      var open = !!id && btn.getAttribute("data-open-panel") === id;
      btn.classList.toggle("is-active", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  function showPanel(id) {
    panels.forEach(function (p) {
      var match = p.getAttribute("data-panel-id") === id;
      p.hidden = !match;
    });
    if (titleEl) titleEl.textContent = titles[id] || "面板";
  }

  function openPortal(id) {
    if (!portal || !backdrop) return;
    showPanel(id);
    setEntryActive(id);
    portal.hidden = false;
    backdrop.hidden = false;
    portal.setAttribute("aria-hidden", "false");
    backdrop.setAttribute("aria-hidden", "false");
    if (stage) stage.classList.add("is-panel-open");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        portal.classList.add("is-open");
        backdrop.classList.add("is-visible");
      });
    });
    document.body.classList.add("is-portal-open");
    if (titles[id]) {
      if (location.hash !== "#" + id) {
        history.replaceState(null, "", "#" + id);
      }
    }
    if (closeBtn) closeBtn.focus();
  }

  function closePortal() {
    if (!portal || !backdrop) return;
    portal.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
    if (stage) stage.classList.remove("is-panel-open");
    document.body.classList.remove("is-portal-open");
    if (location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    setEntryActive(null);

    setTimeout(function () {
      if (!portal.classList.contains("is-open")) {
        portal.hidden = true;
        portal.setAttribute("aria-hidden", "true");
        backdrop.hidden = true;
        backdrop.setAttribute("aria-hidden", "true");
        panels.forEach(function (p) {
          p.hidden = true;
        });
      }
    }, 520);
  }

  entries.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-open-panel");
      if (!id) return;
      if (portal && portal.classList.contains("is-open")) {
        var current = document.querySelector(".entry.is-active");
        if (current === btn) {
          closePortal();
          return;
        }
      }
      openPortal(id);
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closePortal);

  if (backdrop) {
    backdrop.addEventListener("click", closePortal);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var lb = document.getElementById("lightbox");
      if (lb && lb.classList.contains("is-open")) return;
      closePortal();
    }
  });

  function openFromHash() {
    var h = (location.hash || "").replace(/^#/, "");
    if (titles[h]) openPortal(h);
  }

  if (location.hash) openFromHash();
  window.addEventListener("hashchange", openFromHash);

  /* Comments — localStorage */
  var COMMENT_KEY = "lexi-comments-v1";
  var commentList = document.getElementById("comment-list");
  var commentForm = document.getElementById("comment-form");

  function loadComments() {
    try {
      var raw = localStorage.getItem(COMMENT_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveComments(arr) {
    try {
      localStorage.setItem(COMMENT_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function renderComments() {
    if (!commentList) return;
    commentList.innerHTML = "";
    loadComments().forEach(function (c) {
      var li = document.createElement("li");
      li.className = "comment-item";
      var meta = document.createElement("div");
      meta.className = "comment-meta";
      var name = c.name && String(c.name).trim() ? String(c.name).trim() : "访客";
      var t = c.t ? new Date(c.t) : new Date();
      meta.textContent = name + " · " + t.toLocaleString("zh-CN", { hour12: false });
      var body = document.createElement("p");
      body.className = "comment-body";
      body.textContent = c.body || "";
      li.appendChild(meta);
      li.appendChild(body);
      commentList.appendChild(li);
    });
  }

  if (commentForm && commentList) {
    renderComments();
    commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameEl = document.getElementById("comment-name");
      var bodyEl = document.getElementById("comment-body");
      if (!bodyEl) return;
      var body = String(bodyEl.value || "").trim();
      if (!body) return;
      var name = nameEl ? String(nameEl.value || "").trim() : "";
      var arr = loadComments();
      arr.push({ name: name, body: body, t: Date.now() });
      saveComments(arr);
      bodyEl.value = "";
      renderComments();
    });
  }

  /* Signal panel */
  var SIGNAL_LINES = [
    "∇ 03 · 未命名信道 · 无校验",
    "……听……不清……（像猫踩过键盘）",
    "4096 · void · 返回值为梦",
    "坐标丢失。上次见到光，是昨天下午。",
    "██████ · 已省略 · 原因不明",
    "echo: silence",
    "随机不是无意义，只是还没被读。",
    "SIGNAL_OK · 概率 3.7%",
    "∿∿∿ 潮声模拟中 ∿∿∿",
  ];

  var signalTap = document.getElementById("signal-tap");
  var signalStream = document.getElementById("signal-stream");

  function appendSignalLine() {
    if (!signalStream) return;
    var line = pick(SIGNAL_LINES);
    if (signalStream.textContent) signalStream.textContent += "\n";
    signalStream.textContent += line;
    signalStream.scrollTop = signalStream.scrollHeight;
    signalStream.classList.remove("is-flicker");
    void signalStream.offsetWidth;
    signalStream.classList.add("is-flicker");
  }

  if (signalTap) {
    signalTap.addEventListener("click", appendSignalLine);
  }

  /* Relay terminal */
  var relayOut = document.getElementById("relay-output");
  var relayForm = document.getElementById("relay-form");
  var relayInput = document.getElementById("relay-input");

  function relayLine(text, kind) {
    if (!relayOut) return;
    var p = document.createElement("p");
    p.className = "relay-line";
    if (kind === "sys") p.classList.add("relay-line--sys");
    if (kind === "err") p.classList.add("relay-line--err");
    p.textContent = text;
    relayOut.appendChild(p);
    relayOut.scrollTop = relayOut.scrollHeight;
  }

  if (relayOut) {
    relayLine("relay v0.1 — 输入 help 查看指令", "sys");
  }

  function runRelayCommand(raw) {
    var line = String(raw || "").trim();
    if (!line) return;
    relayLine("> " + line);

    var lower = line.toLowerCase();
    var parts = line.split(/\s+/);
    var cmd = parts[0].toLowerCase();

    if (cmd === "help") {
      relayLine(
        "help · clear · date · roll · echo · whoami · open <panel>",
        "sys"
      );
      relayLine("panel: photos cats notes about links signal relay tarot", "sys");
    } else if (cmd === "clear") {
      relayOut.innerHTML = "";
      relayLine("cleared.", "sys");
    } else if (cmd === "date") {
      relayLine(new Date().toString(), "sys");
    } else if (cmd === "roll") {
      relayLine(String(Math.floor(Math.random() * 100) + 1), "sys");
    } else if (cmd === "whoami") {
      relayLine("qwertlexi · visitor · local session", "sys");
    } else if (cmd === "echo") {
      relayLine(parts.slice(1).join(" ") || "…", "sys");
    } else if (cmd === "open" && parts[1]) {
      var target = parts[1].toLowerCase();
      if (titles[target]) {
        relayLine("opening " + target + " …", "sys");
        openPortal(target);
      } else {
        relayLine("unknown panel: " + parts[1], "err");
      }
    } else {
      relayLine("未知指令。试试 help", "err");
    }
  }

  if (relayForm && relayInput) {
    relayForm.addEventListener("submit", function (e) {
      e.preventDefault();
      runRelayCommand(relayInput.value);
      relayInput.value = "";
      relayInput.focus();
    });
  }

  /* Tarot — 22 大阿卡纳 */
  var TAROT_DECK = [
    { id: "0", cn: "愚者", desc: "新的开端或一次莽撞的跳跃；信任直觉，也记得看路。" },
    { id: "I", cn: "魔术师", desc: "把资源握在手中，专注能把想法落地。" },
    { id: "II", cn: "女祭司", desc: "静下来听内在声音；答案可能还没准备好现身。" },
    { id: "III", cn: "皇后", desc: "滋养、丰盛与感官之美；给自己一点温柔的空间。" },
    { id: "IV", cn: "皇帝", desc: "结构、边界与责任；秩序能托住混乱。" },
    { id: "V", cn: "教皇", desc: "传统与指引；适合向经验或师长借一双眼睛。" },
    { id: "VI", cn: "恋人", desc: "选择与契合；诚实面对心里真正想要的方向。" },
    { id: "VII", cn: "战车", desc: "意志与前进；把分散的力气拧成一股绳。" },
    { id: "VIII", cn: "力量", desc: "以柔克刚的勇气；耐心比硬扛更难得。" },
    { id: "IX", cn: "隐士", desc: "暂时退后、独自整理；有些路只能一个人走一截。" },
    { id: "X", cn: "命运之轮", desc: "周期与转折；顺势时别骄傲，逆势时别绝望。" },
    { id: "XI", cn: "正义", desc: "权衡与因果；做决定前把事实摊开来看。" },
    { id: "XII", cn: "倒吊人", desc: "暂停与视角转换；卡住时试试换个角度看。" },
    { id: "XIII", cn: "死神", desc: "结束与蜕变；旧壳脱落才有新芽。" },
    { id: "XIV", cn: "节制", desc: "调和与中庸；快慢、冷热之间找平衡。" },
    { id: "XV", cn: "恶魔", desc: "欲望与束缚；看清什么是习惯，什么是真的需要。" },
    { id: "XVI", cn: "高塔", desc: "突变与真相砸门；痛但可能必要。" },
    { id: "XVII", cn: "星星", desc: "希望与疗愈；远处有光，先把眼前一步走好。" },
    { id: "XVIII", cn: "月亮", desc: "迷雾与潜意识；别被想象吓到，也别完全轻信直觉。" },
    { id: "XIX", cn: "太阳", desc: "明朗与生命力；适合摊在阳光下的事就去做。" },
    { id: "XX", cn: "审判", desc: "觉醒与召唤；旧账可以结算，新章可以起笔。" },
    { id: "XXI", cn: "世界", desc: "圆满与旅程一圈；完成本身也是下一段的门票。" },
  ];

  var tarotDraw = document.getElementById("tarot-draw");
  var tarotCube = document.getElementById("tarot-cube");
  var tarotRoman = document.getElementById("tarot-roman");
  var tarotName = document.getElementById("tarot-name");
  var tarotDesc = document.getElementById("tarot-desc");
  var tarotHint = document.getElementById("tarot-hint");
  var tarotBusy = false;

  function drawTarot() {
    if (!tarotCube || !TAROT_DECK.length || tarotBusy) return;
    tarotBusy = true;
    var card = pick(TAROT_DECK);
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var flipDelay = reduced ? 0 : 480;

    tarotCube.classList.remove("is-flipped");
    if (tarotHint) tarotHint.textContent = "洗牌、切牌…（动画而已）";

    setTimeout(function () {
      if (tarotRoman) tarotRoman.textContent = "大阿卡纳 · " + card.id;
      if (tarotName) tarotName.textContent = card.cn;
      if (tarotDesc) tarotDesc.textContent = card.desc;
      tarotCube.classList.add("is-flipped");
      if (tarotHint) {
        tarotHint.textContent = "已翻开。再点「抽一张」会先合牌再抽新的一张。";
      }
      tarotBusy = false;
    }, flipDelay);
  }

  if (tarotDraw) {
    tarotDraw.addEventListener("click", drawTarot);
  }

  /* Lightbox */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbClose = lightbox.querySelector(".lightbox-close");

    function openLb(src, alt) {
      if (!src || !lbImg) return;
      lbImg.src = src;
      lbImg.alt = alt || "";
      lightbox.hidden = false;
      lightbox.classList.add("is-open");
      document.body.classList.add("is-portal-open");
      if (lbClose) lbClose.focus();
    }

    function closeLb() {
      lightbox.classList.remove("is-open");
      if (lbImg) {
        lbImg.removeAttribute("src");
        lbImg.alt = "";
      }
      lightbox.hidden = true;
      var p = document.getElementById("portal");
      if (!p || !p.classList.contains("is-open")) {
        document.body.classList.remove("is-portal-open");
      }
    }

    document.querySelectorAll(".js-lightbox").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var img = btn.querySelector("img");
        if (!img || !img.src) return;
        openLb(img.currentSrc || img.src, img.getAttribute("alt") || "");
      });
    });

    if (lbClose) {
      lbClose.addEventListener("click", function (e) {
        e.stopPropagation();
        closeLb();
      });
    }

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLb();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLb();
      }
    });

    if (lbImg) {
      lbImg.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }
  }
  /* Mobile bottom nav — mirrors sidebar entry behaviour */
  var mobNavBtns = document.querySelectorAll(".mob-nav-btn[data-open-panel]");

  function syncMobNav(id) {
    mobNavBtns.forEach(function (btn) {
      btn.classList.toggle("is-active", !!id && btn.getAttribute("data-open-panel") === id);
    });
  }

  mobNavBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-open-panel");
      if (!id) return;
      if (portal && portal.classList.contains("is-open")) {
        var currentPanel = document.querySelector(".panel:not([hidden])");
        if (currentPanel && currentPanel.getAttribute("data-panel-id") === id) {
          closePortal();
          syncMobNav(null);
          return;
        }
      }
      openPortal(id);
      syncMobNav(id);
    });
  });

  // Keep mob-nav in sync when portal closes
  var _origClose = closePortal;
  closePortal = function () {
    _origClose();
    syncMobNav(null);
  };

  /* ── Music panel ── */
  var MUSIC_TRACKS = [
    { emoji: "🌙", title: "Neon Dusk", artist: "Synthwave Archive", dur: 213 },
    { emoji: "📡", title: "Signal Lost", artist: "Void Frequencies", dur: 187 },
    { emoji: "🌊", title: "Deep Scan", artist: "Ocean Protocol", dur: 254 },
    { emoji: "⚡", title: "Ghost Circuit", artist: "Lexi & The Static", dur: 198 },
    { emoji: "🌃", title: "Low Orbit", artist: "Terminal Dreams", dur: 241 },
    { emoji: "🔭", title: "Quiet Channel", artist: "Idle Transmission", dur: 176 },
  ];

  var musicState = {
    track: -1,
    playing: false,
    progress: 0,   // seconds elapsed
    tick: null,
  };

  function fmtTime(s) {
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  function musicSetTrack(idx) {
    musicState.track = idx;
    var t = MUSIC_TRACKS[idx];
    var art = document.getElementById("music-art");
    var titleEl = document.getElementById("music-title");
    var artistEl = document.getElementById("music-artist");
    var totEl = document.getElementById("music-time-tot");
    if (art) { art.textContent = t.emoji; }
    if (titleEl) titleEl.textContent = t.title;
    if (artistEl) artistEl.textContent = t.artist;
    if (totEl) totEl.textContent = fmtTime(t.dur);
    musicState.progress = 0;
    musicUpdateProgress();

    // Highlight current track row
    document.querySelectorAll(".music-track").forEach(function (row, i) {
      row.classList.toggle("is-current", i === idx);
    });
  }

  function musicUpdateProgress() {
    var t = MUSIC_TRACKS[musicState.track] || { dur: 1 };
    var pct = Math.min(100, (musicState.progress / t.dur) * 100);
    var fill = document.getElementById("music-progress-fill");
    var curEl = document.getElementById("music-time-cur");
    if (fill) fill.style.width = pct + "%";
    if (curEl) curEl.textContent = fmtTime(musicState.progress);
  }

  function musicPlay() {
    if (musicState.track < 0) musicSetTrack(0);
    musicState.playing = true;
    var playBtn = document.getElementById("music-play");
    var art = document.getElementById("music-art");
    var viz = document.getElementById("music-viz");
    if (playBtn) playBtn.textContent = "⏸";
    if (playBtn) playBtn.classList.add("is-playing");
    if (art) art.classList.add("is-playing");
    if (viz) viz.classList.add("is-active");

    clearInterval(musicState.tick);
    musicState.tick = setInterval(function () {
      var t = MUSIC_TRACKS[musicState.track];
      if (!t) return;
      musicState.progress += 1;
      if (musicState.progress >= t.dur) {
        // auto-advance
        var next = (musicState.track + 1) % MUSIC_TRACKS.length;
        musicSetTrack(next);
      }
      musicUpdateProgress();
    }, 1000);
  }

  function musicPause() {
    musicState.playing = false;
    clearInterval(musicState.tick);
    var playBtn = document.getElementById("music-play");
    var art = document.getElementById("music-art");
    var viz = document.getElementById("music-viz");
    if (playBtn) playBtn.textContent = "▶";
    if (playBtn) playBtn.classList.remove("is-playing");
    if (art) art.classList.remove("is-playing");
    if (viz) viz.classList.remove("is-active");
  }

  function musicToggle() {
    if (musicState.playing) musicPause(); else musicPlay();
  }

  // Build track list rows
  var tracklistEl = document.getElementById("music-tracklist");
  if (tracklistEl) {
    var headEl = tracklistEl.querySelector(".music-tracklist-head");
    MUSIC_TRACKS.forEach(function (t, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "music-track";
      btn.innerHTML =
        '<span class="music-track-num">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="music-track-info">' +
          '<span class="music-track-name">' + t.emoji + "  " + t.title + "</span>" +
          '<span class="music-track-sub">' + t.artist + "</span>" +
        "</span>" +
        '<span class="music-track-dur">' + fmtTime(t.dur) + "</span>";
      btn.addEventListener("click", function () {
        musicSetTrack(i);
        musicPlay();
      });
      tracklistEl.appendChild(btn);
    });
  }

  var playBtn = document.getElementById("music-play");
  var prevBtn = document.getElementById("music-prev");
  var nextBtn = document.getElementById("music-next");

  if (playBtn) playBtn.addEventListener("click", musicToggle);
  if (prevBtn) prevBtn.addEventListener("click", function () {
    var prev = (musicState.track <= 0 ? MUSIC_TRACKS.length : musicState.track) - 1;
    musicSetTrack(prev);
    if (musicState.playing) musicPlay();
  });
  if (nextBtn) nextBtn.addEventListener("click", function () {
    var next = (musicState.track + 1) % MUSIC_TRACKS.length;
    musicSetTrack(next);
    if (musicState.playing) musicPlay();
  });

  // Click progress bar to seek
  var progressBar = document.getElementById("music-progress-bar");
  if (progressBar) {
    progressBar.addEventListener("click", function (e) {
      if (musicState.track < 0) return;
      var rect = progressBar.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      musicState.progress = Math.floor(pct * MUSIC_TRACKS[musicState.track].dur);
      musicUpdateProgress();
    });
  }

  // Init first track display (no autoplay)
  (function () {
    var totEl = document.getElementById("music-time-tot");
    if (totEl && MUSIC_TRACKS.length) totEl.textContent = fmtTime(MUSIC_TRACKS[0].dur);
  })();

})();
