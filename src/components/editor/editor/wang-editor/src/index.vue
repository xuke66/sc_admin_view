<script setup lang="ts">
import type { WangEditorEmits, WangEditorProp } from "./types";
import { computed, onMounted, ref } from "vue";
import { useNamespace } from "@/composables";

defineOptions({ name: "WangEditor" });

const ns = useNamespace("wang-editor");

const props = withDefaults(defineProps<WangEditorProp>(), {
  toolbarKeys: () => [],
  excludeKeys: () => [],
  height: "400px",
  mode: "default",
  disabled: false,
  hideToolBar: false,
  placeholder: "请输入内容...",
  uploadConfig: () => ({}),
});

const emits = defineEmits<WangEditorEmits>();
const content = defineModel<string>({ default: "" });
const textareaRef = ref<HTMLTextAreaElement>();

const editorStyle = computed(() => ({
  height: typeof props.height === "string" ? props.height : `${props.height}px`,
}));

const editorExpose = {
  disable: () => undefined,
  enable: () => undefined,
  destroy: () => undefined,
  setHtml: (html: string) => (content.value = html),
  getHtml: () => content.value,
  clear: () => (content.value = ""),
  focus: () => textareaRef.value?.focus(),
};

onMounted(() => {
  emits("onCreated", editorExpose);
});

defineExpose({
  editor: editorExpose,
  setHtml: editorExpose.setHtml,
  getHtml: editorExpose.getHtml,
  clear: editorExpose.clear,
  focus: editorExpose.focus,
});
</script>

<template>
  <div :class="[ns.b(), ns.is('disabled', disabled), 'wang-editor-fallback']">
    <div v-if="!hideToolBar" :class="ns.e('toolbar')" class="fallback-toolbar"></div>
    <textarea
      ref="textareaRef"
      :class="ns.e('content')"
      :style="editorStyle"
      v-model="content"
      :disabled="disabled"
      :placeholder="placeholder"
      v-bind="$attrs"
    />
  </div>
</template>

<style lang="scss">
@use "./index";

.wang-editor-fallback {
  .fallback-toolbar {
    min-height: 0;
    border-bottom: none;
  }

  textarea {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    box-sizing: border-box;
    resize: vertical;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    outline: none;
    color: var(--el-text-color-primary);
    background: var(--el-bg-color);
    font: inherit;
    line-height: 1.6;
  }
}
</style>
