<template>
  <div :class="{ login: isAdmin}">
    <div class="admin_login-area">
      <button v-if="!isAdmin" @click="goLogin">로그인</button>
      <button v-else @click="logout">로그아웃</button>
    </div>

    <ul class="tab-list">
      <li><button class="tab-item list" @click="$router.push('/member_list')">Members</button></li>
      <li><button class="tab-item member active">Schedule</button></li>
    </ul>

    <div class="member_list-wrap">
      <div class="sort-area">
        <span class="selectBox">
          <input type="text" v-model="searchName" placeholder="이름 검색" />
        </span>
      </div>

      <div class="total_schedule-area">
        <span>총 <span class="count">{{ totalCount }}</span> 건</span>
      </div>

      <ul class="member-list" v-if="pagedLists.length">
        <li v-for="item in pagedLists" :key="item._id">
          <div class="schedule-info">
            <div>
              <div>
                <a v-if="isAdmin" @click.prevent="goEdit(item._id)">{{ item.title }}</a>
                <span v-else>{{ item.title }}</span>
              </div>
              <div><span>{{ formatYYMMDD(item.date) }}</span></div>
              <div v-if="isAdmin">
                <button @click="remove(item._id)">삭제</button>
              </div>
            </div>
            <div class="participants-area" style="margin-top: 10px">
              <div>
                <a class="btn-more" @click.prevent="toggleParticipants(item._id)" :class="{ active: isParticipantsActive(item._id) }"><span>참여자</span></a>
              </div>
              <div class="participants-info active" :class="{ active: isParticipantsActive(item._id) }">
                <span>{{ renderParticipants(item.participants) }}</span>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div class="no_data" v-else>
        <p>등록된 모임이 없습니다.</p>
      </div>

      <div class="btn_reg-area">
        <button v-if="isAdmin" @click="$router.push('/schedule/new')">등록</button>
      </div>

      <div class="pagination" v-if="pages.length > 1" style="margin-top:12px; display:flex; gap:8px; justify-content:center;">
        <button class="btn-prev" @click="prevPage" :disabled="currentPage === 1">이전</button>
        <button
          v-for="p in pages"
          :key="p"
          :class="{ active: currentPage === p }"
          @click="goPage(p)"
        >{{ p }}</button>
        <button class="btn-next" @click="nextPage" :disabled="currentPage === totalPages">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSchedules, deleteSchedule } from '@/api/schedules'

const router = useRouter()
const lists = ref([])
const searchName = ref('')
const pageSize = 10
const currentPage = ref(1)

const load = async () => {
  try {
    const res = await getSchedules()
    lists.value = res.data
  } catch {
    lists.value = []
  }
}

const goEdit = (id) => {
  router.push(`/schedule/${id}`)
}

const remove = async (id) => {
  if (!confirm('삭제하시겠습니까?')) return
  await deleteSchedule(id)
  load()
}

const isAdmin = ref(false)
onMounted(() => {
  isAdmin.value = localStorage.getItem('isAdmin') === 'true'
  load()
})

const goLogin = () => {
  router.push('/login')
}

const logout = () => {
  localStorage.removeItem('isAdmin')
  isAdmin.value = false
}

const formatYYMMDD = (val) => {
  if (!val) return ''
  const s = String(val)
  if (s.length !== 6) return val
  return `${s.substring(0,2)}.${s.substring(2,4)}.${s.substring(4,6)}`
}

const toDate = (val) => {
  if (!val) return new Date(0)
  const s = String(val)
  if (/^\d{6}$/.test(s)) {
    const yy = parseInt(s.slice(0, 2), 10)
    const fullYear = yy >= 70 ? 1900 + yy : 2000 + yy
    const mm = parseInt(s.slice(2, 4), 10) - 1
    const dd = parseInt(s.slice(4, 6), 10)
    return new Date(fullYear, mm, dd)
  }
  const d = new Date(val)
  return isNaN(d) ? new Date(0) : d
}

const renderParticipants = (arr = []) => {
  return arr.map(p => p.name).join(', ')
}

const filtered = computed(() => {
  const q = searchName.value.trim().toLowerCase()
  if (!q) return lists.value
  return lists.value.filter(item =>
    (item.participants || []).some(p => (p.name || '').toLowerCase().includes(q))
  )
})
const totalCount = computed(() => filtered.value.length)

const sorted = computed(() => {
  return [...filtered.value].sort((a, b) => toDate(b.date) - toDate(a.date))
})
const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize)))
const pages = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const pagedLists = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sorted.value.slice(start, start + pageSize)
})

const goPage = (p) => {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}
const prevPage = () => goPage(currentPage.value - 1)
const nextPage = () => goPage(currentPage.value + 1)

watch(filtered, () => {
  currentPage.value = 1
})

const participantsActive = ref({})
const toggleParticipants = (id) => {
  participantsActive.value[id] = !participantsActive.value[id]
}
const isParticipantsActive = (id) => {
  return !!participantsActive.value[id]
}
</script>
