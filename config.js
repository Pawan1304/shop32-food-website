const SHOP_CONFIG = {

  shopName: "Sudh Vaishno Tandoor",
  tagline: "Pure Vegetarian • Since 1996",
  owner: "Sudhir Mandal",
  registered: "Registered by MC Chandigarh",
  phone: ["9779159680", "8264621901"],
  whatsapp: "919779159680",
  address: "Gate No. 2, GMCH, Chandigarh",
  mapsUrl: "https://maps.app.goo.gl/wNxAkM2geS4CqVgk6",
  hours: "7:00 AM – 11:00 PM",
  currency: "₹",

  /* =====================================================
     DAILY / EXPERIENCE PHOTO COLLECTIONS
     Add more file paths inside these arrays whenever you
     add new photos to assets/photos/.
     ===================================================== */

  experienceMedia: [
    { type: "image", src: "assets/photos/thali.png", alt: "Vegetarian thali" },
    { type: "image", src: "assets/photos/paratha.png", alt: "Fresh paratha" },
    { type: "image", src: "assets/photos/rajma-rice.png", alt: "Rajma rice" },
    { type: "image", src: "assets/photos/dal.png", alt: "Dal" },
    { type: "image", src: "assets/photos/roti.png", alt: "Fresh roti" },
  ],

  aboutImages: [
    "assets/photos/thali.png",
    "assets/photos/paratha.png",
    "assets/photos/rajma-rice.png",
    "assets/photos/dal.png",
    "assets/photos/roti.png"
  ],

  galleryImages: [
    "assets/photos/thali.png",
    "assets/photos/roti.png",
    "assets/photos/dal.png",
    "assets/photos/rajma-rice.png",
    "assets/photos/paratha.png",
    "assets/photos/water.png",
    "assets/photos/amul-tikki.png"
  ],

  /* Temporary food-photo collection for Langar.
     Replace/add your real Langar photos here later. */
  langarImages: [
    "assets/photos/thali.png",
    "assets/photos/paratha.png",
    "assets/photos/rajma-rice.png",
    "assets/photos/dal.png",
    "assets/photos/roti.png"
  ],

  menu: [
    {
      id: 1, category: "Thali & Combos",
      name: "5 Roti + Dal + Sabji + Salad",
      description: "5 rotis served with dal, seasonal sabji and fresh salad.",
      price: 70,
      image: "assets/photos/menu/thali-combo-5-roti.png",
      images: [
        "assets/photos/menu/thali-combo-5-roti.png",
        "assets/photos/thali.png",
        "assets/photos/roti.png"
      ]
    },
    {
      id: 2, category: "Thali & Combos",
      name: "3 Roti + Chawal + Dal + Sabji + Salad",
      description: "A filling meal with 3 rotis, rice, dal, sabji and salad.",
      price: 70,
      image: "assets/photos/menu/thali-combo-5-roti.png",
      images: [
        "assets/photos/menu/thali-combo-5-roti.png",
        "assets/photos/thali.png",
        "assets/photos/rajma-rice.png"
      ]
    },
    {
      id: 5, category: "Thali & Combos",
      name: "2 Paratha + Dal + Achar",
      description: "Two parathas served with dal and pickle.",
      price: 70,
      image: "assets/photos/menu/paratha-dal-achar.png",
      images: [
        "assets/photos/menu/paratha-dal-achar.png",
        "assets/photos/paratha.png",
        "assets/photos/dal.png"
      ]
    },
    {
      id: 6, category: "Thali & Combos",
      name: "Dal / Sabji Ki Thali",
      description: "Simple, homely dal or sabji thali.",
      price: 30,
      image: "assets/photos/menu/dal-sabji-thali.png",
      images: [
        "assets/photos/menu/dal-sabji-thali.png",
        "assets/photos/dal.png",
        "assets/photos/thali.png"
      ]
    },
    {
      id: 3, category: "Rice",
      name: "Full Plate Chawal",
      description: "A generous plate of freshly prepared rice.",
      price: 60,
      image: "assets/photos/menu/chawal.png",
      images: [
        "assets/photos/menu/chawal.png",
        "assets/photos/rajma-rice.png",
        "assets/photos/thali.png"
      ]
    },
    {
      id: 4, category: "Rice",
      name: "Half Plate Chawal",
      description: "A lighter serving of freshly prepared rice.",
      price: 40,
      image: "assets/photos/menu/chawal.png",
      images: [
        "assets/photos/menu/chawal.png",
        "assets/photos/rajma-rice.png"
      ]
    },
    {
      id: 7, category: "Roti & Paratha",
      name: "1 Roti",
      description: "Freshly cooked roti.",
      price: 7,
      image: "assets/photos/menu/roti.png",
      images: [
        "assets/photos/menu/roti.png",
        "assets/photos/roti.png",
        "assets/photos/paratha.png"
      ]
    },
    {
      id: 8, category: "Extras",
      name: "Water Bottle",
      description: "1 litre packaged drinking water.",
      price: 20,
      image: "assets/photos/menu/water.png",
      images: ["assets/photos/menu/water.png", "assets/photos/water.png"]
    },
    {
      id: 9, category: "Extras",
      name: "Amul Butter",
      description: "1 Amul butter packet.",
      price: 10,
      image: "assets/photos/menu/amul-butter.png",
      images: ["assets/photos/menu/amul-butter.png", "assets/photos/amul-tikki.png"]
    }
  ]
};
