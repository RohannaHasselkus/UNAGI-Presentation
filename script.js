// ----------------------
// SLIDE LOGIC
// ----------------------
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(n){
  if(n < 0 || n >= slides.length) return;
  slides[currentSlide].classList.remove("active");
  slides[n].classList.add("active");
  currentSlide = n;
}

slides.forEach((slide,i)=>{
  const prev = slide.querySelector("#prev"+i);
  const next = slide.querySelector("#next"+i);
  if(prev) prev.addEventListener("click", ()=>showSlide(i-1));
  if(next) next.addEventListener("click", ()=>showSlide(i+1));
});

// Optional: arrow key navigation
document.addEventListener("keydown",(e)=>{
  if(e.key==="ArrowRight") showSlide(currentSlide+1);
  if(e.key==="ArrowLeft") showSlide(currentSlide-1);
});

// ----------------------
// NETWORK BACKGROUND
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
