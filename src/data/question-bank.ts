/**
 * Ready-made question bank (Hinglish: Roman Hindi + simple English, made for Indian friends).
 *
 * Rules every question follows:
 *  - Hinglish, easy words, short sentences. Things friends talk about daily: food, places, songs.
 *  - Never sensitive: no address, school, birthday, phone number, health, religion, politics,
 *    money details, or anything like a password-reset question ("first pet", "mother's name").
 *  - 4 short options (max 40 characters). The creator taps the one that is true for them.
 *  - Gender-neutral wording like "karta/karti" so it fits every creator.
 */

export const PACK_IDS = [
  "dost",
  "real",
  "favourites",
  "best-friends",
  "food",
  "entertainment",
  "travel",
  "personality",
  "gaming",
  "random",
] as const;
export type PackId = (typeof PACK_IDS)[number];

export type BankQuestion = {
  id: string;
  pack: PackId;
  text: string;
  options: [string, string, string, string];
};

export type Pack = {
  id: PackId;
  name: string;
  emoji: string;
  tagline: string;
  /** Short intro for the /packs/[pack] page (original content). */
  intro: string[];
  color: string;
};

export const PACKS: Pack[] = [
  {
    id: "dost",
    name: "Dost Test 15",
    emoji: "🎯",
    tagline: "Favourite, aadatein, dar aur sapne. Dost ko kitna jaante ho?",
    color: "#7047EB",
    intro: [
      "Ye 15 sawaal ek hi cheez test karte hain: tumhara dost tumhe sach mein kitna jaanta hai. Favourite food aur colour se leke tumhari buri aadat, tumhara gussa, tumhara sapna aur tumhari weakness tak, sab kuch isme hai.",
      "Har sawaal ke 4 options hain aur tum apna jawab tap karte ho. Phir dost guess karta hai. Jiske jitne zyada sahi, wo utna bada bestie!",
    ],
  },  {
    id: "real",
    name: "Asli Dost Test",
    emoji: "🔥",
    tagline: "Meri aadatein, bahane aur ajeeb harkatein. Sirf asli dost bata payega.",
    color: "#EF4444",
    intro: [
      "Favourite colour to koi bhi guess kar leta hai. Asli test wo hai jo sirf paas rehne wala dost jaanta hai: tum kaunsa bahana sabse zyada maarte ho, bill aane pe kya karte ho, aur photo kheenchte waqt kaisi pose dete ho.",
      "Ye sawaal mazedaar aur thode tricky hain, isliye score bhi sach batayega ki kaun tumhe sach mein jaanta hai. Kuch bhi private nahi hai, bas apni aadatein aur style.",
    ],
  },
  {
    id: "favourites",
    name: "Meri Favourites",
    emoji: "⭐",
    tagline: "Favourite khana, hero, cricketer, gaana aur jagah.",
    color: "#F43F5E",
    intro: [
      "Sabse mazedaar test yahi hai: tumhari favourite cheezein dost ko pata hain ya nahi? Favourite colour, khana, hero, cricketer, IPL team, singer, series aur ghoomne ki jagah, sab isme hain.",
      "Ye sawaal sabko samajh aate hain, par sahi jawab wahi dega jo tumhe sach mein jaanta hai. Group chat mein bhejne ke liye ekdum best pack.",
    ],
  },
  {
    id: "best-friends",
    name: "Best Friends",
    emoji: "💜",
    tagline: "Rozmarra ki aadatein, sirf asli dost jaante hain.",
    color: "#7047EB",
    intro: [
      "Asli best friend wo hota hai jo tumhari chhoti-chhoti baatein jaanta hai: tum message ka reply kaise karte ho, free Sunday ko kya karte ho, aur kis baat pe gussa aata hai. Is pack ke sawaal bilkul aise hi hain.",
      "Pehli baar quiz bana rahe ho to yahi pack lo. Maza aayega, kuch bhi private nahi hai, aur group chat mein share karna safe hai.",
    ],
  },
  {
    id: "food",
    name: "Food Lovers",
    emoji: "🍕",
    tagline: "Chai, Maggi, biryani aur bahut kuch.",
    color: "#F97316",
    intro: [
      "Ye to koi bhi bata dega ki tumhe pizza pasand hai. Par kya tumhare dost jaante hain ki tum kitna teekha khate ho, ya raat ke 2 baje kya order karte ho? Khane ke sawaal dost ko test karne ka sabse aasaan tareeka hain.",
      "Ye pack halka-phulka aur mazedaar hai. Quick 5 version try karo aur sabko bhej do.",
    ],
  },
  {
    id: "entertainment",
    name: "Movies & Music",
    emoji: "🎬",
    tagline: "Gaane, shows, cricket aur filmein.",
    color: "#EC4899",
    intro: [
      "Tum kya dekhte aur sunte ho, usse tumhare baare mein bahut kuch pata chalta hai. Is pack mein favourite gaane, web series dekhne ka tareeka, aur movie mein rone wali baatein hain.",
      "Un dosto ke liye best hai jo hamesha tumhare saath movie dekhte hain ya tumse gaane share karte hain.",
    ],
  },
  {
    id: "travel",
    name: "Travel & Places",
    emoji: "✈️",
    tagline: "Ghoomne ke plan aur favourite jagah.",
    color: "#3984F7",
    intro: [
      "Trip ka plan pehle se banate ho ya last minute bag pack karte ho? Goa ya Manali? Window seat ya aisle seat? Travel ke sawaal bata dete hain ki insaan kaisa sochta hai.",
      "Ye pack un dosto ko bhejo jinke saath trip pe jaana hai. Jiska score sabse zyada, uska ticket pakka!",
    ],
  },
  {
    id: "personality",
    name: "About Me",
    emoji: "🧠",
    tagline: "Main kaisa sochta/sochti hoon aur kaisa behave karta/karti hoon.",
    color: "#14B8A6",
    intro: [
      "Ye sawaal favourite colour se thode gehre hain. Inme pooche gaye hain: tension mein tum kya karte ho, decision kaise lete ho, aur plan cancel ho jaye to kaisa lagta hai.",
      "Phir bhi sab kuch maze ka hai aur kuch private nahi hai. Yahan high score matlab dost tumhe sach mein samajhta hai.",
    ],
  },
  {
    id: "gaming",
    name: "Games",
    emoji: "🎮",
    tagline: "Mobile games, Ludo, cricket aur bahut kuch.",
    color: "#22C55E",
    intro: [
      "Un sabke liye jo kabhi Ludo pe dost se ladd chuke hain, ya raat ko 'bas ek aur match' ke liye jaage hain. Sawaal isme hain ki tum kaise khelte ho aur haarne pe kya karte ho.",
      "Pro gamer hona zaroori nahi. Mobile games, board games aur bahar ke games, sab shamil hain.",
    ],
  },
  {
    id: "random",
    name: "Fun & Random",
    emoji: "🎲",
    tagline: "Superpower, zombie aur ajeeb choices.",
    color: "#EAB308",
    intro: [
      "Kabhi-kabhi sabse mazedaar sawaal wo hote hain jinka koi matlab nahi hota. Ek giant batakh se ladoge ya 100 chhoti batakhon se? Tumhare dosto ko tumhara jawab pata hona chahiye.",
      "Is pack ko kisi bhi doosre pack ke saath mix kar do, quiz aur mazedaar ho jayega.",
    ],
  },
];

