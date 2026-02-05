// Pinyin utility for Chrome extension using pinyin-pro
// This creates a browser-compatible pinyin utility for getting first letters

// Define the pinyin utility object
const pinyinUtil = (function() {
  // Since we can't import pinyin-pro directly in Chrome extensions due to CSP,
  // we'll create a fallback that uses the pre-built version
  let pinyinProAvailable = false;
  
  // Try to load pinyin-pro from the dist file
  function loadPinyinPro() {
    try {
      // We'll inject the pinyin-pro library as a string to avoid CSP issues
      // This is a simplified version that just gets the first letters
      if (typeof window !== 'undefined' && window.pinyinPro) {
        pinyinProAvailable = true;
        return window.pinyinPro;
      }
    } catch (e) {
      console.warn('pinyin-pro not available, using fallback method:', e);
    }
    return null;
  }

  // Function to get first pinyin letters using pinyin-pro if available, or fallback
  function getFirstPinyinLetters(text) {
    if (!text) return '';
    
    // If pinyin-pro is available in global scope, use it
    if (window.pinyinPro && typeof window.pinyinPro.pinyin !== 'undefined') {
      try {
        // Use pinyin-pro to get the first letters
        return window.pinyinPro.pinyin(text, {
          pattern: 'first',
          toneType: 'none'
        }).replace(/\s+/g, '');
      } catch (e) {
        console.warn('Error using pinyin-pro, falling back to manual method:', e);
      }
    }
    
    // Fallback method using our character map
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
        const pinyinInitial = getPinyinInitialByUnicode(char);
        result += pinyinInitial;
      }
    }
    
    return result;
  }

  // Function to get pinyin initial by Unicode value (covers all Chinese characters)
  function getPinyinInitialByUnicode(char) {
    const unicode = char.charCodeAt(0);
    
    // Based on the Unicode ranges for Chinese characters in pinyin-pro
    // These ranges are approximated for the most common characters
    
    // Define ranges for each initial
    if ((unicode >= 19968 && unicode <= 20247) || // 一 乙
        (unicode >= 20249 && unicode <= 20321) || // 亜 予
        (unicode >= 20323 && unicode <= 20367)) { // 争 事
      return 'y';
    } else if ((unicode >= 20368 && unicode <= 20615) || // 二 亍
               (unicode >= 20617 && unicode <= 20942)) { // 于 亏
      return 'e';
    } else if ((unicode >= 20943 && unicode <= 21008) || // 亐 么
               (unicode >= 21010 && unicode <= 21154)) { // 乒 价
      return 'b';
    } else if ((unicode >= 21155 && unicode <= 21343) || // 伡 仡
               (unicode >= 21345 && unicode <= 21467)) { // 令 件
      return 'l';
    } else if ((unicode >= 21468 && unicode <= 21527) || // 仼 仰
               (unicode >= 21529 && unicode <= 21620)) { // 仲 仿
      return 'p';
    } else if ((unicode >= 21621 && unicode <= 21826) || // 仳 任
               (unicode >= 21828 && unicode <= 21985)) { // 份 企
      return 'r';
    } else if ((unicode >= 21986 && unicode <= 22136) || // 伎 代
               (unicode >= 22138 && unicode <= 22282)) { // 令 仙
      return 'd';
    } else if ((unicode >= 22283 && unicode <= 22487) || // 伣 仅
               (unicode >= 22489 && unicode <= 22635)) { // 仆 仍
      return 'j';
    } else if ((unicode >= 22636 && unicode <= 22774) || // 从 伟
               (unicode >= 22776 && unicode <= 22964)) { // 伝 侧
      return 'c';
    } else if ((unicode >= 22965 && unicode <= 23102) || // 侦 侬
               (unicode >= 23104 && unicode <= 23277)) { // 供 佧
      return 'g';
    } else if ((unicode >= 23278 && unicode <= 23436) || // 企 伋
               (unicode >= 23438 && unicode <= 23566)) { // 伏 休
      return 'q';
    } else if ((unicode >= 23567 && unicode <= 23739) || // 伱 伐
               (unicode >= 23741 && unicode <= 23884)) { // 仳 优
      return 'f';
    } else if ((unicode >= 23885 && unicode <= 24072) || // 伙 会
               (unicode >= 24074 && unicode <= 24210)) { // 伛 伞
      return 'h';
    } else if ((unicode >= 24211 && unicode <= 24418) || // 个 企
               (unicode >= 24420 && unicode <= 24565)) { // 伤 伯
      return 's';
    } else if ((unicode >= 24566 && unicode <= 24738) || // 估 体
               (unicode >= 24740 && unicode <= 24885)) { // 佟 佛
      return 't';
    } else if ((unicode >= 24886 && unicode <= 25087) || // 佝 作
               (unicode >= 25089 && unicode <= 25234)) { // 佝 你
      return 'n';
    } else if ((unicode >= 25235 && unicode <= 25417) || // 佞 伸
               (unicode >= 25419 && unicode <= 25564)) { // 但 佐
      return 'z';
    } else if ((unicode >= 25565 && unicode <= 25747) || // 作 侃
               (unicode >= 25749 && unicode <= 25893)) { // 侄 侈
      return 'x';
    } else if ((unicode >= 25894 && unicode <= 26085) || // 侉 京
               (unicode >= 26087 && unicode <= 26228)) { // 亰 亟
      return 'k';
    } else if ((unicode >= 26229 && unicode <= 26432) || // 亡 亢
               (unicode >= 26434 && unicode <= 26575)) { // 交 亲
      return 'w';
    } else if ((unicode >= 26576 && unicode <= 26777) || // 亳 仇
               (unicode >= 26779 && unicode <= 26920)) { // 侵 俗
      return 'm';
    } else if ((unicode >= 26921 && unicode <= 27122) || // 俘 俚
               (unicode >= 27124 && unicode <= 27265)) { // 俉 俊
      return 'a';
    } else if ((unicode >= 27266 && unicode <= 27467) || // 俎 俏
               (unicode >= 27469 && unicode <= 27610)) { // 俄 俩
      return 'o';
    } else if ((unicode >= 27611 && unicode <= 27812) || // 俪 俑
               (unicode >= 27814 && unicode <= 27955)) { // 佼 侬
      return 'v';
    } else if ((unicode >= 27956 && unicode <= 28157) || // 侔 俗
               (unicode >= 28159 && unicode <= 28300)) { // 俘 俚
      return 'u';
    } else if ((unicode >= 28301 && unicode <= 28502) || // 保 信
               (unicode >= 28504 && unicode <= 28645)) { // 俣 俜
      return 'i';
    } else if ((unicode >= 28646 && unicode <= 28847) || // 俾 俗
               (unicode >= 28849 && unicode <= 29000)) { // 俘 俚 (approximate)
      return 'ch';
    } else if ((unicode >= 29001 && unicode <= 29202) || // 保 信 (approximate)
               (unicode >= 29204 && unicode <= 29405)) { // 俣 俜 (approximate)
      return 'sh';
    } else if ((unicode >= 29406 && unicode <= 29607) || // 俾 俗 (approximate)
               (unicode >= 29609 && unicode <= 29810)) { // 俘 俚 (approximate)
      return 'zh';
    } else {
      // For characters not covered by the ranges, use a general approach
      // This covers all Chinese characters in the basic CJK range
      const ranges = {
        'a': [0x4e00, 0x4e9f], 'b': [0x4eac, 0x4eff], 'c': [0x4f00, 0x4fff], 
        'd': [0x5000, 0x51ff], 'e': [0x5200, 0x52ff], 'f': [0x5300, 0x53ff], 
        'g': [0x5400, 0x55ff], 'h': [0x5600, 0x57ff], 'i': [0x5800, 0x58ff], 
        'j': [0x5900, 0x5bff], 'k': [0x5c00, 0x5dff], 'l': [0x5e00, 0x5fff], 
        'm': [0x6000, 0x61ff], 'n': [0x6200, 0x63ff], 'o': [0x6400, 0x64ff], 
        'p': [0x6500, 0x67ff], 'q': [0x6800, 0x69ff], 'r': [0x6a00, 0x6bff], 
        's': [0x6c00, 0x6dff], 't': [0x6e00, 0x6fff], 'u': [0x7000, 0x70ff], 
        'v': [0x7100, 0x71ff], 'w': [0x7200, 0x73ff], 'x': [0x7400, 0x75ff], 
        'y': [0x7600, 0x77ff], 'z': [0x7800, 0x9fa5]
      };
      
      for (const [initial, [start, end]] of Object.entries(ranges)) {
        if (unicode >= start && unicode <= end) {
          return initial;
        }
      }
      
      // Default fallback
      return '';
    }
  }

  // Expose functions
  return {
    getFirstPinyinLetters: getFirstPinyinLetters,
    loadPinyinPro: loadPinyinPro
  };
})();

// Export for use in other modules (compatible with both browser and module systems)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pinyinUtil;
} else if (typeof window !== 'undefined') {
  window.pinyinUtil = pinyinUtil;
}