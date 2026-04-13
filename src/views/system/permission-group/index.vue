<template>
	<div class="permission-group-page">
		<el-card shadow="never">
			<template #header>
				<div class="header-row">
					<div>
						<div class="title">权限组</div>
						<div class="subtitle">把多个权限点打包成组，便于管理员账号快速授权</div>
					</div>
					<div class="header-actions">
						<el-input v-model="keyword" placeholder="搜索权限组名称" clearable style="width: 240px" />
						<el-button type="primary" @click="loadPermissionGroups">搜索</el-button>

						<Auth value="system:permission-group:create">
							<el-button type="primary" @click="openCreateDialog">新增权限组</el-button>
						</Auth>
					</div>
				</div>
			</template>

			<el-row :gutter="16">
				<el-col v-for="item in groupList" :key="item.id" :xs="24" :sm="12" :lg="6">
					<el-card shadow="hover" class="group-card" v-loading="loading">
						<div class="group-top">
							<div>
								<div class="group-name">{{ item.name }}</div>
								<div class="group-code">{{ item.remark }}</div>
							</div>
							<div>
								<Auth value="system:permission-group:status">
									<el-button v-if="item.id !== 1" link :type="item.status === 0 ? 'warning' : 'success'" @click="handleStatusChange(item, item.status === 0 ? 1 : 0)">{{
										item.status === 0 ? "已禁用" : "正常"
									}}</el-button>
								</Auth>

								<Auth value="system:permission-group:edit">
									<el-button v-if="item.id !== 1" link type="primary" @click="openEditDialog(item)">编辑</el-button>
								</Auth>

								<Auth value="system:permission-group:del">
									<el-button v-if="item.id !== 1" link type="danger" @click="handleDel(item)">删除</el-button>
								</Auth>
							</div>
						</div>


						<div class="group-meta">
							<el-tag type="success">成员 {{ item.authGroupRules.length }}个</el-tag>
							<el-tag v-if="item.auth_ids !== '*'">{{ item.auth_ids.length }} 个权限</el-tag>
						</div>

						<div class="permission-list">
							<el-tag v-for="(authGroup, index) in item.authGroupRules.slice(0, 6)" :key="index" type="info" effect="plain">
								{{ authGroup.admin.nickname }}
							</el-tag>
							<span v-if="item.authGroupRules.length > 6" class="more-text"> +{{ item.permissionIds.length - 6 }} 个 </span>
						</div>

						<div class="group-footer">创建时间：{{ item.create_time }}</div>
					</el-card>
				</el-col>
			</el-row>
		</el-card>

		<el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px" destroy-on-close @closed="resetEditForm">
			<el-form ref="formRef" :model="editForm" :rules="rules" label-width="96px">
				<el-form-item label="权限组名称" prop="name">
					<el-input class="w300" v-model="editForm.name" placeholder="请输入权限组名称" />
				</el-form-item>
				<el-form-item label="权限组描述" prop="code">
					<el-input class="w300" v-model="editForm.remark" placeholder="权限组描述" />
				</el-form-item>

				<el-form-item label="账号状态">
					<el-radio-group v-model="editForm.status">
						<el-radio :value="1">启用</el-radio>
						<el-radio :value="0">停用</el-radio>
					</el-radio-group>
				</el-form-item>

				<el-form-item label="权限组人员" prop="admin_ids">
					<el-select class="w300" v-model="editForm.admin_ids" multiple placeholder="请选择权限组人员">
						<el-option v-for="item in adminOptions" :key="item.id" :label="item.nickname" :value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item label="分配权限" prop="auth_ids">
					<div>
						<tree-check v-model="editForm.auth_ids" :data="permissionList" />
					</div>
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
			</template>
		</el-dialog>
	</div>