export const QUESTION_BANK: BankQuestion[] = [
  // ---------------- Dost Test 15 (creator's own list) ----------------
  { id: "dost-01", pack: "dost", text: "Mera favourite food kya hai? 🍕", options: ["Biryani", "Pizza", "Chole bhature", "Momos"] },
  { id: "dost-02", pack: "dost", text: "Mera favourite colour kaunsa hai? 🎨", options: ["Kala", "Neela", "Laal", "Hara"] },
  { id: "dost-03", pack: "dost", text: "Meri sabse buri habit kya hai? 😂", options: ["Der se uthna", "Har waqt phone", "Cheezein bhool jaana", "Nakhun chabana"] },
  { id: "dost-04", pack: "dost", text: "Main sabse zyada time kis cheez par spend karta/karti hoon? 📱", options: ["Phone aur Reels", "Games", "Dosto ke saath", "Sone mein"] },
  { id: "dost-05", pack: "dost", text: "Mera sabse bada dream kya hai? 🚀", options: ["Videsh mein settle hona", "Apna business", "Famous banna", "Badi job"] },
  { id: "dost-06", pack: "dost", text: "Main gussa hone par kya karta/karti hoon? 😡", options: ["Chillata/Chillati hoon", "Bilkul chup ho jata/jati", "Rone lagta/lagti hoon", "Akele chala/chali jata/jati"] },
  { id: "dost-07", pack: "dost", text: "Meri sabse badi weakness kya hai? 🥲", options: ["Jaldi emotional hona", "Overthinking", "Aalas", "Khana"] },
  { id: "dost-08", pack: "dost", text: "Agar mujhe ₹1 crore mil jaaye, to main sabse pehle kya karunga/karungi? 💸", options: ["Ghar kharidunga/kharidungi", "Duniya ghoomunga/ghoomungi", "Business shuru karunga/karungi", "Sab dosto ko treat dunga/dungi"] },
  { id: "dost-09", pack: "dost", text: "Main introvert hoon ya extrovert? 👀", options: ["Introvert", "Extrovert", "Thoda dono", "Logon pe depend"] },
  { id: "dost-10", pack: "dost", text: "Mujhe sabse zyada kis baat se hurt hota hai? 💔", options: ["Koi jhooth bole", "Koi ignore kare", "Koi mazaak udaye", "Koi bharosa tode"] },
  { id: "dost-11", pack: "dost", text: "Meri life mein sabse important cheez kya hai? ❤️", options: ["Family", "Dost", "Career", "Meri apni khushi"] },
  { id: "dost-12", pack: "dost", text: "Main apna free time sabse zyada kaise spend karta/karti hoon? 🎮", options: ["Games khelna", "Movies ya series", "Sona", "Dosto ke saath ghoomna"] },
  { id: "dost-13", pack: "dost", text: "Meri sabse embarrassing moment kaunsi thi? 💀", options: ["Sabke saamne gir gaya/gayi", "Galat person ko message bheja", "Kisi ka naam bhool gaya/gayi", "Stage pe bhool gaya/gayi"] },
  { id: "dost-14", pack: "dost", text: "Kisi ek country mein settle hone ka chance mile, to main kaunsi choose karunga/karungi? 🌍", options: ["Canada", "USA", "Dubai", "Japan"] },
  { id: "dost-15", pack: "dost", text: "Mere baare mein aisi kaunsi baat hai jo shayad baaki friends nahi jaante? 🤫", options: ["Mera chhupa hua talent", "Mera ajeeb shauk", "Mera bada dar", "Meri purani aadat"] },
  // ---------------- Asli Dost Test (personal habits only a real friend knows) ----------------
  { id: "real-01", pack: "real", text: "Late hone pe mera sabse bada bahana kya hota hai?", options: ["Bas 5 minute mein aa raha/rahi hoon", "Network nahi tha", "Raaste mein traffic hai", "Phone silent pe tha"] },
  { id: "real-02", pack: "real", text: "Restaurant mein bill aaye to main kya karta/karti hoon?", options: ["Phone mein busy ho jata/jati", "Calculator nikalta/nikalti", "Pehle hi paise de deta/deti", "Washroom chala/chali jata/jati"] },
  { id: "real-03", pack: "real", text: "Photo kheenchte waqt meri pose kya hoti hai?", options: ["Peace sign ✌️", "Serious look", "Funny face", "Photo se bhaagta/bhaagti"] },
  { id: "real-04", pack: "real", text: "Subah uthte hi main sabse pehle kya karta/karti hoon?", options: ["Phone dekhta/dekhti", "Chai ya paani", "Alarm band karke wapas sona", "Time dekhke ghabrata/ghabrati"] },
  { id: "real-05", pack: "real", text: "Meri sabse buri aadat kaun si hai?", options: ["Nakhun chabana", "Der tak jaagna", "Har waqt phone", "Cheezein bhool jaana"] },
  { id: "real-06", pack: "real", text: "Main sabse zyada kaun sa word bolta/bolti hoon?", options: ["\"Yaar\"", "\"Matlab\"", "\"Bhai\"", "\"Scene kya hai\""] },
  { id: "real-07", pack: "real", text: "Koi mera khana maange to main...", options: ["Pura share karta/karti", "Thoda sa deta/deti", "Mana kar deta/deti", "Chhupa leta/leti"] },
  { id: "real-08", pack: "real", text: "Mera phone wallpaper kaisa hai?", options: ["Apni ya dost ki photo", "Nature ya jagah", "Anime ya cartoon", "Default hi hai"] },
  { id: "real-09", pack: "real", text: "Main bina wajah kab hasta/hasti hoon?", options: ["Serious baat pe", "Akele memes dekhke", "Dost ko dekhke", "Jab darr lagta hai"] },
  { id: "real-10", pack: "real", text: "Meri chhupi hui talent kaun si hai?", options: ["Mimicry", "Dance", "Drawing", "Gaana"] },
  { id: "real-11", pack: "real", text: "Raat ke 3 baje bhi main kis cheez ke liye uth jaunga/jaungi?", options: ["Cricket match", "Biryani", "Dost ki help", "Kisi cheez ke liye nahi"] },
  { id: "real-12", pack: "real", text: "Mera data ya recharge sabse zyada kis pe jaata hai?", options: ["Reels aur videos", "Games", "Movies ya series", "Gaane"] },
  { id: "real-13", pack: "real", text: "10 saal baad main kahan dikhunga/dikhungi?", options: ["Videsh mein", "Apna business", "Badi job mein", "Pata nahi, dekhte hain"] },
  { id: "real-14", pack: "real", text: "Meri alarm kitni baar bajti hai?", options: ["Sirf ek baar", "2-3 baar", "5 se zyada", "Alarm lagata/lagati hi nahi"] },
  { id: "real-15", pack: "real", text: "Main sabse zyada paise kis pe kharch karta/karti hoon?", options: ["Khana", "Kapde", "Outings", "Gadgets"] },
  { id: "real-16", pack: "real", text: "Group mein koi galat baat bole to main...", options: ["Seedha bol deta/deti", "Chup rehta/rehti", "Mazaak mein uda deta/deti", "Alag se baad mein bolta/bolti"] },
  { id: "real-17", pack: "real", text: "Mujhe sabse zyada kis cheez se chidh hoti hai?", options: ["Bina bataye plan cancel", "Der se reply", "Jhoot bolna", "Chewing ki awaaz"] },
  { id: "real-18", pack: "real", text: "Main kis tarah ka dost hoon?", options: ["Hamesha help wala/wali", "Mazaak wala/wali", "Salah dene wala/wali", "Bas sunne wala/wali"] },
  { id: "real-19", pack: "real", text: "Exam ya deadline se pehle main kya karta/karti hoon?", options: ["Last night padhai", "Pehle se ready", "Sab bhool jaata/jaati", "Dost se notes maangta/maangti"] },
  { id: "real-20", pack: "real", text: "Mera sabse bada dar kaun sa hai?", options: ["Fail hona", "Akele rehna", "Log kya kahenge", "Kuch nahi, bindaas"] },
  { id: "real-21", pack: "real", text: "Gussa aane pe main kya karta/karti hoon?", options: ["Chillata/Chillati", "Bilkul chup", "Rone lagta/lagti", "Gaane sunta/sunti"] },
  { id: "real-22", pack: "real", text: "Aaj raat khaane mein kuch na ho to main kya banaunga/banaungi?", options: ["Maggi", "Omelette", "Bread ya butter", "Order kar dunga/dungi"] },
  { id: "real-23", pack: "real", text: "Dost ka message aaye aur main busy hoon, to main...", options: ["Turant reply", "Baad mein bhool jata/jati", "Voice note bhej deta/deti", "Call kar leta/leti"] },
  { id: "real-24", pack: "real", text: "Meri sabse ajeeb aadat kya hai?", options: ["Khud se baat karna", "Khaate waqt gaane sunna", "Raat ko akele dance", "Bina wajah kamra badalna"] },

  // ---------------- Meri Favourites ----------------
  { id: "fav-03", pack: "favourites", text: "Meri favourite drink kaun si hai?", options: ["Adrak wali chai", "Cold coffee", "Mango shake", "Nimbu pani"] },
  { id: "fav-04", pack: "favourites", text: "Mera favourite Bollywood hero kaun hai?", options: ["Shah Rukh Khan", "Ranbir Kapoor", "Ranveer Singh", "Akshay Kumar"] },
  { id: "fav-05", pack: "favourites", text: "Meri favourite heroine kaun hai?", options: ["Deepika Padukone", "Alia Bhatt", "Katrina Kaif", "Priyanka Chopra"] },
  { id: "fav-06", pack: "favourites", text: "Mera favourite cricketer kaun hai?", options: ["Virat Kohli", "MS Dhoni", "Rohit Sharma", "Sachin Tendulkar"] },
  { id: "fav-07", pack: "favourites", text: "Meri favourite IPL team kaun si hai?", options: ["CSK", "MI", "RCB", "KKR"] },
  { id: "fav-08", pack: "favourites", text: "Mera favourite singer kaun hai?", options: ["Arijit Singh", "Diljit Dosanjh", "Badshah", "Neha Kakkar"] },
  { id: "fav-09", pack: "favourites", text: "Ghoomne ke liye meri favourite jagah kaun si hai?", options: ["Goa", "Manali", "Jaipur", "Mumbai"] },
  { id: "fav-10", pack: "favourites", text: "School mein mera favourite subject kya tha?", options: ["Maths", "Science", "English", "Games period"] },
  { id: "fav-11", pack: "favourites", text: "Meri favourite ice cream flavour kaun si hai?", options: ["Chocolate", "Vanilla", "Mango", "Butterscotch"] },
  { id: "fav-12", pack: "favourites", text: "Meri favourite chaat kaun si hai?", options: ["Pani puri", "Bhel puri", "Dahi puri", "Aloo tikki"] },
  { id: "fav-13", pack: "favourites", text: "Phone pe mera favourite game kaun sa hai?", options: ["Free Fire", "BGMI", "Candy Crush", "Subway Surfers"] },
  { id: "fav-14", pack: "favourites", text: "Meri favourite web series kaun si hai?", options: ["Panchayat", "Money Heist", "Friends", "Stranger Things"] },
  { id: "fav-15", pack: "favourites", text: "Instagram pe mujhe sabse zyada kya pasand hai?", options: ["Reels dekhna", "Story daalna", "Chat karna", "Memes bhejna"] },
  { id: "fav-16", pack: "favourites", text: "Hafte ka mera favourite din kaun sa hai?", options: ["Friday", "Saturday", "Sunday", "Koi nahi"] },
  { id: "fav-17", pack: "favourites", text: "Mera favourite dessert kaun sa hai?", options: ["Rasmalai", "Kulfi", "Brownie", "Gajar ka halwa"] },
  { id: "fav-18", pack: "favourites", text: "Ghar mein meri favourite jagah kaun si hai?", options: ["Bed", "Balcony", "Kitchen", "Chhat"] },
  { id: "fav-19", pack: "favourites", text: "Shopping mein main sabse zyada kya kharidta/kharidti hoon?", options: ["Kapde", "Shoes", "Gadgets", "Kitabein"] },
  { id: "fav-20", pack: "favourites", text: "Mera favourite time pass kya hai?", options: ["Reels", "Games", "Sona", "Cricket"] },
  { id: "fav-21", pack: "favourites", text: "Pizza mein meri favourite topping kaun si hai?", options: ["Paneer", "Corn", "Extra cheese", "Capsicum"] },
  { id: "fav-22", pack: "favourites", text: "Mera favourite gaana kis type ka hai?", options: ["Romantic", "Party wala", "Sad wala", "Punjabi beats"] },

  // ---------------- Best Friends ----------------
  { id: "bf-01", pack: "best-friends", text: "Main messages ka reply kaise karta/karti hoon?", options: ["Turant", "Kai ghante baad", "Sirf voice note", "Seen karke ignore"] },
  { id: "bf-02", pack: "best-friends", text: "Free Sunday ko main kya karta/karti hoon?", options: ["Din bhar sona", "Web series dekhna", "Dosto ke saath bahar jaana", "Games khelna"] },
  { id: "bf-03", pack: "best-friends", text: "Hamare group mein main wo hoon jo...", options: ["Memes bhejta/bhejti hai", "Plan banata/banati hai", "Kabhi reply nahi karta/karti", "Saari gossip batata/batati hai"] },
  { id: "bf-04", pack: "best-friends", text: "Mujhe sabse jaldi gussa kis baat pe aata hai?", options: ["Late aana", "Zor se chabana", "Spoilers", "Slow internet"] },
  { id: "bf-05", pack: "best-friends", text: "Party mein main kahan milunga/milungi?", options: ["Dance floor pe", "Khane ke paas", "Kone mein baatein karte", "Ghar nikal gaya/gayi"] },
  { id: "bf-06", pack: "best-friends", text: "Main celebrate kaise karna pasand karta/karti hoon?", options: ["Badi party", "Bahar dinner", "Ghar pe aaram", "Surprise trip"] },
  { id: "bf-07", pack: "best-friends", text: "Main sabse zyada kaun sa emoji use karta/karti hoon?", options: ["😂", "💀", "❤️", "🙄"] },
  { id: "bf-08", pack: "best-friends", text: "Jab main udaas hoon, mujhe kya theek karta hai?", options: ["Khana", "Akele rehna", "Dost se baat", "Videos dekhna"] },
  { id: "bf-09", pack: "best-friends", text: "Main aksar kab late hota/hoti hoon?", options: ["Hamesha", "Subah", "Kabhi nahi", "Sirf plans ke liye"] },
  { id: "bf-10", pack: "best-friends", text: "Kaun sa gift dekar mujhe khush kar sakte ho?", options: ["Haath se bana kuch", "Khana", "Trip", "Gadget"] },
  { id: "bf-11", pack: "best-friends", text: "Neend na aaye to main kya karta/karti hoon?", options: ["Phone chalata/chalati", "Kuch khata/khati", "Zyada sochta/sochti", "Gaane sunta/sunti"] },
  { id: "bf-12", pack: "best-friends", text: "Main chat kaise karta/karti hoon?", options: ["Lambe messages", "Ek word ka reply", "Bahut saare emojis", "Memes aur GIFs"] },
  { id: "bf-13", pack: "best-friends", text: "Mere pe kaun si job suit karegi?", options: ["Comedian", "Singer", "Chef", "Actor"] },
  { id: "bf-14", pack: "best-friends", text: "Meri guilty pleasure kya hai?", options: ["Reality shows", "Junk food", "Online shopping", "Der tak sona"] },
  { id: "bf-15", pack: "best-friends", text: "Jab hamari ladai hoti hai, main...", options: ["Baat karke suljhata/suljhati", "Thoda time leta/leti", "Joke maar deta/deti", "Chup ho jata/jati"] },

  // ---------------- Food ----------------
  { id: "food-01", pack: "food", text: "Mera comfort food kya hai?", options: ["Pizza", "Maggi", "Biryani", "Ice cream"] },
  { id: "food-02", pack: "food", text: "Chai ya coffee?", options: ["Chai", "Coffee", "Dono", "Koi nahi"] },
  { id: "food-03", pack: "food", text: "Raat ko bhookh lage to main kya khata/khati hoon?", options: ["Burger", "Maggi", "Kuch meetha", "Main so raha/rahi hoon"] },
  { id: "food-04", pack: "food", text: "Main kitna teekha khata/khati hoon?", options: ["Bilkul nahi", "Thoda", "Medium", "Bahut teekha"] },
  { id: "food-05", pack: "food", text: "Meetha ya namkeen snacks?", options: ["Meetha", "Namkeen", "Dono", "Jo mil jaye"] },
  { id: "food-06", pack: "food", text: "Kaun sa khana main roz kha sakta/sakti hoon?", options: ["Chawal", "Roti", "Paratha", "Noodles"] },
  { id: "food-07", pack: "food", text: "Mera favourite street food?", options: ["Pani puri", "Samosa", "Momos", "Vada pav"] },
  { id: "food-08", pack: "food", text: "Kitchen mein main...", options: ["Accha cook hoon", "Sirf Maggi banata/banati", "Khatarnak hoon", "Sirf khata/khati hoon"] },
  { id: "food-09", pack: "food", text: "Meri favourite mithai?", options: ["Gulab jamun", "Ice cream", "Chocolate", "Jalebi"] },
  { id: "food-10", pack: "food", text: "Mujhe kaun sa khana sabse pasand hai?", options: ["North Indian", "South Indian", "Chinese", "Italian"] },
  { id: "food-11", pack: "food", text: "Main ande kaise khata/khati hoon?", options: ["Omelette", "Ubla", "Fry", "Ande nahi khata/khati"] },
  { id: "food-12", pack: "food", text: "Main kaun si drink leta/leti hoon?", options: ["Paani", "Cold drink", "Juice", "Lassi"] },
  { id: "food-13", pack: "food", text: "Buffet mein main...", options: ["Pehle meetha", "Sirf starters", "Thoda sab kuch", "Wahi plate 3 baar"] },
  { id: "food-14", pack: "food", text: "Kaun sa khana main kabhi nahi chhod sakta/sakti?", options: ["Fries", "Pizza", "Momos", "Biryani"] },

  // ---------------- Movies & Music ----------------
  { id: "en-01", pack: "entertainment", text: "Mujhe kis type ki movie pasand hai?", options: ["Comedy", "Horror", "Love story", "Action"] },
  { id: "en-02", pack: "entertainment", text: "Main web series kaise dekhta/dekhti hoon?", options: ["Ek raat mein sab", "Roz ek episode", "Shuru karke chhod deta/deti", "Purane wale dobara"] },
  { id: "en-03", pack: "entertainment", text: "Main sabse zyada kaun se gaane sunta/sunti hoon?", options: ["Bollywood", "Punjabi", "English pop", "Hip-hop"] },
  { id: "en-04", pack: "entertainment", text: "Kya main movie mein rota/roti hoon?", options: ["Har baar", "Sirf sad ending pe", "Kabhi nahi", "Sirf cartoon mein"] },
  { id: "en-05", pack: "entertainment", text: "Main sabse zyada kaun si app chalata/chalati hoon?", options: ["Instagram", "YouTube", "WhatsApp", "Games"] },
  { id: "en-06", pack: "entertainment", text: "Mujhe kya zyada pasand hai?", options: ["Kitabein", "Gaane", "Videos", "Sona"] },
  { id: "en-07", pack: "entertainment", text: "Karaoke mein main kya gaunga/gaungi?", options: ["Sad song", "Rap", "Purana Hindi gaana", "Main nahi gaunga/gaungi"] },
  { id: "en-08", pack: "entertainment", text: "Main kis duniya mein rehna chahunga/chahungi?", options: ["Hogwarts", "Marvel ki duniya", "Doraemon ki duniya", "Sitcom wala ghar"] },
  { id: "en-09", pack: "entertainment", text: "Spoilers ke baare mein meri kya soch hai?", options: ["Mujhe farak nahi", "Gussa aata hai", "Main pehle hi padh leta/leti", "Main doosron ko bata deta/deti"] },
  { id: "en-10", pack: "entertainment", text: "Theatre ya ghar?", options: ["Hamesha theatre", "Ghar pe snacks ke saath", "Movie pe depend", "Bed mein phone pe"] },
  { id: "en-11", pack: "entertainment", text: "Mood accha karne ke liye main kya dekhta/dekhti hoon?", options: ["Comedy show", "Crime show", "Anime", "Reality show"] },
  { id: "en-12", pack: "entertainment", text: "Long drive pe main kya karta/karti hoon?", options: ["Zor ke gaane", "Podcast", "Shanti", "Purane gaane"] },
  { id: "en-13", pack: "entertainment", text: "Meri movie mein mera role kaun karega?", options: ["Comedian", "Action hero", "Cartoon", "Villain"] },
  { id: "en-14", pack: "entertainment", text: "Mera music kitni awaaz mein chalta hai?", options: ["Full volume", "Bilkul dheere", "Hamesha earphones", "Mood pe depend"] },
  { id: "en-15", pack: "entertainment", text: "Kya main cricket dekhta/dekhti hoon?", options: ["Har match", "Sirf bade matches", "Sirf IPL", "Bilkul nahi"] },

  // ---------------- Travel & Places ----------------
  { id: "tr-01", pack: "travel", text: "Meri dream holiday kaun si hai?", options: ["Beach", "Pahaad", "Bada shehar", "Road trip"] },
  { id: "tr-02", pack: "travel", text: "Window seat ya aisle seat?", options: ["Window", "Aisle", "Beech wali, afsos", "Koi bhi"] },
  { id: "tr-03", pack: "travel", text: "Main bag kab pack karta/karti hoon?", options: ["Kai din pehle", "Ek raat pehle", "Last minute", "Koi aur pack kar deta hai"] },
  { id: "tr-04", pack: "travel", text: "Trip pe main wo hoon jo...", options: ["Sab plan karta/karti hai", "Photos khinchta/khinchti hai", "Khana dhundta/dhundti hai", "Kho jata/jati hai"] },
  { id: "tr-05", pack: "travel", text: "Main kahan rukna pasand karta/karti hoon?", options: ["Accha hotel", "Hostel", "Tent", "Dost ka ghar"] },
  { id: "tr-06", pack: "travel", text: "Pack karte waqt main hamesha kya bhool jata/jati hoon?", options: ["Charger", "Toothbrush", "Moze", "Kuch nahi"] },
  { id: "tr-07", pack: "travel", text: "Main sabse pehle kahan jaunga/jaungi?", options: ["Goa", "Manali", "Kerala", "Ladakh"] },
  { id: "tr-08", pack: "travel", text: "Mera travel style kya hai?", options: ["Pakka plan", "Jaisa chale", "Bas aaram", "Adventure"] },
  { id: "tr-09", pack: "travel", text: "Trip ka sabse accha hissa mere liye kya hai?", options: ["Khana", "Jagah dekhna", "Shopping", "Kuch na karna"] },
  { id: "tr-10", pack: "travel", text: "Lambe safar mein main kya karta/karti hoon?", options: ["Sota/Soti hoon", "Snacks khata/khati hoon", "Movies dekhta/dekhti hoon", "Sabse baatein karta/karti hoon"] },
  { id: "tr-11", pack: "travel", text: "Trip se main kya laata/laati hoon?", options: ["Ghar walon ke gifts", "Snacks", "Kapde", "Sirf photos"] },
  { id: "tr-12", pack: "travel", text: "Kya main akele trip pe jaunga/jaungi?", options: ["Ja chuka/chuki hoon", "Haan, kabhi", "Sirf dosto ke saath", "Kabhi nahi"] },
  { id: "tr-13", pack: "travel", text: "Main station ya airport kab pahunchta/pahunchti hoon?", options: ["Bahut pehle", "Bilkul time pe", "Daudte hue", "Train chhoot jati hai"] },
  { id: "tr-14", pack: "travel", text: "Trip pe mujhe kaisa mausam pasand hai?", options: ["Garm aur dhoop", "Thanda aur baraf", "Baarish", "Koi bhi"] },
  { id: "tr-15", pack: "travel", text: "Main kahan ghoomna pasand karta/karti hoon?", options: ["Cafe", "Park", "Mall", "Chhat"] },

  // ---------------- About Me ----------------
  { id: "pe-01", pack: "personality", text: "Main subah wala hoon ya raat wala?", options: ["Subah jaldi", "Raat ko der tak", "Din pe depend", "Hamesha neend mein"] },
  { id: "pe-02", pack: "personality", text: "Main fresh kaise feel karta/karti hoon?", options: ["Akele time bita ke", "Dosto se mil ke", "Bahar ghoom ke", "Sokar"] },
  { id: "pe-03", pack: "personality", text: "Plan cancel ho jaye to mujhe lagta hai...", options: ["Khushi", "Dukh", "Naya plan banao", "Farak nahi padta"] },
  { id: "pe-04", pack: "personality", text: "Main decision kaise leta/leti hoon?", options: ["Ek dum turant", "Kai din sochta/sochti", "Sabse poochta/poochti", "Sikka uchhalta/uchhalti"] },
  { id: "pe-05", pack: "personality", text: "Tension mein main kya karta/karti hoon?", options: ["Kamra saaf karta/karti", "Snacks khata/khati", "Chup ho jata/jati", "Joke maarta/maarti"] },
  { id: "pe-06", pack: "personality", text: "Mera kamra kaisa hai?", options: ["Ekdum saaf", "Thoda bikhra par theek", "Poora kabada", "Simple, kam saaman"] },
  { id: "pe-07", pack: "personality", text: "Main sharmila hoon ya milansaar?", options: ["Sharmila/Sharmili", "Milansaar", "Thoda dono", "Logon pe depend"] },
  { id: "pe-08", pack: "personality", text: "Dost mein mujhe sabse zyada kya pasand hai?", options: ["Wafadari", "Mazaak", "Imaandari", "Hamesha saath"] },
  { id: "pe-09", pack: "personality", text: "Jab koi meri taareef kare, main...", options: ["Thanks bolta/bolti", "\"Arre nahi nahi\" bolta/bolti", "Sharma jata/jati", "Unki bhi taareef karta/karti"] },
  { id: "pe-10", pack: "personality", text: "Kaun sa shabd mujhe sabse achhe se batata hai?", options: ["Chill", "Pagal", "Dayalu", "Mehnati"] },
  { id: "pe-11", pack: "personality", text: "Main plan kaise banata/banati hoon?", options: ["Sab ki list", "Kuch bhi chalega", "Plan banao, phir bhool jao", "Doosre banayein"] },
  { id: "pe-12", pack: "personality", text: "Mere phone ki battery aksar kitni hoti hai?", options: ["Hamesha full", "Lagbhag aadhi", "Marne wali", "Power bank hamesha"] },
  { id: "pe-13", pack: "personality", text: "Group project mein main...", options: ["Leader hoon", "Mehnat karne wala/wali hoon", "Idea dene wala/wali hoon", "Gayab ho jata/jati hoon"] },
  { id: "pe-14", pack: "personality", text: "Mujhe sabse zyada darr kis cheez se lagta hai?", options: ["Cockroach", "Unchai", "Andhera", "Stage pe bolna"] },

  // ---------------- Games ----------------
  { id: "ga-01", pack: "gaming", text: "Main kaisa gamer hoon?", options: ["Pro gamer", "Casual", "Sirf mobile pe", "Gamer nahi hoon"] },
  { id: "ga-02", pack: "gaming", text: "Haarne pe main kya karta/karti hoon?", options: ["Gussa hoke quit", "Ek aur game", "Hans ke taal deta/deti", "Network ko blame"] },
  { id: "ga-03", pack: "gaming", text: "Mujhe kaun sa game type pasand hai?", options: ["Shooting", "Puzzle", "Sports", "Story games"] },
  { id: "ga-04", pack: "gaming", text: "Main kaun sa board game chunta/chunti hoon?", options: ["Ludo", "Carrom", "Shatranj", "Uno"] },
  { id: "ga-05", pack: "gaming", text: "Team games mein main...", options: ["Star player", "Madad karne wala/wali", "Gadbad karne wala/wali", "Online hi nahi hota/hoti"] },
  { id: "ga-06", pack: "gaming", text: "Kya main game ke rules padhta/padhti hoon?", options: ["Hamesha", "Kabhi nahi", "Haarne ke baad", "Kaun se rules?"] },
  { id: "ga-07", pack: "gaming", text: "Main games kahan khelta/khelti hoon?", options: ["Console", "Computer", "Phone", "Board games"] },
  { id: "ga-08", pack: "gaming", text: "Main kitna competitive hoon?", options: ["Bahut zyada", "Thoda sa", "Bilkul nahi", "Sirf tumse"] },
  { id: "ga-09", pack: "gaming", text: "Main kaun sa game character hoon?", options: ["Hero", "Sidekick", "Villain", "Dukaandaar"] },
  { id: "ga-10", pack: "gaming", text: "Kya main raat ko der tak games khelta/khelti hoon?", options: ["Roz raat", "Sirf weekend", "Kabhi-kabhi", "Neend aa jati hai"] },
  { id: "ga-11", pack: "gaming", text: "Mujhe kaun sa bahar ka game pasand hai?", options: ["Cricket", "Football", "Badminton", "Kabaddi"] },
  { id: "ga-12", pack: "gaming", text: "Zombie game mein main...", options: ["Jo bach jata/jati", "Sabse pehle jata/jati", "Secret zombie", "Madad karne wala/wali"] },

  // ---------------- Fun & Random ----------------
  { id: "ra-01", pack: "random", text: "Main kaun si superpower chunuga/chunungi?", options: ["Udna", "Invisible hona", "Teleport karna", "Mind padhna"] },
  { id: "ra-02", pack: "random", text: "Cat ya dog?", options: ["Cat", "Dog", "Dono", "Koi nahi"] },
  { id: "ra-03", pack: "random", text: "Kya main zombie duniya mein bach jaunga/jaungi?", options: ["Aasaani se", "Ek hafte tak", "Pehle din hi khatam", "Main unka leader banunga/banungi"] },
  { id: "ra-04", pack: "random", text: "Mera favourite mausam kaun sa hai?", options: ["Garmi", "Sardi", "Baarish", "Basant"] },
  { id: "ra-05", pack: "random", text: "Main sabse zyada kaun sa rang pehente hoon?", options: ["Kala", "Safed", "Neela", "Chamakdar rang"] },
  { id: "ra-06", pack: "random", text: "Bahut saare paise mile to sabse pehle main...", options: ["Trip pe jaunga/jaungi", "Ghar kharidunga/kharidungi", "Dosto ko treat dunga/dungi", "Bachaunga/Bachaungi"] },
  { id: "ra-07", pack: "random", text: "Main kis janwar jaisa hoon?", options: ["Cat", "Dog", "Sloth (sust)", "Ullu"] },
  { id: "ra-08", pack: "random", text: "Beach wala din ya baraf wala din?", options: ["Beach", "Baraf", "Ghar pe baarish", "Koi bhi chhutti"] },
  { id: "ra-09", pack: "random", text: "Main kis time mein jaana chahunga/chahungi?", options: ["Bahut purane zamane", "90s mein", "Future mein", "Dinosaur ke time"] },
  { id: "ra-10", pack: "random", text: "Meri reality show kis baare mein hogi?", options: ["Cooking", "Meri daily drama", "Mere pets", "Travel"] },
  { id: "ra-11", pack: "random", text: "Ek giant batakh se ladoge ya 100 chhoti batakhon se?", options: ["Ek giant batakh", "100 chhoti batakhein", "Bhaag jaunga/jaungi", "Dosti kar lunga/lungi"] },
  { id: "ra-12", pack: "random", text: "Main sabse zyada kya kho deta/deti hoon?", options: ["Chaabi", "Phone", "Earphones", "Apna dimaag"] },
  { id: "ra-13", pack: "random", text: "Din ka mera favourite time kaun sa hai?", options: ["Subah-subah", "Dopahar", "Shaam", "Der raat"] },
  { id: "ra-14", pack: "random", text: "Main kaun sa pet rakhunga/rakhungi?", options: ["Dragon", "Unicorn", "Bolta hua tota", "Baby haathi"] },
];

