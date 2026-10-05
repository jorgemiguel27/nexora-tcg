let products=[], cart=JSON.parse(localStorage.getItem("nexora-cart")||"[]"), current="Todos";
const euro=n=>new Intl.NumberFormat("pt-PT",{style:"currency",currency:"EUR"}).format(n/100);
async function init(){products=await fetch("/api/products").then(r=>r.json());render();renderCart()}
function render(){
 const el=document.querySelector("#products");
 const list=current==="Todos"?products:products.filter(p=>p.game===current);
 el.innerHTML=list.map(p=>`<article class="product"><div class="product-art"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="tag">${p.tag}</span></div><div class="product-info"><span class="game-name">${p.game}</span><h3>${p.name}</h3><p>${p.desc}</p><div class="buyrow"><span class="price">${euro(p.price)}</span><button class="add" onclick="add('${p.id}')">Adicionar</button></div></div></article>`).join("");
 document.querySelectorAll(".filters button").forEach(b=>b.classList.toggle("active",b.textContent.trim()===(current==="Todos"?"Todos":current)));
}
function filterGame(g){current=g;render();document.querySelector("#shop").scrollIntoView({behavior:"smooth",block:"start"})}
function add(id){const x=cart.find(i=>i.id===id);x?x.qty++:cart.push({id,qty:1});save();renderCart();toast("Adicionado ao carrinho.");}
function remove(id){cart=cart.filter(i=>i.id!==id);save();renderCart()}
function save(){localStorage.setItem("nexora-cart",JSON.stringify(cart))}
function renderCart(){
 const count=cart.reduce((a,i)=>a+i.qty,0);document.querySelector("#cartCount").textContent=count;
 const box=document.querySelector("#cartItems");
 if(!cart.length){box.innerHTML='<div style="padding:60px 0;text-align:center;color:#737c89">O carrinho está vazio.<br><br><a class="text-link" href="#shop" onclick="closeCart()">Explorar produtos →</a></div>';document.querySelector("#cartTotal").textContent=euro(0);return}
 let total=0;
 box.innerHTML=cart.map(i=>{const p=products.find(x=>x.id===i.id);total+=p.price*i.qty;return `<div class="cart-line"><div class="mini-art"><img src="${p.image}" alt=""></div><div><h4>${p.name}</h4><small>${i.qty} × ${euro(p.price)}</small></div><button class="remove" onclick="remove('${p.id}')">×</button></div>`}).join("");
 document.querySelector("#cartTotal").textContent=euro(total);
}
function openCart(){document.querySelector("#cart").classList.add("open")}
function closeCart(){document.querySelector("#cart").classList.remove("open")}
async function checkout(){
 if(!cart.length)return toast("O carrinho está vazio");
 const btn=document.querySelector(".cart-foot .btn");btn.disabled=true;btn.textContent="A preparar o pagamento…";
 try{const r=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:cart})});const d=await r.json();if(!r.ok)throw new Error(d.error);location.href=d.url}catch(e){toast(e.message);btn.disabled=false;btn.textContent="Finalizar compra →"}
}
function toast(t){const x=document.querySelector("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2400)}
document.querySelector("#cart").addEventListener("click",e=>{if(e.target.id==="cart")closeCart()});
init();