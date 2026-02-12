import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '@/pages/Login.vue'
import MemberList from '@/pages/MemberList.vue'
import MemberForm from '@/pages/MemberForm.vue'
import ScheduleList from '@/pages/ScheduleList.vue'
import ScheduleForm from '@/pages/ScheduleForm.vue'

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/member_list' },
    { path: '/login', component: Login },
    { path: '/member_list', component: MemberList },
    { path: '/members/new', component: MemberForm },
    { path: '/members/:id', component: MemberForm, props: true },
    { path: '/schedule', component: ScheduleList },
    { path: '/schedule/new', component: ScheduleForm },
    { path: '/schedule/:id', component: ScheduleForm, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/member_list' }
  ]
})
