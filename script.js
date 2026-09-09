const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

window.addEventListener("load", () => setTimeout(() => $("#loader")?.classList.add("hide"), 550));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("revealed");
    revealObserver.unobserve(entry.target);
  });
}, {threshold:.12});

$$(".reveal,.reveal-right,.reveal-stagger").forEach(el => {
  if (el.classList.contains("reveal-stagger"))
    [...el.children].forEach((child,i) => child.style.setProperty("--i", i));
  revealObserver.observe(el);
});

const progress = $(".scroll-progress"), topBtn = $("#topBtn");
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max ? (scrollY/max)*100 : 0}%`;
  topBtn?.classList.toggle("show", scrollY > 650);
});
topBtn?.addEventListener("click", () => scrollTo({top:0,behavior:"smooth"}));

const savedTheme = localStorage.getItem("tx-theme");
if (savedTheme === "dark") document.body.classList.add("dark");
$("#themeToggle")?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("tx-theme", document.body.classList.contains("dark") ? "dark" : "light");
});

$(".menu-btn")?.addEventListener("click", () => $("#mobileNav").classList.toggle("open"));
$$(".mobile-nav a").forEach(a => a.addEventListener("click", () => $("#mobileNav").classList.remove("open")));

document.querySelectorAll("[data-tilt]").forEach(card => {
  card.addEventListener("mousemove", e => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    card.style.transform = `rotate(${2.5+x*5}deg) rotateX(${y*-4}deg) rotateY(${x*5}deg)`;
  });
  card.addEventListener("mouseleave", () => card.style.transform = "rotate(2.5deg)");
});

fetch("data.json").then(r=>r.json()).then(data => {
  renderProfile(data.profile);
  renderTimeline(data.timeline);
  renderWorks(data.works, "all");
  renderFavorites(data.favorites);
  renderGallery(data.gallery);
  $$(".filter").forEach(btn => btn.addEventListener("click", () => {
    $$(".filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active"); renderWorks(data.works, btn.dataset.filter);
  }));
  setupGallery();
}).catch(console.error);

function renderProfile(p){
  const items=[["Full name",p.name],["Chinese name",p.chineseName],["Pinyin",p.pinyin],["Born",p.birthday],["Birthplace",p.birthplace],["Education",p.education],["Occupation",p.occupation],["Active",p.active]];
  $("#profileGrid").innerHTML=items.map(([a,b])=>`<div class="profile-card"><small>${a}</small><strong>${b}</strong></div>`).join("");
}
function renderTimeline(items){
  $("#timeline").innerHTML=items.map(i=>`<article class="timeline-item"><span class="timeline-dot"></span><div class="timeline-year">${i.year}</div><h3>${i.title}</h3><p>${i.text}</p></article>`).join("");
  [...$("#timeline").children].forEach((el,i)=>{el.style.setProperty("--i",i);revealObserver.observe(el)});
}
function renderWorks(items,filter){
  const filtered=items.filter(i=>filter==="all"||i.category===filter);
  $("#worksGrid").innerHTML=filtered.map(i=>`<article class="work-card"><span class="work-year">${i.year}</span><h3>${i.title}</h3><div class="work-role">${i.role}</div><p class="work-note">${i.note}</p></article>`).join("");
  [...$("#worksGrid").children].forEach((el,i)=>{el.style.setProperty("--i",i);revealObserver.observe(el)});
}
function renderFavorites(items){
  $("#favoritesGrid").innerHTML=items.map((i,n)=>`<article class="favorite-card"><div class="favorite-num">0${n+1}</div><h3>${i.title}</h3><p>${i.work}</p><small>${i.year} · ${i.type}</small></article>`).join("");
  [...$("#favoritesGrid").children].forEach((el,i)=>{el.style.setProperty("--i",i);revealObserver.observe(el)});
}
function renderGallery(items){
  $("#galleryGrid").innerHTML=items.map(i=>`<figure class="gallery-item" data-full="${i.src}"><img src="${i.src}" alt="Tian Xiwei — ${i.caption}" loading="lazy"><figcaption class="gallery-caption">${i.caption}</figcaption></figure>`).join("");
}
function setupGallery(){
  const box=document.createElement("div");box.className="lightbox";box.innerHTML='<button class="close-lightbox" aria-label="Close">×</button><img alt="Expanded photo">';
  document.body.appendChild(box);
  const img=box.querySelector("img");
  $$(".gallery-item").forEach(item=>item.addEventListener("click",()=>{img.src=item.dataset.full;box.classList.add("open")}));
  box.addEventListener("click",e=>{if(e.target===box||e.target.classList.contains("close-lightbox"))box.classList.remove("open")});
}

// Tiny optional ambient sound: generated in-browser, no audio file required.
let audioCtx=null, playing=false, timer=null;
$("#musicToggle")?.addEventListener("click",()=>{
  if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==="suspended") audioCtx.resume();
  playing=!playing; $("#musicToggle").textContent=playing?"❚❚":"♫";
  if(playing){playChime();timer=setInterval(playChime,3500)}else clearInterval(timer);
});
function playChime(){
  if(!playing)return;
  const o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.type="sine";o.frequency.value=[523.25,659.25,783.99][Math.floor(Math.random()*3)];
  g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.035,audioCtx.currentTime+.03);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.8);
  o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.85);
}
