<template>
	<div class="page">
		<el-card shadow="never">
			<template #header>
				<div class="header">
					<div>
						<div class="title">分类管理</div>
						<div class="subtitle">商品分类维护支持树形分类、状态和排序维护。</div>
					</div>
					<Auth value="shop:category:create">
						<el-button type="primary" @click="openCreateDialog()">新增分类</el-button>
					</Auth>
				</div>
			</template>

			<el-table v-loading="loading" :data="categoryTree" row-key="id" border default-expand-all>
				<el-table-column prop="name" label="分类名称" min-width="220" />
				<el-table-column label="图片" width="90" align="center">
					<template #default="{ row }">
						<el-image v-if="row.image" :src="row.image" fit="cover" class="thumb" />
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
				<el-table-column prop="sort" label="排序" width="90" align="center" />
				<el-table-column prop="update_time" label="更新时间" min-width="160" />
				<el-table-column label="状态" width="110" align="center">
					<template #default="{ row }">
						<Auth value="shop:category:status">
							<el-switch :model-value="row.status === 1" inline-prompt active-text="启用" inactive-text="禁用" @change="(value) => handleStatusChange(row, value)" />
						</Auth>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="260" fixed="right">
					<template #default="{ row }">
						<el-space>
							<Auth value="shop:category:create">
								<el-button link type="primary" @click="openCreateDialog(row.id)">添加子分类</el-button>
							</Auth>
							<Auth value="shop:category:edit">
								<el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
							</Auth>
							<Auth value="shop:category:delete">
								<el-button link type="danger" @click="handleDelete(row)">删除</el-button>
							</Auth>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑分类' : '新增分类'" width="640px" destroy-on-close @closed="resetEditForm">
			<el-form ref="formRef" :model="editForm" :rules="rules" label-width="92px">
				<el-form-item label="上级分类">
					<el-tree-select
						v-model="editForm.parent_id"
						check-strictly
						clearable
						default-expand-all
						node-key="id"
						:data="categoryOptions"
						:props="{ label: 'name', children: 'children' }"
						placeholder="顶级分类"
					/>
				</el-form-item>
				<el-form-item label="分类名称" prop="name">
					<el-input v-model="editForm.name" placeholder="请输入分类名称" />
				</el-form-item>
				<el-form-item label="图片地址">
					<el-input v-model="editForm.image" placeholder="请输入分类图片 URL" />
				</el-form-item>
				<el-form-item label="描述">
					<el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入分类描述" />
				</el-form-item>
				<el-form-item label="排序">
					<el-input-number v-model="editForm.weigh" :min="0" :max="9999" />
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="editForm.status">
						<el-radio :value="1">启用</el-radio>
						<el-radio :value="0">禁用</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
			</template>
		</el-dialog>
	</div>
</template>
<script setup lang="ts" name="ShopCategory">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { ShopService, type CategoryItem } from "@/common/api/shop";

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const categoryList = ref([]);

const editForm = reactive({
	id: 0,
	parent_id: 0,
	name: "",
	image: "",
	link_path: "",
	description: "",
	sort: 0,
	status: 1,
});

const rules: FormRules = {
	name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
};

const loadCategoryList = async () => {
	loading.value = true;
	try {
		const res = await ShopService.getCategoryList();
		categoryList.value = res.data;
	} finally {
		loading.value = false;
	}
};

const resetEditForm = () => {
	editForm.id = 0;
	editForm.parent_id = 0;
	editForm.name = "";
	editForm.image = "";
	editForm.link_path = "";
	editForm.description = "";
	editForm.sort = 0;
	editForm.status = 1;
};

const openCreateDialog = async (parentId = 0) => {
	resetEditForm();
	editForm.parent_id = parentId;
	dialogVisible.value = true;
};

const openEditDialog = async (row: any) => {
	editForm.id = row.id;
	editForm.parent_id = row.parent_id;
	editForm.name = row.name;
	editForm.image = row.image;
	editForm.link_path = row.link_path;
	editForm.description = row.description;
	editForm.sort = row.sort;
	editForm.status = row.status;
	dialogVisible.value = true;
};

const handleSave = async () => {
	if (!formRef.value) return;
	await formRef.value.validate();
	saving.value = true;
	try {
		await ShopService.saveCategory(editForm);
		ElMessage.success(editForm.id ? "分类已更新" : "分类已创建");
		dialogVisible.value = false;
		await loadCategoryList();
	} catch (error: any) {
		ElMessage.error(error.message || "保存失败");
	} finally {
		saving.value = false;
	}
};

const handleDelete = async (row: any) => {
	ElMessageBox.confirm(`确定删除${row.name}分类以及子分类吗?`, "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(() => {
		let res = ShopService.delCategory(row.id);
		if (res.code === 200) {
			loadCategoryList();
		}
	});
};

const handleStatusChange = async (row: any, value: string | number | boolean) => {
	try {
		await ShopService.updateCategoryStatus(row.id, value ? 1 : 0);
		row.status = value ? 1 : 0;
		ElMessage.success(row.status === 1 ? "分类已启用" : "分类已禁用");
	} catch (error: any) {
		ElMessage.error(error.message || "状态更新失败");
	}
};

onMounted(loadCategoryList);
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

.thumb {
	width: 44px;
	height: 44px;
	border-radius: 6px;
}
</style>
