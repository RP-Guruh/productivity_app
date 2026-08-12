<template>
  <div class="skeleton-card">
    <div class="skeleton-line title"></div>
    <div class="skeleton-line description"></div>
    <div class="skeleton-line meta"></div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background-color: var(--color-panel);
  border-radius: var(--radius-md);
  padding: 16px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
}

.skeleton-line {
  background-color: rgba(222, 218, 209, 0.5);
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line.title {
  height: 18px;
  width: 70%;
  margin-bottom: 12px;
}

.skeleton-line.description {
  height: 14px;
  width: 90%;
  margin-bottom: 20px;
}

.skeleton-line.meta {
  height: 12px;
  width: 40%;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
