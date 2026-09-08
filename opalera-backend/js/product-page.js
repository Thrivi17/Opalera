/* ============================================================
   OPALÉRA — shared product-page logic.
   Each generated piece page (product-1.html … product-80.html) sets
   window.PRODUCT_ID; the dynamic template (product.html) resolves the
   id from ?id=N or #id=N instead (used for manager-added pieces).
   ============================================================ */
const { products, byId, fmt, esc, webSrc, stoneOf, isSignature,
        metalOf, descOf, specOf,
        seedOf, ratingOf, starStr, boutiqueEst, store, currentUser,
        VAT_RATE, stockOf, votesOf, castVote, myVote, hiddenIds, findProduct, pageOf,
        api, authApi, adoptAccount, pushBag, pushWishlist, pullReviews } = OPALERA;
const $ = id => document.getElementById(id);

/* ---------- resolve the piece ---------- */
function resolveId(){
  if(window.PRODUCT_ID) return window.PRODUCT_ID;
  const q = new URLSearchParams(location.search).get("id");
  if(q) return parseInt(q, 10);
  const m = location.hash.replace(/^#/,"").match(/(?:id=)?(\d+)/);
  return m ? parseInt(m[1], 10) : NaN;
}
const p = findProduct(resolveId()) || products[0];
if(!window.PRODUCT_ID){ document.title = `OPALÉRA — ${p.name}`; addEventListener("hashchange", ()=>location.reload()); }

/* ---------- toast ---------- */
let toastT;
function toast(t){ const el=$("toast"); el.textContent=t; el.classList.add("show");
  clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove("show"),2600); }

/* ---------- image (CDN -> local -> placeholder) ---------- */
const stage = $("stage"), img = $("pImg");
img.alt = p.name;
img.onload = ()=>stage.classList.add("ok");
img.onerror = ()=>{
  img.onerror = null; img.removeAttribute("src");
  stage.classList.remove("ok"); stage.classList.add("failed");
};
img.src = p.img || "missing.jpg";

/* ---------- slideable views + pointer-follow magnifier ---------- */
/* every view carries an HD baseline grade (full brightness, enriched
   colour) so the photography reads vividly on the dark stage */
const HD = "brightness(1.03) saturate(1.12) contrast(1.05)";
const VIEWS = [
  {label:"Full view", transform:"none", origin:"50% 50%", filter:HD},
  {label:"Detail close-up · move over the photo to explore", transform:"scale(2.2)", origin:"50% 42%",
   filter:"contrast(1.1) saturate(1.12) brightness(1.02)", pan:true},
  {label:"Reverse view", transform:"scaleX(-1)", origin:"50% 50%", filter:HD},
  {label:"In warm light", transform:"none", origin:"50% 50%", filter:"brightness(1.14) saturate(1.2) sepia(.08)"}
];
let viewIdx = 0;
function setView(i){
  viewIdx = (i + VIEWS.length) % VIEWS.length;
  const v = VIEWS[viewIdx];
  img.style.transform = v.transform; img.style.transformOrigin = v.origin; img.style.filter = v.filter;
  stage.classList.toggle("pan", !!v.pan);
  $("vLabel").textContent = v.label;
  [...$("vDots").children].forEach((d,j)=>d.setAttribute("aria-current", j===viewIdx));
}
VIEWS.forEach((v,i)=>{
  const d = document.createElement("button");
  d.className = "vdot"; d.setAttribute("aria-label", `View ${i+1} of ${VIEWS.length}: ${v.label}`);
  d.addEventListener("click", ()=>setView(i));
  $("vDots").appendChild(d);
});
setView(0);
stage.addEventListener("pointermove", e=>{
  const v = VIEWS[viewIdx];
  if(!v.pan) return;
  const rect = stage.getBoundingClientRect();
  const ox = Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100));
  const oy = Math.max(0, Math.min(100, (e.clientY - rect.top) / rect.height * 100));
  img.style.transformOrigin = `${ox}% ${oy}%`;
});
let sx=null, sy=null;
stage.addEventListener("pointerdown", e=>{ if(!e.target.closest("button")){ sx=e.clientX; sy=e.clientY; } });
stage.addEventListener("pointerup", e=>{
  if(sx===null) return;
  const dx=e.clientX-sx, dy=e.clientY-sy; sx=sy=null;
  if(VIEWS[viewIdx].pan) return;
  if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)) setView(viewIdx + (dx<0?1:-1));
});
document.addEventListener("keydown", e=>{
  if($("authModal").classList.contains("open")) return;
  if(e.key==="ArrowLeft") setView(viewIdx-1);
  if(e.key==="ArrowRight") setView(viewIdx+1);
});

