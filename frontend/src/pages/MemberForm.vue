<template>
  <div>
    <h1 class="tit">{{ isEdit ? "수정" : "등록" }}</h1>

    <form @submit.prevent="submit">
      <span class="frm">
        <input type="text" v-model="form.member_name" placeholder="이름" />
      </span>
      <span class="frm">
        <input type="text" v-model="form.addr" placeholder="거주지" />
      </span>
      <div class="radio-area">
        <span class="frm-radio"><input type="radio" id="gender_m" name="gender" v-model="form.gender" value="man"><label for="gender_m">남</label></span>
        <span class="frm-radio"><input type="radio" id="gender_w" name="gender" v-model="form.gender" value="woman"><label for="gender_w">여</label></span>
      </div>
      <span class="frm">
        <VueDatePicker v-model="form.birth" placeholder="생년월일(YYMMDD)" :auto-apply="true" :enable-time-picker="false" :formats="{ input: 'yyMMdd' }" maxlength="6"/>
      </span>
      <div class="datepicker">
        <VueDatePicker v-model="form.regist_date" placeholder="가입일(YYMMDD)" :auto-apply="true" :enable-time-picker="false" :formats="{ input: 'yyMMdd' }" />
      </div>
      <div class="manage">
        <span class="frm-checkbox">
          <input v-model="form.manage" type="checkbox" id="manage" />
          <label for="manage">운영진</label>
        </span>
      </div>
      <div class="btn-area">
        <button type="submit" :disabled="loading">{{ isEdit ? "수정" : "등록" }}</button>
        <button type="button" @click="$router.push('/member_list/')">취소</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getMember, createMember, updateMember } from "@/api/members";
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);

const defaultMonth = {"01": 0, "02": 0, "03": 0, "04": 0, "05": 0, "06": 0, "07": 0, "08": 0, "09": 0, "10": 0, "11": 0, "12": 0}

const form = reactive({
  member_name: "",
  participation: "",
  month: { ...defaultMonth }, 
  birth: "",
  regist_date: "",
  manage: false,
  gender: "",
  addr: "",
});

onMounted(async () => {
  if (isEdit.value) {
    try {
        const res = await getMember(route.params.id);
        form.member_name = res.data.member_name || "";
        form.participation = res.data.participation || "";
        form.birth = res.data.birth || "";
        form.regist_date = res.data.regist_date || "";
        form.manage = res.data.manage === true;     
        form.gender = res.data.gender || "";
        form.addr = res.data.addr || "";

        form.month = {
          ...defaultMonth,
          ...(res.data.month || {})
        }
    } catch (err) {
      console.error(err);
      console.log("회원 정보를 불러오는 중 오류 발생");
      // router.push("/member_list/");
    }
  }
});

const submit = async () => {
  loading.value = true;
  try {
    const payload = { ...form, manage: form.manage ? "Y" : "" };
    console.log("전송 데이터:", payload);

    if (isEdit.value) await updateMember(route.params.id, payload);
    else await createMember(payload);

    alert(isEdit.value ? "회원 수정 완료" : "회원 등록 완료");
    router.push("/member_list/");
  } catch (err) {
    console.error("API 오류:", err);
    alert("등록/수정 중 오류 발생: " + err.message);
  } finally {
    loading.value = false;
  }
};

const getCurrentMonth = () =>
  String(new Date().getMonth() + 1).padStart(2, "0")
</script>
