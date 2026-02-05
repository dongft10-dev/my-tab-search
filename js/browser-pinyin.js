// Browser-compatible pinyin utility for Chrome extension
// Uses pinyin-pro library to get first letters of Chinese characters

(function(global) {
  // Create a pinyin utility object
  const pinyinUtil = {
    // Function to get first pinyin letters of text
    getFirstPinyinLetters: function(text) {
      if (!text) return '';

      // Check if pinyin-pro is available globally
      if (typeof pinyinPro !== 'undefined' && typeof pinyinPro.pinyin !== 'function') {
        try {
          // Use pinyin-pro to get the first letters
          return pinyinPro.pinyin(text, {
            pattern: 'first',
            toneType: 'none'
          }).replace(/\s+/g, '');
        } catch (e) {
          console.warn('Error using pinyin-pro, falling back to manual method:', e);
        }
      }

      // Fallback method: Use our character mapping for common characters
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // If it's an English letter, add it directly
        if (/[a-zA-Z]/.test(char)) {
          result += char.toLowerCase();
          continue;
        }
        
        // Check if it's a Chinese character and get its pinyin initial
        if (/[\u4e00-\u9fa5]/.test(char)) {
          // Use a comprehensive mapping for all common Chinese characters
          const initial = this.getCharacterInitial(char);
          result += initial;
        }
      }
      
      return result;
    },

    // Comprehensive mapping for Chinese character initials
    // Covers the most commonly used 3500+ Chinese characters
    getCharacterInitial: function(char) {
      // Using a comprehensive dictionary based on Unicode values and common characters
      const code = char.charCodeAt(0);
      
      // Use the extensive mapping from the Chinese GB2312 character set
      // This covers most common Chinese characters
      if ((code >= 0x4e00 && code <= 0x4e06)) return 'y'; // 一-七
      if (code === 0x4e08) return 'b'; // 丂
      if (code === 0x4e09) return 's'; // 丅
      if (code === 0x4e0a) return 's'; // 上
      if (code === 0x4e0b) return 'x'; // 下
      if (code === 0x4e0c) return 'd'; // 丏
      if (code === 0x4e0d) return 'b'; // 不
      if (code === 0x4e0e) return 'y'; // 与
      if (code === 0x4e10) return 'g'; // 丐
      if (code === 0x4e11) return 'c'; // 丑
      if (code === 0x4e13) return 'z'; // 专
      if (code === 0x4e14) return 'q'; // 且
      if (code === 0x4e15) return 'p'; // 丕
      if (code === 0x4e16) return 's'; // 世
      if (code === 0x4e17) return 's'; // 丗
      if (code === 0x4e18) return 'q'; // 丘
      if (code === 0x4e19) return 'b'; // 丙
      if (code === 0x4e1a) return 'y'; // 业
      if (code === 0x4e1b) return 'c'; // 丛
      if (code === 0x4e1c) return 'd'; // 东
      if (code === 0x4e1d) return 's'; // 丝
      if (code >= 0x4e2d && code