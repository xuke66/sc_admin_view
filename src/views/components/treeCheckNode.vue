<template>
	<div class="tree-node" :class="{ 'has-children': hasChildren, 'is-leaf': !hasChildren }">
		<el-checkbox :model-value="isChecked(node)" :indeterminate="isIndeterminate(node)" @change="handleChange">
			{{ node.title }}
		</el-checkbox>

		<div v-if="hasChildren" class="children-wrap flat-layout">
			<TreeCheckNode v-for="child in node.children" :key="child.id" :node="child" :is-checked="isChecked" :is-indeterminate="isIndeterminate" @toggle="handleChildToggle" />
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { computed } from "vue";
import type { TreeCheckItem } from "./treeCheck.vue";

defineOptions({
	name: "TreeCheckNode",
});

const props = defineProps({
	node: {
		type: Object as PropType<TreeCheckItem>,
		required: true,
	},
	isChecked: {
		type: Function as PropType<(node: TreeCheckItem) => boolean>,
		required: true,
	},
	isIndeterminate: {
		type: Function as PropType<(node: TreeCheckItem) => boolean>,
		required: true,
	},
});

const emit = defineEmits<{
	(e: "toggle", node: TreeCheckItem, checked: boolean): void;
}>();

const hasChildren = computed(() => !!props.node.children?.length);

const handleChange = (checked: boolean) => {
	emit("toggle", props.node, checked);
};

const handleChildToggle = (node: TreeCheckItem, checked: boolean) => {
	emit("toggle", node, checked);
};
</script>

<style scoped>
.tree-node {
	width: 100%;
}

.tree-node.has-children {
	width: 100%;
}

.tree-node.is-leaf {
	flex: 0 0 calc(25% - 15px);
}

.children-wrap {
	padding-left: 28px;
	margin-top: 8px;
}

.flat-layout {
	display: flex;
	flex-wrap: wrap;
	gap: 10px 20px;
	align-items: flex-start;
}

@media (max-width: 1200px) {
	.tree-node.is-leaf {
		flex-basis: calc(25% - 14px);
	}
}

@media (max-width: 900px) {
	.tree-node.is-leaf {
		flex-basis: calc(25% - 10px);
	}
}

@media (max-width: 640px) {
	.tree-node.is-leaf {
		flex-basis: 100%;
	}
}
</style>
