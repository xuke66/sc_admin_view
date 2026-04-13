<script setup lang="ts" name="Login">
import type { Component } from "vue";
import { ref } from "vue";
import { serviceConfig } from "@/common/config";
import { SwitchDark } from "@/components";
import { useNamespace } from "@/composables";
import LoginForm from "./loginForm.vue";

const ns = useNamespace("login");

const formComponents: Record<string, Component> = {
  login: LoginForm,
};

const formMode = ref("login");
</script>

<template>
  <div :class="ns.b()">
    <SwitchDark :class="ns.e('dark')" />
    <div :class="ns.e('wrapper')">
      <div :class="ns.e('left')">
        <img src="@/common/assets/images/login/login_left.png" alt="login" />
      </div>

      <div :class="ns.e('right')">
        <div :class="ns.e('right__header')" class="flx-center">
          <img :src="serviceConfig.logo.source" alt="" />
          <h2 class="title">{{ serviceConfig.layout.name }}</h2>
        </div>

        <component :is="formComponents[formMode]" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "./index";
</style>
