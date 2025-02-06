import { getCachedPinyinForms } from './pinyin'

// 计算字符串相似度 (Levenshtein Distance)
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null))

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // 删除
        matrix[j - 1][i] + 1, // 插入
        matrix[j - 1][i - 1] + substitutionCost // 替换
      )
    }
  }

  return matrix[b.length][a.length]
}

// 计算搜索相关度分数
export function getSearchScore(text: string, query: string): number {
  // 获取所有拼音形式
  const textForms = getCachedPinyinForms(text)
  const queryForms = getCachedPinyinForms(query)
  
  // 计算最高匹配分数
  let maxScore = 0
  
  for (const textForm of textForms) {
    for (const queryForm of queryForms) {
      let score = 0
      const t = textForm.toLowerCase()
      const q = queryForm.toLowerCase()

      // 完全匹配
      if (t === q) {
        score = 1
      }
      // 包含关系
      else if (t.includes(q)) {
        score = 0.8
      }
      // 单词匹配
      else {
        const textWords = t.split(/[\s/]+/)
        const queryWords = q.split(/\s+/)
        const wordMatches = queryWords.filter(qw => 
          textWords.some(tw => tw.includes(qw))
        ).length
        if (wordMatches > 0) {
          score = 0.6 * (wordMatches / queryWords.length)
        }
        // 编辑距离
        else {
          const maxLength = Math.max(t.length, q.length)
          const distance = levenshteinDistance(t, q)
          const similarity = (maxLength - distance) / maxLength
          if (similarity > 0.5) {
            score = 0.4 * similarity
          }
        }
      }

      maxScore = Math.max(maxScore, score)
    }
  }
  
  return maxScore
} 