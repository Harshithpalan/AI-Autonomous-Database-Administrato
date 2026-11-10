<template>
  <div class="backup-manager">
    <h2>Backup Management</h2>
    <div class="backup-actions">
      <button @click="createBackup" :disabled="loading">
        {{ loading ? 'Creating backup...' : 'Create Backup' }}
      </button>
    </div>
    <div v-if="backups.length > 0" class="backup-list">
      <h3>Recent Backups</h3>
      <div v-for="(backup, index) in backups" :key="index" class="backup-item">
        <div class="backup-info">
          <span class="backup-database">{{ backup.database }}</span>
          <span class="backup-time">{{ formatTime(backup.timestamp) }}</span>
          <span class="backup-tables">{{ Object.keys(backup.tables).length }} tables</span>
        </div>
        <div class="backup-actions-item">
          <button @click="viewBackup(backup)" class="view-btn">View</button>
          <button @click="downloadBackup(backup)" class="download-btn">Download</button>
        </div>
      </div>
    </div>
    <div v-if="selectedBackup" class="backup-details">
      <h3>Backup Details</h3>
      <div class="backup-tables-list">
        <div v-for="(tableData, tableName) in selectedBackup.tables" :key="tableName" class="table-detail">
          <h4>{{ tableName }}</h4>
          <p>Rows: {{ tableData.data.length }}</p>
          <div class="table-structure">
            <pre>{{ JSON.stringify(tableData.structure, null, 2) }}</pre>
          </div>
        </div>
      </div>
      <button @click="selectedBackup = null" class="close-btn">Close</button>
    </div>
    <div v-if="status" :class="['status', status.type]">
      {{ status.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const backups = ref<any[]>([])
const selectedBackup = ref<any>(null)
const status = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const createBackup = async () => {
  loading.value = true
  status.value = null

  try {
    const response = await $fetch('/api/mysql', {
      method: 'POST',
      body: {
        action: 'backup',
        params: { database: 'selected' }
      }
    })

    if (response.success) {
      backups.value.unshift(response.backup)
      status.value = { type: 'success', message: 'Backup created successfully' }
    } else {
      status.value = { type: 'error', message: response.error || 'Backup failed' }
    }
  } catch (error: any) {
    status.value = { type: 'error', message: error.message || 'Backup failed' }
  } finally {
    loading.value = false
  }
}

const viewBackup = (backup: any) => {
  selectedBackup.value = backup
}

const downloadBackup = (backup: any) => {
  const dataStr = JSON.stringify(backup, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `backup-${backup.database}-${backup.timestamp}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}
</script>

<style scoped>
.backup-manager {
  background: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

h2, h3, h4 {
  color: #e0e0e0;
  margin-top: 0;
}

.backup-actions {
  margin-bottom: 20px;
}

.backup-actions button {
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

.backup-actions button:hover:not(:disabled) {
  background: #3a8eef;
}

.backup-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.backup-list {
  margin-top: 20px;
}

.backup-item {
  background: #2d2d2d;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.backup-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.backup-database {
  font-weight: 600;
  color: #4a9eff;
}

.backup-time {
  color: #b0b0b0;
  font-size: 14px;
}

.backup-tables {
  color: #888;
  font-size: 14px;
}

.backup-actions-item {
  display: flex;
  gap: 10px;
}

.view-btn, .download-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.view-btn {
  background: #3a8eef;
  color: white;
}

.view-btn:hover {
  background: #2a7edf;
}

.download-btn {
  background: #2d5a2d;
  color: #4ade80;
}

.download-btn:hover {
  background: #1d4a1d;
}

.backup-details {
  margin-top: 20px;
  background: #2d2d2d;
  padding: 20px;
  border-radius: 4px;
}

.backup-tables-list {
  max-height: 400px;
  overflow-y: auto;
}

.table-detail {
  background: #1e1e1e;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.table-detail h4 {
  color: #4a9eff;
  margin-bottom: 5px;
}

.table-detail p {
  color: #b0b0b0;
  margin: 5px 0;
}

.table-structure {
  background: #0d0d0d;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

.table-structure pre {
  color: #4ade80;
  font-size: 12px;
  margin: 0;
}

.close-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: #5a2d2d;
  color: #f87171;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.close-btn:hover {
  background: #4a1d1d;
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
