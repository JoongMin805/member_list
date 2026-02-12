<template>
  <div class="container">
    <div class="login-form">
      <h1>운영진</h1>
      <form @submit.prevent="login">
        <div class="form-group">
          <input v-model="id" placeholder="아이디" required />
        </div>
        <div class="form-group">
          <input v-model="password" type="password" placeholder="비밀번호" required />
        </div>
        <button class="btn btn-primary" type="submit">로그인</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const id = ref('')
const password = ref('')

const login = () => {
  if (id.value === 'daaumm' && password.value === 'ekdna') {
    localStorage.setItem('isAdmin', 'true')
    router.push('/member_list/')
  } else {
    alert('운영진이 아니네요?')
  }
}
</script>
