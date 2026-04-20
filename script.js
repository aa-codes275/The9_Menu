
const SUPABASE_URL = 'https://kmctbfolqqtpfxulmnme.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_kyWvTw6HcKUecHCJzOi_gw_Kho6l0P3'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);



let menuData = [];
let cart = [];
const categoryMap = {
    'فطار ': { db: 'Sun Breakfast', en: 'Breakfast' },
    'مشروبات باردة': { db: 'Soft Drinks', en: 'Cold Drinks' },
    'فرابيه': { db: 'Frappe', en: 'Frappe' },
    'السلطات': { db: 'Venus Salads', en: 'Salads' },
    'الشوربة': { db: 'Galaxy Soup', en: 'Soup' },
    'بيتزا ': { db: 'Zahle Pizza', en: 'Pizza' },
    'المقبلات': { db: 'Appetizers', en: 'Appetizers' },
    'برجر ': { db: 'Mars Burgers', en: 'Burgers' },
    'ساندوتشات ': { db: "Buyer's Sandwiches", en: 'Sandwiches' },
    'الأطباق الرئيسية': { db: 'Main Dishes', en: 'Main Dishes' },
    'الحلويات ': { db: 'Uranus Desserts', en: 'Desserts' },
    'مشروبات ساخنة': { db: 'Hot Drinks Pluto', en: 'Hot Drinks' },
    'عصائر فريش': { db: 'Fresh Juices', en: 'Fresh Juices' },
    'ميلك شيك': { db: 'Milkshake', en: 'Milkshake' },
    'آيس كريم': { db: 'Ice Cream', en: 'Ice Cream' },
    'الكوكتيلات': { db: 'Cocktails', en: 'Cocktails' },
    'موهيتو': { db: 'Mojitos', en: 'Mojitos' }
};

const categories = {
    food: ['فطار ', 'السلطات', 'الشوربة', 'المقبلات', 'بيتزا ', 'برجر ', 'ساندوتشات ', 'كونو', 'الأطباق الرئيسية', 'الحلويات ', 'إضافات '],
    drinks: ['مشروبات باردة', 'مشروبات ساخنة', 'فرابيه', 'عصائر فريش', 'ميلك شيك', 'الكوكتيلات',  'آيس كريم']
};


async function loadMenu() {
    try {
        const { data, error } = await _supabase.from('products').select('*');
        if (error) throw error;
        menuData = data;
        console.log("تم تحميل المنيو بنجاح:", menuData.length, "صنف");
    } catch (err) {
        console.error("خطأ في الاتصال بقاعدة البيانات:", err.message);
    }
}

let currentGalaxyType = 'food'; 

function enterGalaxy(type) {
    currentGalaxyType = type;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    
    const nav = document.getElementById('dynamic-nav');
    const selected = categories[type];
    
    nav.innerHTML = selected.map((cat, i) => {
       
        const displayName = currentLang === 'en' && categoryMap[cat] ? categoryMap[cat].en : cat;
        return `
            <div class="nav-item ${i === 0 ? 'active' : ''}" 
                 onclick="showCategory('${cat}', this)">${displayName}</div>
        `;
    }).join('');
    
    showCategory(selected[0]);
}

function exitToPortal() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
}


function showCategory(catArabic, element) {
  
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if(element) element.classList.add('active');
    
  
    const dbInfo = categoryMap[catArabic];
    const dbName = dbInfo ? dbInfo.db : catArabic;
    
    
    const filtered = menuData.filter(p => p.category === dbName);
    

    renderProducts(filtered); 
}

function addToCart(id) {
    const product = menuData.find(item => item.id === id);
    if(product) {
        cart.push(product);
        updateUI();
        showToast();
    }
}

function updateUI() {
    const counter = document.getElementById('cart-counter');
    counter.innerText = cart.length;
    document.getElementById('floating-cart').style.display = cart.length > 0 ? "flex" : "none";
    
    const content = document.getElementById('sidebar-content');
    content.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-text">
                <span>${item.name}</span>
                <small>${item.price} ج.م</small>
            </div>
            <button onclick="removeFromCart(${index})" class="remove-btn">✕</button>
        </div>
    `).join('');
    
    const total = cart.reduce((s, i) => s + parseFloat(i.price), 0);
    document.getElementById('total-price').innerText = total.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateUI();
}

function toggleCart(show) {
    document.getElementById('cart-sidebar').classList.toggle('active', show);
}


function openWaiterModal() {
    document.getElementById('waiter-modal').style.display = 'flex';
}

function closeWaiterModal() {
    document.getElementById('waiter-modal').style.display = 'none';
}

function sendWaiterRequest() {
    const table = document.getElementById('table-number').value;
    if(!table) return alert("دخل رقم الطاولة الأول!");
    
    const text = `📡 *طلب مساعدة (ويتر)*%0Aالمكان: Nine Space%0Aإحداثيات الطاولة: ${table}`;
    window.open(`https://wa.me/201123385820?text=${text}`);
    closeWaiterModal();
}


