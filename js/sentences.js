/**
 * Type War - Sentence Generator
 * Normal fights: ONLY letters and spaces (no special characters/punctuation)
 * Boss fights: ALL MIXED (punctuation, symbols, numbers, quotes, exclamations)
 */
class SentenceManager {
  constructor() {
    this.history = [];
    this.historyLimit = 15;

    // Normal sentences: pure alphabetic words and single spaces ONLY!
    this.normalSentences = [
      "grow your mind",
      "strike first with honor",
      "speed wins the fight",
      "focus your energy",
      "the night is young",
      "defend the city streets",
      "punch through the fear",
      "keep moving forward",
      "master your reflex",
      "breathe and attack",
      "quick hands prevail",
      "rise to the challenge",
      "break the ultimate limit",
      "fight with real passion",
      "the silent warrior waits",
      "a small spark lights the street",
      "fast hands make the champion",
      "the alley echoes with footsteps",
      "keep your eyes sharp",
      "a true master never hesitates",
      "electric energy pulses through us",
      "trust your warrior instincts",
      "no obstacle can stop you",
      "victory belongs to the calm mind",
      "a single accurate strike wins",
      "shadows stretch across the neon",
      "master the swift street rhythm",
      "only the fastest brawler stands",
      "thunder rumbles above the skyline",
      "slip inside and land the blow",
      "every keystroke is a clean hit",
      "the underground tournament tests all",
      "stay composed when the battle turns",
      "fierce determination in your eyes",
      "a sudden clash in the dark alley",
      "precision beats raw heavy power",
      "relentless speed breaks any defense",
      "deep inside the secret street dojo",
      "two fearless fighters face each other",
      "the ancient code guides your fists",
      "unleash the flying dragon kick",
      "steel your courage on the pavement",
      "the rhythm of battle never stops",
      "champions walk through the midnight haze",
      "clean combinations break the guard",
      "swift footwork controls the ring",
      "the neon horizon calls the victor"
    ];

    // Boss sentences: ALL MIXED with numbers, punctuation, hyphens, and symbols!
    this.bossSentences = [
      "BOSS OVERRIDE: Cyber-Titan 9000 online — destroy core now!",
      "DANGER! 100% power surge detected: strike before 00:00!",
      "The Shadow Boss laughs: 'You can't defeat the 7th Clan!'",
      "FINAL PROTOCOL: Level-10 overdrive active... execute combo!",
      "WARNING: Heavy armor engaged! Punch x4, Kick x2, finish him!",
      "CRITICAL ERROR: System corrupted at 99.8% — break the firewall!",
      "Challenger's ultimate form: 'Face the fury of 1,000 strikes!'",
      "BOSS ALERT: 'You've reached the end of the line, kid!'",
      "TARGET LOCKED: Deploy 50-caliber fist strike — GO, GO, GO!",
      "MAXIMUM THREAT! Cyber-Titan HP @ 100% — initiate combo #1!"
    ];
  }

  getSentence(isBoss = false) {
    const pool = isBoss ? this.bossSentences : this.normalSentences;
    let available = pool.filter(s => !this.history.includes(s));
    if (available.length === 0) {
      this.history = [];
      available = pool;
    }

    const selected = available[Math.floor(Math.random() * available.length)];
    this.history.push(selected);
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }

    return selected;
  }
}

window.sentenceManager = new SentenceManager();
