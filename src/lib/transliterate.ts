const CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'g', 'ज़': 'z', 'ड़': 'd', 'ढ़': 'dh', 'फ़': 'f'
};

const VOWELS: Record<string, string> = {
  'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u',
  'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au'
};

const MATRAS: Record<string, string> = {
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u',
  'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au'
};

const OTHERS: Record<string, string> = {
  'ं': 'n', 'ः': 'h', 'ँ': 'n'
};

export function capitalizeWords(str: string): string {
  return str
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function transliterateHindiToEnglish(text: string): string {
  if (!text) return "";
  
  // Check if string contains Hindi characters. If not, return as is.
  const hasHindi = /[\u0900-\u097F]/.test(text);
  if (!hasHindi) return text;

  let result = "";
  const chars = Array.from(text);
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const nextChar = chars[i + 1];
    
    // Check if vowel
    if (VOWELS[char] !== undefined) {
      result += VOWELS[char];
      continue;
    }
    
    // Check if consonant
    if (CONSONANTS[char] !== undefined) {
      const engConsonant = CONSONANTS[char];
      
      // Determine if we need inherent 'a'
      let inherentA = true;
      
      if (nextChar === '्') {
        // Halant suppresses inherent 'a'
        inherentA = false;
      } else if (nextChar !== undefined && (MATRAS[nextChar] !== undefined || OTHERS[nextChar] !== undefined)) {
        // Matra or other nasalization suppresses inherent 'a'
        inherentA = false;
      } else if (nextChar === undefined || nextChar === ' ' || /[\s,.\-|]/.test(nextChar)) {
        // End of word deletes schwa (no inherent 'a')
        inherentA = false;
      }
      
      result += engConsonant + (inherentA ? 'a' : '');
      continue;
    }
    
    // Check if matra
    if (MATRAS[char] !== undefined) {
      result += MATRAS[char];
      continue;
    }
    
    // Check if other diacritic
    if (OTHERS[char] !== undefined) {
      result += OTHERS[char];
      continue;
    }
    
    // Skip halant itself since it's already handled
    if (char === '्') {
      continue;
    }
    
    // Keep other characters as is
    result += char;
  }
  
  const capitalized = result
    .replace(/\s+/g, ' ')
    .trim();
    
  return capitalizeWords(capitalized);
}