</template>
<script setup lang="ts" name="SystemPermissionGroup">
import { ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { RbacService } from "@/common/api/rbac";
import TreeCheck from "@/views/components/treeCheck.vue";

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const groupList = ref<any[]>([]);
const permissionList = ref<any[]>([]);
const adminOptions = ref<any[]>([]);
const keyword = ref("");

const editForm = reactive({
	id: 0,
	name: "",
	remark: "",
	status: 1,
	auth_ids: [],
	admin_ids: [],
});

const rules: FormRules = {
	name: [{ required: true, message: "请输入权限组名称", trigger: "blur" }],
	auth_ids: [{ required: true, message: "请至少选择一个权限点", trigger: "change" }],
};

const dialogTitle = computed(() => (editForm.id ? "编辑权限组" : "新增权限组"));

const loadPermissionGroups = async () => {
	loading.value = true;
	try {
		let res = await RbacService.getPermissionGroupList({ keyword: keyword.value });
		groupList.value = res.data;
	} finally {
		loading.value = false;
	}
};

const resetEditForm = () => {
	editForm.id = 0;
	editForm.name = "";
	editForm.remark = "";
	editForm.status = 1;
	editForm.auth_ids = [];
	editForm.admin_ids = [];
};

const openCreateDialog = () => {
	resetEditForm();
	dialogVisible.value = true;
};

const openEditDialog = (row: any) => {
	editForm.id = row.id;
	editForm.name = row.name;
	editForm.remark = row.remark;
	editForm.status = row.status;
	editForm.auth_ids = row.auth_ids;
	editForm.admin_ids = row.authGroupRules.map((item: any) => item.admin_id);
	console.log(editForm.admin_ids);
	dialogVisible.value = true;
};

const handleSave = async () => {
	if (!formRef.value) return;

	await formRef.value.validate();
	saving.value = true;
	try {
		await RbacService.savePermissionGroup(editForm);
		ElMessage.success(editForm.id ? "权限组已更新" : "权限组已创建");
		dialogVisible.value = false;
		await loadPermissionGroups();
	} finally {
		saving.value = false;
	}
};

const handleDel = async (row: any) => {
	ElMessageBox.confirm(`确定删除${row.name}权限组吗?`, "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(() => {
		let res = RbacService.delPermissionGroup(row.id);
		if (res.code === 200) {
			loadPermissionGroups();
		}
	});
};

const handleStatusChange = async (row: any, value: number) => {
	await RbacService.updatePermissionGroupStatus(row.id, value);
	row.status = value;
	ElMessage.success(`权限组已${value === 1 ? "启用" : "停用"}`);
};

const getPermissionList = async () => {
	let res = await RbacService.getPermissionList();
	permissionList.value = res.data;
};

const getAdminOptions = async () => {
	let res = await RbacService.getAdminOptions();
	adminOptions.value = res.data;
};

onMounted(async () => {
	await loadPermissionGroups();
	await getPermissionList();
	await getAdminOptions();
});
</script>
<style scoped lang="scss">
.permission-group-page {
	display: grid;
}

.header-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 12px;
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

.group-card {
	margin-bottom: 16px;
}

.group-top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
}

.group-name {
	font-size: 16px;
	font-weight: 600;
}

.group-code {
	margin-top: 4px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.group-description {
	min-height: 44px;
	margin: 16px 0 14px;
	line-height: 1.6;
	color: var(--el-text-color-regular);
}

.group-meta {
	display: flex;
	flex-wrap: wrap;
    margin-top: 8px;
	gap: 8px;
}

.permission-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 16px;
}

.more-text {
	font-size: 12px;
	line-height: 28px;
	color: var(--el-text-color-secondary);
}

.group-footer {
	margin-top: 16px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.permission-checks {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px 16px;
	width: 100%;
}

@media (max-width: 900px) {
	.header-row,
	.header-actions {
		flex-direction: column;
		align-items: stretch;
	}

	.permission-checks {
		grid-template-columns: minmax(0, 1fr);
	}
}
</style>
