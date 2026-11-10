<template>
  <div class="query-optimizer">
    <h2>Query Optimizer</h2>
    <div class="query-input">
      <textarea
        v-model="query"
        placeholder="Enter your SQL query here..."
        rows="6"
      ></textarea>
      <div class="query-actions">
        <button @click="optimizeQuery" :disabled="loading || !query.trim()">
          {{ loading ? 'Analyzing...' : 'Analyze & Optimize' }}
        </button>
        <button @click="executeQuery" :disabled="loading || !query.trim()" class="execute-btn">
          {{ loading ? 'Executing...' : 'Execute' }}
        </button>
      </div>
    </div>
    <div v-if="suggestions.length > 0" class="suggestions">
      <h3>Optimization Suggestions</h3>
      <div v-for="(suggestion, index) in suggestions" :key="index" :class="['suggestion-item', getSuggestionClass(suggestion)]">
        {{ suggestion }}
      </div>
    </div>
    <div v-if="queryResults" class="query-results">
      <h3>Query Results</h3>
      <div class="results-table-container">
        <table class="results-table">
          <thead>
            <tr>
              <th v-for="(column, index) in columns" :key="index">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in queryResults" :key="rowIndex">
              <td v-for="(value, colIndex) in row" :key="colIndex">{{ formatValue(value) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="row-count">{{ queryResults.length }} rows returned</p>
    </div>
    <div v-if="explainResults.length > 0" class="explain-results">
      <h3>Query Execution Plan</h3>
      <table class="explain-table">
        <thead>
          <tr>
            <th>id</th>
            <th>select_type</th>
            <th>table</th>
            <th>type</th>
            <th>possible_keys</th>
            <th>key</th>
            <th>rows</th>
            <th>Extra</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in explainResults" :key="index">
            <td>{{ row.id }}</td>
            <td>{{ row.select_type }}</td>
            <td>{{ row.table }}</td>
            <td :class="getTypeClass(row.type)">{{ row.type }}</td>
            <td>{{ row.possible_keys || '-' }}</td>
            <td>{{ row.key || '-' }}</td>
            <td>{{ row.rows }}</td>
            <td>{{ row.Extra || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="status" :class="['status', status.type]">
      {{ status.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
const query = ref('')
const loading = ref(false)
const suggestions = ref<string[]>([])
const queryResults = ref<any[] | null>(null)
const explainResults = ref<any[]>([])
const status = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const columns = computed(() => {
  if (!queryResults.value || queryResults.value.length === 0) return []
  return Object.keys(queryResults.value[0])
})

const optimizeQuery = async () => {
  loading.value = true
  status.value = null
  suggestions.value = []
  explainResults.value = []

  try {
    const response = await $fetch('/api/mysql', {
      method: 'POST',
      body: {
        action: 'optimize',
        query: query.value
      }
    })

    if (response.success) {
      suggestions.value = response.suggestions
      explainResults.value = response.explain
      status.value = { type: 'success', message: 'Query analyzed successfully' }
    } else {
      status.value = { type: 'error', message: response.error || 'Analysis failed' }
    }
  } catch (error: any) {
    status.value = { type: 'error', message: error.message || 'Analysis failed' }
  } finally {
    loading.value = false
  }
}

const executeQuery = async () => {
  loading.value = true
  status.value = null
  queryResults.value = null

  try {
    const response = await $fetch('/api/mysql', {
      method: 'POST',
      body: {
        action: 'query',
        query: query.value
      }
    })

    if (response.success) {
      queryResults.value = response.results
      status.value = { type: 'success', message: 'Query executed successfully' }
    } else {
      status.value = { type: 'error', message: response.error || 'Query failed' }
    }
  } catch (error: any) {
    status.value = { type: 'error', message: error.message || 'Query failed' }
  } finally {
    loading.value = false
  }
}

const getSuggestionClass = (suggestion: string) => {
  if (suggestion.includes('Critical')) return 'critical'
  if (suggestion.includes('Warning')) return 'warning'
  return 'tip'
}

const getTypeClass = (type: string) => {
  if (type === 'ALL') return 'type-bad'
  if (type === 'index' || type === 'range') return 'type-warning'
  return 'type-good'
}

const formatValue = (value: any) => {
  if (value === null) return 'NULL'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>

<style scoped>
.query-optimizer {
  background: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

h2, h3 {
  color: #e0e0e0;
  margin-top: 0;
}

.query-input {
  margin-bottom: 20px;
}

.query-input textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #2d2d2d;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 10px;
}

.query-input textarea:focus {
  outline: none;
  border-color: #4a9eff;
}

.query-actions {
  display: flex;
  gap: 10px;
}

.query-actions button {
  padding: 12px 24px;
  background: #4a9eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background 0.2s;
}

.query-actions button:hover:not(:disabled) {
  background: #3a8eef;
}

.query-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.execute-btn {
  background: #2d5a2d;
}

.execute-btn:hover:not(:disabled) {
  background: #1d4a1d;
}

.suggestions {
  margin-top: 20px;
}

.suggestion-item {
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 14px;
}

.suggestion-item.critical {
  background: #5a2d2d;
  color: #f87171;
  border-left: 4px solid #f87171;
}

.suggestion-item.warning {
  background: #5a4a2d;
  color: #fbbf24;
  border-left: 4px solid #fbbf24;
}

.suggestion-item.tip {
  background: #2d4a5a;
  color: #60a5fa;
  border-left: 4px solid #60a5fa;
}

.query-results {
  margin-top: 20px;
}

.results-table-container {
  max-height: 400px;
  overflow: auto;
  background: #2d2d2d;
  border-radius: 4px;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.results-table th,
.results-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #444;
}

.results-table th {
  background: #1e1e1e;
  color: #4a9eff;
  position: sticky;
  top: 0;
}

.results-table tr:hover {
  background: #3d3d3d;
}

.row-count {
  color: #b0b0b0;
  font-size: 14px;
  margin-top: 10px;
}

.explain-results {
  margin-top: 20px;
}

.explain-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: #2d2d2d;
  border-radius: 4px;
  overflow: hidden;
}

.explain-table th,
.explain-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #444;
}

.explain-table th {
  background: #1e1e1e;
  color: #4a9eff;
}

.type-bad {
  color: #f87171;
  font-weight: 600;
}

.type-warning {
  color: #fbbf24;
}

.type-good {
  color: #4ade80;
}

.status {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.status.success {
  background: #2d5a2d;
  color: #4ade80;
}

.status.error {
  background: #5a2d2d;
  color: #f87171;
}
</style>
