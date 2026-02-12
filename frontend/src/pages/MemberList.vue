<template>
  <div :class="{ login: isAdmin}">
    <div class="admin_login-area">
      <button v-if="!isAdmin" @click="goLogin">로그인</button>
      <button v-else @click="logout">로그아웃</button>
    </div>

    <ul class="tab-list">
      <li><button class="tab-item list active">Members</button></li>
      <li><button class="tab-item member" @click="goGatherList">Schedule</button></li>
    </ul>
    
    <div class="member_list-wrap">
      <div class="sort-wrap">
        <div class="sort_btn-area">
          <button class="btn1" @click="sortByAttend">{{ isAttendSorted ? '정렬 해제' : '참여도 정렬' }}</button>
          <button class="btn2" @click="toggleBirthFilter">{{ isBirthFiltered ? '전체 보기' : '이번 달 생일' }}</button>
          <button class="btn3" @click="sortByName">이름정렬</button>
        </div>
        <div class="gender_sort-area">
          <span class="frm-radio">
            <input type="radio" id="total_gender" name="gender" value="total" v-model="selectedGender"><label for="total_gender">전체</label>
          </span>
          <span class="frm-radio">
            <input type="radio" id="gender_man" name="gender" value="man" v-model="selectedGender"><label for="gender_man">남자</label>
          </span>
          <span class="frm-radio">
            <input type="radio" id="gender_woman" name="gender" value="woman" v-model="selectedGender"><label for="gender_woman">여자</label>
          </span>
        </div>
        <span class="selectBox">
          <select name="birthYear" v-model="selectedBirthYear" @change="filterByBirthYear">
            <option value="total">전체</option>
            <option value="97">97</option>
            <option value="96">96</option>
            <option value="95">95</option>
            <option value="94">94</option>
            <option value="93">93</option>
            <option value="92">92</option>
            <option value="91">91</option>
            <option value="90">90</option>
            <option value="89">89</option>
            <option value="88">88</option>
            <option value="87">87</option>
            <option value="86">86</option>
            <option value="85">85</option>
          </select>
        </span>
        <span class="selectBox">
          <select id="period" v-model="selectedPeriod">
            <option value="total">total</option>
            <option value="7">7일</option>
            <option value="15">15일</option>
          </select>
        </span>
      </div>

      <div class="total-count-area">
        총 <span class="total-count">{{ displayedMembers.length }}</span> 명
      </div>

      <ul class="member-list" v-if="pagedMembers.length">
        <li v-for="member in pagedMembers" :key="member._id">
          <div class="user_info-area">
            <div class="info">
              <a v-if="isAdmin" @click.prevent="goEdit(member._id)">{{ member.member_name }}</a>
              <span v-else>{{ member.member_name }}</span>
            </div>
            <div class="info"><span class="addr">{{ member.addr }}</span></div>
            <div class="info"><span class="gender">{{ member.gender }}</span></div>
            <div class="info" :class="{ birth: isBirthThisMonth(member.birth) }">
              <span>
                {{ formatYYMMDD(member.birth) }}
              </span>
            </div>
            <div class="info"><span>{{ member.manage }}</span></div>
            <div class="info">
              <span class="regdate" :class="{ new: isNew(member.regist_date) }">{{ formatYYMMDD(member.regist_date) }}</span>
            </div>
            <div class="info"><span class="dday">{{ getDday(member) }}</span></div>
            <div class="info"><span>{{ member.attend }}</span></div>
            <div class="info">
              <span class="participaion-cnt">{{ getTotalParticipation(member._id) }}</span>
              <div>
                <table class="month-check">
                  <tbody>
                    <tr>
                      <td
                        v-for="mon in 12"
                        :key="mon"
                        class="month-cnt"
                        :data-month="String(mon).padStart(2, '0')"
                      >
                        {{ getMonthValue(member, mon) }}
                      </td>
                    </tr>
                  </tbody>  
                </table>   
              </div>
            </div>
            <div class="info"><span>{{ member.new_check }}</span></div>
            <div class="info"><span>{{ member.phone }}</span></div>
            <div class="user_del-area" v-if="isAdmin">
              <button @click="remove(member._id)">삭제</button>
            </div>
          </div>
        </li>
      </ul>
      <div class="no_data" v-else>
        <p>등록된 회원이 없습니다.</p>
      </div>

      <div v-if="isAdmin" class="btn_reg-area">
        <button @click="$router.push('/members/new')">등록</button>
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
import { getMembers, deleteMember } from '@/api/members'
import { getSchedules } from '@/api/schedules'
import { useRouter } from 'vue-router'

