<template>
	<div class="goods-service-panel">
		<div class="toolbar">
			<el-form inline :model="filters">
				<el-form-item label="关键词">
					<el-input v-model="filters.keywords" clearable placeholder="搜索服务名称/描述" style="width: 240px" @keyup.enter="loadGoodsServices" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="loadGoodsServices">查询</el-button>
					<el-button @click="resetFilters">重置</el-button>
				</el-form-item>
			</el-form>
			<el-button type="primary" @click="openCreate">新增服务</el-button>
		</div>

		<el-card shadow="never">
			<template #header>
				<div class="section-title">服务列表</div>
			</template>
			<el-table
				ref="tableRef"
				v-loading="loading"
				:data="goodsServiceList"
				border
				highlight-current-row
				row-key="id"
				height="460"
				@current-change="handleCurrentChange"
				@selection-change="handleSelectionChange"
			>
				<el-table-column v-if="selectable" type="selection" width="50" align="center" reserve-selection />
				<el-table-column prop="id" label="ID" width="70" align="center" />
				<el-table-column label="图片" width="90" align="center">
					<template #default="{ row }">
						<el-image v-if="row.image" :src="row.image" fit="cover" class="thumb" />
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column prop="name" label="服务名称" min-width="160" />
				<el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
				<el-table-column prop="update_time" label="更新时间" min-width="170" align="center" />
				<el-table-column label="操作" width="140" align="center">
					<template #default="{ row }">
						<el-space>
							<el-button link type="primary" @click="openEdit(row)">编辑</el-button>
							<el-button link type="danger" @click="handleDelete(row)">删除</el-button>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<template v-if="selectable">
			<el-card shadow="never">
				<div class="selected-bar">
					<div class="section-title">已选服务</div>
					<div class="selected-tags">
						<el-tag v-for="item in selectedRows" :key="item.id" closable @close="removeSelection(item.id)">
							{{ item.name }}
						</el-tag>
						<span v-if="!selectedRows.length" class="empty-text">暂未选择服务</span>
					</div>
					<el-button type="primary" @click="emitConfirm">确认选择</el-button>
				</div>
			</el-card>
		</template>

		<el-dialog
			v-model="editorVisible"
			:title="editForm.id ? '编辑服务' : '新增服务'"
			width="560px"
			append-to-body
			destroy-on-close
			@closed="resetEditForm"
		>
			<el-form ref="formRef" :model="editForm" :rules="rules" label-width="92px">
				<el-form-item label="服务名称" prop="name">
					<el-input v-model="editForm.name" maxlength="120" placeholder="请输入服务名称" />
				</el-form-item>
				<el-form-item label="服务图片">
					<el-upload
						class="uploader"
						action="/admin/index/upload"
						:headers="uploadHeader"
						:show-file-list="false"
						auto-upload
						:key="uploadKey"
						:limit="1"
						:on-success="uploadSuccess"
					>
						<img v-if="editForm.image" :src="editForm.image" class="preview" />
						<el-icon v-else class="uploader-icon">
							<Plus />
						</el-icon>
					</el-upload>
				</el-form-item>
				<el-form-item label="服务描述" prop="description">
					<el-input v-model="editForm.description" type="textarea" :rows="4" maxlength="255" show-word-limit placeholder="请输入服务描述" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="editorVisible = false">取消</el-button>
				<el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ShopService } from "@/common/api/shop";
import { useUserStore } from "@/pinia";

type GoodsServiceItem = {
	id: number;
	name: string;
	image?: string;
	description?: string;
	create_time?: string;
	update_time?: string;
};

const props = withDefaults(
	defineProps<{
		selectable?: boolean;
		modelValue?: number[];
	}>(),
	{
		selectable: false,
		modelValue: () => [],
	},
);

const emit = defineEmits<{
	(e: "update:modelValue", value: number[]): void;
	(e: "confirm", value: GoodsServiceItem[]): void;
	(e: "changed", value: GoodsServiceItem[]): void;
}>();

const userStore = useUserStore();
const tableRef = ref<any>();
const formRef = ref<FormInstance>();
const loading = ref(false);
const saving = ref(false);
const editorVisible = ref(false);
const goodsServiceList = ref<GoodsServiceItem[]>([]);
const selectedRows = ref<GoodsServiceItem[]>([]);
const filters = reactive({
	keywords: "",
});

const uploadKey = ref(Date.now().toString());
const uploadHeader = computed(() => ({
	token: userStore.getToken(),
}));

const editForm = reactive({
	id: 0,
	name: "",
	image: "",
	description: "",
});

const rules: FormRules = {
	name: [{ required: true, message: "请输入服务名称", trigger: "blur" }],
	description: [{ max: 255, message: "描述长度不能超过255个字符", trigger: "blur" }],
};