/* ---------- fill the record ---------- */
$("pCat").textContent = "OPALÉRA · " + p.category + " collection";
$("pName").textContent = p.name;
$("pPrice").textContent = fmt(p.price);
$("pSig").classList.toggle("show", !p.custom && isSignature(p));
$("pDesc").textContent = p.desc || descOf(p);   /* hand-written first, generated for new arrivals */
$("pSpec").textContent = specOf(p);             /* per-piece craftsmanship line */
if(!p.custom){
  const r0 = ratingOf(p);
  $("pStars").innerHTML = `${starStr(r0.avg)}<small>${r0.avg.toFixed(1)} · ${r0.count} patron reviews</small>`;
  const est = boutiqueEst(p), save = Math.round((1-p.price/est)*100);
  $("pValue").innerHTML =
    `Comparable boutique estimate <s>${fmt(est)}</s> — <span class="save">you save ${save}%</span><br>` +
    `or 3 interest-free instalments of ${fmt(Math.ceil(p.price/3))}`;
  $("pCert").innerHTML =
    `<span class="cno">Certificate № OP-2026-${String(p.id).padStart(4,"0")}-${p.category.slice(0,3).toUpperCase()}</span><br>` +
    `Stone · ${esc(stoneOf(p))} — verified genuine in the atelier<br>` +
    `Metal · ${metalOf(p)}<br>` +
    `Hallmark · OPALÉRA · 750<br>` +
    `<em>Every piece is inspected by the maison before dispatch. Should any stone ever prove misrepresented, the maison refunds you in full — that is the promise.</em>`;
}
$("customLink").href = `jewellery_Html.html#tab=studio&pick=${p.id}`;
$("customLink").textContent = (!p.custom && isSignature(p)) ? "Add Inscription" : "Customise";
if(p.custom) $("customLink").style.display = "none";

/* stock (manager-controlled) */
const stock = stockOf(p.id);
const sr = $("pStock");
if(hiddenIds().has(p.id)){
  sr.className = "stockrow out"; sr.textContent = "This piece is currently unavailable";
  $("addBag").disabled = true;
}else if(stock <= 0){
  sr.className = "stockrow out"; sr.textContent = "Out of stock — enquire with the maison";
  $("addBag").disabled = true;
}else if(stock <= 3){
  sr.className = "stockrow low"; sr.textContent = `Only ${stock} left in the vault`;
}else{
  sr.className = "stockrow in"; sr.textContent = `In stock · ${stock} available`;
}

/* prev / next piece (within the original archive) */
if(!p.custom){
  const idx = products.findIndex(x=>x.id===p.id);
  const prev = products[(idx-1+products.length)%products.length];
  const next = products[(idx+1)%products.length];
  $("prevLink").href = pageOf(prev); $("prevLink").textContent = `← ${prev.name}`;
  $("nextLink").href = pageOf(next); $("nextLink").textContent = `${next.name} →`;
}

/* ---------- thumbs up / down ---------- */
function paintThumbs(){
  const v = votesOf(p.id), mine = myVote(p.id);
  $("thumbUp").classList.toggle("on", mine===1);
  $("thumbDown").classList.toggle("on", mine===-1);
  $("thumbUp").setAttribute("aria-pressed", mine===1);
  $("thumbDown").setAttribute("aria-pressed", mine===-1);
  $("thumbUpN").textContent = v.up;
  $("thumbDownN").textContent = v.down;
  $("thumbPct").innerHTML = `<b>${v.pct}%</b> of patrons recommend this piece`;
}
$("thumbUp").addEventListener("click", ()=>{ castVote(p.id, 1); paintThumbs(); });
$("thumbDown").addEventListener("click", ()=>{ castVote(p.id, -1); paintThumbs(); });
paintThumbs();