const router = useRouter()
const members = ref([])
const isAttendSorted = ref(false)
const originMembers = ref([])
const selectedBirthYear = ref('total')
const selectedPeriod = ref('total')
const selectedGender = ref('total')
const schedule = ref([])
const pageSize = 10
const currentPage = ref(1)


const load = async () => {
  try {
    const resMembers = await getMembers()
    members.value = resMembers.data
    originMembers.value = [...resMembers.data]
  } catch {}
  try {
    const resSchedule = await getSchedules()
    schedule.value = resSchedule.data
  } catch {
    schedule.value = []
  }
}

const goEdit = (id) => {
  router.push(`/members/${id}`)
}

const remove = async (id) => {
  if (!confirm('삭제하시겠습니까?')) return
  await deleteMember(id)
  load()
}

const isAdmin = ref(false)

onMounted(() => {
  isAdmin.value = localStorage.getItem('isAdmin') === 'true'
})

const goLogin = () => {
  router.push('/login')
}

const goGatherList = () => {
  router.push('/schedule')
}

const logout = () => {
  localStorage.removeItem('isAdmin')
  isAdmin.value = false
}

const isBirthThisMonth = (birth) => {
  if (!birth) return false

  // birth: YYMMDD or YYYYMMDD
  const birthMonth =
    birth.length === 6
      ? birth.substring(2, 4)   // YYMMDD
      : birth.substring(4, 6)   // YYYYMMDD

  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0')

  return birthMonth === currentMonth
}

const monthlyCounts = computed(() => {
  const map = new Map()
  for (const g of schedule.value) {
    const baseDate = g.date
    const arr = g.participants || []
    for (const p of arr) {
      const d = parseYYMMDD(p.date || baseDate)
      if (!d) continue
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const id = p.id
      const rec = map.get(id) || {}
      rec[mm] = (rec[mm] || 0) + 1
      map.set(id, rec)
    }
  }
  return map
})
const getMonthValue = (member, mon) => {
  const key = String(mon).padStart(2, '0')
  const rec = monthlyCounts.value.get(member._id)
  return (rec && rec[key]) ? rec[key] : 0
}

