/**
 * Typing Fighter - Sentence Generator & Motivational Quotes Engine
 * Supports 120+ curated motivational street sentences, concise boss quotes,
 * Fisher-Yates no-repeat deck shuffling, and background public API quotes fetching.
 * Sentences are strictly capped at 15-36 characters to prevent multi-line overflow.
 */
class SentenceManager {
  constructor() {
    // Normal sentences: 100+ curated motivational street-fighter phrases (letters & spaces only)
    this.normalDeck = [];
    this.bossDeck = [];
    this.dynamicQuotes = [];

    this.baseNormalSentences = [
      "stay focused and strike fast",
      "fear is only an illusion",
      "champions never give up",
      "victory belongs to the bold",
      "discipline beats motivation",
      "every hit makes you stronger",
      "speed and power win battles",
      "stand tall against all odds",
      "rise above the neon city",
      "your willpower is unbreakable",
      "precision beats raw force",
      "strike with pure conviction",
      "conquer your doubts today",
      "turn struggle into victory",
      "keep fighting till the end",
      "master your craft each day",
      "grit defines true champions",
      "stay humble stay hungry",
      "focus flows like lightning",
      "courage under heavy fire",
      "glory awaits the fearless",
      "breathe in power exhale fear",
      "the fire inside burns bright",
      "unleash your true strength",
      "never back down from battle",
      "one accurate strike ends it",
      "the pavement respects courage",
      "defeat is never an option",
      "strike like rolling thunder",
      "your mind is your weapon",
      "dominate the street arena",
      "push past your human limits",
      "energy pulses through hands",
      "be swift like the night wind",
      "stand firm like a mountain",
      "relentless drive wins gold",
      "turn pain into your fuel",
      "rise higher every single round",
      "heart and soul in every shot",
      "true power comes from focus",
      "strike without hesitation",
      "embrace the midnight grind",
      "greatness is earned here",
      "keep your guard held high",
      "speed and skill reign supreme",
      "your destiny is in your hands",
      "true warriors never quit",
      "iron will breaks any wall",
      "step forward and take victory",
      "calm mind fierce spirit",
      "glory belongs to fighters",
      "master the tempo of combat",
      "your spirit never dies",
      "lightning fast reactions",
      "crush the doubt inside you",
      "the arena belongs to you",
      "sharp eyes and steady aim",
      "fear no enemy on the street",
      "flow like water strike hard",
      "the tournament begins now",
      "legends are forged in battle",
      "speed wins every showdown",
      "keep your head in the fight",
      "shatter the ceiling today",
      "pure heart and steel fists",
      "aim true and fire fast",
      "silence the crowd with skill",
      "push beyond the pain barrier",
      "the neon streets know you",
      "stand your ground boldly",
      "victory is within reach",
      "your journey starts now",
      "unshakeable inner resolve",
      "move like a shadow strike hard",
      "patience creates champions",
      "turn darkness into bright dawn",
      "the thrill of victory calls",
      "breathe and stay relaxed",
      "precision timing wins battles",
      "rise from every knockdown",
      "eyes on the championship",
      "embrace the fierce battle",
      "bold moves bring big rewards",
      "never surrender your dream",
      "your potential has no limit",
      "fight with real street honor",
      "keep moving and keep punching",
      "calm water deep current",
      "let your actions speak loud",
      "stay sharp and stay ready",
      "the road to glory is paved",
      "strike before they can react",
      "unleash the warrior within",
      "conquer every tough street",
      "speed and accuracy combined",
      "you were born to win this",
      "step up and take the belt",
      "the world watches champions",
      "determination conquers all",
      "victory comes to the brave"
    ];

    // Boss sentences: arcade pseudo-words (no special characters, non-meaningful words, 20-25 chars)
    this.baseBossSentences = [
      "karnov vex zedok plyx",
      "vondor xantix krel zylar",
      "plork vaxen thur qelt",
      "zorp kelv trux fandar",
      "nexor quond bliv zadrak",
      "vylor flonx dret javal",
      "klavun zorpix thundar vex",
      "drakon velox quent zir",
      "polvex garnik tyvun lox",
      "skalor venrix quondar",
      "blortix farn velk tronx",
      "zydor vankel phorx cliv",
      "trundor glex vark zenth",
      "xandor plyn quovix barx",
      "volk trund zaphir kloq",
      "dranix kolv sturn vax",
      "gornik veltor flaz pyx",
      "kravun zildor pyronx",
      "frenzor quild trux vark",
      "zephtor klyn vandoz gluv",
      "tronvek phald jorx vind",
      "plankor vexta grond zup",
      "skarn pyrox veld quantor",
      "durx fandoz gleb tyrin",
      "kortan vlux zendik phor",
      "vandor grex typhon kloq",
      "krelix vorn quaz plund",
      "xylar drent faldor zerv",
      "bravok quinzer tyx mold",
      "pelvox zanthir clun vax",
      "gralix vandoz quel trun",
      "yulox trandar fenk ziv",
      "dranok velxar pyv torx",
      "sturnik vaxor glent zud",
      "phondor kravix jelt vurn",
      "blanx zephtor kurd vix",
      "trundik vornax pliv zol",
      "xelvun gardok quor fyn",
      "vildar pryx kental zof",
      "zondar flurn glex krav"
    ];

    this.reshuffleNormal();
    this.reshuffleBoss();

    // Fetch dynamic motivational quotes in the background
    this.fetchOnlineQuotes();
  }

  shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  reshuffleNormal() {
    const all = [...this.baseNormalSentences, ...this.dynamicQuotes];
    this.normalDeck = this.shuffle(all);
  }

  reshuffleBoss() {
    this.bossDeck = this.shuffle(this.baseBossSentences);
  }

  getSentence(isBoss = false) {
    if (isBoss) {
      if (this.bossDeck.length === 0) {
        this.reshuffleBoss();
      }
      return this.bossDeck.pop();
    } else {
      if (this.normalDeck.length === 0) {
        this.reshuffleNormal();
      }
      return this.normalDeck.pop();
    }
  }

  // Background fetch from public free quote APIs (seamlessly falls back to local bank)
  async fetchOnlineQuotes() {
    try {
      // Free public API: DummyJSON quotes
      const res = await fetch('https://dummyjson.com/quotes?limit=45');
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.quotes)) {
        data.quotes.forEach(q => {
          if (q && q.quote) {
            // Clean quote: letters and spaces only, lower case, length 15-36 chars
            const clean = q.quote
              .toLowerCase()
              .replace(/[^a-z\s]/g, '')
              .replace(/\s+/g, ' ')
              .trim();

            if (clean.length >= 15 && clean.length <= 36) {
              if (!this.baseNormalSentences.includes(clean) && !this.dynamicQuotes.includes(clean)) {
                this.dynamicQuotes.push(clean);
              }
            }
          }
        });
        if (this.dynamicQuotes.length > 0) {
          this.reshuffleNormal();
        }
      }
    } catch (e) {
      // Offline / blocked: flawlessly use the 100+ local curated sentences
    }
  }
}

window.sentenceManager = new SentenceManager();
