document.addEventListener("DOMContentLoaded",()=>{
  const menu=document.querySelector(".menu-button");
  const links=document.querySelector(".nav-links");
  if(menu&&links){
    menu.addEventListener("click",()=>links.classList.toggle("open"));
  }
  document.querySelectorAll("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());
});