const formatYYMMDD = (value) => {
  if (!value) return ''

  // 이미 YYMMDD면 그대로
  if (/^\d{6}$/.test(value)) return value

  const d = new Date(value)
  if (isNaN(d)) return value

  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}${mm}${dd}`
}

const isNew = (value) => {
  if (!value) return false
  let d
  if (/^\d{6}$/.test(value)) {
    const yy = parseInt(value.slice(0, 2), 10)
    const fullYear = yy >= 70 ? 1900 + yy : 2000 + yy
    const mm = parseInt(value.slice(2, 4), 10) - 1
    const dd = parseInt(value.slice(4, 6), 10)
    d = new Date(fullYear, mm, dd)
  } else {
    d = new Date(value)
  }
  if (isNaN(d)) return false
  const now = new Date()
  const diffMs = now - d
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000
  return diffMs >= 0 && diffMs <= oneMonthMs
}

const parseYYMMDD = (value) => {
  if (!value) return null
  if (/^\d{6}$/.test(value)) {
    const yy = parseInt(value.slice(0, 2), 10)
    const fullYear = yy >= 70 ? 1900 + yy : 2000 + yy
    const mm = parseInt(value.slice(2, 4), 10) - 1
    const dd = parseInt(value.slice(4, 6), 10)
    return new Date(fullYear, mm, dd)
  }
  const d = new Date(value)
  return isNaN(d) ? null : d
}

const latestGatherDateFor = (memberId) => {
  let latest = null
  for (const g of schedule.value) {
    const found = (g.participants || []).find(p => p.id === memberId)
    if (found) {
      const pd = parseYYMMDD(found.date || g.date)
      if (!pd) continue
      if (!latest || pd > latest) latest = pd
    }
  }
  return latest
}

const getGatherDday = (memberId) => {
  const d = latestGatherDateFor(memberId)
  if (!d) return ''
  const target = new Date(d.getTime() + 30 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const diffDays = Math.ceil((target - now) / (24 * 60 * 60 * 1000))
  if (diffDays <= 0) return 'D-0'
  return `D-${diffDays}`
}
const getDday = (member) => {
  const latest = latestGatherDateFor(member._id)
  if (latest) {
    const target = new Date(latest.getTime() + 30 * 24 * 60 * 60 * 1000)
    const now = new Date()
    const diff = Math.ceil((target - now) / (24 * 60 * 60 * 1000))
    return diff <= 0 ? 'D-0' : `D-${diff}`
  }
  const reg = parseYYMMDD(member.regist_date)
  if (!reg) return ''
  const now = new Date()
  const diff = Math.floor((now - reg) / (24 * 60 * 60 * 1000))
  return diff >= 0 ? `D+${diff}` : `D-${Math.abs(diff)}`
}
const getTotalParticipation = (memberId) => {
  const rec = monthlyCounts.value.get(memberId)
  if (!rec) return 0
  return Object.values(rec).reduce((sum, n) => sum + (n || 0), 0)
}
const isNameAsc = ref(true)
const sortByName = () => {
  const dir = isNameAsc.value ? 1 : -1
  members.value = [...members.value].sort((a, b) => {
    const an = a.member_name || ''
    const bn = b.member_name || ''
    return an.localeCompare(bn, 'ko') * dir
  })
  isNameAsc.value = !isNameAsc.value
  currentPage.value = 1
}
const getGatherDaysLeft = (memberId) => {
  const d = latestGatherDateFor(memberId)
  if (!d) return null
  const target = new Date(d.getTime() + 30 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const diffDays = Math.ceil((target - now) / (24 * 60 * 60 * 1000))
  return Math.max(diffDays, 0)
}
const normalize = (v) => String(v || '').toLowerCase()
const isManGender = (v) => {
  const n = normalize(v)
  return n === 'man' || n === 'm' || n.startsWith('남')
}
const isWomanGender = (v) => {
  const n = normalize(v)
  return n === 'woman' || n === 'w' || n.startsWith('여')
}
const displayedMembers = computed(() => {
  let list = members.value
  if (selectedGender.value === 'man') {
    list = list.filter(m => isManGender(m.gender))
  } else if (selectedGender.value === 'woman') {
    list = list.filter(m => isWomanGender(m.gender))
  }
  const val = selectedPeriod.value
  if (val === 'total') return list
  const limit = Number(val)
  return list.filter(m => {
    const days = getGatherDaysLeft(m._id)
    if (days === null) return false
    if (limit === 15) return days <= 15 && days >= 8
    return days <= limit
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(displayedMembers.value.length / pageSize)))
const pages = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const pagedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return displayedMembers.value.slice(start, start + pageSize)
})
const sortByAttend = () => {
  if (!isAttendSorted.value) {
    members.value = [...members.value].sort((a, b) => {
      const ac = getTotalParticipation(a._id)
      const bc = getTotalParticipation(b._id)
      if (bc !== ac) return bc - ac
      const an = a.member_name || ''
      const bn = b.member_name || ''
      return an.localeCompare(bn, 'ko')
    })
  } else {
    members.value = [...originMembers.value]
  }

  isAttendSorted.value = !isAttendSorted.value
  currentPage.value = 1
}

const isBirthFiltered = ref(false)

const toggleBirthFilter = () => {
  if (!isBirthFiltered.value) {
    // 👉 이번 달 생일만 필터
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0')

    members.value = originMembers.value.filter(member => {
      if (!member.birth) return false

      const birthMonth =
        member.birth.length === 6
          ? member.birth.substring(2, 4)
          : member.birth.substring(4, 6)

      return birthMonth === currentMonth
    })
  } else {
    // 👉 다시 전체 목록으로 복구
    members.value = [...originMembers.value]
  }

  isBirthFiltered.value = !isBirthFiltered.value
  currentPage.value = 1
}

const filterByBirthYear = () => {
  // 👉 전체 선택
  if (selectedBirthYear.value === 'total') {
    members.value = [...originMembers.value]
    return
  }

  // 👉 연도 필터
  members.value = originMembers.value.filter(member => {
    if (!member.birth) return false

    // YYMMDD / YYYYMMDD 둘 다 대응
    const birthYear =
      member.birth.length === 6
        ? member.birth.substring(0, 2)
        : member.birth.substring(2, 4)

    return birthYear === selectedBirthYear.value
  })
}

const goPage = (p) => {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}
const prevPage = () => goPage(currentPage.value - 1)
const nextPage = () => goPage(currentPage.value + 1)

watch([displayedMembers], () => {
  currentPage.value = 1
})

onMounted(load)
</script>
