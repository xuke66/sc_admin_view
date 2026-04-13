<template>
	<div class="admin-page">
		<el-card shadow="never" class="filter-card">
			<el-form :inline="true" :model="queryForm">
				<el-form-item label="关键词">
					<el-input v-model="queryForm.keyword" placeholder="账号/姓名/手机号" clearable />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleSearch">查询</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<el-card shadow="never">
			<template #header>
				<div class="card-header">
					<div>
						<div class="title">管理员管理</div>
						<div class="subtitle">维护后台登录账号、权限组绑定与启停状态</div>
					</div>
					<Auth value="system:admin:create">
						<el-button type="primary" @click="openCreateDialog">新增管理员</el-button>
					</Auth>
				</div>
			</template>

			<el-table v-loading="loading" :data="adminList" border>
				<el-table-column prop="username" label="登录账号" min-width="140" />
				<el-table-column prop="nickname" label="姓名" min-width="110" />
				<el-table-column prop="mobile" label="手机号" min-width="130" />
				<el-table-column label="权限组" min-width="220">
					<template #default="{ row }">
						<el-space wrap>
							<el-tag v-for="(item, index) in row.authGroupRule" :key="index" type="info">
								{{ item.authGroup.name }}
							</el-tag>
						</el-space>
					</template>
				</el-table-column>
				<el-table-column prop="login_time" label="最近登录" min-width="160" />
				<el-table-column label="状态" width="110" align="center">
					<template #default="{ row }">
						<el-badge is-dot v-if="row.status === 1" type="success" class="item" :badge-style="{ left: '-20px', top: '12px' }">
							{{ RbacService.status_map[row.status] }}
						</el-badge>
						<el-badge is-dot v-else class="item" type="danger" :badge-style="{ left: '-20px', top: '12px' }">
							{{ RbacService.status_map[row.status] }}
						</el-badge>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="150">
					<template #default="{ row }">
						<el-space>
							<Auth value="system:admin:edit">
								<el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
							</Auth>

							<Auth value="system:admin:status">
								<el-button link v-if="row.status === 1" type="warning" @click="handleStatusChange(row, 0)"> 禁用 </el-button>
								<el-button link v-else type="success" @click="handleStatusChange(row, 1)">启用</el-button>
							</Auth>
							<Auth value="system:admin:del">
								<el-button link type="danger" @click="delAdmin(row.id)">删除</el-button>
							</Auth>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog v-model="dialogVisible" :title="dialogTitle" width="620px" destroy-on-close>
			<el-form ref="formRef" :model="editForm" :rules="rules" label-width="120px">
				<el-form-item label="登录账号" prop="username">
					<el-input style="width: 200px" v-model="editForm.username" placeholder="请输入登录账号" />
				</el-form-item>
				<el-form-item label="登录密码">
					<el-input style="width: 200px" v-model="editForm.password" placeholder="登录密码 不修改不用填写" />
				</el-form-item>
				<el-form-item label="姓名" prop="nickname">
					<el-input style="width: 200px" v-model="editForm.nickname" placeholder="请输入管理员姓名" />
				</el-form-item>
				<el-form-item label="手机号" prop="mobile">
					<el-input style="width: 200px" v-model="editForm.mobile" placeholder="请输入手机号" />
				</el-form-item>

				<el-form-item label="账号状态">
					<el-radio-group v-model="editForm.status">
						<el-radio :value="1">启用</el-radio>
						<el-radio :value="0">停用</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="权限组" prop="group_ids">
					<el-select style="width: 200px" v-model="editForm.group_ids" multiple placeholder="请选择权限组">
						<el-option v-for="item in permissionGroupOptions" :key="item.id" :label="item.name" :value="item.id" />
					</el-select>
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="SystemAdmin">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { RbacService } from "@/common/api/rbac";

const loading = ref(false);

const saving = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const adminList = ref([]);
const queryForm = reactive({
	keyword: "",
	page: 1,
	limit: 10,
});

const permissionGroupOptions = ref<any[]>([]);

const createInitialEditForm = () => ({
	id: 0,
	username: "",
	password: "",
	nickname: "",
	mobile: "",
	status: 1,
	group_ids: [] as any[],
});

const editForm = reactive(createInitialEditForm());

const rules: FormRules = {
	username: [{ required: true, message: "请输入登录账号", trigger: "blur" }],
	nickname: [{ required: true, message: "请输入管理员姓名", trigger: "blur" }],
	mobile: [{ required: true, message: "请输入手机号", trigger: "blur" }],
	group_ids: [{ required: true, message: "请选择权限组", trigger: "change" }],
};

const dialogTitle = computed(() => (editForm.id ? "编辑管理员" : "新增管理员"));

const loadAdminList = async () => {
	loading.value = true;
	try {
		const res = await RbacService.getAdminList(queryForm);
		adminList.value = res.data.list;
	} finally {
		loading.value = false;
	}
};

const handleSearch = async () => {
	await loadAdminList();
};

const openCreateDialog = () => {
	Object.assign(editForm, createInitialEditForm());
	formRef.value?.clearValidate();
	dialogVisible.value = true;
};

const openEditDialog = (row: any) => {
	Object.assign(editForm, createInitialEditForm());
	editForm.id = row.id;
	editForm.username = row.username;
	editForm.password = "";
	editForm.nickname = row.nickname;
	editForm.mobile = row.mobile;
	editForm.status = row.status;
	editForm.group_ids = row.group_ids ? row.group_ids : [];
	formRef.value?.clearValidate();
	dialogVisible.value = true;
};

const handleSave = async () => {
	if (!formRef.value) return;

	await formRef.value.validate();
	saving.value = true;
	try {
		await RbacService.saveAdmin(editForm);
		ElMessage.success(editForm.id ? "管理员已更新" : "管理员已创建");
		dialogVisible.value = false;
		await loadAdminList();
	} finally {
		saving.value = false;
	}
};

const delAdmin = async (id: number) => {
	ElMessageBox.confirm("确定删除吗?", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(() => {
		RbacService.delAdmin(id);
		loadAdminList();
	});
};

const handleStatusChange = async (row: any, value: number) => {
	await RbacService.updateAdminStatus(row.id, value);
	row.status = value;
	ElMessage.success(`账号已${value === 1 ? "启用" : "停用"}`);
};

async function getPermissionGroupOptions() {
	let permissionGroupOptionsRes = await RbacService.getPermissionGroupOptions();
	permissionGroupOptions.value = permissionGroupOptionsRes.data;
}

onMounted(async () => {
	await loadAdminList();
	await getPermissionGroupOptions();
});
</script>
<style scoped lang="scss">
.admin-page {
	display: grid;
	gap: 16px;
}

.filter-card :deep(.el-form) {
	margin-bottom: -18px;
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
	color: var(--el-text-color-primary);
}

.subtitle {
	margin-top: 4px;
	font-size: 13px;
	color: var(--el-text-color-secondary);
}
</style>
