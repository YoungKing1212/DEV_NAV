import { pinyin } from 'pinyin-pro'

// 获取文本的所有拼音形式
export function getAllPinyinForms(text: string): string[] {
  const forms: string[] = []
  
  // 原文
  forms.push(text)
  
  try {
    // 完整拼音
    forms.push(pinyin(text, { toneType: 'none' }))
    
    // 首字母
    forms.push(pinyin(text, { pattern: 'first', toneType: 'none' }))
    
    // 分词拼音（保持原文格式）
    const words = text.split(/[\s/]+/)
    forms.push(words.map(word => pinyin(word, { toneType: 'none' })).join(' '))
    forms.push(words.map(word => pinyin(word, { pattern: 'first', toneType: 'none' })).join(' '))
  } catch (error) {
    console.warn('Pinyin conversion failed:', error)
  }
  
  return [...new Set(forms)]
}

// 缓存已转换的拼音
const pinyinCache = new Map<string, string[]>()

// 获取带缓存的拼音形式
export function getCachedPinyinForms(text: string): string[] {
  if (pinyinCache.has(text)) {
    return pinyinCache.get(text)!
  }
  
  const forms = getAllPinyinForms(text)
  pinyinCache.set(text, forms)
  return forms
} 