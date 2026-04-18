<template>
	<div class="page">
		<el-card shadow="never">
			<template #header>
				<div class="header">
					<div>
						<div class="title">商品服务</div>
						<div class="subtitle">管理商品服务标签，并提供商品新增页可复用的弹窗管理组件。</div>
					</div>
					<el-button @click="dialogVisible = true">预览弹窗组件</el-button>
				</div>
			</template>

			<GoodsServicePanel />
		</el-card>

		<GoodsServiceManagerDialog
			v-model="dialogVisible"
			v-model:selected-ids="selectedIds"
			@confirm="handleConfirm"
		/>
	</div>
</template>

<script setup lang="ts" name="ShopGoodsService">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import GoodsServiceManagerDialog from "@/views/shop/components/GoodsServiceManagerDialog.vue";
import GoodsServicePanel from "@/views/shop/components/GoodsServicePanel.vue";

type GoodsServiceItem = {
	id: number;
	name: string;
};

const dialogVisible = ref(false);
const selectedIds = ref<number[]>([]);

const handleConfirm = (items: GoodsServiceItem[]) => {
	selectedIds.value = items.map(item => item.id);
	ElMessage.success(`已选择 ${items.length} 项服务`);
};
</script>

<style scoped lang="scss">
.page {
	display: grid;
	gap: 16px;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
}

.title {
	font-size: 16px;
	font-weight: 600;
}

.subtitle {
	margin-top: 4px;
	font-size: 13px;
	color: var(--el-text-color-secondary);
}
</style>
