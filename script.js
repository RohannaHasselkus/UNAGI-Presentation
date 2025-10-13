// ----------------------
// SLIDE LOGIC (Enhanced version)
// ----------------------
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const totalSlides = slides.length;

function showSlide(n){
  // Handle wraparound
  if(n >= totalSlides) n = 0;
  if(n < 0) n = totalSlides - 1;
  
  slides[currentSlide].classList.remove("active");
  slides[n].classList.add("active");
  currentSlide = n;
}

// Enhanced button handling with better error checking
slides.forEach((slide,i)=>{
  const prev = slide.querySelector("#prev"+i);
  const next = slide.querySelector("#next"+i);
  if(prev) prev.addEventListener("click", ()=>showSlide(i-1));
  if(next) next.addEventListener("click", ()=>showSlide(i+1));
});

// Arrow key navigation
document.addEventListener("keydown",(e)=>{
  if(e.key==="ArrowRight") showSlide(currentSlide+1);
  if(e.key==="ArrowLeft") showSlide(currentSlide-1);
});

// ----------------------
// YOUR ORIGINAL NETWORK BACKGROUND
// ----------------------
const canvas = document.getElementById("network");
const ctx = canvas.getContext("2d");
let width, height;
let nodes = [];
const numNodes = 150; // number of dots

function resize(){
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener("resize", resize);
resize();

function initNodes(){
  nodes = [];
  for(let i=0;i<numNodes;i++){
    nodes.push({
      x: Math.random()*width,
      y: Math.random()*height,
      vx: (Math.random()-0.5)*0.5,
      vy: (Math.random()-0.5)*0.5,
      r: 3 + Math.random()*3 // larger dots: 3–6
    });
  }
}
initNodes();

function draw(){
  ctx.clearRect(0,0,width,height);
  // edges
  for(let i=0;i<numNodes;i++){
    for(let j=i+1;j<numNodes;j++){
      const dx = nodes[i].x-nodes[j].x;
      const dy = nodes[i].y-nodes[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist<120){
        ctx.strokeStyle = `rgba(111,177,160,${1-dist/120})`;
        ctx.lineWidth = 2; // thicker lines
        ctx.beginPath();
        ctx.moveTo(nodes[i].x,nodes[i].y);
        ctx.lineTo(nodes[j].x,nodes[j].y);
        ctx.stroke();
      }
    }
  }
  // nodes
  nodes.forEach(n=>{
    ctx.beginPath();
    ctx.arc(n.x,n.y,n.r,0,2*Math.PI);
    ctx.fillStyle = "#2a9d8f";
    ctx.fill();
  });
  update();
  requestAnimationFrame(draw);
}

function update(){
  nodes.forEach(n=>{
    n.x+=n.vx;
    n.y+=n.vy;
    if(n.x<0||n.x>width) n.vx*=-1;
    if(n.y<0||n.y>height) n.vy*=-1;
  });
}
draw();

// ----------------------
// SIDE MENU NAVIGATION
// ----------------------
document.querySelectorAll('#side-menu a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if(target) {
      const index = Array.from(slides).indexOf(target);
      if(index >= 0) showSlide(index);
    }
  });
});

// Toggle menu
const menuToggle = document.getElementById("menu-toggle");
const sideMenu = document.getElementById("side-menu");

menuToggle.addEventListener("click", () => {
  sideMenu.classList.toggle("open");
});

// Close menu when a link is clicked & go to slide
document.querySelectorAll('#side-menu a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if(target){
      const index = Array.from(slides).indexOf(target);
      if(index >= 0) showSlide(index);
    }
    sideMenu.classList.remove("open"); // auto-close menu
  });
});

// --- Unipartite data ---
const uniNodes = [
  { id: 'A'},{ id: 'B'},{ id: 'C'},{ id: 'D'},{ id: 'E'},{ id: 'F'}
];
const uniLinks = [
  { source: 'A', target: 'B' }, { source: 'A', target: 'C' }, { source: 'B', target: 'C' },
  { source: 'C', target: 'D' }, { source: 'D', target: 'E' }, { source: 'E', target: 'F' }, { source: 'B', target: 'F' }
];

// --- Bipartite data ---
const U = ['u1','u2','u3'];
const V = ['v1','v2','v3','v4'];
const biNodes = U.map(d=>({id:d,type:'U'})).concat(V.map(d=>({id:d,type:'V'})));
const biLinks = [
  { source:'u1', target:'v1' }, { source:'u1', target:'v3' },
  { source:'u2', target:'v2' }, { source:'u2', target:'v3' },
  { source:'u3', target:'v2' }, { source:'u3', target:'v4' }
];

// --- Unipartite visualization (force simulation) ---
const uniSvg = d3.select('#uni-svg');
const uniWidth = 800, uniHeight = 360;
const uniG = uniSvg.append('g');

const linkG = uniG.append('g').attr('class','links');
const nodeG = uniG.append('g').attr('class','nodes');

let uniSimulation = d3.forceSimulation(uniNodes)
  .force('link', d3.forceLink(uniLinks).id(d=>d.id).distance(90).strength(0.8))
  .force('charge', d3.forceManyBody().strength(-260))
  .force('center', d3.forceCenter(uniWidth/2, uniHeight/2))
  .on('tick', ticked);

let uniLink = linkG.selectAll('line').data(uniLinks).join('line').attr('stroke','rgba(0,0,0,0.8)').attr('stroke-width',1.6);
let uniNode = nodeG.selectAll('g').data(uniNodes).join('g').call(drag(uniSimulation));
uniNode.append('circle').attr('r',20).attr('fill','#1f77b4');
uniNode.append('text').attr('dy',5).attr('text-anchor','middle').attr('font-size',12).attr('fill','white').text(d=>d.id);