const syncSelectionFromModel = async () => {
	if (!props.selectable || !tableRef.value) return;
	await nextTick();
	tableRef.value.clearSelection?.();
	const selectedIdSet = new Set((props.modelValue || []).map(item => Number(item)));
	goodsServiceList.value.forEach(row => {
		if (selectedIdSet.has(Number(row.id))) tableRef.value?.toggleRowSelection(row, true);
	});
};

watch(
	() => props.modelValue,
	() => {
		syncSelectionFromModel();
	},
	{ deep: true },
);

const normalizeList = (list: GoodsServiceItem[] = []) =>
	list.map(item => ({
		...item,
		id: Number(item.id),
	}));

const loadGoodsServices = async () => {
	loading.value = true;
	try {
		const res = await ShopService.getGoodsServiceList({ keywords: filters.keywords.trim() });
		goodsServiceList.value = normalizeList(res.data || []);
		emit("changed", goodsServiceList.value);
	} finally {
		loading.value = false;
		await syncSelectionFromModel();
	}
};

const resetFilters = async () => {
	filters.keywords = "";
	await loadGoodsServices();
};

const resetEditForm = () => {
	editForm.id = 0;
	editForm.name = "";
	editForm.image = "";
	editForm.description = "";
	uploadKey.value = Date.now().toString();
	formRef.value?.clearValidate();
};

const openCreate = () => {
	resetEditForm();
	editorVisible.value = true;
};

const openEdit = (row: GoodsServiceItem) => {
	editForm.id = Number(row.id);
	editForm.name = row.name || "";
	editForm.image = row.image || "";
	editForm.description = row.description || "";
	uploadKey.value = Date.now().toString();
	formRef.value?.clearValidate();
	editorVisible.value = true;
};

const handleCurrentChange = (row?: GoodsServiceItem) => {
	if (row && !props.selectable) openEdit(row);
};

const uploadSuccess = (res: any) => {
	const url = res?.data?.url;
	if (!url) {
		ElMessage.error("上传失败，未获取到图片地址");
		return;
	}

	editForm.image = url;
	uploadKey.value = Date.now().toString();
};

const handleSave = async () => {
	if (!formRef.value) return;
	await formRef.value.validate();
	saving.value = true;
	try {
		await ShopService.saveGoodsService({
			id: editForm.id,
			name: editForm.name.trim(),
			image: editForm.image,
			description: editForm.description.trim(),
		});
		ElMessage.success(editForm.id ? "商品服务已更新" : "商品服务已创建");
		editorVisible.value = false;
		await loadGoodsServices();
	} catch (error: any) {
		ElMessage.error(error?.message || "保存失败");
	} finally {
		saving.value = false;
	}
};

const handleDelete = async (row: GoodsServiceItem) => {
	try {
		await ElMessageBox.confirm(`确定删除服务“${row.name}”吗？`, "提示", {
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			type: "warning",
		});
		await ShopService.delGoodsService(row.id);
		ElMessage.success("商品服务已删除");
		if (editForm.id === row.id) resetEditForm();
		selectedRows.value = selectedRows.value.filter(item => item.id !== row.id);
		emit("update:modelValue", selectedRows.value.map(item => item.id));
		await loadGoodsServices();
	} catch (error: any) {
		if (error !== "cancel") ElMessage.error(error?.message || "删除失败");
	}
};

const handleSelectionChange = (rows: GoodsServiceItem[]) => {
	selectedRows.value = rows.map(item => ({ ...item, id: Number(item.id) }));
	emit("update:modelValue", selectedRows.value.map(item => item.id));
};

const removeSelection = (id: number) => {
	const row = goodsServiceList.value.find(item => item.id === id);
	if (row) tableRef.value?.toggleRowSelection(row, false);
};

const emitConfirm = () => {
	emit("confirm", selectedRows.value);
};

defineExpose({
	loadGoodsServices,
	resetEditForm,
});

onMounted(loadGoodsServices);
</script>

<style scoped lang="scss">
.goods-service-panel {
	display: grid;
	gap: 16px;
}

.toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
}

.section-title {
	font-size: 15px;
	font-weight: 600;
}

.thumb {
	width: 44px;
	height: 44px;
	border-radius: 8px;
}

.preview,
.uploader-icon {
	width: 88px;
	height: 88px;
	border-radius: 10px;
}

.preview {
	object-fit: cover;
}

.uploader-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px dashed var(--el-border-color);
	font-size: 24px;
	color: var(--el-text-color-secondary);
}

.selected-bar {
	display: grid;
	gap: 12px;
}

.selected-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.empty-text {
	font-size: 13px;
	color: var(--el-text-color-secondary);
}

</style>
