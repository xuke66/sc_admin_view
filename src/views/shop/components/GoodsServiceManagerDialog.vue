<template>
	<el-dialog v-model="visible" title="商品服务管理" width="1180px" destroy-on-close>
		<GoodsServicePanel
			v-if="visible"
			v-model="selectedIds"
			:selectable="selectable"
			@confirm="handleConfirm"
			@changed="items => emit('changed', items)"
		/>
		<template #footer>
			<el-button @click="visible = false">关闭</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GoodsServicePanel from "./GoodsServicePanel.vue";

type GoodsServiceItem = {
	id: number;
	name: string;
	image?: string;
	description?: string;
};

const props = withDefaults(
	defineProps<{
		modelValue: boolean;
		selectable?: boolean;
		selectedIds?: number[];
	}>(),
	{
		selectable: true,
		selectedIds: () => [],
	},
);

const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void;
	(e: "update:selectedIds", value: number[]): void;
	(e: "confirm", value: GoodsServiceItem[]): void;
	(e: "changed", value: GoodsServiceItem[]): void;
}>();

const visible = computed({
	get: () => props.modelValue,
	set: value => emit("update:modelValue", value),
});

const selectedIds = computed({
	get: () => props.selectedIds,
	set: value => emit("update:selectedIds", value),
});

const handleConfirm = (items: GoodsServiceItem[]) => {
	emit("confirm", items);
	if (props.selectable) visible.value = false;
};
</script>
