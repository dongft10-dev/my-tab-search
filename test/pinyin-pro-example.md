# 使用 pinyin-pro 库实现搜索建议（兼容浏览器）

## 1. 安装和引入

### 安装
```bash
npm install @pinyin-pro/pinyin
# 或
yarn add @pinyin-pro/pinyin
```

### 浏览器直接使用
```html
<!-- 通过 CDN 引入 -->
<script src="https://cdn.jsdelivr.net/npm/@pinyin-pro/pinyin@latest/dist/index.min.js"></script>
<script>
  // 使用 window.pinyinPro 访问
  const { pinyin } = window.pinyinPro;
</script>
```

## 2. 基础使用示例

```javascript
import { pinyin } from '@pinyin-pro/pinyin';

// 基本用法
console.log(pinyin('中华人民共和国')); 
// "zhong hua ren min gong he guo"

// 获取首字母
console.log(pinyin('中华人民共和国', { pattern: 'first' }));
// "zhrmghg"

// 带空格分隔
console.log(pinyin('中华人民共和国', { 
  pattern: 'first',
  separator: ' '
}));
// "z h r m g h g"
```

## 3. 完整搜索建议实现

```javascript
import { pinyin } from '@pinyin-pro/pinyin';

class PinyinSearch {
  constructor(options = {}) {
    this.options = {
      // 是否启用拼音搜索
      enablePinyin: true,
      // 是否启用首字母搜索
      enableInitials: true,
      // 是否区分大小写
      caseSensitive: false,
      // 是否模糊匹配
      fuzzyMatch: true,
      ...options
    };
    
    this.items = [];
    this.indexMap = new Map(); // 缓存拼音索引
  }

  /**
   * 添加搜索项
   * @param {string} text - 要搜索的文本
   * @param {any} data - 关联的数据
   * @param {string[]} keywords - 额外的关键词
   */
  addItem(text, data = null, keywords = []) {
    // 生成拼音索引
    const pinyinIndex = this.generatePinyinIndex(text);
    
    const item = {
      id: this.items.length,
      text,
      originalText: text,
      data,
      keywords: [...keywords],
      pinyinIndex,
      initialsIndex: pinyinIndex.replace(/\s+/g, ''), // 去掉空格的首字母
      fullPinyin: this.generateFullPinyin(text)
    };
    
    this.items.push(item);
    this.indexMap.set(text, item);
    
    return item.id;
  }

  /**
   * 生成拼音索引（带空格）
   */
  generatePinyinIndex(text) {
    return pinyin(text, {
      pattern: 'pinyin', // 完整拼音
      toneType: 'none',  // 不显示声调
      type: 'array'      // 返回数组格式
    }).join(' ');
  }

  /**
   * 生成完整拼音
   */
  generateFullPinyin(text) {
    return pinyin(text, {
      pattern: 'pinyin',
      toneType: 'none'
    });
  }

  /**
   * 生成首字母索引
   */
  generateInitials(text) {
    return pinyin(text, {
      pattern: 'first',
      toneType: 'none'
    }).replace(/\s+/g, '');
  }

  /**
   * 搜索功能
   * @param {string} query - 搜索词
   * @param {object} options - 搜索选项
   */
  search(query, searchOptions = {}) {
    const options = { ...this.options, ...searchOptions };
    
    if (!query || query.trim() === '') {
      return this.items.map(item => this.formatResult(item));
    }

    const searchQuery = options.caseSensitive ? query : query.toLowerCase();
    
    // 多维度搜索
    const results = this.items.filter(item => {
      // 1. 原始文本匹配
      if (this.matchText(item.text, searchQuery, options)) {
        return true;
      }

      // 2. 关键词匹配
      if (item.keywords.some(keyword => 
        this.matchText(keyword, searchQuery, options))) {
        return true;
      }

      // 3. 拼音匹配
      if (options.enablePinyin && 
          this.matchPinyin(item, searchQuery, options)) {
        return true;
      }

      // 4. 首字母匹配
      if (options.enableInitials && 
          this.matchInitials(item, searchQuery, options)) {
        return true;
      }

      return false;
    });

    // 按匹配度排序
    results.sort((a, b) => {
      return this.calculateMatchScore(b, searchQuery) - 
             this.calculateMatchScore(a, searchQuery);
    });

    return results.map(item => this.formatResult(item));
  }

  /**
   * 文本匹配
   */
  matchText(text, query, options) {
    const target = options.caseSensitive ? text : text.toLowerCase();
    
    if (options.fuzzyMatch) {
      return target.includes(query);
    }
    
    return target === query;
  }

  /**
   * 拼音匹配
   */
  matchPinyin(item, query, options) {
    const target = options.caseSensitive ? 
      item.fullPinyin : item.fullPinyin.toLowerCase();
    
    if (options.fuzzyMatch) {
      return target.includes(query);
    }
    
    // 精确匹配时，检查是否以查询词开头
    return target.startsWith(query);
  }

  /**
   * 首字母匹配
   */
  matchInitials(item, query, options) {
    const target = options.caseSensitive ? 
      item.initialsIndex : item.initialsIndex.toLowerCase();
    
    if (options.fuzzyMatch) {
      return target.includes(query);
    }
    
    return target.startsWith(query);
  }

  /**
   * 计算匹配分数
   */
  calculateMatchScore(item, query) {
    let score = 0;
    const queryLower = query.toLowerCase();
    const textLower = item.text.toLowerCase();
    const initialsLower = item.initialsIndex.toLowerCase();
    
    // 1. 完全匹配原始文本（最高优先级）
    if (textLower === queryLower) {
      score += 100;
    }
    // 2. 开头匹配原始文本
    else if (textLower.startsWith(queryLower)) {
      score += 80;
    }
    // 3. 包含原始文本
    else if (textLower.includes(queryLower)) {
      score += 60;
    }
    
    // 4. 首字母完全匹配
    if (initialsLower === queryLower) {
      score += 70;
    }
    // 5. 首字母开头匹配
    else if (initialsLower.startsWith(queryLower)) {
      score += 50;
    }
    // 6. 首字母包含
    else if (initialsLower.includes(queryLower)) {
      score += 30;
    }
    
    // 7. 关键词匹配加分
    item.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (keywordLower.includes(queryLower)) {
        score += 40;
      }
    });
    
    return score;
  }

  /**
   * 格式化搜索结果
   */
  formatResult(item) {
    return {
      id: item.id,
      text: item.text,
      data: item.data,
      highlightText: this.highlightMatch(item.text, item.pinyinIndex),
      matchType: this.getMatchType(item)
    };
  }

  /**
   * 高亮匹配部分
   */
  highlightMatch(text, pinyinIndex) {
    // 这里可以实现文本高亮逻辑
    return text;
  }

  /**
   * 获取匹配类型
   */
  getMatchType(item) {
    // 可以根据实际情况判断匹配类型
    return 'pinyin';
  }

  /**
   * 批量添加项目
   */
  addItems(items) {
    return items.map(item => {
      if (typeof item === 'string') {
        return this.addItem(item);
      } else {
        return this.addItem(item.text, item.data, item.keywords);
      }
    });
  }

  /**
   * 清空搜索数据
   */
  clear() {
    this.items = [];
    this.indexMap.clear();
  }

  /**
   * 获取项目数量
   */
  get count() {
    return this.items.length;
  }
}

// 导出
export default PinyinSearch;
```

