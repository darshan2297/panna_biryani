export interface RoyalTag {
  id: string;
  title: string;
  icon: string;
  description: string;
  badgeClass: string;
  bgGradient: string;
}

export const ROYAL_TAGS: RoyalTag[] = [
  {
    id: "nawab-of-dum",
    title: "Nawab of Dum",
    icon: "👑",
    description: "Master of the 2-hour slow dum flame. Every fragrant grain carries your royal seal.",
    badgeClass: "bg-amber-50 text-[#85521b] border-amber-300 hover:border-amber-400",
    bgGradient: "from-amber-500/20 via-yellow-500/10 to-amber-600/5",
  },
  {
    id: "dum-connoisseur",
    title: "Dum Connoisseur",
    icon: "✨",
    description: "Gifted with the rare palate to distinguish aged Dehradun basmati by scent alone.",
    badgeClass: "bg-emerald-50 text-[#007A55] border-emerald-300 hover:border-emerald-400",
    bgGradient: "from-emerald-500/20 via-teal-500/10 to-emerald-600/5",
  },
  {
    id: "zaffran-sultan",
    title: "Zaffran Sultan",
    icon: "🌸",
    description: "Devotee of pure Kashmiri saffron threads bloomed in warm cream and desi ghee.",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-300 hover:border-purple-400",
    bgGradient: "from-purple-500/20 via-pink-500/10 to-purple-600/5",
  },
  {
    id: "handi-maestro",
    title: "Handi Maestro",
    icon: "🍲",
    description: "Honorary commander of sealed earthen clay pots that lock in pure royal aroma.",
    badgeClass: "bg-orange-50 text-orange-800 border-orange-300 hover:border-orange-400",
    bgGradient: "from-orange-500/20 via-amber-500/10 to-orange-600/5",
  },
  {
    id: "shahi-dastarkhwan",
    title: "Shahi Dastarkhwan",
    icon: "⚜️",
    description: "Believer that biryani is never eaten alone — it is meant for grand, joyous royal sharing.",
    badgeClass: "bg-amber-50 text-[#925c28] border-amber-300 hover:border-amber-400",
    bgGradient: "from-yellow-500/20 via-amber-500/10 to-yellow-600/5",
  },
  {
    id: "basmati-raja",
    title: "Basmati Raja",
    icon: "🌾",
    description: "Patron of extra-long pearl rice grains that stay separate, fragrant, and royal.",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-300 hover:border-teal-400",
    bgGradient: "from-teal-500/20 via-emerald-500/10 to-teal-600/5",
  },
  {
    id: "spice-custodian",
    title: "Secret Spice Custodian",
    icon: "🌶️",
    description: "Trusted with the heritage potli of star anise, black stone flower, and royal cloves.",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-300 hover:border-rose-400",
    bgGradient: "from-rose-500/20 via-red-500/10 to-rose-600/5",
  },
  {
    id: "dum-alchemist",
    title: "Dum Alchemist",
    icon: "💎",
    description: "Witnesses the magic of slow simmering turn fragrant layers into royal perfection.",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-300 hover:border-indigo-400",
    bgGradient: "from-indigo-500/20 via-blue-500/10 to-indigo-600/5",
  },
  {
    id: "royal-epicurean",
    title: "Royal Epicurean",
    icon: "🎖️",
    description: "A discerning taster who knows the exact moment steam whispers that the feast is ready.",
    badgeClass: "bg-yellow-50 text-yellow-900 border-yellow-300 hover:border-yellow-400",
    bgGradient: "from-yellow-500/20 via-amber-500/10 to-yellow-600/5",
  },
  {
    id: "crown-gourmand",
    title: "Crown Gourmand",
    icon: "🌟",
    description: "Decorated with highest culinary honours in the Royal Court of Biryani Aficionados.",
    badgeClass: "bg-emerald-50 text-[#006043] border-emerald-300 hover:border-emerald-400",
    bgGradient: "from-emerald-500/20 via-green-500/10 to-emerald-600/5",
  },
  {
    id: "panna-patron",
    title: "Panna Dynasty Patron",
    icon: "🏆",
    description: "Distinguished patron of the royal kitchen, bringing grand feasts to festive gatherings.",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-300 hover:border-sky-400",
    bgGradient: "from-sky-500/20 via-blue-500/10 to-sky-600/5",
  },
  {
    id: "maharaja-of-dum",
    title: "Maharaja of Dum",
    icon: "🔥",
    description: "Reigns supreme over velvety raita, slow-roasted spices, and aromatic handi biryani.",
    badgeClass: "bg-red-50 text-red-800 border-red-300 hover:border-red-400",
    bgGradient: "from-red-500/20 via-orange-500/10 to-red-600/5",
  },
];

/**
 * Returns a deterministic RoyalTag based on a user's phone or identifier.
 * Ensures the user sees the same curiosity tag every time they visit unless rerolled.
 */
export function getDeterministicRoyalTag(key: string): RoyalTag {
  if (!key) return ROYAL_TAGS[0];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % ROYAL_TAGS.length;
  return ROYAL_TAGS[index];
}

/**
 * Returns a random RoyalTag, optionally excluding the current title.
 */
export function getRandomRoyalTag(excludeTitle?: string): RoyalTag {
  const pool = excludeTitle
    ? ROYAL_TAGS.filter((t) => t.title.toLowerCase() !== excludeTitle.toLowerCase())
    : ROYAL_TAGS;
  if (pool.length === 0) return ROYAL_TAGS[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Look up a RoyalTag by title, with a safe fallback.
 */
export function getRoyalTagByTitle(title?: string): RoyalTag {
  if (!title) return ROYAL_TAGS[0];
  const found = ROYAL_TAGS.find(
    (t) => t.title.toLowerCase().trim() === title.toLowerCase().trim()
  );
  if (found) return found;
  return {
    id: "custom",
    title,
    icon: "✨",
    description: "Distinguished patron of royal dum biryani feasts",
    badgeClass: "bg-amber-50 text-[#925c28] border-amber-300 hover:border-amber-400",
    bgGradient: "from-amber-500/20 via-yellow-500/10 to-amber-600/5",
  };
}