/* ---------- wishlist + bag (qty-aware, stock-capped) ---------- */
let wishlist = new Set(store.get("opalera.wishlist", []));
const bagQty = () => store.get("opalera.bag", []).reduce((s,it)=>s+(it.qty||1),0);
function syncBadges(){
  $("wishCount").textContent = wishlist.size || "";
  $("bagCount").textContent = bagQty() || "";
  $("pHeart").setAttribute("aria-pressed", wishlist.has(p.id));
}
$("pHeart").addEventListener("click", ()=>{
  wishlist.has(p.id) ? wishlist.delete(p.id) : wishlist.add(p.id);
  store.set("opalera.wishlist",[...wishlist]);
  pushWishlist();   /* keep the account's wishlist in sync on the server */
  syncBadges();
  toast(wishlist.has(p.id) ? `${p.name} saved to your wishlist` : `${p.name} removed from your wishlist`);
});
$("addBag").addEventListener("click", ()=>{
  const bag = store.get("opalera.bag", []);
  const line = bag.find(it=>it.pid===p.id && !it.custom);
  const have = line ? (line.qty||1) : 0;
  if(have >= stock){ toast(`Only ${stock} of this piece in the vault — all are in your bag.`); return; }
  if(line) line.qty = have + 1;
  else bag.push({ pid:p.id, custom:null, price:p.price, qty:1 });
  store.set("opalera.bag", bag);
  pushBag();        /* keep the account's bag in sync on the server */
  syncBadges();
  toast(`${p.name} added to your bag`);
});
syncBadges();

/* ---------- related pieces & recently viewed ---------- */
function mini(x){
  return `<a class="mini" href="${pageOf(x)}">
    <div class="mimg"><img src="${x.custom ? esc(x.img) : webSrc(x)}" alt="" loading="lazy"
      onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${esc(x.img)}'}else{this.style.opacity=.15}"></div>
    <div class="mb"><div class="mn">${esc(x.name)}</div><div class="mp">${fmt(x.price)}</div></div></a>`;
}
const hid = hiddenIds();
const related = products
  .filter(x=>x.id!==p.id && x.category===p.category && !hid.has(x.id))
  .sort((a,b)=>Math.abs(a.price-p.price)-Math.abs(b.price-p.price))
  .slice(0,4);
if(related.length) $("relatedStrip").innerHTML = related.map(mini).join("");
else $("relatedSec").style.display = "none";

let recent = store.get("opalera.recent", []).filter(id=>id!==p.id);
const recentPieces = recent.map(id=>findProduct(id)).filter(Boolean).filter(x=>!hid.has(x.id)).slice(0,4);
if(recentPieces.length) $("recentStrip").innerHTML = recentPieces.map(mini).join("");
else $("recentSec").style.display = "none";
recent.unshift(p.id);
store.set("opalera.recent", recent.slice(0,8));

/* ---------- structured data for search engines (dynamic pages) ---------- */
/* custom (manager-added) pieces have no seed ratings, so skip the block
   for them — ratingOf() would throw and take the rest of the page down */
if(!document.getElementById("jsonld") && !p.custom){
  const r = ratingOf(p);
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context":"https://schema.org", "@type":"Product",
    name:p.name, description:p.desc, image: p.custom ? p.img : webSrc(p),
    brand:{"@type":"Brand", name:"OPALÉRA"},
    offers:{"@type":"Offer", priceCurrency:"ZAR", price:p.price,
            availability: stock>0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"},
    aggregateRating:{"@type":"AggregateRating", ratingValue:+r.avg.toFixed(1), reviewCount:r.count}
  });
  document.head.appendChild(ld);
}

/* ---------- reviews ---------- */
function revRow(stars, name, text, verified){
  const d = document.createElement("div");
  d.className = "rev";
  d.innerHTML = `
    <div class="rhead">
      <span class="stars">${starStr(stars)}</span>
      <span class="rname">${esc(name)}</span>
      <span class="rbadge ${verified ? "" : "plain"}">${verified ? "Verified purchase" : "Patron"}</span>
    </div>
    ${text ? `<p>“${esc(text)}”</p>` : ""}`;
  return d;
}
function renderReviews(){
  const el = $("revList"); el.innerHTML = "";
  store.get("opalera.reviews", []).filter(r=>r.pid===p.id)
    .slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0))
    .forEach(r=>el.appendChild(revRow(r.stars, r.name, r.text, r.verified)));
  if(!p.custom) seedOf.get(p.id).revs.forEach(r=>el.appendChild(revRow(r.stars, r.name, r.text, r.verified)));
}
renderReviews();
let pickedStars = 5;
function paintRevStars(){ [...$("revStars").children].forEach((b,i)=>b.classList.toggle("on", i<pickedStars)); }
for(let i=1;i<=5;i++){
  const b = document.createElement("button");
  b.type="button"; b.textContent="★"; b.setAttribute("aria-label", `${i} star${i>1?"s":""}`);
  b.addEventListener("click", ()=>{ pickedStars=i; paintRevStars(); });
  $("revStars").appendChild(b);
}
paintRevStars();
$("revForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const u = currentUser();
  if(!u){ openAuth("Sign in to review your piece."); return; }
  const btn = e.target.querySelector("button[type=submit]");
  if(btn) btn.disabled = true;
  try{
    /* the server stores the review and marks it "Verified purchase" by
       checking the patron's real order history */
    const { review } = await api("/reviews", {method:"POST",
      body:{ pid:p.id, stars:pickedStars, text:$("revText").value.trim().slice(0,240) }});
    const reviews = store.get("opalera.reviews", []);
    reviews.push(review);
    store.set("opalera.reviews", reviews);
    renderReviews();
    if(!p.custom){
      const r = ratingOf(p);
      $("pStars").innerHTML = `${starStr(r.avg)}<small>${r.avg.toFixed(1)} · ${r.count} patron reviews</small>`;
    }
    pickedStars = 5; paintRevStars(); $("revText").value = "";
    toast("Merci — your review now guides other patrons.");
  }catch(err){
    if(err.status === 401) openAuth("Sign in to review your piece.");
    else toast(err.message || "Couldn't submit your review — please try again.");
  }finally{
    if(btn) btn.disabled = false;
  }
});

