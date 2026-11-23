(() => {
 const cfg=window.NYX_CONFIG||{}, repo=cfg.githubRepo||"vmvlad1029384756-hash/nyx-proxy-bridge";
 const version=cfg.version||"1.0.0", github="https://github.com/"+repo;
 const installer=cfg.installerName||"NYXProxyBridge_Setup.exe";
 const release=github+"/releases/latest/download/"+encodeURIComponent(installer);
 document.getElementById("version").textContent=version;
 document.getElementById("year").textContent=new Date().getFullYear();
 document.getElementById("githubLink").href=github;
 document.getElementById("footerGithub").href=github;
 document.getElementById("downloadStatus").textContent="VERSION "+version+" · WINDOWS INSTALLER";
 ["downloadButton","downloadButton2"].forEach(id=>document.getElementById(id).href=release);
 const targets=document.querySelectorAll(".section-top,.feature,.experience-copy,.interface-stage,.download-inner");
 targets.forEach(el=>el.classList.add("reveal"));
 if("IntersectionObserver" in window&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12});
  targets.forEach(el=>io.observe(el));
 }else targets.forEach(el=>el.classList.add("visible"));
 const aura=document.querySelector(".cursor-aura");
 if(aura&&matchMedia("(pointer:fine)").matches) addEventListener("pointermove",e=>{aura.style.left=e.clientX+"px";aura.style.top=e.clientY+"px"},{passive:true}); else aura?.remove();
})();