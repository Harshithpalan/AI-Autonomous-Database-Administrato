<template>
  <div class="database-connection">
    <h2>MySQL Database Connection</h2>
    <form @submit.prevent="connect" class="connection-form">
      <div class="form-group">
        <label for="host">Host:</label>
        <input
          id="host"
          v-model="connection.host"
          type="text"
          placeholder="localhost"
          required
        />
      </div>
      <div class="form-group">
        <label for="port">Port:</label>
        <input
          id="port"
          v-model="connection.port"
          type="number"
          placeholder="3306"
          value="3306"
        />
      </div>
      <div class="form-group">
        <label for="user">Username:</label>
        <input
          id="user"
          v-model="connection.user"
          type="text"
          placeholder="root"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="connection.password"
          type="password"
          placeholder="••••••••"
        />
      </div>
      <div class="form-group">
        <label for="database">Database:</label>
        <input
          id="database"
          v-model="connection.database"
          type="text"
          placeholder="my_database"
          required
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Connecting...' : 'Connect' }}
      </button>
    </form>
    <div v-if="status" :class="['status', status.type]">
      {{ status.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
const connection = ref({
  host: 'localhost',
  port: 3306,
  user: '',
  password: '',
  database: ''
})

const loading = ref(false)
const status = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const emit = defineEmits(['connected'])

const connect = async () => {
  loading.value = true
  status.value = null

  try {
    const response = await $fetch('/api/mysql', {
      method: 'POST',
      body: {
        action: 'connect',
        params: connection.value
      }
    })

    if (response.success) {
      status.value = { type: 'success', message: response.message }
      emit('connected', connection.value)
    } else {
      status.value = { type: 'error', message: response.error || 'Connection failed' }
    }
  } catch (error: any) {
    status.value = { type: 'error', message: error.message || 'Connection failed' }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.database-connection {
  background: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

h2 {
  margin-top: 0;
  color: #e0e0e0;
}

.connection-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  color: #b0b0b0;
  font-size: 14px;
}

.form-group input {
  padding: 10px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #2d2d2d;
  color: #e0e0e0;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #4a9eff;
}

button {
  grid-column: 1 / -1;
  padding: 12px;
  background: #4a9eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #3a8eef;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