/* pull the latest reviews from the server so every patron sees them */
pullReviews().then(()=>{
  renderReviews();
  if(!p.custom){
    const r = ratingOf(p);
    $("pStars").innerHTML = `${starStr(r.avg)}<small>${r.avg.toFixed(1)} · ${r.count} patron reviews</small>`;
  }
});

/* ---------- auth ---------- */
const authModal = $("authModal");
function openAuth(msg){ authModal.classList.add("open"); document.body.style.overflow="hidden";
  $("liMsg").textContent = msg||""; $("liEmail").focus(); }
function closeAuth(){ authModal.classList.remove("open"); document.body.style.overflow="";
  $("liMsg").textContent=""; $("suMsg").textContent=""; $("loginForm").reset(); $("signupForm").reset(); }
function switchAuth(signup){
  $("loginForm").hidden = signup; $("signupForm").hidden = !signup;
  $("tabLogin").classList.toggle("active",!signup); $("tabSignup").classList.toggle("active",signup);
  (signup ? $("suFirst") : $("liEmail")).focus();
}
$("tabLogin").addEventListener("click", ()=>switchAuth(false));
$("tabSignup").addEventListener("click", ()=>switchAuth(true));
$("authClose").addEventListener("click", closeAuth);
authModal.addEventListener("click", e=>{ if(e.target===authModal) closeAuth(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && authModal.classList.contains("open")) closeAuth(); });

/* real accounts on the maison's server; after signing in, merge this
   browser's guest bag/wishlist into the account and refresh the badges */
async function signedIn(u){
  await adoptAccount();
  wishlist = new Set(store.get("opalera.wishlist", []));
  syncBadges(); syncAccount(); closeAuth();
  toast(`Welcome, ${u.fn}.`);
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
$("signupForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const fn=$("suFirst").value.trim(), ln=$("suLast").value.trim(),
        em=$("suEmail").value.trim().toLowerCase(), pw=$("suPass").value, msg=$("suMsg");
  if(!fn||!ln) return msg.textContent="Please tell the maison your name.";
  if(!EMAIL_RE.test(em)) return msg.textContent="That email does not look right.";
  if(pw.length<6) return msg.textContent="Password needs at least 6 characters.";
  const btn = e.target.querySelector("button[type=submit]");
  if(btn) btn.disabled = true;
  try{ await signedIn(await authApi.signup(fn, ln, em, pw)); }
  catch(err){ msg.textContent = err.message; }
  finally{ if(btn) btn.disabled = false; }
});
$("loginForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const em=$("liEmail").value.trim().toLowerCase(), pw=$("liPass").value, msg=$("liMsg");
  const btn = e.target.querySelector("button[type=submit]");
  if(btn) btn.disabled = true;
  try{ await signedIn(await authApi.login(em, pw)); }
  catch(err){ msg.textContent = err.message; }
  finally{ if(btn) btn.disabled = false; }
});
function syncAccount(){
  const u = currentUser();
  $("acctBtn").textContent = u ? u.fn : "Sign in";
  $("acctBtn").onclick = u ? ()=>{ location.href = "account.html"; } : ()=>openAuth();
}
syncAccount();
/* verify the cookie session with the server, then refresh the header */
authApi.me().then(syncAccount).catch(()=>{});