let frozen = false;
function ticked(){
  uniLink.attr('x1', d=>d.source.x)
    .attr('y1', d=>d.source.y)
    .attr('x2', d=>d.target.x)
    .attr('y2', d=>d.target.y);
  uniNode.attr('transform', d=>`translate(${d.x},${d.y})`);
}

function drag(sim){
  function started(event,d){
    if(!event.active) sim.alphaTarget(0.3).restart();
    d.fx = d.x; d.fy = d.y;
  }
  function dragged(event,d){ d.fx = event.x; d.fy = event.y; }
  function ended(event,d){ if(!event.active) sim.alphaTarget(0); if(frozen){ d.fx = d.x; d.fy = d.y; } else { d.fx = null; d.fy = null; } }
  return d3.drag().on('start', started).on('drag', dragged).on('end', ended);
}

// Buttons for uni
document.getElementById('restart-uni').addEventListener('click', ()=>{
  uniNodes.forEach(n=>{ n.fx = null; n.fy = null; });
  uniSimulation.alpha(1).restart();
  frozen = false;
});

document.getElementById('freeze-uni').addEventListener('click', ()=>{
  frozen = !frozen;
  if(frozen){ uniSimulation.stop(); } else { uniSimulation.alpha(0.5).restart(); }
});

// --- Bipartite visualization (fixed left/right) ---
const biSvg = d3.select('#bi-svg');
const biWidth = 800, biHeight = 360;
const biG = biSvg.append('g');

// layout: U on left, V on right
const leftX = 140, rightX = biWidth - 140;
const spacingU = biHeight / (U.length + 1);
const spacingV = biHeight / (V.length + 1);

const biNodesPos = biNodes.map(d=>{
  if(d.type === 'U'){
    const idx = U.indexOf(d.id)+1; return Object.assign({}, d, {x: leftX, y: spacingU*idx});
  } else {
    const idx = V.indexOf(d.id)+1; return Object.assign({}, d, {x: rightX, y: spacingV*idx});
  }
});

const biLink = biG.selectAll('line').data(biLinks).join('line')
  .attr('stroke','rgba(0,0,0,0.85)').attr('stroke-width',1.6)
  .attr('x1', d=>getNode(d.source).x).attr('y1', d=>getNode(d.source).y)
  .attr('x2', d=>getNode(d.target).x).attr('y2', d=>getNode(d.target).y);

const biNode = biG.selectAll('g').data(biNodesPos).join('g')
  .attr('transform', d=>`translate(${d.x},${d.y})`);

biNode.append('circle').attr('r',18).attr('fill', d=> d.type==='U' ? '#2ca02c' : '#ff7f0e');
biNode.append('text').attr('dy',5).attr('text-anchor','middle').attr('font-size',12).attr('fill','white').text(d=>d.id);

function getNode(id){ return biNodesPos.find(n=>n.id===id) || biNodesPos.find(n=>n.id===id); }

// Projection helpers: project bipartite graph to unipartite (one-mode projection)
function project(mode){
  // mode: 'U' or 'V' — returns an array of edges between nodes of that mode when they share a neighbor
  const neighbors = {};
  biLinks.forEach(l=>{
    // ensure entries
    if(!neighbors[l.source]) neighbors[l.source] = new Set();
    if(!neighbors[l.target]) neighbors[l.target] = new Set();
    neighbors[l.source].add(l.target);
    neighbors[l.target].add(l.source);
  });
  const pool = biNodesPos.filter(n=>n.type===mode).map(n=>n.id);
  const edges = [];
  for(let i=0;i<pool.length;i++){
    for(let j=i+1;j<pool.length;j++){
      const a = pool[i], b = pool[j];
      // they project if they share at least one neighbor
      const shared = [...(neighbors[a]||new Set())].filter(x => (neighbors[b]||new Set()).has(x));
      if(shared.length>0) edges.push({ source: a, target: b, weight: shared.length });
    }
  }
  return edges;
}

let currentProj = null;
function drawProjection(mode){
  const edges = project(mode);
  // remove previous projection group if present
  biG.selectAll('.proj').remove();
  if(edges.length===0) return;
  const projG = biG.append('g').attr('class','proj');
  // position projected nodes along the same side as original
  const nodesMode = biNodesPos.filter(n=>n.type===mode);
  const x = mode==='U' ? leftX : rightX;
  // draw curved links on the same side for visualization
  projG.selectAll('path').data(edges).join('path')
    .attr('d', d=>{
      const a = getNode(d.source); const b = getNode(d.target);
      const mx = (a.x + b.x)/2 + (mode==='U' ? -60 : 60);
      return `M ${a.x} ${a.y} Q ${mx} ${(a.y+b.y)/2} ${b.x} ${b.y}`;
    })
    .attr('stroke','rgba(30,30,120,0.65)').attr('fill','none').attr('stroke-width', d=>1 + Math.log(1 + d.weight));
}

// Buttons for projection
document.getElementById('proj-left').addEventListener('click', ()=>{ drawProjection('U'); currentProj='U'; });
document.getElementById('proj-right').addEventListener('click', ()=>{ drawProjection('V'); currentProj='V'; });
document.getElementById('clear-proj').addEventListener('click', ()=>{ biG.selectAll('.proj').remove(); currentProj = null; });

// small resize handling (keeps viewBox-based svg responsive)
window.addEventListener('resize', ()=>{ /* viewBox keeps layout responsive; nothing required here */ });


  document.getElementById("wiki-btn").addEventListener("click", () => {
    window.open(
      "https://rohannahasselkus.github.io/GRN-Model/",
      "_blank",
      "noopener,noreferrer"
    );
  });