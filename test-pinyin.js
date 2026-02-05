const pinyin = require('pinyin');

// 测试 "上线记录"
const text1 = '上线记录';
const result1 = pinyin(text1, { style: pinyin.STYLE_FIRST_LETTER, heteronym: false });
const letters1 = result1.map(item => item[0]).join('');
console.log('Text:', text1);
console.log('Pinyin result:', result1);
console.log('First letters:', letters1);
console.log();

// 测试 "天猫商家及商品关联数据配置"
const text2 = '天猫商家及商品关联数据配置';
const result2 = pinyin(text2, { style: pinyin.STYLE_FIRST_LETTER, heteronym: false });
const letters2 = result2.map(item => item[0]).join('');
console.log('Text:', text2);
console.log('Pinyin result:', result2);
console.log('First letters:', letters2);
console.log();

// 测试 "小象班班"
const text3 = '小象班班';
const result3 = pinyin(text3, { style: pinyin.STYLE_FIRST_LETTER, heteronym: false });
const letters3 = result3.map(item => item[0]).join('');
console.log('Text:', text3);
console.log('Pinyin result:', result3);
console.log('First letters:', letters3);
console.log();

// 测试搜索匹配
const searchQuery = 'sxjl';
const matches = letters1.includes(searchQuery.toLowerCase());
console.log(`Search "${searchQuery}" matches "${text1}" (${letters1}):`, matches);

const searchQuery2 = 'tmsj';
const matches2 = letters2.includes(searchQuery2.toLowerCase());
console.log(`Search "${searchQuery2}" matches "${text2}" (${letters2}):`, matches2);