function sendOrder() {
    const table = document.getElementById('table-num').value;
    const notes = document.getElementById('order-notes').value;
    
    if(!table) return alert("من فضلك اكتب رقم الطاولة لشحن الطلب!");
    if(cart.length === 0) return;
    
    let text = `*طلب شحن جديد - Nine Space*%0A*رقم الطاولة:* ${table}%0A`;
    if(notes) text += `*ملاحظات الطيار:* ${notes}%0A`;
    text += `%0A*الأصناف المشحونة:*%0A`;
    
    cart.forEach((i, index) => {
        text += `${index + 1}. ${i.name} (${i.price}ج)%0A`;
    });
    
    text += `%0A*الإجمالي النهائي:* ${document.getElementById('total-price').innerText} ج.م`;
    
    window.open(`https://wa.me/201123385820?text=${text}`);
}

function showToast() {
    const toast = document.getElementById('order-toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}




function toggleTheme() {
    document.body.classList.toggle('red-mode');
    const icon = document.querySelector('.theme-toggle i');
    
   
    if(document.body.classList.contains('red-mode')) {
        icon.classList.replace('fa-moon', 'fa-fire'); 
    } else {
        icon.classList.replace('fa-fire', 'fa-moon');
    }
}


let currentLang = 'ar';
const translations = {
    ar: { search: "ابحث في المجرة...", portal: "اختر مسارك الكوني", food: "المأكولات", drinks: "المشروبات" },
    en: { search: "Search the galaxy...", portal: "Choose your path", food: "Food", drinks: "Drinks" }
};



function searchProducts() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    
    
    const filtered = menuData.filter(p => {
        const name = p.name ? p.name.toLowerCase() : '';
        const desc = p.description ? p.description.toLowerCase() : '';
        return name.includes(term) || desc.includes(term);
    });

    renderProducts(filtered);
}
function renderProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = ""; 
    
    products.forEach(p => {
       
        const displayName = currentLang === 'en' ? (p.name_en || p.name) : p.name;
        const displayDesc = currentLang === 'en' ? (p.description_en || p.description) : (p.description || "");

        container.innerHTML += `
            <div class="mini-card" onclick="openProductModal('${displayName}', '${p.price}', '${p.image}', '${displayDesc}')">
                <img src="${p.image}" onerror="this.src='unnamed.png'">
                <div class="product-info">
                    <h3 class="product-name">${displayName}</h3>
                    <p class="product-desc">${displayDesc}</p> 
                    <span class="price-tag">${p.price} EGP</span>
                </div>
                <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})">+</button>
            </div>`;
    });
}


function renderMenuAfterLangChange() {
   
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) {
        showCategory(activeNav.innerText); 
    }
}


function renderMenuAfterLangChange() {
  
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) {
        showCategory(activeNav.innerText); 
    }
}

function contactSupport() {
    const phoneNumber = "201123385820";
    const message = "📡 نداء لـ Nine Space.. محتاج مساعدة من كابتن السفينة!";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
}
let gameActive = false;
let score = 0;
let animationId;

function openSpaceGame() {
    document.getElementById('game-modal').style.display = 'flex';
    startGame();
}

function closeSpaceGame() {
    document.getElementById('game-modal').style.display = 'none';
    gameActive = false;
    cancelAnimationFrame(animationId);
}

function startGame() {
    const canvas = document.getElementById('spaceGameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('game-score');
    
    gameActive = true;
    score = 0;
    
    let rocket = { x: 135, y: 350, w: 30, h: 30 };
    let obstacles = [];
    let frame = 0;


    canvas.onmousemove = (e) => {
        let rect = canvas.getBoundingClientRect();
        rocket.x = e.clientX - rect.left - rocket.w / 2;
    };
    canvas.ontouchmove = (e) => {
        let rect = canvas.getBoundingClientRect();
        rocket.x = e.touches[0].clientX - rect.left - rocket.w / 2;
        e.preventDefault();
    };

    function update() {
        if (!gameActive) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
      
        ctx.font = "25px serif";
        ctx.fillText("🚀", rocket.x, rocket.y);

       
        if (frame % 30 === 0) {
            obstacles.push({ x: Math.random() * (canvas.width - 20), y: -20, size: 20 + Math.random() * 20 });
        }

        obstacles.forEach((obs, index) => {
            obs.y += 4 + (score / 100); 
            ctx.fillText("☄️", obs.x, obs.y);

           
            if (rocket.x < obs.x + 20 && rocket.x + 20 > obs.x && rocket.y < obs.y + 20 && rocket.y + 20 > obs.y) {
                gameActive = false;
                alert("الأكل قرب يجهز! مجموع نقاطك: " + score);
                closeSpaceGame();
            }

            if (obs.y > canvas.height) {
                obstacles.splice(index, 1);
                score += 10;
                scoreElement.innerText = `النقاط: ${score}`;
            }
        });

        frame++;
        animationId = requestAnimationFrame(update);
    }
    update();
}
function closeSpaceGame() {
    const modal = document.getElementById('game-modal');
    modal.style.display = 'none';
    gameActive = false;
    cancelAnimationFrame(animationId);
}

function openSpaceGame() {
    const modal = document.getElementById('game-modal');
    modal.style.display = 'flex'; 
    startGame();
}


document.addEventListener("DOMContentLoaded", loadMenu);
