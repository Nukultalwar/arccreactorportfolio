"use client";

import React, { useEffect } from "react";

export default function Home() {
  const startArcfolio = () => {
    if (typeof window === "undefined") return;
    if ((window as any).__arcfolio_initialized) return;
    (window as any).__arcfolio_initialized = true;

    (function () {
      "use strict";
      const $ = (s: string, r?: Document | HTMLElement | Element | null) =>
        (r || document).querySelector(s) as any;
      const $$ = (s: string, r?: Document | HTMLElement | Element | null) =>
        Array.prototype.slice.call((r || document).querySelectorAll(s));

      const app = $("#app"),
        stage = $("#stage"),
        panel = $("#panel"),
        pbody = $("#pbody"),
        chipsEl = $("#chips"),
        crumb = $("#crumb");
      const pillsEl = $("#pills"),
        leadersEl = $("#leaders"),
        hint = $("#hint"),
        stateTxt = $("#stateTxt"),
        reasm = $("#reasm"),
        boot = $("#boot");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const narrow = () => window.innerWidth < 900;

      const SEC = [
        { id: "about", n: "01", name: "About Me", sub: "Who’s behind the screen" },
        { id: "resume", n: "02", name: "Résumé", sub: "Résumé · Socials" },
        { id: "work", n: "03", name: "My Work", sub: "Case studies" },
        { id: "projects", n: "04", name: "My Projects", sub: "Side builds" },
        { id: "skills", n: "05", name: "My Skills", sub: "The toolkit" },
        { id: "connect", n: "06", name: "Let’s Connect", sub: "Say hello" },
      ];
      const TITLES: Record<string, string> = {
        about: "About Me",
        resume: "Résumé",
        socials: "Socials",
        work: "My Work",
        projects: "My Projects",
        skills: "My Skills",
        connect: "Let’s Connect",
      };
      const NUM: Record<string, string> = {
        about: "01",
        resume: "02",
        socials: "02",
        work: "03",
        projects: "04",
        skills: "05",
        connect: "06",
      };
      const ORDER = ["about", "resume", "socials", "work", "projects", "skills", "connect"];

      /* ---------- state ---------- */
      const state: { exploded: boolean; view: string | null; split: boolean } = {
        exploded: false,
        view: null,
        split: false,
      };
      let engine: any = null;

      /* ---------- pills (HTML labels pinned to 3D layers) ---------- */
      const tags: HTMLElement[] = [];
      pillsEl.innerHTML = '<svg class="leaders" id="leaders" aria-hidden="true"></svg>';
      const currentLeadersEl = $("#leaders");

      SEC.forEach(function (s, i) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tag";
        b.dataset.id = s.id;
        b.dataset.order = String(i);
        b.setAttribute("aria-label", "Open " + s.name);
        b.innerHTML =
          '<span class="pill"><b><i>' +
          s.n +
          "</i>" +
          s.name +
          "</b><em>" +
          s.sub +
          "</em></span>";
        pillsEl.appendChild(b);
        tags.push(b);
      });

      [
        ["resume", "Résumé", "The record"],
        ["socials", "Socials", "The network"],
      ].forEach(function (d, j) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tag strand-tag";
        b.dataset.id = "resume";
        b.dataset.view = d[0];
        b.dataset.order = String(1 + j * 0.1);
        b.setAttribute("aria-label", "Open " + d[1]);
        b.innerHTML = '<span class="pill"><b>' + d[1] + "</b><em>" + d[2] + "</em></span>";
        pillsEl.appendChild(b);
        tags.push(b);
      });

      const leaderLines = tags.map(function () {
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        currentLeadersEl.appendChild(l);
        return l;
      });

      pillsEl.addEventListener("click", function (e: any) {
        const t = e.target.closest(".tag");
        if (!t) return;
        if (t.dataset.view) {
          openView(t.dataset.view);
          return;
        }
        tapSection(t.dataset.id);
      });

      pillsEl.addEventListener("pointerover", function (e: any) {
        const t = e.target.closest(".tag");
        if (t && engine && e.pointerType === "mouse") engine.setHover(t.dataset.id);
      });
      pillsEl.addEventListener("pointerout", function (e: any) {
        if (engine && e.pointerType === "mouse") engine.setHover(null);
      });

      /* ---------- flow ---------- */
      function explode() {
        state.exploded = true;
        if (engine) engine.seekSide();
        render();
      }
      function reassemble() {
        state.exploded = false;
        state.view = null;
        state.split = false;
        if (engine) engine.seekFront();
        render();
      }
      function closePanel() {
        state.view = null;
        render();
      }
      function openView(v: string) {
        state.exploded = true;
        state.split = v === "resume" || v === "socials";
        state.view = v;
        if (engine && !engine.isSide()) engine.seekSide();
        paintPanel();
        render();
      }
      function tapSection(id: string) {
        if (id === "resume") {
          state.split = true;
          if (engine && !engine.isSide()) engine.seekSide();
          render();
          return;
        }
        openView(id);
      }
      function render() {
        const ex = state.exploded,
          view = state.view,
          split = state.split && ex;
        const act = view ? (view === "socials" ? "resume" : view) : null;
        app.classList.toggle("open", !!view);
        pillsEl.classList.toggle("has-active", !!view);
        panel.setAttribute("aria-hidden", view ? "false" : "true");
        tags.forEach(function (t) {
          const isStrand = !!t.dataset.view;
          const on = isStrand
            ? t.dataset.view === view
            : t.dataset.id === act && !(split && t.dataset.id === "resume");
          t.classList.toggle("active", on);
          t.classList.toggle("off", isStrand ? !split : split && t.dataset.id === "resume");
        });
        $$(".chip", chipsEl).forEach(function (c: HTMLElement) {
          c.setAttribute("aria-current", c.dataset.go === view ? "true" : "false");
        });
        reasm.hidden = !ex;
        stateTxt.textContent = ex ? (view ? "Inspecting" : "Deconstructed") : "Assembled";
        hint.classList.toggle("pulse", !ex || (split && !view));
        hint.textContent = !ex
          ? "Tap the reactor · drag to rotate"
          : split && !view
          ? "Tap a strand"
          : "Tap a layer · drag to rotate";
        if (app.classList.contains("nogl"))
          hint.textContent = "3D view unavailable on this device · pick a section";
        if (engine) engine.retarget(act);
      }

      /* ---------- panel content (populated with actual portfolio data) ---------- */
      const SKILLS = [
        [
          "Core Frontend & Frameworks",
          [
            ["React.js", 9],
            ["JavaScript (ES6+)", 9],
            ["HTML5 & Semantic Markup", 9],
            ["CSS3 & Responsive Design", 9],
            ["TypeScript", 8],
          ],
        ],
        [
          "Tools, APIs & Workflow",
          [
            ["REST APIs & Integration", 8],
            ["Git & Version Control", 8],
            ["GitHub Collaboration", 8],
            ["Vite & Modern Tooling", 8],
          ],
        ],
        [
          "Foundations & Programming",
          [
            ["ES6+ Standards & Async", 9],
            ["Component Architecture", 9],
            ["Python (Data Structures)", 7],
            ["Java (OOP Foundations)", 7],
          ],
        ],
        [
          "Motion & Graphics",
          [
            ["Three.js / WebGL", 8],
            ["Framer Motion", 8],
            ["CSS Keyframes & Shaders", 8],
            ["Canvas 2D Particles", 8],
          ],
        ],
      ];

      function gauge(n: number, idx: number) {
        let s = "";
        for (let i = 0; i < 10; i++) {
          s +=
            i < n
              ? '<span class="f" style="--i:' + (idx + i) + '"></span>'
              : "<span></span>";
        }
        return (
          '<div class="gauge" role="img" aria-label="' +
          n +
          ' out of 10">' +
          s +
          "</div>"
        );
      }

      const SOCIALS = [
        ["in", "LinkedIn", "nukul-talwar-84a574211", "https://www.linkedin.com/in/nukul-talwar-84a574211/"],
        ["GH", "GitHub", "Nukultalwar", "https://github.com/Nukultalwar"],
        ["CV", "Resume PDF", "1Nukul_Talwar.pdf", "/1Nukul_Talwar.pdf"],
        ["ML", "Email Signal", "nukultalwar@gmail.com", "mailto:nukultalwar@gmail.com"],
      ];
      const EMAIL = "nukultalwar@gmail.com";

      function seg(active: string) {
        return (
          '<div class="seg" role="group" aria-label="Résumé or socials">' +
          '<button type="button" data-go="resume" aria-pressed="' +
          (active === "resume") +
          '">Résumé</button><span class="link" aria-hidden="true"></span>' +
          '<button type="button" data-go="socials" aria-pressed="' +
          (active === "socials") +
          '">Socials</button></div>'
        );
      }

      const VIEWS: Record<string, () => string> = {
        about: function () {
          return (
            "" +
            '<div class="k">Section 01 · Identity</div>' +
            '<div class="about-top"><svg viewBox="-50 -50 100 100" aria-hidden="true"><circle r="46" fill="none" stroke="#14465c" stroke-width="1"/><circle class="av-spin" r="40" fill="none" stroke="#6fe7ff" stroke-width="2" stroke-dasharray="6 5"/><circle r="32" fill="#0a2230" stroke="#6fe7ff" stroke-width="1"/><text y="8" text-anchor="middle" font-family="Oxanium, sans-serif" font-weight="700" font-size="22" fill="#e6fbff">NT</text></svg>' +
            '<div><h2 class="h">Nukul Talwar</h2><p class="sub">Software Engineer & Frontend Developer</p></div></div>' +
            '<p class="lead">I build modern, responsive and interactive web experiences using JavaScript, React, HTML and CSS. Bridging creative UI design with clean engineering architecture to deliver fast, accessible, and delightful digital products.</p>' +
            '<dl class="facts">' +
            "<dt>Role</dt><dd>Software Engineer & Frontend Developer</dd>" +
            "<dt>Core Focus</dt><dd>Component Architecture, Motion, Modern React & Performance</dd>" +
            "<dt>Daily Stack</dt><dd>React.js, JavaScript (ES6+), TypeScript, HTML5, CSS3, Vite</dd>" +
            "<dt>Location</dt><dd>Available for Remote & Onsite Roles</dd>" +
            '<dt>Status</dt><dd><span class="dot"></span>Open to Opportunities</dd>' +
            "</dl>"
          );
        },
        resume: function () {
          return (
            "" +
            '<div class="k">Section 02 · The record</div>' +
            seg("resume") +
            '<h2 class="h">Résumé & Credentials</h2>' +
            '<p class="lead">Specialized in engineering robust, performant front-end web applications with clean modular architecture, accessible semantic code, and interactive micro-animations.</p>' +
            '<div style="margin: 12px 0;"><a class="btn" href="/1Nukul_Talwar.pdf" download="Nukul_Talwar_Resume.pdf" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block;">Download Official PDF ↗</a></div>' +
            '<div class="tl">' +
            '<div class="tl-i"><time>Core</time><div><h4>Software Engineering & Frontend</h4><p>Extensive experience architecting modular components, custom audio controllers, dynamic streaming layouts, and interactive state workflows.</p></div></div>' +
            '<div class="tl-i"><time>Architecture</time><div><h4>Clean Architecture & State Engines</h4><p>Scalable, readable, and maintainable codebase structure following modern component-driven best practices and rigorous linting.</p></div></div>' +
            '<div class="tl-i"><time>Integration</time><div><h4>API & Asynchronous Data Pipelines</h4><p>Seamless connection to RESTful endpoints, weather APIs, recommendation similarity matrices, and local storage persistence.</p></div></div>' +
            '<div class="tl-i"><time>Foundation</time><div><h4>Computer Science & Engineering</h4><p>Algorithmic foundations, data structures, object-oriented concepts, and performance tuning.</p></div></div>' +
            "</div>"
          );
        },
        socials: function () {
          return (
            "" +
            '<div class="k">Section 02 · The network</div>' +
            seg("socials") +
            '<h2 class="h">Find me online</h2>' +
            "<p class=\"lead\">Production repositories on GitHub, professional network on LinkedIn, and direct contact line.</p>" +
            '<div class="socials">' +
            SOCIALS.map(function (s) {
              return (
                '<a class="social" href="' +
                s[3] +
                '" target="_blank" rel="noopener"><span class="hx">' +
                s[0] +
                "</span><span><b>" +
                s[1] +
                "</b><small>" +
                s[2] +
                "</small></span><i>↗</i></a>"
              );
            }).join("") +
            "</div>"
          );
        },
        work: function () {
          return (
            "" +
            '<div class="k">Section 03 · Engineering Workflow & Case Studies</div><h2 class="h">How I Build</h2>' +
            '<p class="lead">From initial user journey discovery to high-performance production delivery.</p>' +
            '<article class="card"><div class="meta"><span>Workflow Stage 01 - 02</span><span>Architecture & Wireframing</span></div><h3 class="h3">Understand & Component Design</h3><div class="metric"><b>100%</b><span>Modular Breakdown</span></div><p>Mapping user journeys and defining strict component hierarchies, design tokens, color harmonies, and responsive layout blueprints prior to coding.</p><div class="tagrow"><span>User Journey</span><span>Design Tokens</span><span>Architecture</span></div></article>' +
            '<article class="card"><div class="meta"><span>Workflow Stage 03 - 04</span><span>Build & Integration</span></div><h3 class="h3">Clean Code & REST API Integration</h3><div class="metric"><b>0ms</b><span>Optimistic State Updates</span></div><p>Developing accessible semantic interfaces connected to RESTful endpoints with defensive error boundaries and caching.</p><div class="tagrow"><span>React</span><span>ES6+</span><span>REST APIs</span><span>State Sync</span></div></article>' +
            '<article class="card"><div class="meta"><span>Workflow Stage 05 - 06</span><span>Validation & Launch</span></div><h3 class="h3">Multi-Device Testing & Production Deploy</h3><div class="metric"><b>60 fps</b><span>Fluid Framerate</span></div><p>Cross-browser verification, responsive validation across mobile and desktop, and optimized asset bundling for sub-second page loads.</p><div class="tagrow"><span>Vite</span><span>Lighthouse</span><span>Responsive</span><span>Accessibility</span></div></article>'
          );
        },
        projects: function () {
          return (
            "" +
            '<div class="k">Section 04 · Featured Work</div><h2 class="h">My Projects</h2>' +
            '<p class="lead">Real, verifiable production applications and engineering showcases from my portfolio.</p>' +
            '<div class="grid2">' +
            '<article class="card"><div class="meta"><span class="status live">Featured</span></div><h3 class="h3">Podcast Website</h3><p>Audio Streaming & Content Discovery Platform with custom scrubber, responsive playlist archives, and category filters.</p><div class="tagrow"><span>React</span><span>Audio API</span><span>CSS3</span></div><a class="more" href="https://github.com/Nukultalwar/prodcast-website" target="_blank" rel="noopener">GitHub Repo ↗</a></article>' +
            '<article class="card"><div class="meta"><span class="status live">Featured</span></div><h3 class="h3">Netflix Clone</h3><p>Cinematic entertainment streaming UI featuring dynamic carousels, backdrop banners, movie previews, and dark theme.</p><div class="tagrow"><span>JavaScript</span><span>HTML5</span><span>CSS Grid</span></div><a class="more" href="https://github.com/Nukultalwar/Netflix_Clone" target="_blank" rel="noopener">GitHub Repo ↗</a></article>' +
            '<article class="card"><div class="meta"><span class="status beta">Algorithm</span></div><h3 class="h3">Movie Recommendation</h3><p>Intelligent discovery engine matching user taste with movie feature matrices, genre filters, and rating algorithms.</p><div class="tagrow"><span>Python</span><span>Algorithms</span><span>Data</span></div><a class="more" href="https://github.com/Nukultalwar/Movie-Recommender-System" target="_blank" rel="noopener">GitHub Repo ↗</a></article>' +
            '<article class="card"><div class="meta"><span class="status live">Utility</span></div><h3 class="h3">Weather Dashboard</h3><p>Real-time meteorological forecast interface connecting to OpenWeather REST APIs with dynamic condition visuals.</p><div class="tagrow"><span>REST API</span><span>JavaScript</span><span>Geolocation</span></div><a class="more" href="https://github.com/Nukultalwar/weather_app" target="_blank" rel="noopener">GitHub Repo ↗</a></article>' +
            '<article class="card"><div class="meta"><span class="status live">App</span></div><h3 class="h3">Todo Productivity App</h3><p>Persistent task manager featuring CRUD operations, completion filters, and LocalStorage data synchronization.</p><div class="tagrow"><span>LocalStorage</span><span>CRUD</span><span>JavaScript</span></div><a class="more" href="https://github.com/Nukultalwar/todo-app" target="_blank" rel="noopener">GitHub Repo ↗</a></article>' +
            '<article class="card"><div class="meta"><span class="status live">Frontend</span></div><h3 class="h3">Hotel Booking Website</h3><p>Hospitality reservation portal engineered with typed components, room galleries, amenity filters, and booking flow.</p><div class="tagrow"><span>TypeScript</span><span>Responsive</span><span>HTML5</span></div><a class="more" href="https://github.com/Nukultalwar/hotel-website" target="_blank" rel="noopener">GitHub Repo ↗</a></article>' +
            '<article class="card"><div class="meta"><span class="status wip">Interactive</span></div><h3 class="h3">Quick Quiz</h3><p>Gamified knowledge testing app with countdown timers, dynamic scoring state machine, and instant feedback.</p><div class="tagrow"><span>JavaScript</span><span>State Machine</span></div><a class="more" href="https://github.com/Nukultalwar/quick-quiz" target="_blank" rel="noopener">GitHub Repo ↗</a></article>' +
            "</div>"
          );
        },
        skills: function () {
          let idx = 0;
          return (
            "" +
            '<div class="k">Section 05 · Toolkit</div><h2 class="h">My Skills</h2>' +
            SKILLS.map(function (g) {
              return (
                '<div class="skill-group"><p class="sub">' +
                g[0] +
                "</p>" +
                (g[1] as [string, number][])
                  .map(function (sk) {
                    const h =
                      '<div class="skill"><span>' +
                      sk[0] +
                      "</span>" +
                      gauge(sk[1], idx) +
                      "<em>" +
                      (sk[1] < 10 ? "0" : "") +
                      sk[1] +
                      "</em></div>";
                    idx += 2;
                    return h;
                  })
                  .join("") +
                "</div>"
              );
            }).join("")
          );
        },
        connect: function () {
          return (
            "" +
            '<div class="k">Section 06 · Signal</div><h2 class="h">Let’s build something</h2>' +
            "<p class=\"lead\">Have an opportunity, a project, or want to discuss frontend architecture? Send a signal directly.</p>" +
            '<div class="card"><div class="mail"><code>' +
            EMAIL +
            '</code><button class="btn" type="button" data-copy="' +
            EMAIL +
            '">Copy</button></div></div>' +
            '<form id="cform" autocomplete="on"><label for="cf-name">Name<input id="cf-name" name="name" type="text" placeholder="Tony Stark" required></label><label for="cf-mail">Email<input id="cf-mail" name="email" type="email" placeholder="you@company.com" required></label><label for="cf-msg">Message<textarea id="cf-msg" name="message" placeholder="What are we building?" required></textarea></label><button class="btn" type="submit">Send signal</button><p class="note" id="cnote" hidden></p></form>' +
            '<p class="sub">Prefer social? <button class="more" type="button" data-go="socials" style="background:none;border-top:0;border-left:0;border-right:0;cursor:pointer;padding:0;margin:0">See all profiles</button></p>'
          );
        },
      };

      const chipLabels: Record<string, string> = {
        about: "About",
        resume: "Résumé",
        socials: "Socials",
        work: "Work",
        projects: "Projects",
        skills: "Skills",
        connect: "Connect",
      };

      chipsEl.innerHTML = "";
      ORDER.forEach(function (v) {
        const c = document.createElement("button");
        c.type = "button";
        c.className = "chip";
        c.dataset.go = v;
        c.textContent = chipLabels[v];
        chipsEl.appendChild(c);
      });

      function paintPanel() {
        const v = state.view;
        if (!v) return;
        crumb.textContent = NUM[v] + " / 06 · " + TITLES[v];
        pbody.innerHTML = VIEWS[v]();
        pbody.scrollTop = 0;
        panel.classList.remove("shown");
        void panel.offsetWidth;
        requestAnimationFrame(function () {
          panel.classList.add("shown");
        });
        const cur = $(".chip[data-go='" + v + "']", chipsEl);
        if (cur && cur.scrollIntoView) {
          try {
            cur.scrollIntoView({ inline: "center", block: "nearest" });
          } catch (_) {}
        }
      }

      chipsEl.addEventListener("click", function (e: any) {
        const c = e.target.closest(".chip");
        if (c) openView(c.dataset.go);
      });

      panel.addEventListener("click", function (e: any) {
        const g = e.target.closest("[data-go]");
        if (g && !g.classList.contains("chip")) {
          openView(g.dataset.go);
          return;
        }
        const c = e.target.closest("[data-copy]");
        if (c) copyText(c.dataset.copy, c);
      });

      panel.addEventListener("submit", function (e: any) {
        if (e.target.id !== "cform") return;
        e.preventDefault();
        const n = $("#cnote");
        n.hidden = false;
        n.textContent =
          "Signal received. Direct transmission queued for Nukul at " + EMAIL + ".";
      });

      $("#close").addEventListener("click", closePanel);
      reasm.addEventListener("click", reassemble);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && state.view) closePanel();
      });

      function copyText(txt: string, btn: HTMLElement) {
        const o = btn.textContent;
        function done() {
          btn.textContent = "Copied";
          setTimeout(function () {
            btn.textContent = o;
          }, 1400);
        }
        function fb() {
          const ta = document.createElement("textarea");
          ta.value = txt;
          ta.style.cssText = "position:fixed;opacity:0";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            done();
          } catch (_) {
            btn.textContent = "Select & copy";
          }
          ta.remove();
        }
        try {
          navigator.clipboard.writeText(txt).then(done, fb);
        } catch (_) {
          fb();
        }
      }

      /* ---------- ambient telemetry ---------- */
      const barGroups = $$(".bar-g div");
      barGroups.forEach(function (g: HTMLElement) {
        g.innerHTML = "";
        for (let i = 0; i < 12; i++) {
          g.appendChild(document.createElement("i"));
        }
      });

      function tick() {
        const out = $("#out");
        if (out) out.textContent = (2.94 + Math.random() * 0.12).toFixed(2);
        barGroups.forEach(function (g: HTMLElement) {
          $$("i", g).forEach(function (b: HTMLElement) {
            b.style.height = 18 + Math.random() * 82 + "%";
          });
        });
        $$("[data-rd]").forEach(function (el: HTMLElement) {
          const base = +(el.dataset.rd || 50),
            v = Math.max(2, Math.min(99, Math.round(base + (Math.random() * 6 - 3))));
          el.innerHTML = v + "<small>%</small>";
        });
      }
      tick();
      if (!reduce)
        setInterval(function () {
          if (!document.hidden) tick();
        }, 1100);

      /* =====================================================================
         3D ENGINE
         ===================================================================== */
      function initGL() {
        const THREE = (window as any).THREE;
        const cv = $("#gl");
        const renderer = new THREE.WebGLRenderer({
          canvas: cv,
          antialias: true,
          powerPreference: "high-performance",
        });
        let W = window.innerWidth,
          H = window.innerHeight;
        const PR = Math.min(window.devicePixelRatio || 1, narrow() ? 1.6 : 2);
        renderer.setPixelRatio(PR);
        renderer.setSize(W, H, false);
        renderer.setClearColor(0x02060a, 1);

        const scene = new THREE.Scene();
        const CAMZ = 8.2;
        const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 300);
        cam.position.set(0, 0, CAMZ);

        /* ----- post processing: HDR bloom + filmic grade ----- */
        let composer: any = null,
          finalPass: any = null,
          bloom: any = null;
        const ext = function (n: string) {
          try {
            return !!renderer.extensions.has(n);
          } catch (e) {
            return false;
          }
        };
        const isGL2 = !!renderer.capabilities.isWebGL2;
        const canHDR = isGL2
          ? ext("EXT_color_buffer_float") || ext("EXT_color_buffer_half_float")
          : ext("OES_texture_half_float") && ext("EXT_color_buffer_half_float");

        if (
          canHDR &&
          THREE.EffectComposer &&
          THREE.UnrealBloomPass &&
          THREE.ShaderPass &&
          THREE.RenderPass
        ) {
          try {
            const opts: any = {
              type: THREE.HalfFloatType,
              format: THREE.RGBAFormat,
              minFilter: THREE.LinearFilter,
              magFilter: THREE.LinearFilter,
            };
            if (isGL2 && ext("EXT_color_buffer_float")) opts.samples = narrow() ? 2 : 4;
            const rt = new THREE.WebGLRenderTarget(W * PR, H * PR, opts);
            composer = new THREE.EffectComposer(renderer, rt);
            composer.addPass(new THREE.RenderPass(scene, cam));
            bloom = new THREE.UnrealBloomPass(
              new THREE.Vector2(W * PR * 0.5, H * PR * 0.5),
              0.55,
              0.6,
              0.95
            );
            composer.addPass(bloom);
            finalPass = new THREE.ShaderPass({
              uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
              vertexShader:
                "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
              fragmentShader: [
                "varying vec2 vUv;uniform sampler2D tDiffuse;uniform float uTime;",
                "vec3 aces(vec3 x){const float a=2.51,b=.03,c=2.43,d=.59,e=.14;return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.,1.);}",
                "float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}",
                "void main(){",
                " vec2 d=vUv-.5;float r=dot(d,d);vec2 off=d*r*.008;",
                " vec3 col=vec3(texture2D(tDiffuse,vUv+off).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-off).b);",
                " col=aces(col*.78);col=pow(col,vec3(1./2.2));",
                " col*=1.-r*.85;",
                " col+=(hash(vUv*1200.+uTime)-.5)*.016;",
                " gl_FragColor=vec4(col,1.);}",
              ].join("\n"),
            });
            composer.addPass(finalPass);
            composer.setSize(W * PR, H * PR);
          } catch (err) {
            console.warn("post fx off", err);
            composer = null;
          }
        }
        if (!composer) {
          renderer.outputEncoding = THREE.sRGBEncoding;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 0.85;
        }

        /* ----- studio environment for metal reflections ----- */
        (function () {
          const s = new THREE.Scene();
          s.add(
            new THREE.Mesh(
              new THREE.BoxGeometry(24, 24, 24),
              new THREE.MeshBasicMaterial({ color: 0x04090e, side: THREE.BackSide })
            )
          );
          function pnl(w: number, h: number, pos: number[], col: number, k: number) {
            const m = new THREE.Mesh(
              new THREE.PlaneGeometry(w, h),
              new THREE.MeshBasicMaterial({
                color: new THREE.Color(col).multiplyScalar(k),
                side: THREE.DoubleSide,
              })
            );
            m.position.set(pos[0], pos[1], pos[2]);
            m.lookAt(0, 0, 0);
            s.add(m);
          }
          pnl(10, 3, [0, 10, 2], 0xffffff, 4.6);
          pnl(3, 9, [-10, 1, 3], 0xbfe9ff, 2.4);
          pnl(3, 9, [10, -1, 2], 0xffd2b0, 1.7);
          pnl(12, 2, [0, -9, 4], 0x6fe7ff, 1.6);
          pnl(7, 7, [0, 2, 10], 0xffffff, 1.3);
          pnl(5, 5, [-6, 6, -8], 0x4aa8ff, 2);
          const pm = new THREE.PMREMGenerator(renderer);
          scene.environment = pm.fromScene(s, 0.03).texture;
          pm.dispose();
        })();

        /* ----- lights ----- */
        scene.add(new THREE.AmbientLight(0x1b2c38, 0.55));
        const key = new THREE.DirectionalLight(0xe2f7ff, 1.0);
        key.position.set(3, 6, 6);
        scene.add(key);
        const rimL = new THREE.DirectionalLight(0x4ab4ff, 0.9);
        rimL.position.set(-6, -3, -5);
        scene.add(rimL);
        const warm = new THREE.DirectionalLight(0xffc99a, 0.45);
        warm.position.set(6, -2, 3);
        scene.add(warm);

        /* ----- helpers ----- */
        const hdr = (hex: number, k: number) => new THREE.Color(hex).multiplyScalar(k);
        const basic = (hex: number, k: number) => new THREE.MeshBasicMaterial({ color: hdr(hex, k) });
        const noRay = (o: any) => {
          o.raycast = function () {};
          return o;
        };

        function wireTex() {
          const c = document.createElement("canvas");
          c.width = 512;
          c.height = 32;
          const g = c.getContext("2d")!;
          g.fillStyle = "#1b0d06";
          g.fillRect(0, 0, 512, 32);
          for (let x = 0; x < 512; x += 8) {
            const gr = g.createLinearGradient(x, 0, x + 8, 0);
            gr.addColorStop(0, "#281206");
            gr.addColorStop(0.3, "#a55627");
            gr.addColorStop(0.5, "#f6aa70");
            gr.addColorStop(0.7, "#be6b33");
            gr.addColorStop(1, "#281206");
            g.fillStyle = gr;
            g.fillRect(x, 0, 8, 32);
          }
          const t = new THREE.CanvasTexture(c);
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.anisotropy = 8;
          return t;
        }

        function pcbTex() {
          const c = document.createElement("canvas");
          c.width = 512;
          c.height = 512;
          const g = c.getContext("2d")!;
          g.fillStyle = "#041410";
          g.fillRect(0, 0, 512, 512);
          g.strokeStyle = "#1b5e40";
          g.lineWidth = 1.5;
          for (let i = 0; i < 40; i++) {
            g.beginPath();
            const y = (i * 13) % 512;
            g.moveTo(0, y);
            g.lineTo(150, y);
            g.lineTo(200, (y + 50) % 512);
            g.lineTo(512, (y + 50) % 512);
            g.stroke();
          }
          g.fillStyle = "#d4af37";
          for (let i = 0; i < 60; i++) {
            const px = (i * 37) % 512, py = (i * 59) % 512;
            g.beginPath();
            g.arc(px, py, 2.5, 0, Math.PI * 2);
            g.fill();
          }
          const t = new THREE.CanvasTexture(c);
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(4, 2);
          return t;
        }

        function glowTex() {
          const c = document.createElement("canvas");
          c.width = c.height = 128;
          const g = c.getContext("2d")!;
          const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
          gr.addColorStop(0, "rgba(255,255,255,1)");
          gr.addColorStop(0.18, "rgba(180,240,255,.55)");
          gr.addColorStop(0.5, "rgba(60,170,230,.16)");
          gr.addColorStop(1, "rgba(0,0,0,0)");
          g.fillStyle = gr;
          g.fillRect(0, 0, 128, 128);
          return new THREE.CanvasTexture(c);
        }

        const GLOW = glowTex();
        const wt = wireTex();
        const pcb = pcbTex();
        const chrome = new THREE.MeshStandardMaterial({ color: 0xeef5fc, metalness: 1.0, roughness: 0.12 });
        const steel = new THREE.MeshStandardMaterial({ color: 0xb5c4d2, metalness: 0.95, roughness: 0.24 });
        const gun = new THREE.MeshStandardMaterial({ color: 0x3d4752, metalness: 0.9, roughness: 0.38 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x070c10, metalness: 0.8, roughness: 0.6 });
        const gold = new THREE.MeshStandardMaterial({ color: 0xf3ba48, metalness: 0.95, roughness: 0.22 });
        const frostedGlass = new THREE.MeshPhysicalMaterial({
          color: 0xddf8ff,
          metalness: 0.1,
          roughness: 0.25,
          transmission: 0.75,
          opacity: 0.85,
          transparent: true,
          ior: 1.5,
          thickness: 0.35,
          depthWrite: false,
        });
        const pcbMat = new THREE.MeshStandardMaterial({
          map: pcb,
          metalness: 0.4,
          roughness: 0.45,
          side: THREE.DoubleSide,
        });
        const copperBase = { color: 0xda7232, metalness: 0.95, roughness: 0.28 };
        const wt1 = wt.clone();
        wt1.needsUpdate = true;
        wt1.repeat.set(1, 1);
        const copperBlock = new THREE.MeshStandardMaterial(
          Object.assign({ bumpMap: wt1, bumpScale: 3.5, roughness: 0.3 }, copperBase)
        );
        const wt2 = wt.clone();
        wt2.needsUpdate = true;
        wt2.repeat.set(160, 1);
        const copperRing = new THREE.MeshStandardMaterial(
          Object.assign({ bumpMap: wt2, bumpScale: 4.0 }, copperBase)
        );

        const UVS =
          "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
        const coreMat = new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 } },
          vertexShader: UVS,
          fragmentShader:
            "varying vec2 vUv;uniform float uTime;void main(){vec2 p=vUv-.5;float d=length(p)*2.;float pulse=.92+.08*sin(uTime*2.4);vec3 c=mix(vec3(3.2,3.4,3.6),vec3(.25,1.0,1.7),smoothstep(.0,.95,d));c*=pulse;float m=smoothstep(1.,.93,d);gl_FragColor=vec4(c*m,1.);}",
        });
        const plasmaMat = new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 } },
          vertexShader: UVS,
          fragmentShader:
            "varying vec2 vUv;uniform float uTime;void main(){float f=.5+.5*sin(vUv.x*90.-uTime*5.);float g=.5+.5*sin(vUv.x*26.+uTime*2.2);float sh=.7+.3*cos(vUv.y*6.2831);vec3 c=mix(vec3(.12,.7,1.3),vec3(.9,2.1,2.8),f*g);gl_FragColor=vec4(c*sh*1.7,1.);}",
        });
        const beamMat = new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uK: { value: 1 } },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexShader: UVS,
          fragmentShader:
            "varying vec2 vUv;uniform float uTime;uniform float uK;void main(){float d=step(.45,fract(vUv.y*26.-uTime*1.6));float a=(.25+.75*d)*uK;gl_FragColor=vec4(vec3(.35,1.1,1.6)*a*2.,a);}",
        });
        const axisMat = new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uK: { value: 0 } },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexShader: UVS,
          fragmentShader:
            "varying vec2 vUv;uniform float uTime;uniform float uK;void main(){float d=step(.5,fract(vUv.y*34.-uTime*1.2));float a=(.18+.5*d)*uK;gl_FragColor=vec4(vec3(.35,1.0,1.5)*a*2.,a);}",
        });

        const torus = (R: number, r: number, m: any, seg?: number, tube?: number, arc?: number) =>
          new THREE.Mesh(new THREE.TorusGeometry(R, r, tube || 14, seg || 96, arc || Math.PI * 2), m);

        function latheZ(pts: number[][], seg: number) {
          const g = new THREE.LatheGeometry(
            pts.map((p) => new THREE.Vector2(p[0], p[1])),
            seg
          );
          g.rotateX(Math.PI / 2);
          return g;
        }

        function sector(r0: number, r1: number, a0: number, a1: number, depth: number, bev: number) {
          const s = new THREE.Shape();
          s.absarc(0, 0, r1, a0, a1, false);
          s.absarc(0, 0, r0, a1, a0, true);
          s.closePath();
          const g = new THREE.ExtrudeGeometry(s, {
            depth: depth,
            bevelEnabled: bev > 0,
            bevelThickness: bev,
            bevelSize: bev,
            bevelSegments: 2,
            curveSegments: 10,
          });
          g.translate(0, 0, -depth / 2);
          return g;
        }

        function flatRing(r0: number, r1: number, depth: number) {
          const s = new THREE.Shape();
          s.absarc(0, 0, r1, 0, Math.PI * 2, false);
          const h = new THREE.Path();
          h.absarc(0, 0, r0, 0, Math.PI * 2, true);
          s.holes.push(h);
          const g = new THREE.ExtrudeGeometry(s, {
            depth: depth,
            bevelEnabled: false,
            curveSegments: 64,
          });
          g.translate(0, 0, -depth / 2);
          return g;
        }

        function tri(r: number) {
          const s = new THREE.Shape();
          for (let k = 0; k < 3; k++) {
            const a = -Math.PI / 2 + (k * Math.PI * 2) / 3;
            const x = Math.cos(a) * r,
              y = Math.sin(a) * r;
            if (k) {
              s.lineTo(x, y);
            } else {
              s.moveTo(x, y);
            }
          }
          s.closePath();
          return s;
        }

        function mk(id: string) {
          const g = new THREE.Group();
          g.userData.sec = id;
          return g;
        }

        /* ----- reactor: original concentric front face + solid tapering rear body ----- */
        const posG = new THREE.Group();
        scene.add(posG);
        const floatG = new THREE.Group();
        posG.add(floatG);
        const rig = new THREE.Group();
        floatG.add(rig);

        const ZA = [0.24, 0.15, 0.09, 0.11, 0.0, -0.02];
        const ZE = [2.2, 1.35, 0.5, -0.35, -1.2, -2.05];
        const OUTR = [0.55, 0.85, 1.3, 1.5, 1.9, 2.3];
        const SPIN = [0, 0, -0.18, 0.32, -0.07, 0.05];
        const DIAM = 4.8,
          EXT = 7.2;
        const L: any[] = [];
        const shellMat = new THREE.MeshStandardMaterial({
          color: 0x6d7b88,
          metalness: 1,
          roughness: 0.3,
          side: THREE.DoubleSide,
        });

        /* 01 core: layered mechanical palladium core with inner coil, wire feeds, and deep reflector */
        (function () {
          const g = mk("about");
          // Deep reflector housing
          g.add(
            new THREE.Mesh(
              latheZ(
                [
                  [0, -0.25],
                  [0.45, -0.22],
                  [0.55, -0.07],
                  [0.55, 0.07],
                  [0.5, 0.14],
                  [0, 0.14],
                ],
                72
              ),
              dark
            )
          );
          // Inner turbine chamber with metallic radial fins
          for (let f = 0; f < 12; f++) {
            const an = (f * Math.PI * 2) / 12;
            const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.2), gun);
            fin.position.set(Math.cos(an) * 0.28, Math.sin(an) * 0.28, -0.05);
            fin.rotation.z = an;
            g.add(fin);
          }
          // Center copper magnetic choke
          const innerCoil = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 16, 64), copperBlock);
          innerCoil.position.z = 0.02;
          g.add(innerCoil);

          // Deep glowing core emitter disc
          const deepCore = new THREE.Mesh(new THREE.CircleGeometry(0.38, 64), coreMat);
          deepCore.position.z = 0.05;
          g.add(deepCore);

          // Frosted glass protective lens with high refraction
          const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.03, 64).rotateX(Math.PI / 2), frostedGlass);
          lens.position.z = 0.11;
          g.add(lens);

          // Stepped chrome retention bezel
          const rim = torus(0.5, 0.032, chrome, 72, 12);
          rim.position.z = 0.13;
          g.add(rim);

          const disc = new THREE.Mesh(new THREE.CircleGeometry(0.45, 72), coreMat);
          disc.position.z = 0.123;
          g.add(disc);

          // Central triangular reactor frame
          const ts = tri(0.37);
          const hp = new THREE.Path();
          const hs = tri(0.25).getPoints();
          hs.forEach(function (p: any, i: number) {
            if (i) {
              hp.lineTo(p.x, p.y);
            } else {
              hp.moveTo(p.x, p.y);
            }
          });
          ts.holes.push(hp);
          const trim = new THREE.Mesh(
            new THREE.ExtrudeGeometry(ts, { depth: 0.025, bevelEnabled: false }),
            chrome
          );
          trim.position.z = 0.132;
          g.add(trim);

          // Glowing triangular energy emitter
          const innerTri = new THREE.Mesh(new THREE.ShapeGeometry(tri(0.24)), basic(0xffffff, 3.8));
          innerTri.position.z = 0.138;
          g.add(innerTri);

          // Center primary diode dot
          const dot = new THREE.Mesh(new THREE.CircleGeometry(0.08, 32), basic(0x6fe7ff, 4.2));
          dot.position.z = 0.142;
          g.add(dot);

          // 48 interlocking precision gear teeth with socket fasteners
          const teeth = new THREE.InstancedMesh(new THREE.BoxGeometry(0.022, 0.07, 0.035), chrome, 48);
          {
            const tm = new THREE.Matrix4(),
              tq = new THREE.Quaternion(),
              tv = new THREE.Vector3(),
              ts2 = new THREE.Vector3(1, 1, 1),
              tz = new THREE.Vector3(0, 0, 1);
            for (let i = 0; i < 48; i++) {
              const a = (i * Math.PI) / 24;
              tv.set(Math.cos(a) * 0.47, Math.sin(a) * 0.47, 0.135);
              tq.setFromAxisAngle(tz, a + Math.PI / 2);
              tm.compose(tv, tq, ts2);
              teeth.setMatrixAt(i, tm);
            }
          }
          g.add(teeth);

          // Hex screws around perimeter
          for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4 + 0.2;
            const b = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 6).rotateX(Math.PI / 2), gold);
            b.position.set(Math.cos(a) * 0.535, Math.sin(a) * 0.535, 0.145);
            g.add(b);
          }

          const halo = noRay(
            new THREE.Sprite(
              new THREE.SpriteMaterial({
                map: GLOW,
                color: 0x7fe8ff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
                opacity: 0.65,
              })
            )
          );
          halo.scale.set(3.2, 3.2, 1);
          halo.position.z = 0.4;
          g.add(halo);

          const light = new THREE.PointLight(0x7fe8ff, 3.2, 12, 1.5);
          light.position.z = 0.5;
          g.add(light);
          g.userData.halo = halo;
          g.userData.light = light;
          L.push({ id: "about", g: g, sp: null });
        })();

        /* 02 résumé: authentic 10-coil electromagnetic ring with hand-wound copper coils, black brackets, and wire jumpers */
        const halves: any = {};
        const segMats: any[] = [];
        (function () {
          const g = mk("resume");
          ["l", "r"].forEach(function (k) {
            const h = new THREE.Group();
            h.userData.view = k === "l" ? "resume" : "socials";
            const anchor = new THREE.Object3D();
            anchor.position.set(k === "l" ? -0.45 : 0.45, 0, 0);
            h.add(anchor);
            h.userData.anchor = anchor;
            const arc = Math.PI;

            // Thick acrylic frosted substrate ring (MK1 diffuser)
            const acrylicRing = new THREE.Mesh(
              new THREE.TorusGeometry(0.72, 0.15, 16, 64, arc),
              frostedGlass
            );
            acrylicRing.rotation.z = k === "l" ? Math.PI / 2 : -Math.PI / 2;
            acrylicRing.position.z = 0.02;
            h.add(acrylicRing);

            // Stainless steel inner and outer retaining rings
            const a1 = torus(0.88, 0.026, chrome, 48, 10, arc);
            a1.rotation.z = k === "l" ? Math.PI / 2 : -Math.PI / 2;
            a1.position.z = 0.07;
            h.add(a1);
            const a2 = torus(0.55, 0.026, chrome, 48, 10, arc);
            a2.rotation.z = a1.rotation.z;
            a2.position.z = 0.07;
            h.add(a2);

            // Dark anodized chassis backplate with circuit trace texture
            const back = new THREE.Mesh(
              sector(
                0.54,
                0.89,
                k === "l" ? Math.PI / 2 : -Math.PI / 2,
                k === "l" ? Math.PI * 1.5 : Math.PI / 2,
                0.06,
                0
              ),
              pcbMat
            );
            back.position.z = -0.02;
            h.add(back);
            halves[k] = h;
            g.add(h);
          });

          // Accurate 10-Coil MK1 configuration (5 coils per half)
          for (let i = 0; i < 10; i++) {
            const ac = (i * Math.PI * 2) / 10 + Math.PI / 10;
            const half = Math.cos(ac) > 0 ? halves.r : halves.l;
            const coilGrp = new THREE.Group();
            coilGrp.position.set(Math.cos(ac) * 0.72, Math.sin(ac) * 0.72, 0.06);
            coilGrp.rotation.z = ac + Math.PI / 2;

            // Coil core (bobbin) with copper wire windings
            const bobbin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.16), copperBlock);
            coilGrp.add(bobbin);

            // Black/gunmetal bracket clamp that holds the coil to the ring
            const clampBracket = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.18), gun);
            clampBracket.position.z = 0.01;
            coilGrp.add(clampBracket);

            // Top chrome retention plate with exposed hex screws
            const topCap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.13, 0.02), chrome);
            topCap.position.z = 0.1;
            coilGrp.add(topCap);

            // Miniature hex screw on each coil clamp
            const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 6).rotateX(Math.PI / 2), gold);
            screw.position.set(0, 0, 0.115);
            coilGrp.add(screw);

            // Glowing light emitter slot between coils
            const m = basic(0x6fe7ff, 2.5);
            segMats.push(m);
            const emitSlot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.05), m);
            emitSlot.position.set(0, 0.075, 0.02);
            coilGrp.add(emitSlot);

            // Real copper wire jumpers linking coils
            const wireJumper = new THREE.Mesh(
              new THREE.TorusGeometry(0.05, 0.008, 6, 16, Math.PI),
              copperBlock
            );
            wireJumper.position.set(0.12, 0, 0.08);
            wireJumper.rotation.y = Math.PI / 2;
            coilGrp.add(wireJumper);

            half.add(coilGrp);
          }

          const beam = noRay(
            new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1, 8, 1, true).rotateZ(Math.PI / 2), beamMat)
          );
          beam.position.z = 0.06;
          beam.scale.x = 0.0001;
          beam.visible = false;
          g.add(beam);
          g.userData.beam = beam;
          L.push({ id: "resume", g: g, sp: null });
        })();

        /* 03 work: ten copper coil transformer blocks with visible heavy wire windings and cooling channels */
        (function () {
          const g = mk("work"),
            sp = new THREE.Group();
          g.add(sp);
          const base = new THREE.Mesh(flatRing(0.88, 1.34, 0.05), dark);
          base.position.z = -0.03;
          sp.add(base);

          // Dual precision machined locking rings with Allen bolt recesses
          sp.add(torus(0.9, 0.032, chrome, 80, 10));
          sp.add(torus(1.31, 0.036, chrome, 96, 10));

          // Retaining circuit ring underneath the copper blocks
          const underPcb = new THREE.Mesh(flatRing(0.92, 1.28, 0.015), pcbMat);
          underPcb.position.z = -0.01;
          sp.add(underPcb);

          const sh = new THREE.Shape();
          sh.moveTo(-0.15, 0.96);
          sh.lineTo(0.15, 0.96);
          sh.lineTo(0.235, 1.25);
          sh.lineTo(-0.235, 1.25);
          sh.closePath();
          const geo = new THREE.ExtrudeGeometry(sh, {
            depth: 0.22,
            bevelEnabled: true,
            bevelThickness: 0.015,
            bevelSize: 0.015,
            bevelSegments: 3,
          });
          geo.translate(0, 0, -0.11);

          const cs = new THREE.Shape();
          cs.moveTo(-0.1, 1.0);
          cs.lineTo(0.1, 1.0);
          cs.lineTo(0.17, 1.22);
          cs.lineTo(-0.17, 1.22);
          cs.closePath();
          const cap = new THREE.ExtrudeGeometry(cs, { depth: 0.035, bevelEnabled: false });
          cap.translate(0, 0, 0.11);

          const slit = new THREE.BoxGeometry(0.032, 0.17, 0.01);
          const sm = basic(0x6fe7ff, 2.8);

          for (let i = 0; i < 10; i++) {
            const b = new THREE.Group();
            b.rotation.z = (i * Math.PI) / 5;
            b.add(new THREE.Mesh(geo, copperBlock));
            b.add(new THREE.Mesh(cap, chrome));

            // Central blue indicator line
            const sl = new THREE.Mesh(slit, sm);
            sl.position.set(0, 1.11, 0.145);
            b.add(sl);

            // Exposed terminal soldering lugs
            const lug1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 6).rotateX(Math.PI / 2), gold);
            lug1.position.set(-0.08, 0.98, 0.135);
            b.add(lug1);
            const lug2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 6).rotateX(Math.PI / 2), gold);
            lug2.position.set(0.08, 0.98, 0.135);
            b.add(lug2);

            sp.add(b);
          }
          L.push({ id: "work", g: g, sp: sp });
        })();

        /* 04 projects: flowing plasma ring, internal glowing quartz ring + heatsink drum behind it */
        let ember1: any = null,
          ember2: any = null;
        (function () {
          const g = mk("projects"),
            sp = new THREE.Group();
          g.add(sp);
          const base = new THREE.Mesh(flatRing(1.27, 1.49, 0.03), dark);
          base.position.z = -0.04;
          sp.add(base);

          // Deep internal glowing core channel
          sp.add(new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.04, 16, 128), basic(0x6fe7ff, 1.8)));

          // Frosted quartz plasma containment tube
          sp.add(new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.058, 20, 180), plasmaMat));

          [-0.09, 0.09].forEach(function (z) {
            const t = torus(1.38, 0.034, chrome, 120, 10);
            t.position.z = z;
            sp.add(t);
          });
          ember1 = new THREE.Group();
          ember2 = new THREE.Group();
          ember1.add(torus(1.38, 0.07, basic(0xff5638, 2.8), 40, 10, 1.1));
          ember2.add(torus(1.38, 0.07, basic(0xff5638, 2.8), 30, 10, 0.6));
          ember2.rotation.z = Math.PI;
          sp.add(ember1);
          sp.add(ember2);

          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3 + 0.5;
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.22, 10).rotateX(Math.PI / 2), gun);
            post.position.set(Math.cos(a) * 1.45, Math.sin(a) * 1.45, -0.02);
            sp.add(post);
          }
          /* core primary heatsink: finned drum with deep stepped ribs */
          for (let k = 0; k < 6; k++) {
            const rr = k % 2 ? 0.9 : 0.84;
            const d = new THREE.Mesh(
              new THREE.CylinderGeometry(rr, rr, 0.11, 72).rotateX(Math.PI / 2),
              k % 2 ? chrome : gun
            );
            d.position.z = -0.12 - k * 0.15;
            g.add(d);
          }
          const finGeo = new THREE.BoxGeometry(0.22, 0.05, 0.85);
          for (let i = 0; i < 20; i++) {
            const a = new THREE.Group();
            a.rotation.z = (i * Math.PI) / 10;
            const f = new THREE.Mesh(finGeo, steel);
            f.position.set(0.95, 0, -0.55);
            a.add(f);
            g.add(a);
          }
          [-0.25, -0.55, -0.85].forEach(function (z) {
            const t = torus(0.86, 0.028, steel, 96, 8);
            t.position.z = z;
            g.add(t);
          });
          L.push({ id: "projects", g: g, sp: sp });
        })();

        /* 05 skills: copper winding ring */
        (function () {
          const g = mk("skills"),
            sp = new THREE.Group();
          g.add(sp);
          sp.add(new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.19, 24, 180), copperRing));
          [-0.18, 0.18].forEach(function (z) {
            const t = torus(1.68, 0.026, gold, 140, 8);
            t.position.z = z;
            sp.add(t);
          });
          for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4 + 0.2,
              pos = new THREE.Vector3(Math.cos(a) * 1.68, Math.sin(a) * 1.68, 0);
            const band = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.032, 10, 32), steel);
            band.position.copy(pos);
            band.quaternion.setFromUnitVectors(
              new THREE.Vector3(0, 0, 1),
              new THREE.Vector3(-Math.sin(a), Math.cos(a), 0)
            );
            sp.add(band);
          }
          L.push({ id: "skills", g: g, sp: sp });
        })();

        /* 06 connect: front bezel and dial, plus the tapering ribbed housing and rear plate */
        (function () {
          const g = mk("connect"),
            sp = new THREE.Group();
          g.add(sp);
          // Stepped outer alloy bezel
          g.add(
            new THREE.Mesh(
              latheZ(
                [
                  [1.95, -0.15],
                  [2.22, -0.15],
                  [2.35, -0.06],
                  [2.35, 0.08],
                  [2.22, 0.16],
                  [2.02, 0.16],
                  [1.95, 0.09],
                  [1.95, -0.15],
                ],
                128
              ),
              chrome
            )
          );
          // Dark anodized stepped floor
          const floor = new THREE.Mesh(new THREE.CircleGeometry(1.97, 96), dark);
          floor.position.z = -0.03;
          g.add(floor);

          // Authentic outer brass/gold engraved retention bezel with screws
          const brassRing = new THREE.Mesh(flatRing(1.82, 1.96, 0.02), gold);
          brassRing.position.z = 0.11;
          g.add(brassRing);

          // 24 M3 hex socket cap screws around outer retention ring
          for (let s = 0; s < 24; s++) {
            const as = (s * Math.PI * 2) / 24;
            const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 6).rotateX(Math.PI / 2), chrome);
            screw.position.set(Math.cos(as) * 1.89, Math.sin(as) * 1.89, 0.125);
            g.add(screw);
          }

          [1.78, 1.62].forEach(function (r) {
            const t = torus(r, 0.009, basic(0x6fe7ff, 1.1), 128, 4);
            t.position.z = -0.02;
            g.add(t);
          });
          const tickMinor = new THREE.InstancedMesh(
            new THREE.BoxGeometry(0.012, 0.06, 0.012),
            basic(0x6fe7ff, 1.0),
            72
          );
          const tickMajor = new THREE.InstancedMesh(
            new THREE.BoxGeometry(0.022, 0.11, 0.012),
            basic(0xffffff, 2.2),
            12
          );
          const m4 = new THREE.Matrix4(),
            q = new THREE.Quaternion(),
            v = new THREE.Vector3(),
            sc = new THREE.Vector3(1, 1, 1),
            zax = new THREE.Vector3(0, 0, 1);
          let mi = 0,
            mj = 0;
          for (let i = 0; i < 72; i++) {
            const a = (i * Math.PI * 2) / 72;
            v.set(Math.cos(a) * 2.11, Math.sin(a) * 2.11, 0.135);
            q.setFromAxisAngle(zax, a + Math.PI / 2);
            m4.compose(v, q, sc);
            if (i % 6 === 0) {
              tickMajor.setMatrixAt(mj++, m4);
            } else {
              tickMinor.setMatrixAt(mi++, m4);
            }
          }
          tickMinor.count = mi;
          tickMajor.count = mj;
          sp.add(tickMinor);
          sp.add(tickMajor);
          const win = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.03, 0.1), basic(0x6fe7ff, 1.1), 36);
          for (let i = 0; i < 36; i++) {
            const a = (i * Math.PI) / 18;
            v.set(Math.cos(a) * 2.305, Math.sin(a) * 2.305, 0);
            q.setFromAxisAngle(zax, a - Math.PI / 2);
            m4.compose(v, q, sc);
            win.setMatrixAt(i, m4);
          }
          g.add(win);
          [
            [0, 0.5],
            [2.2, 0.28],
            [4.0, 0.7],
          ].forEach(function (p) {
            const e = new THREE.Mesh(sector(2.035, 2.085, p[0], p[0] + p[1], 0.025, 0), basic(0xff5638, 2.8));
            e.position.z = 0.14;
            sp.add(e);
          });

          /* rear body: stepped, layered housing. Stacked flanges, joined by rods and clamp nodes */
          const TIERS = 7,
            tz = function (k: number) {
              return -0.2 - k * 0.19;
            },
            tr = function (k: number) {
              return 2.15 - k * 0.15;
            };
          for (let k = 0; k < TIERS; k++) {
            const r = tr(k),
              z = tz(k);
            const band = new THREE.Mesh(
              new THREE.CylinderGeometry(r, r, 0.13, 96, 1, true).rotateX(Math.PI / 2),
              shellMat
            );
            band.position.z = z;
            g.add(band);
            const fl = new THREE.Mesh(flatRing(r - 0.2, r + 0.035, 0.04), k % 2 ? gun : steel);
            fl.position.z = z + 0.07;
            g.add(fl);
            const seam = torus(r - 0.01, 0.016, gold, 96, 6);
            seam.position.z = z - 0.07;
            g.add(seam);
          }

          /* rods running down the slope, with clamp nodes at every tier */
          const rdx = tr(0) - tr(TIERS - 1),
            rdz = tz(0) - tz(TIERS - 1),
            rlen = Math.hypot(rdx, rdz),
            rth = Math.atan2(rdx, rdz);
          const rodGeo = new THREE.CylinderGeometry(0.026, 0.026, rlen, 8);
          const rodQ = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(Math.sin(rth), 0, Math.cos(rth))
          );
          const nodes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.075, 0.075), gold, 10 * TIERS);
          const nm = new THREE.Matrix4(),
            nq = new THREE.Quaternion(),
            nv = new THREE.Vector3(),
            ns = new THREE.Vector3(1, 1, 1),
            zz = new THREE.Vector3(0, 0, 1);
          let ni = 0;
          for (let j = 0; j < 10; j++) {
            const a = (j * Math.PI) / 5 + Math.PI / 10;
            const grp = new THREE.Group();
            grp.rotation.z = a;
            const rod = new THREE.Mesh(rodGeo, steel);
            rod.quaternion.copy(rodQ);
            rod.position.set((tr(0) + tr(TIERS - 1)) / 2 + 0.05, 0, (tz(0) + tz(TIERS - 1)) / 2);
            grp.add(rod);
            g.add(grp);
            for (let k = 0; k < TIERS; k++) {
              nv.set(Math.cos(a) * (tr(k) + 0.05), Math.sin(a) * (tr(k) + 0.05), tz(k) + 0.02);
              nq.setFromAxisAngle(zz, a);
              nm.compose(nv, nq, ns);
              nodes.setMatrixAt(ni++, nm);
            }
          }
          g.add(nodes);

          /* copper-wound bands over two of the tiers */
          [2, 4].forEach(function (k) {
            const t = new THREE.Mesh(new THREE.TorusGeometry(tr(k) + 0.06, 0.07, 18, 120), copperRing);
            t.position.z = tz(k);
            g.add(t);
          });

          /* laminated paddle stacks that step down the housing */
          const lamMat = copperBlock;
          for (let k = 0; k < 6; k++) {
            const pg = new THREE.BoxGeometry(0.5 - 0.035 * k, 0.5, 0.05);
            for (let i = 0; i < 10; i++) {
              const a = (i * Math.PI) / 5;
              const p = new THREE.Mesh(pg, lamMat);
              p.position.set(Math.cos(a) * (tr(k) + 0.02), Math.sin(a) * (tr(k) + 0.02), tz(k) + 0.11);
              p.rotation.z = a - Math.PI / 2;
              g.add(p);
              const cap = new THREE.Mesh(new THREE.BoxGeometry(0.5 - 0.035 * k + 0.02, 0.03, 0.065), steel);
              cap.position.set(Math.cos(a) * (tr(k) + 0.27), Math.sin(a) * (tr(k) + 0.27), tz(k) + 0.11);
              cap.rotation.z = a - Math.PI / 2;
              g.add(cap);
            }
          }

          /* rear plate: raised rings, five spokes, tabbed outer ring, bolts */
          const z0 = -1.6;
          const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 72).rotateX(Math.PI / 2), dark);
          plate.position.z = z0;
          g.add(plate);
          const prim = torus(1.12, 0.065, steel, 96, 12);
          prim.position.z = z0;
          g.add(prim);
          [0.8, 0.55].forEach(function (r) {
            const t = torus(r, 0.022, steel, 96, 8);
            t.position.z = z0 + 0.07;
            g.add(t);
          });
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 40).rotateX(Math.PI / 2), gun);
          hub.position.z = z0;
          g.add(hub);
          const hr = torus(0.3, 0.04, gold, 48, 8);
          hr.position.z = z0 + 0.15;
          g.add(hr);
          [0.16, -0.16].forEach(function (dz) {
            const d = new THREE.Mesh(new THREE.CircleGeometry(0.1, 28), basic(0x6fe7ff, 2.8));
            d.position.z = z0 + dz;
            if (dz < 0) d.rotation.y = Math.PI;
            g.add(d);
          });
          const spoke = new THREE.BoxGeometry(0.78, 0.11, 0.16),
            cap = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 10).rotateX(Math.PI / 2);
          for (let i = 0; i < 5; i++) {
            const a = new THREE.Group();
            a.rotation.z = (i * Math.PI * 2) / 5 + Math.PI / 2;
            const s = new THREE.Mesh(spoke, steel);
            s.position.set(0.69, 0, z0);
            a.add(s);
            const c = new THREE.Mesh(cap, gold);
            c.position.set(0.7, 0, z0 + 0.1);
            a.add(c);
            g.add(a);
          }
          const tab = new THREE.BoxGeometry(0.24, 0.17, 0.1),
            bolt = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8).rotateX(Math.PI / 2);
          for (let i = 0; i < 10; i++) {
            const a = (i * Math.PI) / 5 + 0.1;
            const t = new THREE.Mesh(tab, gun);
            t.position.set(Math.cos(a) * 1.2, Math.sin(a) * 1.2, z0);
            t.rotation.z = a + Math.PI / 2;
            g.add(t);
            const b = new THREE.Mesh(bolt, gold);
            b.position.set(Math.cos(a) * 1.2, Math.sin(a) * 1.2, z0 + 0.07);
            g.add(b);
          }

          /* cables: two loops that clamp onto the housing */
          const rub = new THREE.MeshStandardMaterial({ color: 0x14191e, metalness: 0.2, roughness: 0.62 });
          const cable = function (pts: number[][], rad: number) {
            return new THREE.Mesh(
              new THREE.TubeGeometry(
                new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]))),
                56,
                rad,
                8,
                false
              ),
              rub
            );
          };
          [0, Math.PI].forEach(function (rot) {
            const cg = new THREE.Group();
            cg.rotation.z = rot;
            cg.add(
              cable(
                [
                  [0.7, 0.15, z0 - 0.08],
                  [1.1, 0.3, z0 - 0.4],
                  [1.55, 0.25, z0 - 0.35],
                  [1.75, -0.1, z0 - 0.1],
                  [1.6, -0.45, z0 + 0.15],
                  [1.38, -0.5, z0 + 0.32],
                ],
                0.04
              )
            );
            const clip = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 6, 16), gold);
            clip.position.set(1.55, 0.25, z0 - 0.35);
            cg.add(clip);
            g.add(cg);
          });
          g.add(
            cable(
              [
                [0, 0.35, z0 - 0.08],
                [0.05, 0.62, z0 - 0.35],
                [0.3, 0.95, z0 - 0.5],
                [0.45, 1.15, z0 - 0.62],
              ],
              0.045
            )
          );
          const conn = new THREE.Group();
          conn.position.set(0.45, 1.15, z0 - 0.66);
          conn.add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 20).rotateX(Math.PI / 2), steel));
          for (let i = 0; i < 3; i++) {
            const pn = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 6).rotateX(Math.PI / 2), gold);
            pn.position.set((i - 1) * 0.045, 0, -0.18);
            conn.add(pn);
          }
          g.add(conn);
          L.push({ id: "connect", g: g, sp: sp });
        })();

        L.forEach(function (l, i) {
          l.i = i;
          l.z = ZA[i];
          l.g.position.z = ZA[i];
          l.hl = 0;
          const ring = noRay(
            new THREE.Mesh(
              new THREE.TorusGeometry(OUTR[i] + 0.09, 0.014, 6, 128),
              new THREE.MeshBasicMaterial({
                color: hdr(0x6fe7ff, 2.4),
                transparent: true,
                opacity: 0,
                depthWrite: false,
              })
            )
          );
          l.g.add(ring);
          l.ring = ring;
          rig.add(l.g);
        });

        /* exploded axis beam */
        const axisLen = ZE[0] - ZE[5] + 1.8;
        const axis = noRay(
          new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, axisLen, 6, 1, true).rotateX(Math.PI / 2),
            axisMat
          )
        );
        axis.position.z = (ZE[0] + ZE[5]) / 2 - 0.4;
        rig.add(axis);

        /* ----- space ----- */
        const spaceG = new THREE.Group();
        scene.add(spaceG);
        (function () {
          const mkStars = function (n: number, size: number, spread: number, col: number) {
            const pos = new Float32Array(n * 3),
              cols = new Float32Array(n * 3);
            for (let i = 0; i < n; i++) {
              const r = spread * (0.35 + 0.65 * Math.random()),
                th = Math.random() * Math.PI * 2,
                ph = Math.acos(2 * Math.random() - 1);
              pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
              pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
              pos[i * 3 + 2] = -Math.abs(r * Math.cos(ph)) - 6;
              const t = Math.random(),
                c = new THREE.Color().setRGB(0.7 + 0.3 * t, 0.85 + 0.15 * t, 1);
              if (Math.random() < 0.12) c.setRGB(1, 0.82, 0.65);
              cols[i * 3] = c.r;
              cols[i * 3 + 1] = c.g;
              cols[i * 3 + 2] = c.b;
            }
            const g = new THREE.BufferGeometry();
            g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
            g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
            const p = noRay(
              new THREE.Points(
                g,
                new THREE.PointsMaterial({
                  size: size,
                  map: GLOW,
                  vertexColors: true,
                  transparent: true,
                  depthWrite: false,
                  blending: THREE.AdditiveBlending,
                  sizeAttenuation: true,
                  opacity: col,
                })
              )
            );
            spaceG.add(p);
            return p;
          };
          mkStars(1500, 0.5, 90, 0.85);
          mkStars(500, 1.0, 80, 0.9);
          mkStars(90, 2.0, 70, 0.8);
          const neb = function (rgb: string, x: number, y: number, z: number, s: number, o: number) {
            const c = document.createElement("canvas");
            c.width = c.height = 256;
            const g = c.getContext("2d")!;
            const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
            gr.addColorStop(0, "rgba(" + rgb + ",.9)");
            gr.addColorStop(0.45, "rgba(" + rgb + ",.28)");
            gr.addColorStop(1, "rgba(" + rgb + ",0)");
            g.fillStyle = gr;
            g.fillRect(0, 0, 256, 256);
            const sp = noRay(
              new THREE.Sprite(
                new THREE.SpriteMaterial({
                  map: new THREE.CanvasTexture(c),
                  blending: THREE.AdditiveBlending,
                  transparent: true,
                  depthWrite: false,
                  opacity: o,
                })
              )
            );
            sp.position.set(x, y, z);
            sp.scale.set(s, s, 1);
            spaceG.add(sp);
          };
          neb("20,110,150", -26, 12, -70, 95, 0.22);
          neb("130,34,40", 30, -16, -75, 80, 0.13);
          neb("40,70,170", 6, 24, -80, 90, 0.12);
        })();

        const DUST = 240;
        const dustPos = new Float32Array(DUST * 3),
          dustVel = new Float32Array(DUST);
        for (let i = 0; i < DUST; i++) {
          const r = 3 + Math.random() * 7,
            a = Math.random() * Math.PI * 2;
          dustPos[i * 3] = Math.cos(a) * r;
          dustPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
          dustPos[i * 3 + 2] = Math.sin(a) * r * 0.7 - 1;
          dustVel[i] = 0.05 + Math.random() * 0.12;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
        const dust = noRay(
          new THREE.Points(
            dustGeo,
            new THREE.PointsMaterial({
              size: 0.07,
              map: GLOW,
              color: 0x8fe9ff,
              transparent: true,
              opacity: 0.55,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            })
          )
        );
        scene.add(dust);

        /* ----- interaction state ----- */
        const q = new THREE.Quaternion();
        const QA = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.34, -0.72, 0, "YXZ"));
        const QE = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + 0.42, 0, 0, "XYZ"));
        let seek: any = null,
          vx = 0,
          vy = 0,
          zoom = 1,
          ex = 0,
          sp = 0,
          sCur = 1,
          pxCur = 0,
          pyCur = 0,
          T = 0,
          last = 0,
          frames = 0,
          hoverId: any = null,
          activeId: any = null,
          mx = 0,
          my = 0;
        const tgt = { s: 1, x: 0, y: 0 };
        const ray = new THREE.Raycaster(),
          ndc = new THREE.Vector2();
        const tmpV = new THREE.Vector3(),
          tmpQ = new THREE.Quaternion(),
          tmpE = new THREE.Euler();
        const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const clamp = THREE.MathUtils.clamp;

        function applyRot(dyaw: number, dpitch: number) {
          tmpE.set(dpitch, dyaw, 0, "YXZ");
          tmpQ.setFromEuler(tmpE);
          q.premultiply(tmpQ).normalize();
        }

        function retarget(act?: any) {
          activeId = act === undefined ? activeId : act;
          const sr = stage.getBoundingClientRect();
          const visH = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * CAMZ,
            upp = visH / H;
          const wU = sr.width * upp,
            hU = sr.height * upp;
          const sA = Math.min(wU * 0.9, hU * 0.8) / DIAM;
          const sE = Math.min((hU * 0.95) / EXT, (wU * 0.94) / DIAM, 1.25);
          let cx = sr.left + sr.width / 2,
            cy = sr.top + sr.height / 2,
            s = state.exploded ? sE : sA;
          if (state.view && state.exploded) {
            if (!narrow()) {
              const pw = Math.min(540, window.innerWidth * 0.44);
              cx -= pw / 2;
              s = Math.min(s, sE * 0.96);
            } else {
              const a = app.getBoundingClientRect();
              const ph = a.height * 0.64;
              const top = sr.top + 2,
                bot = a.top + a.height - ph - 6;
              const rh = Math.max(120, bot - top);
              cy = (top + bot) / 2;
              s = Math.min(sE, (rh * upp) / EXT);
            }
          }
          tgt.s = s;
          tgt.x = (cx - W / 2) * upp;
          tgt.y = -(cy - H / 2) * upp;
        }

        /* ----- picking ----- */
        function pick(x: number, y: number) {
          ndc.set((x / W) * 2 - 1, -(y / H) * 2 + 1);
          ray.setFromCamera(ndc, cam);
          const hits = ray.intersectObjects(rig.children, true);
          for (let h = 0; h < hits.length; h++) {
            let o: any = hits[h].object,
              view = null;
            while (o && o !== rig) {
              if (o.userData.view && !view) view = o.userData.view;
              if (o.userData.sec)
                return { sec: o.userData.sec, view: state.split && state.exploded ? view : null };
              o = o.parent;
            }
          }
          return null;
        }

        function tap(x: number, y: number) {
          const hit = pick(x, y);
          if (!hit) return;
          if (!state.exploded) {
            explode();
            return;
          }
          if (hit.view) {
            openView(hit.view);
            return;
          }
          tapSection(hit.sec);
        }

        /* ----- pointer: drag to rotate, pinch / wheel to zoom ----- */
        const ptrs = new Map<number, { x: number; y: number }>();
        let dragging = false,
          moved = 0,
          downT = 0,
          lx = 0,
          ly = 0,
          lt = 0,
          pinchD = 0;
        const K = 0.0062;
        const pdist = () => {
          const a = Array.from(ptrs.values());
          return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        };

        cv.addEventListener("pointerdown", function (e: PointerEvent) {
          try {
            cv.setPointerCapture(e.pointerId);
          } catch (_) {}
          ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (ptrs.size === 1) {
            dragging = true;
            moved = 0;
            downT = performance.now();
            lx = e.clientX;
            ly = e.clientY;
            lt = downT;
            vx = vy = 0;
          } else if (ptrs.size === 2) {
            pinchD = pdist();
            moved = 99;
          }
        });

        cv.addEventListener("pointermove", function (e: PointerEvent) {
          if (!ptrs.has(e.pointerId)) {
            if (e.pointerType === "mouse") {
              mx = (e.clientX / W) * 2 - 1;
              my = (e.clientY / H) * 2 - 1;
              const h = pick(e.clientX, e.clientY);
              cv.classList.toggle("hit", !!h);
              hoverId = h ? h.sec : null;
            }
            return;
          }
          ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (ptrs.size >= 2) {
            const d = pdist();
            if (pinchD > 0) zoom = clamp((zoom * d) / pinchD, 0.6, 1.6);
            pinchD = d;
            return;
          }
          const dx = e.clientX - lx,
            dy = e.clientY - ly,
            now = performance.now(),
            dt = Math.max(0.008, (now - lt) / 1000);
          moved += Math.abs(dx) + Math.abs(dy);
          if (moved > 6) {
            seek = null;
            cv.classList.add("grab");
            applyRot(dx * K, dy * K);
            vx = vx * 0.55 + ((dx * K) / dt) * 0.45;
            vy = vy * 0.55 + ((dy * K) / dt) * 0.45;
          }
          lx = e.clientX;
          ly = e.clientY;
          lt = now;
        });

        function release(e: PointerEvent) {
          if (!ptrs.has(e.pointerId)) return;
          ptrs.delete(e.pointerId);
          if (ptrs.size === 0) {
            dragging = false;
            cv.classList.remove("grab");
            const now = performance.now();
            if (moved <= 6 && now - downT < 600) {
              vx = vy = 0;
              tap(e.clientX, e.clientY);
            } else if (now - lt > 90) {
              vx = vy = 0;
            } else {
              const m = 7;
              vx = clamp(vx, -m, m);
              vy = clamp(vy, -m, m);
            }
          }
        }

        cv.addEventListener("pointerup", release);
        cv.addEventListener("pointercancel", release);
        cv.addEventListener("pointerleave", function () {
          hoverId = null;
          cv.classList.remove("hit");
        });
        cv.addEventListener(
          "wheel",
          function (e: WheelEvent) {
            e.preventDefault();
            zoom = clamp(zoom * Math.exp(-e.deltaY * 0.0012), 0.6, 1.6);
          },
          { passive: false }
        );

        /* ----- pill projection ----- */
        const pillItems = tags.map(function (el) {
          return {
            el: el,
            w: 90,
            h: 44,
            x: 0,
            y: 0,
            ax: 0,
            ay: 0,
            order: +(el.dataset.order || 0),
            idx: 0,
          };
        });

        function measure() {
          pillItems.forEach(function (it) {
            it.w = it.el.offsetWidth || 90;
            it.h = it.el.offsetHeight || 44;
          });
        }

        function anchorFor(it: any) {
          const v = it.el.dataset.view;
          if (v === "resume") return halves.l.userData.anchor;
          if (v === "socials") return halves.r.userData.anchor;
          return L[
            SEC.findIndex(function (s) {
              return s.id === it.el.dataset.id;
            })
          ].g;
        }

        const anchors = pillItems.map(anchorFor);

        function updatePills() {
          const show = ex > 0.96 && !(narrow() && state.view);
          pillsEl.classList.toggle("live", show);
          if (!show) return;
          const vis: any[] = [];
          pillItems.forEach(function (it, i) {
            if (it.el.classList.contains("off")) return;
            anchors[i].getWorldPosition(tmpV);
            tmpV.project(cam);
            it.ax = it.x = (tmpV.x * 0.5 + 0.5) * W;
            it.ay = it.y = (-tmpV.y * 0.5 + 0.5) * H;
            it.idx = i;
            vis.push(it);
          });
          for (let pass = 0; pass < 8; pass++) {
            for (let a = 0; a < vis.length; a++)
              for (let b = a + 1; b < vis.length; b++) {
                const A = vis[a],
                  B = vis[b];
                const ox = (A.w + B.w) / 2 + 6 - Math.abs(A.x - B.x),
                  oy = (A.h + B.h) / 2 + 4 - Math.abs(A.y - B.y);
                if (ox > 0 && oy > 0) {
                  const aUp = A.y < B.y || (A.y === B.y && A.order < B.order);
                  const m = oy / 2,
                    sgn = aUp ? -1 : 1;
                  A.y += sgn * m;
                  B.y -= sgn * m;
                }
              }
          }
          vis.forEach(function (it) {
            const x = clamp(it.x, it.w / 2 + 8, W - it.w / 2 - 8),
              y = clamp(it.y, it.h / 2 + 60, H - it.h / 2 - 40);
            it.el.style.transform =
              "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-50%)";
            const ln = leaderLines[it.idx];
            const far = Math.hypot(x - it.ax, y - it.ay) > 20;
            ln.setAttribute("x1", it.ax.toFixed(1));
            ln.setAttribute("y1", it.ay.toFixed(1));
            ln.setAttribute("x2", x.toFixed(1));
            ln.setAttribute("y2", y.toFixed(1));
            ln.style.display = far ? "" : "none";
          });
          leaderLines.forEach(function (ln, i) {
            if (pillItems[i].el.classList.contains("off")) ln.style.display = "none";
          });
        }

        /* ----- main loop ----- */
        let fxChecked = !composer,
          errShown = false;
        function disableFX() {
          composer = null;
          finalPass = null;
          bloom = null;
          renderer.setRenderTarget(null);
          renderer.outputEncoding = THREE.sRGBEncoding;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 0.85;
          scene.traverse(function (o: any) {
            if (o.material) {
              (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m: any) {
                m.needsUpdate = true;
              });
            }
          });
          console.warn("post fx disabled, rendering directly");
        }
        function showErr(e: any) {
          if (errShown) return;
          errShown = true;
          console.error(e);
          const d = document.createElement("div");
          d.style.cssText =
            "position:fixed;left:16px;right:16px;bottom:56px;z-index:200;font:12px/1.4 monospace;color:#ff9a86;background:rgba(2,6,10,.85);padding:8px 10px;border:1px solid #ff5638;pointer-events:none";
          d.textContent = "3D error: " + (e && e.message ? e.message : e);
          document.body.appendChild(d);
        }
        function loop(now: number) {
          requestAnimationFrame(loop);
          try {
            frame(now);
          } catch (e) {
            if (composer) {
              try {
                disableFX();
                renderer.render(scene, cam);
              } catch (e2) {
                showErr(e2);
              }
            } else showErr(e);
            boot.classList.add("off");
          }
        }
        function frame(now: number) {
          const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
          last = now;
          T += dt;
          const fast = reduce ? 30 : 1;
          ex += clamp((state.exploded ? 1 : 0) - ex, (-dt * fast) / 1.5, (dt * fast) / 1.5);
          sp += clamp((state.split && state.exploded ? 1 : 0) - sp, (-dt * fast) / 0.9, (dt * fast) / 0.9);

          /* orientation */
          if (!dragging) {
            if (seek) {
              q.slerp(seek, 1 - Math.exp(-dt * (reduce ? 30 : 3.2)));
              if (q.angleTo(seek) < 0.003) {
                q.copy(seek);
                seek = null;
              }
            } else if (Math.abs(vx) + Math.abs(vy) > 0.01) {
              applyRot(vx * dt, vy * dt);
              const f = Math.pow(0.06, dt);
              vx *= f;
              vy *= f;
            } else if (!reduce && ex > 0.9 && !state.view) {
              applyRot(0.1 * dt, 0);
            }
          }
          rig.quaternion.copy(q);
          floatG.rotation.set(
            Math.sin(T * 0.45) * 0.035,
            Math.cos(T * 0.37) * 0.05 + Math.sin(T * 0.3) * 0.26 * (1 - ex),
            0
          );

          /* layers */
          for (let i = 0; i < L.length; i++) {
            const l = L[i],
              p = ease(clamp(ex * 1.5 - i * 0.1, 0, 1));
            l.g.position.z = ZA[i] + (ZE[i] - ZA[i]) * p;
            if (l.sp && !reduce) l.sp.rotation.z += SPIN[i] * dt;
            const want = hoverId === l.id || activeId === l.id ? 1 : 0;
            l.hl += (want - l.hl) * (1 - Math.exp(-dt * 10));
            l.ring.material.opacity = l.hl * (0.55 + 0.2 * Math.sin(T * 4));
          }
          if (!reduce) {
            ember1.rotation.z -= 1.1 * dt;
            ember2.rotation.z += 0.7 * dt;
          }
          const sh = ease(sp) * 1.15;
          halves.l.position.x = -sh;
          halves.r.position.x = sh;
          const beam = L[1].g.userData.beam;
          beam.visible = sp > 0.02;
          beam.scale.x = Math.max(0.0001, sh * 2 * 0.98);
          beamMat.uniforms.uK.value = sp;
          axisMat.uniforms.uK.value = ex;
          for (let i = 0; i < segMats.length; i++) {
            const k = 0.55 + 0.45 * Math.sin(T * 2.6 - i * 0.55);
            segMats[i].color.setRGB(0.43 * (1.2 + 1.6 * k), 0.9 * (1.2 + 1.6 * k), 1 * (1.2 + 1.6 * k));
          }
          coreMat.uniforms.uTime.value = T;
          plasmaMat.uniforms.uTime.value = T;
          beamMat.uniforms.uTime.value = T;
          axisMat.uniforms.uTime.value = T;
          const core = L[0].g.userData;
          core.halo.material.opacity = 0.45 + 0.15 * Math.sin(T * 2.4);
          core.light.intensity = 2.4 + 0.5 * Math.sin(T * 2.4);

          /* placement */
          const kk = 1 - Math.exp(-dt * (reduce ? 30 : 5));
          sCur += (tgt.s * zoom - sCur) * kk;
          pxCur += (tgt.x - pxCur) * kk;
          pyCur += (tgt.y - pyCur) * kk;
          posG.scale.setScalar(sCur);
          posG.position.set(pxCur, pyCur, 0);
          cam.position.x += (mx * 0.3 - cam.position.x) * 0.03;
          cam.position.y += (-my * 0.2 - cam.position.y) * 0.03;
          cam.lookAt(0, 0, 0);

          /* space */
          spaceG.rotation.y = T * 0.004;
          spaceG.rotation.x = Math.sin(T * 0.02) * 0.02;
          for (let i = 0; i < DUST; i++) {
            let y = dustPos[i * 3 + 1] + dustVel[i] * dt;
            if (y > 6) y = -6;
            dustPos[i * 3 + 1] = y;
          }
          dustGeo.attributes.position.needsUpdate = true;

          if (finalPass) finalPass.uniforms.uTime.value = T;
          if (composer) composer.render();
          else renderer.render(scene, cam);
          if (composer && !fxChecked && frames >= 2) {
            const gl = renderer.getContext(),
              px = new Uint8Array(4);
            let lit = 0;
            [
              [0.5, 0.5],
              [0.4, 0.5],
              [0.6, 0.5],
              [0.5, 0.4],
              [0.5, 0.6],
            ].forEach(function (p) {
              gl.readPixels(
                Math.floor(cv.width * p[0]),
                Math.floor(cv.height * p[1]),
                1,
                1,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                px
              );
              if (px[0] + px[1] + px[2] > 90) lit++;
            });
            if (lit === 0) {
              disableFX();
              renderer.render(scene, cam);
            }
            if (frames >= 6) fxChecked = true;
          }
          updatePills();
          if (++frames === 3) boot.classList.add("off");
        }

        function resize() {
          W = window.innerWidth;
          H = window.innerHeight;
          renderer.setSize(W, H, false);
          cam.aspect = W / H;
          cam.updateProjectionMatrix();
          if (composer) {
            composer.setSize(W * PR, H * PR);
            if (bloom) bloom.resolution.set(W * PR * 0.5, H * PR * 0.5);
          }
          measure();
          retarget();
        }
        let rt: any;
        window.addEventListener("resize", function () {
          clearTimeout(rt);
          rt = setTimeout(resize, 80);
        });
        if ((document as any).fonts && (document as any).fonts.ready)
          (document as any).fonts.ready.then(measure);

        q.copy(QA);
        rig.quaternion.copy(q);
        resize();
        sCur = tgt.s;
        pxCur = tgt.x;
        pyCur = tgt.y;
        requestAnimationFrame(loop);

        return {
          retarget: retarget,
          seekSide: function () {
            seek = QE.clone();
            vx = vy = 0;
          },
          seekFront: function () {
            seek = QA.clone();
            vx = vy = 0;
          },
          isSide: function () {
            return q.angleTo(QE) < 0.9;
          },
          setHover: function (id: string | null) {
            hoverId = id;
          },
        };
      }

      /* ---------- boot ---------- */
      try {
        if (typeof (window as any).THREE === "undefined") throw new Error("three missing");
        engine = initGL();
      } catch (err) {
        console.warn("3D unavailable, using menu fallback", err);
        engine = null;
        app.classList.add("nogl");
        $("#gl").style.display = "none";
        state.exploded = true;
        pillsEl.classList.add("live");
        hint.textContent = "3D view unavailable on this device · pick a section";
        boot.classList.add("off");
      }
      render();
      setTimeout(function () {
        boot.classList.add("off");
      }, 4000);
    })();
  };

  useEffect(() => {
    startArcfolio();
  }, []);

  return (
    <>
      <canvas id="gl" aria-hidden="true"></canvas>
      <div className="boot" id="boot">
        <span>Powering up the reactor</span>
      </div>

      <div className="app" id="app">
        <header className="top">
          <div className="id">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <polygon
                points="20,2 36,11 36,29 20,38 4,29 4,11"
                fill="none"
                stroke="#6fe7ff"
                strokeWidth="1.5"
              />
              <text
                x="20"
                y="25"
                textAnchor="middle"
                fontFamily="Oxanium, sans-serif"
                fontWeight="700"
                fontSize="13"
                fill="#e6fbff"
              >
                NT
              </text>
            </svg>
            <div>
              <h1>Nukul Talwar</h1>
              <p>Front-end Developer</p>
            </div>
          </div>
          <div className="sys">
            <div className="on">
              <span className="dot"></span>Arc reactor online
            </div>
            <div className="proto">Production Ready · Next.js Edition</div>
          </div>
        </header>

        <main className="stage" id="stage">
          <div className="hud hud-l" aria-hidden="true">
            <div className="bars" id="bars">
              <div className="bar-g">
                <div></div>
                <span>Flux</span>
              </div>
              <div className="bar-g">
                <div></div>
                <span>Resonance</span>
              </div>
              <div className="bar-g">
                <div></div>
                <span>Thermal</span>
              </div>
            </div>
          </div>
          <div className="hud hud-r" aria-hidden="true">
            <p className="rd">
              <b data-rd="98">
                98<small>%</small>
              </b>
              Focus
            </p>
            <p className="rd">
              <b data-rd="0">
                0<small>%</small>
              </b>
              Bugs
            </p>
            <p className="rd">
              <b data-rd="85">
                85<small>%</small>
              </b>
              Coffee
            </p>
            <p className="rd">
              <b data-rd="99">
                99<small>%</small>
              </b>
              Ship rate
            </p>
          </div>
          <div className="pills" id="pills">
            <svg className="leaders" id="leaders" aria-hidden="true"></svg>
          </div>
        </main>

        <footer className="bot">
          <div className="hint pulse" id="hint">
            Tap the reactor · drag to rotate
          </div>
          <div className="read">
            <span>
              Output <b id="out">3.00</b> GJ/s
            </span>
            <span>
              State <b id="stateTxt">Assembled</b>
            </span>
          </div>
          <button className="reasm" id="reasm" type="button" hidden>
            Reassemble
          </button>
        </footer>

        <aside className="panel" id="panel" role="dialog" aria-label="Section details" aria-hidden="true">
          <div className="panel-in">
            <div className="p-head">
              <div className="k" id="crumb">
                01 / 06
              </div>
              <button className="x" id="close" type="button">
                Close ×
              </button>
            </div>
            <nav className="chips" id="chips" aria-label="Sections"></nav>
            <div className="p-body" id="pbody" tabIndex={-1}></div>
          </div>
        </aside>
      </div>
    </>
  );
}
