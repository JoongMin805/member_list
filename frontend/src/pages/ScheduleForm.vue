<template>
  <div>
    <h1>{{ isEdit ? "수정" : "등록" }}</h1>

    <form @submit.prevent="submit">
      <span class="frm">
        <input type="text" v-model="form.title" placeholder="제목" />
      </span>
      <span class="frm">
        <VueDatePicker v-model="form.date" placeholder="날짜(YYMMDD)" :auto-apply="true" :enable-time-picker="false" :formats="{ input: 'yyMMdd' }"/>
      </span>

      <div class="schedule_info-wrap">
        <h3>참여 회원 선택</h3>
        <div v-if="members.length">
          <span class="frm-checkbox" v-for="m in members" :key="m._id">
            <input :id="`choice_${m._id}`" type="checkbox" :value="m._id" v-model="selectedIds" /><label :for="`choice_${m._id}`">{{ m.member_name }}</label>
          </span>
        </div>
        <div class="no_data" v-else>
          <p>회원 목록을 불러오는 중이거나 없습니다.</p>
        </div>

        <div class="btn_confirm-area">
          <button type="button" @click="confirmSelection">확인</button>
          <button type="button" @click="clearSelection">선택 해제</button>
        </div>

        <div class="schedule_member-info">
          <strong>선택된 참여자:</strong>
          <span>{{ participantsPreview }}</span>
        </div>
      </div>

      <div class="btm_btn-area">
        <button type="submit" :disabled="loading">{{ isEdit ? "수정" : "등록" }}</button>
        <button type="button" @click="$router.push('/schedule')">취소</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMembers } from '@/api/members'
import { getSchedule, createSchedule, updateSchedule } from '@/api/schedules'
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const loading = ref(false)

const form = reactive({
  title: '',
  date: '',
  participants: [] // [{id, name}]
})

const members = ref([])
const selectedIds = ref([])

const loadMembers = async () => {
  const res = await getMembers()
  members.value = res.data
}

const loadSchedule = async () => {
  if (!isEdit.value) return
  const res = await getSchedule(route.params.id)
  form.title = res.data.title || ''
  form.date = res.data.date || ''
  form.participants = Array.isArray(res.data.participants) ? res.data.participants : []
  const existingIds = form.participants.map(p => p.id).filter(Boolean)
  selectedIds.value = existingIds
}

onMounted(async () => {
  await loadMembers()
  await loadSchedule()
})

const ensureParticipantsFromSelection = () => {
  const mapById = new Map(members.value.map(m => [m._id, m.member_name]))
  const toYYMMDD = (val) => {
    if (!val) return ''
    if (typeof val === 'string') {
      if (/^\d{6}$/.test(val)) return val
      const d = new Date(val)
      if (isNaN(d)) return ''
      const yy = String(d.getFullYear()).slice(2)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yy}${mm}${dd}`
    }
    if (val instanceof Date) {
      const yy = String(val.getFullYear()).slice(2)
      const mm = String(val.getMonth() + 1).padStart(2, '0')
      const dd = String(val.getDate()).padStart(2, '0')
      return `${yy}${mm}${dd}`
    }
    return ''
  }
  form.participants = selectedIds.value.map(id => ({
    id,
    name: mapById.get(id) || '',
    date: toYYMMDD(form.date)
  }))
}

const confirmSelection = () => {
  const mapById = new Map(members.value.map(m => [m._id, m.member_name]))
  const toYYMMDD = (val) => {
    if (!val) return ''
    if (typeof val === 'string') {
      if (/^\d{6}$/.test(val)) return val
      const d = new Date(val)
      if (isNaN(d)) return ''
      const yy = String(d.getFullYear()).slice(2)
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yy}${mm}${dd}`
    }
    if (val instanceof Date) {
      const yy = String(val.getFullYear()).slice(2)
      const mm = String(val.getMonth() + 1).padStart(2, '0')
      const dd = String(val.getDate()).padStart(2, '0')
      return `${yy}${mm}${dd}`
    }
    return ''
  }
  form.participants = selectedIds.value.map(id => ({
    id,
    name: mapById.get(id) || '',
    date: toYYMMDD(form.date)
  }))
}

const clearSelection = () => {
  selectedIds.value = []
  form.participants = []
}

const participantsPreview = computed(() => form.participants.map(p => p.name).join(', '))

const submit = async () => {
  loading.value = true
  try {
    if (!String(form.title || '').trim()) {
      alert('제목을 입력하세요')
      loading.value = false
      return
    }
    if (!form.participants.length && selectedIds.value.length) {
      ensureParticipantsFromSelection()
    }
    if (form.participants.some(p => !String(p.name || '').trim())) {
      alert('선택된 참여자의 이름 정보가 없습니다. 확인 후 다시 시도하세요.')
      loading.value = false
      return
    }
    const toYYMMDD = (val) => {
      if (!val) return ''
      if (typeof val === 'string') {
        if (/^\d{6}$/.test(val)) return val
        const d = new Date(val)
        if (isNaN(d)) return ''
        const yy = String(d.getFullYear()).slice(2)
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yy}${mm}${dd}`
      }
      if (val instanceof Date) {
        const yy = String(val.getFullYear()).slice(2)
        const mm = String(val.getMonth() + 1).padStart(2, '0')
        const dd = String(val.getDate()).padStart(2, '0')
        return `${yy}${mm}${dd}`
      }
      return ''
    }
    const payload = { ...form, date: toYYMMDD(form.date) }
    if (isEdit.value) await updateSchedule(route.params.id, payload)
    else await createSchedule(payload)
    alert(isEdit.value ? '수정완료' : '등록완료')
    router.push('/schedule')
  } catch (err) {
    console.error(err)
    alert('등록/수정 중 오류 발생: ' + err.message)
  } finally {
    loading.value = false
  }
}
</script>
