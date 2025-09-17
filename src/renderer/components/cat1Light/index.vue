<template>
    <div class="container">
      <h1>Vue 3 测试页面</h1>
      
      <!-- 基本的数据绑定 -->
      <div class="section">
        <h2>数据绑定测试</h2>
        <p>当前计数: {{ count }}</p>
        <button @click="increment">增加</button>
        <button @click="decrement">减少</button>
      </div>
  
      <!-- v-if 指令测试 -->
      <div class="section">
        <h2>条件渲染测试</h2>
        <button @click="toggleShow">{{ showMessage ? '隐藏' : '显示' }} 消息</button>
        <p v-if="showMessage" class="message">这是一条测试消息！</p>
      </div>
  
      <!-- v-for 指令测试 -->
      <div class="section">
        <h2>列表渲染测试</h2>
        <ul>
          <li v-for="item in items" :key="item.id" class="list-item">
            {{ item.name }} - {{ item.value }}
          </li>
        </ul>
        <button @click="addItem">添加项目</button>
      </div>
  
      <!-- 表单绑定测试 -->
      <div class="section">
        <h2>表单绑定测试</h2>
        <input v-model="inputValue" placeholder="请输入内容" />
        <p>你输入的内容: {{ inputValue }}</p>
      </div>
  
      <!-- Element Plus 组件测试（如果可用） -->
      <div class="section">
        <h2>Element Plus 测试</h2>
        <!-- 尝试使用一个简单的 Element Plus 组件 -->
        <el-button type="primary" @click="showElementMessage">Element Plus 按钮</el-button>
        <p v-if="elementMessage" class="element-message">{{ elementMessage }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  
  // 响应式数据
  const count = ref(0)
  const showMessage = ref(false)
  const inputValue = ref('')
  const elementMessage = ref('')
  
  // 响应式对象
  const items = reactive([
    { id: 1, name: '项目1', value: 'Value 1' },
    { id: 2, name: '项目2', value: 'Value 2' },
    { id: 3, name: '项目3', value: 'Value 3' }
  ])
  
  // 方法
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  const toggleShow = () => {
    showMessage.value = !showMessage.value
  }
  
  const addItem = () => {
    const newId = items.length + 1
    items.push({
      id: newId,
      name: `项目${newId}`,
      value: `Value ${newId}`
    })
  }
  
  const showElementMessage = () => {
    elementMessage.value = 'Element Plus 组件工作正常！'
    setTimeout(() => {
      elementMessage.value = ''
    }, 3000)
  }
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  
  .section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  h1 {
    color: #2c3e50;
    text-align: center;
    margin-bottom: 30px;
  }
  
  h2 {
    color: #34495e;
    margin-bottom: 15px;
  }
  
  button {
    padding: 10px 20px;
    margin: 5px;
    border: none;
    border-radius: 4px;
    background-color: #3498db;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: #2980b9;
  }
  
  .message {
    color: #27ae60;
    font-weight: bold;
    margin-top: 10px;
  }
  
  .list-item {
    padding: 8px;
    margin: 5px 0;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  input {
    padding: 10px;
    margin: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .element-message {
    color: #e74c3c;
    font-weight: bold;
    margin-top: 10px;
  }
  </style>