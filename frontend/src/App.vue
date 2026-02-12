<script setup>
  import MemberList from './pages/MemberList.vue'
  import { getMembers } from "./api/members";
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>
