<script setup lang="ts" name="LoginForm">
import type { FormInstance } from "element-plus";
import { ElNotification } from "element-plus";
import { ref, reactive, useTemplateRef } from "vue";
import { useRouter, useRoute } from "vue-router";
import { User, Lock, UserFilled } from "@element-plus/icons-vue";
import { serviceConfig, HOME_URL } from "@/common/config";
import { useNamespace } from "@/composables";
import { useUserStore } from "@/pinia";

interface LoginForm {
  username: string;
  password: string;
  verifyCode: string;
}

const ns = useNamespace("login-form");

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  verifyCode: [
    {
      validator: (_: any, value: string, callback: (e?: Error) => void) => {
        if (value === "") {
          callback(new Error("请输入验证码"));
        } else if (imgCode.value !== value) {
          callback(new Error("请输入正确的验证码"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};
const loginFormRef = useTemplateRef<FormInstance>("loginFormRef");

const imgCode = ref("");
const loading = ref(false);
const loginForm = reactive<LoginForm>({ username: "", password: "", verifyCode: "" });

const login = () => {
  loginFormRef.value?.validate(async valid => {
    if (!valid) return;
    loading.value = true;
    try {
      // 执行登录
      const result = await userStore.login({ ...loginForm });
      if (!result) {
        return;
      }

      // 跳转到首页或者 URL 携带的 redirect 页（优先级高）
      let path = HOME_URL;
      const { query } = route;

      if (query.redirect) path = query.redirect as string;

      const otherQuery = getOtherQuery(query);
      // otherQuery 不能是 {}，否则无法跳转
      if (Object.keys(otherQuery).length === 0) router.push(path);
      else router.push({ path, query: otherQuery });

      ElNotification.success({
        title: `欢迎登录 ${result.data.nickname}`,
        message: "",
        duration: 3000,
      });
    } finally {
      loading.value = false;
    }
  });
};

const getOtherQuery = (query: any) => {
  return Object.keys(query).reduce((acc: any, cur) => {
    if (cur !== "redirect") acc[cur] = query[cur];
    return acc;
  }, {});
};


</script>

<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large" :class="ns.b()">
    <el-form-item prop="username">
      <el-input
        v-model="loginForm.username"
        placeholder="用户名（任意）"
        :prefix-icon="User"
        @keydown.enter="login"
      ></el-input>
    </el-form-item>

    <el-form-item prop="password">
      <el-input
        type="password"
        v-model="loginForm.password"
        placeholder="密码"
        show-password
        autocomplete="new-password"
        :prefix-icon="Lock"
        @keydown.enter="login"
      ></el-input>
    </el-form-item>

    <el-form-item>
      <div :class="ns.e('btn')" class="flx-align-center">
        <el-button
          :icon="UserFilled"
          round
          @click="login()"
          size="large"
          type="primary"
          :loading="loading"
          style="width: 100%"
        >
          登录
        </el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
@use "./loginForm";
</style>
