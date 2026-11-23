export type Product = {
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

export const products: Product[] = [
  {
    id: "tee",
    name: "Ağır Dokulu Tişört",
    category: "T-shirt",
    price: 48,
    image: "tee",
    color: "Yıkanmış siyah",
    description: "Sıradanlığın çok ötesinde.",
  },
  {
    id: "hoodie",
    name: "Temel Kapüşonlu",
    category: "Hoodie",
    price: 98,
    image: "hoodie",
    color: "Yıkanmış siyah",
    description: "Ağırlığını hissettiren konfor.",
  },
  {
    id: "pants",
    name: "Fonksiyonel Pantolon",
    category: "Pantolon",
    price: 88,
    image: "pants",
    color: "Yıkanmış siyah",
    description: "Her güne hazır.",
  },
  {
    id: "blue-tracksuit",
    name: "Mavi Eşofman Takımı",
    category: "Eşofman",
    price: 148,
    image: "blue-tracksuit",
    color: "Kobalt mavisi",
    description: "İki parça. Tek görünüm.",
  },
  {
    id: "blue-hoodie",
    name: "Kobalt Sweatshirt",
    category: "Hoodie",
    price: 84,
    image: "blue-hoodie-final",
    color: "Kobalt mavisi",
    description: "Tek başına güçlü.",
    featured: false,
  },
  {
    id: "blue-pants",
    name: "Kobalt Eşofman Altı",
    category: "Eşofman",
    price: 72,
    image: "blue-pants-final",
    color: "Kobalt mavisi",
    description: "Rahat ve net.",
    featured: false,
  },
  {
    id: "wes-born-to-die",
    name: "Born To Die Boxy Tişört",
    category: "T-shirt",
    price: 64,
    image: "wes-born-to-die",
    color: "Yıkanmış siyah / kırmızı",
    description: "Ağır kumaş. Nakış detay.",
    featured: false,
    isNew: true,
    bestseller: true,
  },
  {
    id: "wes-koi-shirt",
    name: "Koi Fish Poplin Gömlek",
    category: "Gömlek",
    price: 86,
    image: "wes-koi-shirt",
    color: "Cadmium kırmızı",
    description: "Klips ve nakış detaylı.",
    featured: false,
    isNew: true,
  },
  {
    id: "wes-atelier-hoodie",
    name: "Atelier Boxy Hoodie",
    category: "Hoodie",
    price: 104,
    image: "wes-atelier-hoodie",
    color: "Siyah",
    description: "Çıkarılabilir kapüşon.",
    featured: false,
    bestseller: true,
  },
  {
    id: "wes-knights-knit",
    name: "Death of Knights Triko",
    category: "Kazak",
    price: 94,
    image: "wes-knights-knit",
    color: "Alizarin bordo",
    description: "%100 pamuk triko.",
    featured: false,
    isNew: true,
  },
  {
    id: "wes-grey-jogger",
    name: "Parçalı Baggy Eşofman",
    category: "Eşofman",
    price: 82,
    image: "wes-grey-jogger",
    color: "Gri",
    description: "Ayarlanabilir paça.",
    featured: false,
    isNew: true,
  },
];

export const featuredProducts = products.filter(
  (product) => product.featured !== false,
);

export const categories = [
  { slug: "t-shirt", name: "T-shirt" },
  { slug: "gomlek", name: "Gömlek" },
  { slug: "hoodie", name: "Hoodie" },
  { slug: "sweatshirt", name: "Sweatshirt" },
  { slug: "kazak", name: "Kazak" },
  { slug: "pantolon", name: "Pantolon" },
  { slug: "esofman", name: "Eşofman" },
  { slug: "sort", name: "Şort" },
] as const;
