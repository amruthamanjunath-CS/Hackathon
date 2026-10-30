// Spoken prompts using the browser's built-in speech synthesis (no network needed).
window.ML = window.ML || {};

ML.say = function (text) {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech utterances immediately
  speechSynthesis.cancel();
  
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.85; // Slightly slower rate for clarity and comfort
  u.pitch = 1;

  // Try to pick a natural English voice if loaded
  const voices = speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
  if (englishVoice) {
    u.voice = englishVoice;
  }

  speechSynthesis.speak(u);
};

ML.stopSay = () => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
};

// Ensure voices are pre-loaded in asynchronous browsers (like Chrome)
if ('speechSynthesis' in window && typeof speechSynthesis.onvoiceschanged !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}