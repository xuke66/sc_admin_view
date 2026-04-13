<template>
	<div v-if="data.length" class="flat-tree-check">
		<TreeCheckNode
			v-for="item in data"
			:key="item.id"
			:node="item"
			:is-checked="isChecked"
			:is-indeterminate="isIndeterminate"
			@toggle="handleToggle"
		/>
	</div>
	<div v-else class="tree-check-empty">暂无权限数据</div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { computed } from "vue";
import TreeCheckNode from "./treeCheckNode.vue";

export type TreeCheckItem = {
	id: number;
	pid: number;
	title: string;
	children?: TreeCheckItem[];
};

const props = defineProps({
	data: {
		type: Array as PropType<TreeCheckItem[]>,
		default: () => [],
	},
	modelValue: {
		type: Array as PropType<number[]>,
		default: () => [],
	},
});

const emit = defineEmits<{
	(e: "update:modelValue", value: number[]): void;
}>();

const selectedSet = computed(() => new Set(props.modelValue));

const nodeMap = computed(() => {
	const map = new Map<number, TreeCheckItem>();
	const walk = (list: TreeCheckItem[]) => {
		list.forEach(item => {
			map.set(item.id, item);
			if (item.children?.length) walk(item.children);
		});
	};
	walk(props.data);
	return map;
});

const getDescendantIds = (node: TreeCheckItem): number[] => {
	const ids: number[] = [];
	(node.children || []).forEach(child => {
		ids.push(child.id);
		ids.push(...getDescendantIds(child));
	});
	return ids;
};

const getSubtreeIds = (node: TreeCheckItem) => [node.id, ...getDescendantIds(node)];

const hasAnyCheckedDescendant = (node: TreeCheckItem): boolean => {
	return (node.children || []).some(child => hasAnyChecked(child));
};

const hasAnyChecked = (node: TreeCheckItem): boolean => {
	if (selectedSet.value.has(node.id)) return true;
	return hasAnyCheckedDescendant(node);
};

const isChecked = (node: TreeCheckItem) => {
	if (!node.children?.length) return selectedSet.value.has(node.id);
	return node.children.every(child => isChecked(child));
};

const isIndeterminate = (node: TreeCheckItem) => {
	if (!node.children?.length) return false;

	if (isChecked(node)) return false;
	return node.children.some(child => isChecked(child) || isIndeterminate(child) || hasAnyChecked(child));
};

const hasAnyCheckedInNext = (node: TreeCheckItem, next: Set<number>): boolean => {
	if (next.has(node.id)) return true;
	return (node.children || []).some(child => hasAnyCheckedInNext(child, next));
};

const isFullyCheckedInNext = (node: TreeCheckItem, next: Set<number>): boolean => {
	if (!node.children?.length) return next.has(node.id);
	return node.children.every(child => isFullyCheckedInNext(child, next));
};

const syncParentState = (pid: number, next: Set<number>) => {
	if (!pid) return;

	const parent = nodeMap.value.get(pid);
	if (!parent) return;

	if (isFullyCheckedInNext(parent, next)) next.add(parent.id);
	else next.delete(parent.id);

	syncParentState(parent.pid, next);
};

const handleToggle = (node: TreeCheckItem, checked: boolean) => {
	const next = new Set(props.modelValue);

	getSubtreeIds(node).forEach(id => {
		if (checked) next.add(id);
		else next.delete(id);
	});

	syncParentState(node.pid, next);

	const normalizedIds: number[] = [];
	const collectIds = (list: TreeCheckItem[]) => {
		list.forEach(item => {
			if (hasAnyCheckedInNext(item, next)) normalizedIds.push(item.id);
			if (item.children?.length) collectIds(item.children);
		});
	};

	collectIds(props.data);
	emit("update:modelValue", normalizedIds);
};
</script>

<style scoped>
.flat-tree-check {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 4px 0;
}

.tree-check-empty {
	padding: 10px 0;
	color: var(--el-text-color-secondary);
}
</style>
