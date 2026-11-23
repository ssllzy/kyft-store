import { gsap } from "gsap";
type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  color: string;
  description: string;
  featured?: boolean;
  isNew?: boolean;
  bestseller?: boolean;
};
declare global {
  interface Window {
    kyftProducts: Product[];
    kyftFeaturedProducts: Product[];
  }
}
const products = window.kyftProducts;
const featuredProducts = window.kyftFeaturedProducts;
const $ = <T extends HTMLElement = HTMLElement>(s: string) =>
  document.querySelector<T>(s)!;
const all = (s: string) => document.querySelectorAll<HTMLElement>(s);
let current = 0,
  size = "M",
  quickId = "tee",
  currentColor = "Yıkanmış siyah";
let productTransitioning = false;
type CartItem = { id: string; size: string; color?: string; quantity: number };
let cart: CartItem[] = [];
try {
  const stored = JSON.parse(localStorage.getItem("kyft-bag") || "[]");
  if (Array.isArray(stored))
    cart = stored.filter(
      (i) =>
        products.some((p) => p.id === i.id) &&
        ["XS", "S", "M", "L", "XL"].includes(i.size) &&
        Number.isInteger(i.quantity) &&
        i.quantity > 0 &&
        i.quantity < 100,
    );
} catch {}
const money = (n: number) => `$${n.toFixed(2)}`;
const escapeHtml = (value: unknown) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3000);
}
function openDialog(id: string) {
  $<HTMLDialogElement>(id).showModal();
  document.body.style.overflow = "hidden";
}
all("dialog").forEach((d) => {
  d.addEventListener("close", () => {
    document.body.style.overflow = "";
  });
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      const event = e as MouseEvent;
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        (d as HTMLDialogElement).close();
    }
  });
});
all(".nav-menu").forEach((element) => {
  const menu = element as HTMLDetailsElement;
  menu.addEventListener("toggle", () => {
    if (!menu.open) return;
    all(".nav-menu").forEach((otherElement) => {
      const other = otherElement as HTMLDetailsElement;
      if (other !== menu) other.open = false;
    });
  });
});
all("[data-close]").forEach((b) =>
  b.addEventListener("click", () => b.closest("dialog")!.close()),
);
function updateCart() {
  try {
    localStorage.setItem("kyft-bag", JSON.stringify(cart));
  } catch {}
  const count = cart.reduce((a, i) => a + i.quantity, 0);
  $("#cart-count").textContent = String(count);
  $("#drawer-count").textContent = `(${count})`;
  $("#subtotal").textContent = money(
    cart.reduce(
      (a, i) => a + products.find((p) => p.id === i.id)!.price * i.quantity,
      0,
    ),
  );
  $("#cart-items").innerHTML = cart.length
    ? cart
        .map((i, index) => {
          const p = products.find((p) => p.id === i.id)!;
          const itemColor = i.color || p.color;
          const whiteVariant = itemColor === "Kırık beyaz";
          const itemImage =
            p.id === "tee" && itemColor === "Kırık beyaz"
              ? "tee-white"
              : p.image;
          const imageClass = whiteVariant && p.id !== "tee" ? "cart-white" : "";
          return `<div class="cart-item"><img class="${imageClass}" src="/images/${itemImage}.webp" alt="${escapeHtml(p.name)}"><div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(itemColor)} / ${escapeHtml(i.size)} · ${money(p.price)}</p><div class="quantity"><button data-change="${index}" data-delta="-1" aria-label="${escapeHtml(p.name)} adedini azalt">−</button><span>${i.quantity}</span><button data-change="${index}" data-delta="1" aria-label="${escapeHtml(p.name)} adedini artır">+</button><button class="remove" data-remove="${index}">Kaldır</button></div></div></div>`;
        })
        .join("")
    : '<p class="muted">Sepetin yeni bir temel parçayı bekliyor.</p>';
  $<HTMLButtonElement>("#checkout").disabled = !cart.length;
  $("#checkout-status").textContent = "";
}
function add(id: string, chosenSize: string, chosenColor?: string) {
  const product = products.find((p) => p.id === id)!;
  const color = chosenColor || product.color;
  const item = cart.find(
    (i) =>
      i.id === id &&
      i.size === chosenSize &&
      (i.color || product.color) === color,
  );
  if (item) {
    item.quantity = Math.min(item.quantity + 1, 99);
  } else cart.push({ id, size: chosenSize, color, quantity: 1 });
  updateCart();
  toast(`${products.find((p) => p.id === id)!.name} sepete eklendi`);
}
$("#cart-items").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!b) return;
  if (b.dataset.remove !== undefined) cart.splice(Number(b.dataset.remove), 1);
  if (b.dataset.change !== undefined) {
    const i = Number(b.dataset.change);
    cart[i].quantity = Math.min(99, cart[i].quantity + Number(b.dataset.delta));
    if (cart[i].quantity <= 0) cart.splice(i, 1);
  }
  updateCart();
});
$("#cart-open").addEventListener("click", () => openDialog("#cart-dialog"));
$("#checkout").addEventListener("click", () => {
  $("#checkout-status").textContent =
    "Bu bir demo mağazadır. Ödeme sistemi bağlı değildir ve ücret alınmaz.";
});
all("[data-size]").forEach((b) =>
  b.addEventListener("click", () => {
    size = b.dataset.size!;
    all("[data-size]").forEach((el) => {
      el.classList.toggle("selected", el === b);
      el.setAttribute("aria-pressed", String(el === b));
    });
  }),
);
$("#hero-add").addEventListener("click", () =>
  add(featuredProducts[current].id, size, currentColor),
);
function renderFeature(index: number) {
  current = index;
  const p = featuredProducts[index],
    next = featuredProducts[(index + 1) % featuredProducts.length];
  const isTracksuit = p.id === "blue-tracksuit";
  const mainImage = $<HTMLImageElement>("#featured-image");
  const tracksuitParts = $("#tracksuit-parts");
  currentColor = p.color;
  $("#product-title").textContent = p.name + ".";
  $("#product-description").textContent = p.description;
  $("#product-price").innerHTML = `${money(p.price)} <span>USD</span>`;
  $("#product-original-price").textContent = money(Math.ceil(p.price * 1.28));
  mainImage.src = `/images/${p.image}.webp`;
  mainImage.alt = `${p.name}, ${p.color.toLowerCase()}`;
  mainImage.hidden = false;
  mainImage.classList.remove("product-white");
  tracksuitParts.hidden = true;
  $(".floating-product").classList.remove("tracksuit-active");
  $("#color-picker").hidden = isTracksuit;
  const baseColorButton = $<HTMLButtonElement>('[data-product-color="base"]');
  baseColorButton.style.setProperty(
    "--swatch-color",
    p.color === "Kobalt mavisi" ? "#124e9a" : "#242426",
  );
  baseColorButton.setAttribute("aria-label", p.color);
  all("[data-product-color]").forEach((button) => {
    const selected = button.dataset.productColor === "base";
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  $<HTMLImageElement>(".next-image img").src = `/images/${next.image}.webp`;
  $<HTMLImageElement>(".next-image img").alt = next.name;
  $("#next-name").textContent = next.name;
  $("#next-product").setAttribute("aria-label", `${next.name} ürününü önizle`);
  all("[data-feature]").forEach((b, i) => {
    b.classList.toggle("active", i === index);
    b.setAttribute("aria-pressed", String(i === index));
  });
}

function feature(index: number) {
  if (index === current || productTransitioning) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mainImage = $<HTMLImageElement>("#featured-image");
  const previewImage = $<HTMLImageElement>(".next-image img");
  const target = featuredProducts[index];
  if (featuredProducts[current].id === "blue-tracksuit") {
    mainImage.src = "/images/blue-tracksuit.webp";
    mainImage.hidden = false;
    $("#tracksuit-parts").hidden = true;
    $(".floating-product").classList.remove("tracksuit-active");
  }
  const nextButton = $<HTMLButtonElement>("#next-product");
  const pagination = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-feature]"),
  );

  productTransitioning = true;
  nextButton.disabled = true;
  pagination.forEach((button) => (button.disabled = true));

  const finish = () => {
    productTransitioning = false;
    nextButton.disabled = false;
    pagination.forEach((button) => (button.disabled = false));
  };

  if (reducedMotion) {
    gsap.to([mainImage, "[data-product-copy]"], {
      opacity: 0,
      duration: 0.12,
      onComplete: () => {
        renderFeature(index);
        gsap.to([mainImage, "[data-product-copy]"], {
          opacity: 1,
          duration: 0.18,
          onComplete: finish,
        });
      },
    });
    return;
  }

  const showcase = $("#showcase");
  const showcaseRect = showcase.getBoundingClientRect();
  const sourceRect = previewImage.getBoundingClientRect();
  const targetRect = mainImage.getBoundingClientRect();
  const incoming = document.createElement("img");
  incoming.src = `/images/${target.image}.webp`;
  incoming.alt = "";
  incoming.className = "product-transition-clone";
  Object.assign(incoming.style, {
    left: `${sourceRect.left - showcaseRect.left}px`,
    top: `${sourceRect.top - showcaseRect.top}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
  });
  showcase.append(incoming);

  const deltaX =
    targetRect.left +
    targetRect.width / 2 -
    (sourceRect.left + sourceRect.width / 2);
  const deltaY =
    targetRect.top +
    targetRect.height / 2 -
    (sourceRect.top + sourceRect.height / 2);
  const destinationScale = targetRect.width / sourceRect.width;

  gsap
    .timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        incoming.remove();
        gsap.set(mainImage, { clearProps: "all" });
        finish();
      },
    })
    .set(incoming, { opacity: 0.68, scale: 0.82, filter: "blur(2px)" })
    .to(
      mainImage,
      {
        xPercent: -44,
        scale: 0.66,
        rotation: -4,
        opacity: 0,
        filter: "blur(12px)",
        duration: 0.48,
        ease: "power3.in",
      },
      0,
    )
    .to(
      incoming,
      {
        x: deltaX,
        y: deltaY,
        scale: destinationScale,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.72,
        ease: "expo.inOut",
      },
      0.02,
    )
    .to(
      "[data-product-copy]",
      { opacity: 0, x: -16, duration: 0.2, ease: "power2.in" },
      0.04,
    )
    .add(() => renderFeature(index), 0.28)
    .set(mainImage, { opacity: 0 }, 0.28)
    .set("[data-product-copy]", { x: 18 }, 0.3)
    .to(
      "[data-product-copy]",
      { opacity: 1, x: 0, duration: 0.46, ease: "power3.out" },
      0.34,
    )
    .set(
      mainImage,
      { xPercent: 0, scale: 1, rotation: 0, filter: "blur(0px)" },
      0.69,
    )
    .to(incoming, { opacity: 0, duration: 0.13, ease: "power1.out" }, 0.69)
    .to(mainImage, { opacity: 1, duration: 0.13, ease: "power1.out" }, 0.69);
}
$("#next-product").addEventListener("click", () =>
  feature((current + 1) % featuredProducts.length),
);
all("[data-feature]").forEach((b) =>
  b.addEventListener("click", () => feature(Number(b.dataset.feature))),
);

all("[data-product-color]").forEach((button) => {
  button.addEventListener("click", () => {
    const product = featuredProducts[current];
    if (product.id === "blue-tracksuit" || productTransitioning) return;
    const color = button.dataset.productColor!;
    const nextColor = color === "white" ? "Kırık beyaz" : product.color;
    if (currentColor === nextColor) return;
    const useGeneratedWhite = color === "white" && product.id === "tee";
    const useFilteredWhite = color === "white" && product.id !== "tee";
    const nextSource = useGeneratedWhite
      ? "/images/tee-white.webp"
      : `/images/${product.image}.webp`;
    const mainImage = $<HTMLImageElement>("#featured-image");
    const sweep = $<HTMLImageElement>("#color-sweep-image");
    productTransitioning = true;
    currentColor = nextColor;
    all("[data-product-color]").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    sweep.src = nextSource;
    sweep.classList.toggle("product-white", useFilteredWhite);
    sweep.hidden = false;
    sweep.classList.remove("is-sweeping");
    void sweep.offsetWidth;
    sweep.classList.add("is-sweeping");
    gsap.to(mainImage, {
      opacity: 0.56,
      duration: 0.24,
      ease: "power2.in",
      onComplete: () => {
        mainImage.src = nextSource;
        mainImage.classList.toggle("product-white", useFilteredWhite);
        mainImage.alt = `${featuredProducts[current].name}, ${nextColor.toLowerCase()}`;
        gsap.to(mainImage, {
          opacity: 1,
          duration: 0.34,
          ease: "power2.out",
        });
      },
    });
    window.setTimeout(() => {
      sweep.hidden = true;
      sweep.classList.remove("is-sweeping");
      productTransitioning = false;
    }, 800);
  });
});

function quick(id: string) {
  quickId = id;
  const p = products.find((p) => p.id === id)!;
  $("#quick-title").textContent = p.name;
  $<HTMLImageElement>("#quick-image").src = `/images/${p.image}.webp`;
  $<HTMLImageElement>("#quick-image").alt = p.name;
  $("#quick-price").textContent = money(p.price);
  $("#quick-color").textContent = p.color;
  $<HTMLSelectElement>("#quick-size").value = "M";
  openDialog("#quick-dialog");
}
all("[data-quick],[data-preview]").forEach((b) =>
  b.addEventListener("click", () =>
    quick(b.dataset.quick || b.dataset.preview!),
  ),
);
$("#quick-confirm").addEventListener("click", () => {
  add(quickId, $<HTMLSelectElement>("#quick-size").value);
  $<HTMLDialogElement>("#quick-dialog").close();
});
$("#search-open").addEventListener("click", () => openDialog("#search-dialog"));
$("#search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const query = $<HTMLInputElement>("#search-input").value.trim().toLowerCase();
  const targetIndex = featuredProducts.findIndex((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(query),
  );
  $<HTMLDialogElement>("#search-dialog").close();
  if (targetIndex >= 0) {
    feature(targetIndex);
    $("#new-drop").scrollIntoView({ behavior: "smooth" });
  } else toast("Bu aramada öne çıkan ürün bulunamadı");
});
$("#menu-toggle").addEventListener("click", () => {
  const nav = $("#mobile-nav");
  nav.hidden = !nav.hidden;
  $("#menu-toggle").setAttribute("aria-expanded", String(!nav.hidden));
});
all("#mobile-nav a,#mobile-nav button").forEach((a) =>
  a.addEventListener("click", () => {
    $("#mobile-nav").hidden = true;
    $("#menu-toggle").setAttribute("aria-expanded", "false");
  }),
);
$("#newsletter-form").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#newsletter-status").textContent =
    "Teşekkürler. Bu demo e-posta adreslerini göndermez veya kaydetmez.";
});
const info: Record<string, [string, string]> = {
  care: [
    "Uzun süre seninle.",
    "Benzer renklerle, ters çevirerek ve soğuk suda yıka. Parça boyalı görünümü korumak için yumuşak deterjan kullan, ağartıcıdan kaçın ve asarak kurut.",
  ],
  shipping: [
    "Kargo ve iadeler",
    "Demo mağaza politikası: 100 $ üzeri siparişlerde standart kargo ücretsizdir. Giyilmemiş ürünler 100 gün içinde iade edilebilir. Nihai bölgeler, ücretler ve iade koşulları yayından önce yapılandırılmalıdır.",
  ],
  contact: [
    "Bize ulaş.",
    "Müşteri desteği bu demoya bağlı değildir. Yayından önce markanın destek e-postasını ve iletişim bilgilerini ekle.",
  ],
  privacy: [
    "Gizliliğin",
    "Bu demo sepetini yalnızca tarayıcında saklar. Bülten bilgileri toplanmaz veya iletilmez. Ödeme verisi alınmaz.",
  ],
  terms: [
    "Mağaza koşulları",
    "Bu bir demo mağazadır. Ürünler, fiyatlar, malzeme açıklamaları ve hizmet politikaları örnek içeriktir. Sipariş ve ödeme işlemleri gerçekleştirilmez.",
  ],
};
all("[data-info]").forEach((b) =>
  b.addEventListener("click", () => {
    const [title, content] = info[b.dataset.info!];
    $("#info-title").textContent = title;
    $("#info-content").textContent = content;
    openDialog("#info-dialog");
  }),
);
$("#size-guide-open").addEventListener("click", () => {
  $("#info-title").textContent = "Bedenini bul.";
  $("#info-content").innerHTML =
    "<p>Rahat ve oversize kalıp. Bol bir silüet için normal bedenini, daha yakın bir kalıp için bir beden küçüğünü seç.</p><p>Düz zeminde ölçülen örnek tişört ölçüleri, cm.</p><table><thead><tr><th>Beden</th><th>Göğüs genişliği</th><th>Uzunluk</th></tr></thead><tbody>" +
    [
      ["XS", 54, 67],
      ["S", 57, 69],
      ["M", 60, 71],
      ["L", 63, 73],
      ["XL", 66, 75],
    ]
      .map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join("")}</tr>`)
      .join("") +
    "</tbody></table>";
  openDialog("#info-dialog");
});
updateCart();
const mm = gsap.matchMedia();
mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
  gsap.from(".product-info,.next-product", {
    opacity: 0,
    y: 15,
    duration: 0.9,
    stagger: 0.15,
  });
});