## 4. 使用示例

```javascript
import { pinyin } from '@pinyin-pro/pinyin';
import PinyinSearch from './PinyinSearch';

// 创建搜索实例
const search = new PinyinSearch({
  enablePinyin: true,
  enableInitials: true,
  fuzzyMatch: true,
  caseSensitive: false
});

// 添加测试数据
const cities = [
  { text: '北京', data: { id: 1, province: '北京' } },
  { text: '上海', data: { id: 2, province: '上海' } },
  { text: '广州', data: { id: 3, province: '广东' } },
  { text: '深圳', data: { id: 4, province: '广东' } },
  { text: '杭州', data: { id: 5, province: '浙江' } },
  { text: '成都', data: { id: 6, province: '四川' } },
  { text: '重庆', data: { id: 7, province: '重庆' } },
  { text: '武汉', data: { id: 8, province: '湖北' } },
  { text: '西安', data: { id: 9, province: '陕西' } },
  { text: '南京', data: { id: 10, province: '江苏' } }
];

// 批量添加
search.addItems(cities);

// 添加带关键词的项目
search.addItem('北京大学', 
  { id: 11, type: 'university' }, 
  ['北大', 'Peking University']
);

search.addItem('清华大学', 
  { id: 12, type: 'university' }, 
  ['清华', 'Tsinghua']
);

// 测试搜索
console.log('=== 拼音首字母搜索示例 ===');

// 测试各种搜索方式
const testCases = [
  'bj',        // 北京
  'sh',        // 上海
  'gz',        // 广州
  '深圳',      // 原始文本
  'cheng',     // 成都、重庆（拼音）
  'cd',        // 成都（首字母）
  'cq',        // 重庆（首字母）
  '北大',      // 关键词
  'qh',        // 清华（首字母）
  '京',        // 模糊匹配
  'university' // 英文关键词
];

testCases.forEach(query => {
  console.log(`\n搜索: "${query}"`);
  const results = search.search(query);
  
  if (results.length === 0) {
    console.log('  无结果');
  } else {
    results.slice(0, 5).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.text} (匹配度: ${search.calculateMatchScore(
        search.items.find(item => item.id === result.id), query
      )})`);
    });
    
    if (results.length > 5) {
      console.log(`  ... 还有 ${results.length - 5} 个结果`);
    }
  }
});

// 获取详细结果
console.log('\n=== 搜索"bj"的详细结果 ===');
const detailedResults = search.search('bj', {
  fuzzyMatch: true
});

