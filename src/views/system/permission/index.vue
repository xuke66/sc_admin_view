<template>
	<div class="permission-page">
		<el-card shadow="never">
			<template #header>
				<div class="card-header">
					<div>
						<div class="title">菜单/权限管理</div>
						<div class="subtitle">统一维护菜单权限、按钮权限与权限组归属</div>
					</div>
					<Auth value="system:permission:create">
						<el-button type="primary" @click="openCreateDialog">新增权限/菜单</el-button>
					</Auth>
				</div>
			</template>

			<el-table v-loading="loading" :data="permissionList" row-key="id" border>
				<el-table-column prop="title" label="菜单/权限名称" min-width="180">
					<template #default="{ row }">
						<Icon v-if="row.icon" :icon="row.icon" :class="`${ns.elNamespace}-icon`" />
                        {{row.title}}
					</template>
				</el-table-column>
				<el-table-column prop="auth" label="权限编码" min-width="220" />
				<el-table-column label="类型" width="110" align="center">
					<template #default="{ row }">
						<el-tag :type="row.is_menu ? 'success' : 'danger'">
							{{ row.is_menu ? "菜单" : "权限" }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="remark" label="说明" min-width="220" show-overflow-tooltip />
				<el-table-column label="操作" width="120">
					<template #default="{ row }">
						<Auth value="system:permission:edit">
							<el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
						</Auth>
						<Auth value="system:permission:del">
							<el-button link type="danger" @click="delPermission(row)">删除</el-button>
						</Auth>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog v-model="dialogVisible" :title="dialogTitle" width="620px" destroy-on-close @closed="resetEditForm">
			<el-form ref="formRef" :model="editForm" :rules="rules" label-width="120px">
				<el-form-item label="菜单/权限名称" prop="title">
					<el-input style="width: 300px" v-model="editForm.title" placeholder="请输入权限名称" />
				</el-form-item>
				<el-form-item label="权限编码" prop="auth">
					<el-input style="width: 300px" v-model="editForm.auth" placeholder="例如：system:admin:create" />
				</el-form-item>

				<el-form-item label="权限类型">
					<el-radio-group v-model="editForm.is_menu">
						<el-radio :value="1">菜单</el-radio>
						<el-radio :value="0">权限</el-radio>
					</el-radio-group>
				</el-form-item>

				<el-form-item label="所属父级">
					<el-cascader v-model="editForm.pid" :options="permissionList" :props="{ checkStrictly: true, label: 'title', value: 'id', emitPath: false }" clearable />
				</el-form-item>

				<el-form-item label="路径" v-if="editForm.is_menu">
					<el-input style="width: 300px" v-model="editForm.path" placeholder="" />
				</el-form-item>

				<el-form-item label="页面地址" v-if="editForm.is_menu">
					<el-input style="width: 300px" v-model="editForm.url" placeholder="" />
				</el-form-item>

				<el-form-item label="图标" v-if="editForm.is_menu">
					<el-input style="width: 300px" v-model="editForm.icon" placeholder="" />
				</el-form-item>

				<el-form-item label="排序" v-if="editForm.is_menu">
					<el-input style="width: 300px" type="number" v-model="editForm.sort" placeholder="" />
				</el-form-item>

				<el-form-item label="说明">
					<el-input style="width: 300px" v-model="editForm.remark" type="textarea" :rows="3" placeholder="请输入权限说明" />
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
			</template>
		</el-dialog>
	</div>
</template>
<script setup lang="ts" name="SystemPermission">
import { ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { RbacService } from "@/common/api/rbac";
import { useNamespace } from "@/composables";

const ns = useNamespace();
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const permissionList = ref([]);

const editForm = reactive({
	id: 0,
	is_menu: 1,
	pid: 0,
	title: "",
	icon: "",
	path: "",
	url: "",
	auth: "",
	remark: "",
	sort: 0,
});

const rules: FormRules = {
	auth: [{ required: true, message: "请输入权限编码", trigger: "blur" }],
	title: [{ required: true, message: "请输入权限名称", trigger: "blur" }],
};

const dialogTitle = computed(() => (editForm.id ? "编辑权限" : "新增权限"));

const loadPermissionList = async () => {
	loading.value = true;
	try {
		let res = await RbacService.getPermissionList();
		permissionList.value = res.data;
	} finally {
		loading.value = false;
	}
};

const resetEditForm = () => {
	editForm.id = 0;
	editForm.is_menu = 1;
	editForm.pid = 0;
	editForm.title = "";
	editForm.icon = "";
	editForm.path = "";
	editForm.url = "";
	editForm.auth = "";
	editForm.remark = "";
	editForm.sort = 0;
};

const openCreateDialog = () => {
	resetEditForm();
	dialogVisible.value = true;
};

const openEditDialog = (row: any) => {
	editForm.id = row.id;
	editForm.is_menu = row.is_menu;
	editForm.pid = row.pid;
	editForm.title = row.title;
	editForm.icon = row.icon;
	editForm.path = row.path;
	editForm.url = row.url;
	editForm.auth = row.auth;
	editForm.remark = row.remark;
	editForm.sort = row.sort;
	dialogVisible.value = true;
};

const handleSave = async () => {
	if (!formRef.value) return;

	await formRef.value.validate();
	saving.value = true;
	try {
		await RbacService.savePermission(editForm);
		ElMessage.success(editForm.id ? "权限已更新" : "权限已创建");
		dialogVisible.value = false;
		await loadPermissionList();
	} finally {
		saving.value = false;
	}
};

const delPermission = (row: any) => {
	ElMessageBox.confirm(`确定删除${row.title}吗?`, "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(() => {
		RbacService.delPermission(row.id);
		loadPermissionList();
	});
};

onMounted(async () => {
	await loadPermissionList();
});
</script>
<style scoped lang="scss">
.permission-page {
	display: grid;
	gap: 16px;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 16px;
}

.stats-item {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.stats-label {
	font-size: 13px;
	color: var(--el-text-color-secondary);
}

.stats-value {
	font-size: 28px;
	font-weight: 700;
	color: var(--el-text-color-primary);
}

.card-header {
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

@media (max-width: 960px) {
	.stats-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
</style>