export const BANK_BY_ID = new Map(QUESTION_BANK.map((q) => [q.id, q]));

export function questionsForPack(pack: PackId) {
  return QUESTION_BANK.filter((q) => q.pack === pack);
}

export function getPack(id: string) {
  return PACKS.find((p) => p.id === id);
}

export type Template = {
  id: string;
  name: string;
  emoji: string;
  size: 5 | 10 | 15;
  /** Packs to draw from in round-robin order. */
  packs: PackId[];
  blurb: string;
};

export const TEMPLATES: Template[] = [
  { id: "dost-15", name: "Dost Test 15", emoji: "🎯", size: 15, packs: ["dost"], blurb: "Poore 15 sawaal. Dekho kaun sabse bada bestie hai." },
  { id: "dost-10", name: "Dost Test 10", emoji: "🎯", size: 10, packs: ["dost"], blurb: "10 sawaal. Group chat ke liye best." },
  { id: "dost-5", name: "Dost Test 5", emoji: "⚡", size: 5, packs: ["dost"], blurb: "Sirf 5 sawaal. Status ke liye." },
  { id: "real-10", name: "Asli Dost Test 10", emoji: "🔥", size: 10, packs: ["real"], blurb: "Tumhari aadatein aur bahane. Dekho kaun pakad paata hai." },
  { id: "real-5", name: "Asli Dost 5", emoji: "😈", size: 5, packs: ["real"], blurb: "Sirf 5 tricky sawaal. Status ke liye." },
  { id: "favourites-10", name: "Meri Favourites 10", emoji: "⭐", size: 10, packs: ["favourites"], blurb: "Favourite khana, hero, cricketer, gaana aur jagah." },
  { id: "favourites-5", name: "Favourites 5", emoji: "🌟", size: 5, packs: ["favourites"], blurb: "Sirf 5 sawaal. Status ke liye perfect." },
  { id: "best-friends-10", name: "Best Friends 10", emoji: "💜", size: 10, packs: ["dost", "real", "best-friends", "food", "personality", "random"], blurb: "Group chat ke liye sabse best." },
  { id: "quick-5", name: "Jaldi 5", emoji: "⚡", size: 5, packs: ["dost", "real", "best-friends", "food", "random"], blurb: "30 second mein ready. Status ke liye perfect." },
  { id: "food-lovers-5", name: "Khane wale 5", emoji: "🍕", size: 5, packs: ["food"], blurb: "Chai, Maggi, biryani aur bahut kuch." },
  { id: "movie-night-10", name: "Movies & Gaane 10", emoji: "🎬", size: 10, packs: ["entertainment", "random"], blurb: "Gaane, shows, cricket aur filmein." },
  { id: "travel-buddy-10", name: "Ghumakkad 10", emoji: "✈️", size: 10, packs: ["travel", "personality"], blurb: "Apna best trip partner dhundo." },
  { id: "gamer-10", name: "Games 10", emoji: "🎮", size: 10, packs: ["gaming", "random"], blurb: "Ludo, mobile games aur bahut kuch." },
  { id: "ultimate-15", name: "Ultimate 15", emoji: "🏆", size: 15, packs: ["dost", "real", "favourites", "best-friends", "personality", "food", "entertainment", "travel", "random", "gaming"], blurb: "15/15 sirf asli bestie laayenge." },
];

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}

/**
 * Picks `size` questions round-robin across packs. With a shuffle function the order inside each
 * pack is mixed, which is how "Make your own version" gives a fresh set every time.
 */
export function pickQuestions(packs: PackId[], size: number, shuffle?: (list: BankQuestion[]) => BankQuestion[]) {
  const pools = packs.map((p) => (shuffle ? shuffle(questionsForPack(p)) : questionsForPack(p)));
  const out: BankQuestion[] = [];
  let i = 0;
  while (out.length < size && pools.some((pool) => pool.length)) {
    const pool = pools[i % pools.length];
    const next = pool.shift();
    if (next) out.push(next);
    i++;
  }
  return out;
}

/** Question of the day: same for every visitor on the same UTC date. */
export function dailyQuestion(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
  return QUESTION_BANK[(day * 7919) % QUESTION_BANK.length];
}