detailedResults.forEach(result => {
  console.log(JSON.stringify(result, null, 2));
});
```

## 5. Vue 组件示例

```vue
<template>
  <div class="pinyin-search-demo">
    <div class="search-box">
      <input
        v-model="query"
        @input="handleSearch"
        placeholder="输入中文、拼音或首字母搜索..."
        class="search-input"
      />
      <button @click="clearSearch" class="clear-btn">清空</button>
    </div>

    <div class="stats">
      共 {{ totalItems }} 个项目，找到 {{ results.length }} 个结果
    </div>

    <div v-if="loading" class="loading">搜索中...</div>

    <div v-else>
      <div v-if="results.length === 0" class="no-results">
        没有找到匹配的结果
      </div>

      <ul v-else class="results-list">
        <li
          v-for="(item, index) in results"
          :key="item.id"
          class="result-item"
          :class="{ highlighted: index === highlightedIndex }"
        >
          <div class="item-text">{{ item.text }}</div>
          <div v-if="item.data" class="item-data">
            {{ item.data }}
          </div>
          <div class="item-match">
            匹配方式: {{ item.matchType }}
          </div>
        </li>
      </ul>
    </div>

    <div class="examples">
      <h4>搜索示例:</h4>
      <div class="example-tags">
        <span
          v-for="example in examples"
          :key="example"
          class="example-tag"
          @click="query = example; handleSearch()"
        >
          {{ example }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { pinyin } from '@pinyin-pro/pinyin';
import PinyinSearch from './PinyinSearch';

export default {
  name: 'PinyinSearchDemo',
  setup() {
    const query = ref('');
    const results = ref([]);
    const loading = ref(false);
    const totalItems = ref(0);
    const highlightedIndex = ref(0);
    const searchEngine = ref(null);

    const examples = [
      '北京', 'sh', 'gz', 'cheng', '北京大学', 'qh'
    ];

    // 初始化搜索数据
    const initSearchData = () => {
      searchEngine.value = new PinyinSearch();
      
      // 添加示例数据
      const data = [
        '北京', '上海', '广州', '深圳', '杭州',
        '成都', '重庆', '武汉', '西安', '南京',
        '北京大学', '清华大学', '复旦大学', '浙江大学'
      ];
      
      data.forEach((item, index) => {
        searchEngine.value.addItem(item, { id: index + 1 });
      });
      
      totalItems.value = searchEngine.value.count;
    };

    // 处理搜索
    const handleSearch = () => {
      if (!query.value.trim()) {
        results.value = searchEngine.value.items.map(item => 
          searchEngine.value.formatResult(item)
        );
        return;
      }

      loading.value = true;
      
      // 使用防抖优化
      setTimeout(() => {
        results.value = searchEngine.value.search(query.value);
        loading.value = false;
        highlightedIndex.value = 0;
      }, 150);
    };

    // 清空搜索
    const clearSearch = () => {
      query.value = '';
      handleSearch();
    };

    // 键盘导航
    const handleKeydown = (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1,
          results.value.length - 1
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      } else if (event.key === 'Enter' && results.value.length > 0) {
        const selected = results.value[highlightedIndex.value];
        console.log('选中:', selected);
        // 执行选中操作
      }
    };

    onMounted(() => {
      initSearchData();
      handleSearch();
      window.addEventListener('keydown', handleKeydown);
    });

    return {
      query,
      results,
      loading,
      totalItems,
      highlightedIndex,
      examples,
      handleSearch,
      clearSearch
    };
  }
};
</script>

<style scoped>
.pinyin-search-demo {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.clear-btn {
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-btn:hover {
  background-color: #5a6268;
}

.stats {
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #007bff;
}

.no-results {
  padding: 40px;
  text-align: center;
  color: #999;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover {
  background-color: #f8f9fa;
}

.result-item.highlighted {
  background-color: #e3f2fd;
}

.item-text {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.item-data {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.item-match {
  font-size: 12px;
  color: #999;
}

.examples {
  margin-top: 30px;
}

.example-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.example-tag {
  padding: 5px 10px;
  background-color: #e9ecef;
  border-radius: 15px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.example-tag:hover {
  background-color: #dee2e6;
}
</style>
```

## 6. 主要特点和优势

1. **浏览器兼容性好**：pinyin-pro 专门为现代浏览器设计
2. **体积小**：相比 pinyin 库，体积更小，适合前端使用
3. **功能丰富**：支持多种拼音格式和配置选项
4. **性能优秀**：内部做了大量优化，搜索速度快
5. **TypeScript 支持**：提供完整的类型定义

## 7. 配置选项说明

```javascript
// pinyin-pro 的主要配置选项
const options = {
  pattern: 'pinyin', // 'pinyin' | 'first' | 'num' | 'initial'
  toneType: 'none',  // 'none' | 'num' | 'symbol'
  type: 'string',    // 'string' | 'array'
  multiple: false,   // 多音字模式
  mode: 'normal',    // 'normal' | 'surname'
  removeNonZh: false, // 移除非中文字符
  nonZh: 'spaced',   // 非中文字符处理
  v: true            // 是否使用 v 表示 ü
};
```

这个实现提供了完整的拼音搜索功能，支持原始文本、拼音、首字母等多维度搜索，并且可以直接在浏览器中运行。