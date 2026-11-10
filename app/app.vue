<template>
  <div class="app">
    <header class="header">
      <h1>AI Autonomous Database Administrator</h1>
      <p class="subtitle">MySQL Management & Optimization</p>
    </header>
    <main class="main">
      <DatabaseConnection @connected="handleConnection" />
      <div v-if="isConnected" class="dashboard">
        <div class="dashboard-grid">
          <BackupManager />
          <QueryOptimizer />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const isConnected = ref(false)

const handleConnection = () => {
  isConnected.value = true
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #0d0d0d;
  color: #e0e0e0;
}

.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
}

.header {
  background: rgba(30, 30, 30, 0.9);
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid #333;
  backdrop-filter: blur(10px);
}

.header h1 {
  font-size: 28px;
  color: #4a9eff;
  margin-bottom: 8px;
}

.subtitle {
  color: #888;
  font-size: 16px;
}

.main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

.dashboard {
  margin-top: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
