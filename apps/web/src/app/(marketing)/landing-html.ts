// Landing markup ported verbatim from the delivered answerfox-landing.html design
// (Downloads/answerfox-landing.html). SVG sprite + body copied 1:1; only the CTA
// hrefs were wired to real routes (/scan, /sign-in, GitHub App install). The
// styles live in landing.css and the interactions in landing-scripts.tsx.
export const LANDING_HTML = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="i-scan" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></symbol>
  <symbol id="i-pr" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></symbol>
  <symbol id="i-badge" viewBox="0 0 24 24"><path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></symbol>
  <symbol id="i-ext" viewBox="0 0 24 24"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></symbol>
  <symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></symbol>
  <symbol id="i-slide" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/><path d="m9 6 6 6-6 6" opacity=".4"/></symbol>
  <symbol id="i-lock" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol>
  <symbol id="i-rocket" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></symbol>
  <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></symbol>
  <symbol id="i-git" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6 0C6.2 3.6 5.1 3.9 5.1 3.9a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.7 10c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V22"/></symbol>
</defs></svg>

<div class="lp">
  <h1 class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Answerfox: AI is reading the blank version of your docs. See what AI crawlers receive, then merge the fix as a pull request.</h1>

  <nav class="nav" id="nav"><div class="wrap">
    <div class="nav-links"><a href="#loop">How it works</a><a href="#pricing">Pricing</a><a href="#docs">Docs</a><a href="#changelog">Changelog</a></div>
    <a class="brand" href="#top"><svg width="27" height="27" viewBox="296 223 927 518" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><mask id="nm"><rect x="296" y="223" width="927" height="518" fill="#fff"/><rect x="700" y="493" width="523" height="18" fill="#000"/></mask></defs><polygon points="717,223 877,223 970,741 851,741 776,335 443,741 296,741" fill="#211E1A" mask="url(#nm)"/><polygon points="734,413 1223,413 1144,493 668,493" fill="#F34504"/><polygon points="655,511 1077,511 1000,591 589,591" fill="#F34504"/><polygon points="574,611 674,611 567,741 467,741" fill="#F34504"/></svg><span class="wm">answer<span class="fx">fox</span></span></a>
    <div class="nav-right"><a class="signin" href="/sign-in">Sign in</a><a class="btn btn-ink btn-sm" data-mag href="https://github.com/apps/answerfox/installations/new"><svg class="ic"><use href="#i-git"/></svg> Install the GitHub App</a></div>
  </div></nav>

  <!-- HERO -->
  <header class="hero" id="top">
    <div class="hghost" aria-hidden="true">
      <i style="left:1%;top:58%;width:24%"></i>
      <i class="d" style="left:1%;top:68%;width:19%"></i>
      <i style="left:1%;top:78%;width:14%"></i>
      <i style="left:47%;top:10%;width:22%"></i>
      <i class="d" style="left:47%;top:19%;width:29%"></i>
      <i style="left:47%;top:28%;width:17%"></i>
      <i style="left:38%;top:88%;width:30%"></i>
      <i class="d" style="left:56%;top:95%;width:20%"></i>
    </div>
    <div class="wrap">
    <div class="hero-top">
      <div class="hcol reveal">
        <span class="tick"><span class="live"></span> Watching 25 pages, first loop free</span>
        <h1 id="heroH">AI is reading the <span class="b">blank</span> version of your docs.</h1>
        <p class="hero-lead">GPTBot, ClaudeBot and PerplexityBot don't run JavaScript, so your docs reach them gutted. <b>See exactly what they get, then merge the fix.</b></p>
        <div class="hero-cta">
          <a class="btn btn-ink" data-mag href="/scan"><svg class="ic"><use href="#i-arrow"/></svg> Run your free audit</a>
          <a class="btn btn-ghost" href="https://github.com/apps/answerfox/installations/new"><svg class="ic"><use href="#i-git"/></svg> Install the GitHub App</a>
        </div>
        <div class="hstats">
          <div class="st"><div class="sv">50<span class="u"> checks</span></div><div class="sl">open source, in your repo</div></div>
          <div class="st"><div class="sv">41<span class="u">s</span></div><div class="sl">to re-audit on merge</div></div>
          <div class="st"><div class="sv">$0<span class="u"></span></div><div class="sl">first loop, public repos free</div></div>
        </div>
      </div>
      <div class="hcol reveal d1">
        <div class="term" id="term">
          <div class="term-bar"><span class="pw"></span><span class="nm">answerfox</span><button class="cp" id="termCopy" aria-label="Copy command"><svg class="ic" style="width:14px;height:14px"><use href="#i-copy"/></svg></button></div>
          <div class="term-body"><span class="p">$</span> <span id="tcmd"></span><span class="cur" id="tcur"></span>
            <div class="term-out" id="tout">
              <div><span class="ok"><svg class="ic tic"><use href="#i-check"/></svg></span> fetched 25 high-value pages</div>
              <div><span class="no"><svg class="ic tic"><use href="#i-x"/></svg></span> 12 pages hide content from AI</div>
              <div><span class="dim">&nbsp;&nbsp;most gutted&nbsp;&nbsp;</span><span class="score">/pricing /api /quickstart</span></div>
              <div><span class="dim">&nbsp;&nbsp;readiness&nbsp;&nbsp;&nbsp;</span><span class="bar">&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;<span class="e">&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span></span> <span class="score">47 / 100</span></div>
              <div><span class="cta">&rarr; run the free audit</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div></header>

  <!-- AGENT BAND -->
  <section class="agents"><div class="wrap">
    <div class="head reveal">Every AI answer about you <b>starts here.</b></div>
    <div class="row reveal d1">
      <span class="chip hot"><span class="d"></span> GPTBot</span>
      <span class="chip hot"><span class="d"></span> ClaudeBot</span>
      <span class="chip hot"><span class="d"></span> PerplexityBot</span>
      <span class="chip"><span class="d"></span> Google-Extended</span>
      <span class="chip"><span class="d"></span> Bingbot</span>
      <span class="chip"><span class="d"></span> Amazonbot</span>
      <span class="note">not one of them runs your JavaScript</span>
    </div>
  </div></section>

  <!-- X-RAY SLIDER -->
  <section class="sec"><div class="wrap">
    <div class="sec-head reveal">
      <span class="kick">The X-Ray</span>
      <h2>Drag it. Watch your page disappear.</h2>
      <p>This is your live pricing page, fetched two ways. Slide the handle to swap between what a person renders and what an AI crawler actually received.</p>
    </div>
    <div class="xray-wrap reveal d1" id="xray">
      <div class="xtop">
        <span class="hint"><svg class="ic" style="width:15px;height:15px"><use href="#i-slide"/></svg> drag to compare</span>
        <span class="cov"><span class="n">47%</span><span class="t">of this page reaches AI</span></span>
      </div>
      <div class="slider" id="slider">
        <div class="slab a"><span class="sq"></span> AI crawler</div>
        <!-- AI (gutted) layer -->
        <div class="xpage ai">
          <div class="xchrome"><span class="cd"></span><span class="cd"></span><span class="cd"></span><span class="url"><svg class="ic" style="width:12px;height:12px"><use href="#i-x"/></svg> <span class="lk">no-js fetch</span> &middot; docs.yoursite.dev/pricing</span></div>
          <div class="xbody">
            <nav class="xnav"><span class="nl">Overview</span><span class="nl on">Pricing</span><span class="nl">Quickstart</span><span class="nl">API</span><span class="nl">Guides</span><span class="nl">Changelog</span></nav>
            <div class="xmain">
              <div class="ey">Plans</div>
              <h4>Pricing</h4>
              <p class="lede">Simple, per-repo pricing for teams that ship documentation. No seats, no metering, cancel anytime.</p>
              <div class="xprice"><span class="amt miss">$9</span><span class="per">/ repo / month</span> <span class="xsub miss">or $90 / year, save $18</span></div>
              <ul class="xfeat">
                <li><svg class="ic"><use href="#i-x"/></svg> <span class="miss">Unlimited pages audited</span></li>
                <li><svg class="ic"><use href="#i-x"/></svg> <span class="miss">Fix-PRs opened for you</span></li>
                <li><svg class="ic"><use href="#i-x"/></svg> <span class="miss">Proof-of-Fix on every merge</span></li>
                <li><svg class="ic"><use href="#i-x"/></svg> <span class="miss">Drift Guard on every deploy</span></li>
                <li><svg class="ic"><use href="#i-x"/></svg> <span class="miss">50 open-source checks</span></li>
                <li><svg class="ic"><use href="#i-x"/></svg> <span class="miss">Readiness badge for the repo</span></li>
              </ul>
              <div class="xnote"><svg class="ic"><use href="#i-alert"/></svg> the whole plan is injected by pricing.js after load, so the crawler gets none of it</div>
            </div>
            <aside class="xrail">
              <h5>On this page</h5>
              <span class="tl miss">Overview</span><span class="tl miss">Pricing</span><span class="tl miss">What's included</span><span class="tl miss">FAQ</span>
              <h5 class="mt">Current plan</h5>
              <div class="rplan miss">not rendered</div>
            </aside>
          </div>
        </div>
        <!-- Human (full) layer, clipped -->
        <div class="xpage human">
          <div class="slab h"><span class="sq"></span> a person</div>
          <div class="xchrome"><span class="cd"></span><span class="cd"></span><span class="cd"></span><span class="url"><svg class="ic" style="width:12px;height:12px"><use href="#i-check"/></svg> docs.yoursite.dev/pricing</span></div>
          <div class="xbody">
            <nav class="xnav"><span class="nl">Overview</span><span class="nl on">Pricing</span><span class="nl">Quickstart</span><span class="nl">API</span><span class="nl">Guides</span><span class="nl">Changelog</span></nav>
            <div class="xmain">
              <div class="ey">Plans</div>
              <h4>Pricing</h4>
              <p class="lede">Simple, per-repo pricing for teams that ship documentation. No seats, no metering, cancel anytime.</p>
              <div class="xprice"><span class="amt">$9</span><span class="per">/ repo / month</span> <span class="xsub">or $90 / year, save $18</span></div>
              <ul class="xfeat">
                <li><svg class="ic"><use href="#i-check"/></svg> Unlimited pages audited</li>
                <li><svg class="ic"><use href="#i-check"/></svg> Fix-PRs opened for you</li>
                <li><svg class="ic"><use href="#i-check"/></svg> Proof-of-Fix on every merge</li>
                <li><svg class="ic"><use href="#i-check"/></svg> Drift Guard on every deploy</li>
                <li><svg class="ic"><use href="#i-check"/></svg> 50 open-source checks</li>
                <li><svg class="ic"><use href="#i-check"/></svg> Readiness badge for the repo</li>
              </ul>
              <div class="xfaq"><span class="q">Do you store my code?</span> No. Answerfox reads only what you publish, the same bytes a crawler gets.</div>
            </div>
            <aside class="xrail">
              <h5>On this page</h5>
              <span class="tl">Overview</span><span class="tl on">Pricing</span><span class="tl">What's included</span><span class="tl">FAQ</span>
              <h5 class="mt">Current plan</h5>
              <div class="rplan">Team &middot; $9/repo</div>
            </aside>
          </div>
        </div>
        <div class="sdiv" id="sdiv"></div>
        <button class="shandle nudge" id="shandle" aria-label="Drag to compare human and AI views" role="slider" aria-valuenow="54" aria-valuemin="0" aria-valuemax="100"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6-4 6 4 6"/><path d="m15 6 4 6-4 6"/></svg></button>
      </div>
    </div>
  </div></section>

  <!-- THE LOOP: asymmetric bento -->
  <section class="sec" id="loop" style="background:var(--paper-2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">
    <div class="sec-head ctr reveal"><span class="kick">The loop</span><h2>See it. Fix it. Prove it. Keep it fixed.</h2><p>Four moving parts, one closed loop. Every finding walks the whole way from detected to merged to verified.</p></div>
    <div class="bento">
      <!-- 01 SEE (wide, orange) -->
      <article class="bt w7 reveal" style="--c:var(--c-orange-ink);--cw:var(--c-orange-wash);--cl:var(--c-orange-line);--cs:var(--c-orange-sh)">
        <div class="bhead"><span class="bicon"><svg class="ic"><use href="#i-scan"/></svg></span><span class="bstep">01 &middot; See</span></div>
        <h3>See what AI actually sees</h3>
        <p class="bp">A no-JavaScript fetch of your 25 money pages, diffed against the rendered page, so you know exactly what each crawler is missing.</p>
        <div class="art"><div class="diff2">
          <div class="col"><div class="lab"><span class="sq"></span> you ship</div><span class="have">&lt;h1&gt;Pricing&lt;/h1&gt;</span><br><span class="have">$9 / repo / month</span><br><span class="have">4 plan features</span></div>
          <div class="col crawl"><div class="lab"><span class="sq"></span> crawler gets</div><span class="have">&lt;h1&gt;Pricing&lt;/h1&gt;</span><br><span class="miss">$9 / repo / month</span><br><span class="dim">0 features seen</span></div>
        </div></div>
      </article>
      <!-- 02 FIX (narrow, violet) -->
      <article class="bt w5 reveal d1" style="--c:var(--c-violet-ink);--cw:var(--c-violet-wash);--cl:var(--c-violet-line);--cs:var(--c-violet-sh)">
        <div class="bhead"><span class="bicon"><svg class="ic"><use href="#i-pr"/></svg></span><span class="bstep">02 &middot; Fix</span></div>
        <h3>Fix it in a pull request</h3>
        <p class="bp">Each gap becomes one small, validated PR you can review and merge from your phone.</p>
        <div class="art"><div class="prcard">
          <div class="top"><svg class="ic"><use href="#i-pr"/></svg> Add Product JSON-LD to /pricing</div>
          <div class="body"><span class="add">+ &lt;script type="application/ld+json"&gt;</span><br><span class="add">+&nbsp;&nbsp;"offers": { "price": "9.00" }</span><br><span class="val"><svg class="ic"><use href="#i-check"/></svg> validated to apply and parse</span></div>
        </div></div>
      </article>
      <!-- 03 PROVE (narrow, green) -->
      <article class="bt w5 reveal" style="--c:var(--c-green-ink);--cw:var(--c-green-wash);--cl:var(--c-green-line);--cs:var(--c-green-sh)">
        <div class="bhead"><span class="bicon"><svg class="ic"><use href="#i-badge"/></svg></span><span class="bstep">03 &middot; Prove</span></div>
        <h3>Prove it worked</h3>
        <p class="bp">On merge, we re-audit the live page and post the before-and-after right on the PR.</p>
        <div class="art"><div class="pdelta">
          <div class="fig"><span class="from">61</span><svg viewBox="0 0 96 52" fill="none" aria-hidden="true"><path d="M2 44 L22 40 L42 42 L62 30 L80 14 L94 6" stroke="var(--c-green-ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="94" cy="6" r="3.4" fill="var(--c-green-ink)"/></svg><span class="to">74</span></div>
          <span class="plus">+13</span>
        </div><div class="pline">re-audited 41s after merge &middot; evidence, not vibes</div></div>
      </article>
      <!-- 04 KEEP (wide, blue) -->
      <article class="bt w7 reveal d1" style="--c:var(--c-blue-ink);--cw:var(--c-blue-wash);--cl:var(--c-blue-line);--cs:var(--c-blue-sh)">
        <div class="bhead"><span class="bicon"><svg class="ic"><use href="#i-shield"/></svg></span><span class="bstep">04 &middot; Keep</span></div>
        <h3>Keep it fixed</h3>
        <p class="bp">Every deploy is watched. If a fix regresses you don't get a naked alarm, the alert arrives with its pull request already open.</p>
        <div class="art"><div class="flow">
          <div class="node"><div class="nh"><svg class="ic" style="color:var(--ink-3)"><use href="#i-refresh"/></svg> deploy</div><span class="ns">main &middot; 12:04</span></div>
          <span class="arw"><svg class="ic"><use href="#i-arrow"/></svg></span>
          <div class="node det"><div class="nh"><svg class="ic"><use href="#i-alert"/></svg> drift found</div><span class="ns">schema stripped from /pricing</span></div>
          <span class="arw"><svg class="ic"><use href="#i-arrow"/></svg></span>
          <div class="node fix"><div class="nh"><svg class="ic"><use href="#i-pr"/></svg> Fix-PR #148</div><span class="ns">opened automatically</span></div>
        </div></div>
      </article>
    </div>
    <div class="loop-tail reveal d2"><svg class="ic"><use href="#i-refresh"/></svg> and then it loops, every time you ship</div>
  </div></section>

  <!-- PROOF -->
  <section class="sec"><div class="wrap">
    <div class="proof reveal">
      <div class="proof-viz">
        <svg class="proof-spark" viewBox="0 0 210 90" fill="none" aria-hidden="true">
          <path d="M4 74 L46 68 L88 70 L130 52 L172 30 L206 12" stroke="var(--c-green-ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 74 L46 68 L88 70 L130 52 L172 30 L206 12 L206 90 L4 90 Z" fill="var(--ok-wash)"/>
          <circle cx="206" cy="12" r="4" fill="var(--c-green-ink)"/>
        </svg>
        <div class="proof-fig"><span class="from">61</span><span class="to" id="proofTo" data-to="74">74</span><span class="plus">+13</span></div>
      </div>
      <div>
        <h2>Evidence, not vibes.</h2>
        <p>Every merge is re-audited and the delta posted on the pull request, 41 seconds after you merge. Plus a readiness badge that sits in front of every future reviewer of your repo.</p>
        <div class="cmt"><span class="av"><svg viewBox="296 223 927 518"><polygon points="717,223 877,223 970,741 851,741 776,335 443,741 296,741" fill="#fff"/><polygon points="734,413 1223,413 1144,493 668,493" fill="#F34504"/><polygon points="655,511 1077,511 1000,591 589,591" fill="#F34504"/><polygon points="574,611 674,611 567,741 467,741" fill="#F34504"/></svg></span><div>agent-readiness <span class="delta">61 to 74</span>, verified on merge</div></div>
      </div>
    </div>
  </div></section>

  <!-- POSITIONING -->
  <section class="sec" id="docs" style="padding:clamp(56px,6vw,84px) 0;background:var(--paper-2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">
    <div class="posn reveal"><div class="big">Dependabot for agent readiness. <span class="not">Not an SEO tool.</span></div><p>It lives in your repo and ships fixes as pull requests. You merge, you don't "optimize."</p></div>
  </div></section>

  <!-- CLOSER -->
  <section class="closer" id="pricing"><div class="wrap">
    <div class="ready reveal">Ready when you are</div>
    <div class="sliced reveal d1"><span class="top">ANSWER<i>FOX</i></span><span class="bot" aria-hidden="true">ANSWER<i>FOX</i></span></div>
    <p class="cline reveal d1">See what AI actually sees. Then merge the fix.</p>
    <div class="fcta reveal d2">
      <a class="btn btn-blaze" data-mag href="https://github.com/apps/answerfox/installations/new"><svg class="ic"><use href="#i-git"/></svg> Install the GitHub App</a>
      <a class="btn btn-ghost" href="/scan"><svg class="ic"><use href="#i-arrow"/></svg> Run your free audit</a>
    </div>
    <div class="os reveal d2">The 50 checks are open source. <a href="#">Read the engine on GitHub</a></div>
    <div class="price reveal d2"><b>$9</b> per repo / month. The first fix is free. Public repos free forever.</div>
  </div></section>

  <!-- FOOTER -->
  <footer class="foot" id="changelog"><div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="#top" style="gap:6px"><svg width="30" height="30" viewBox="296 223 927 518" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><polygon points="717,223 877,223 970,741 851,741 776,335 443,741 296,741" fill="#211E1A"/><polygon points="734,413 1223,413 1144,493 668,493" fill="#F34504"/><polygon points="655,511 1077,511 1000,591 589,591" fill="#F34504"/><polygon points="574,611 674,611 567,741 467,741" fill="#F34504"/></svg><span class="ilock">nswer<span class="fx">fox</span></span></a>
        <div class="pos">Dependabot for agent readiness. Not an SEO tool.</div>
      </div>
      <div><h4>Product</h4><ul><li><a href="#">How it works</a></li><li><a href="#">Pricing</a></li><li><a href="#">Changelog</a></li><li><a href="#">Public audits</a></li></ul></div>
      <div><h4>Developers</h4><ul><li><a href="#">Docs</a></li><li><a href="#">CLI</a></li><li><a href="#">Check engine</a></li><li><a href="#">llms.txt</a></li></ul></div>
      <div><h4>Company</h4><ul><li><a href="#">About</a></li><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
    </div>
    <div class="foot-bot"><span>2026 Answerfox</span><span>built to be read by machines</span></div>
  </div></footer>
</div>
`;
