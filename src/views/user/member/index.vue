<template>
	<div class="page">
		<el-card shadow="never">
			<el-form :inline="true" :model="queryForm">
				<el-form-item label="关键词">
					<el-input v-model="queryForm.keywords" clearable placeholder="昵称/手机号" style="width: 220px" />
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="queryForm.status" clearable placeholder="全部状态" style="width: 140px">
						<el-option label="正常" value="normal" />
						<el-option label="禁用" value="disabled" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="loadMemberList">查询</el-button>
					<el-button @click="resetQuery">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<el-card shadow="never">
			<template #header>
				<div class="header">
					<div>
						<div class="title">会员管理</div>
						<div class="subtitle">基于 `sc_user` 提供会员列表、详情、基本信息维护与余额积分调整。</div>
					</div>
				</div>
			</template>

			<el-table v-loading="loading" :data="memberList" border>
				<el-table-column prop="id" label="ID" width="90" align="center" />
				<el-table-column label="会员信息" align="center">
					<template #default="{ row }">
						<div class="member-cell">
							<el-avatar :src="row.avatar || undefined" :size="44">
								{{ (row.nickname || "U").slice(0, 1) }}
							</el-avatar>
							<div>
								<div class="member-name">{{ row.nickname || "-" }}</div>
								<div class="member-meta">{{ row.mobile || "未绑定手机号" }}</div>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="parent_user_name" label="推荐人" align="center" />
				<el-table-column prop="money" label="余额"  align="center" />
				<el-table-column prop="score" label="积分"  align="center" />
				<el-table-column prop="total_consume" label="累计消费" width="120" align="center" />
				<el-table-column prop="create_time" label="注册时间" min-width="160" align="center" />
				<el-table-column label="状态" width="110" align="center">
					<template #default="{ row }">
						<el-badge is-dot :type="row.status ? 'success' : 'danger'" class="item" :badge-style="{ left: '-20px', top: '12px' }">
							{{ row.status_text }}
						</el-badge>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="220" fixed="right">
					<template #default="{ row }">
						<el-space>
							<Auth value="user:member:detail">
								<el-button link type="primary" @click="openDetail(row.id)">详情</el-button>
							</Auth>
							<Auth value="user:member:account">
								<el-button link type="warning" @click="openAccountDialog(row)">调账户</el-button>
							</Auth>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog v-model="detailVisible" title="会员详情" width="920px" destroy-on-close>
			<div v-loading="detailLoading" class="detail-page">
				<div class="section-title">基本信息</div>
				<div class="detail-card">
					<div class="detail-header">
						<div class="detail-profile">
							<el-avatar :src="basicForm.avatar || undefined" :size="76">
								{{ (basicForm.nickname || "U").slice(0, 1) }}
							</el-avatar>
							<div>
								<div class="profile-name">{{ basicForm.nickname || "-" }}</div>
								<div class="profile-id">#{{ basicForm.id || 0 }}</div>
							</div>
						</div>
						<Auth value="user:member:edit">
							<el-upload :show-file-list="false" :http-request="handleAvatarUpload">
								<el-button type="primary">更换头像</el-button>
							</el-upload>
						</Auth>
					</div>

					<el-form :model="basicForm" label-width="90px" class="basic-form">
						<div class="basic-grid">
							<el-form-item label="昵称">
								<el-input v-model="basicForm.nickname" class="compact-input" />
							</el-form-item>
							<el-form-item label="手机号">
								<el-input v-model="basicForm.mobile" class="compact-input" />
							</el-form-item>
							<el-form-item label="状态">
								<el-radio-group v-model="basicForm.status">
									<el-radio value="normal">正常</el-radio>
									<el-radio value="disabled">禁用</el-radio>
								</el-radio-group>
							</el-form-item>
							<el-form-item label="推荐人">
								<el-input :model-value="detailUser?.parent_user?.nickname || '平台直推'" class="compact-input" readonly />
							</el-form-item>
						</div>
						<div class="form-actions">
							<el-button @click="resetBasicForm">重置</el-button>
							<Auth value="user:member:edit">
								<el-button type="primary" :loading="basicSaving" @click="saveBasic">保存</el-button>
							</Auth>
						</div>
					</el-form>
				</div>

				<div class="section-title">账户信息</div>
				<div class="detail-card">
					<div class="account-grid">
						<div class="account-item">
							<div class="account-label">推荐人</div>
							<div class="account-value">{{ detailUser?.parent_user?.nickname || "平台直推" }}</div>
						</div>
						<div class="account-item">
							<div class="account-label">佣金</div>
							<div class="account-value">{{ detailUser?.commission || "0.00" }}</div>
						</div>
						<div class="account-item">
							<div class="account-label">余额</div>
							<div class="account-value">
								{{ detailUser?.money || "0.00" }}
								<Auth value="user:member:account">
									<el-button link type="primary" @click="openAccountDialog(detailUser)">调整</el-button>
								</Auth>
							</div>
						</div>
						<div class="account-item">
							<div class="account-label">积分</div>
							<div class="account-value">
								{{ detailUser?.score || 0 }}
								<Auth value="user:member:account">
									<el-button link type="primary" @click="openAccountDialog(detailUser)">调整</el-button>
								</Auth>
							</div>
						</div>
						<div class="account-item">
							<div class="account-label">累计消费</div>
							<div class="account-value">{{ detailUser?.total_consume || "0.00" }}</div>
						</div>
						<div class="account-item">
							<div class="account-label">注册时间</div>
							<div class="account-value">{{ detailUser?.create_time || "-" }}</div>
						</div>
					</div>
				</div>

				<div class="section-title">操作日志</div>
				<div class="detail-card">
					<el-table :data="logs" border>
						<el-table-column prop="create_time" label="时间" min-width="160" align="center" />
						<el-table-column prop="admin_name" label="操作人" width="120" align="center" />
						<el-table-column prop="title" label="动作" min-width="160" align="center" />
						<el-table-column label="变动" min-width="160" align="center">
							<template #default="{ row }">
								<span v-if="Number(row.change_money) !== 0">余额 {{ row.change_money }}</span>
								<span v-if="Number(row.change_score) !== 0"> / 积分 {{ row.change_score }}</span>
								<span v-if="Number(row.change_money) === 0 && Number(row.change_score) === 0">-</span>
							</template>
						</el-table-column>
						<el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip align="center" />
					</el-table>
				</div>
			</div>
		</el-dialog>

		<el-dialog v-model="accountDialogVisible" title="调整余额/积分" width="460px" destroy-on-close @closed="resetAccountForm">
			<el-form :model="accountForm" label-width="92px">
				<el-form-item label="余额变动">
					<el-input-number v-model="accountForm.money_change" :controls="false" :precision="2" class="compact-input" />
				</el-form-item>
				<el-form-item label="积分变动">
					<el-input-number v-model="accountForm.score_change" :controls="false" :precision="0" class="compact-input" />
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="accountForm.remark" type="textarea" :rows="3" placeholder="请输入调整说明" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="accountDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="accountSaving" @click="saveAccount">保存</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="UserMember">
import type { UploadRequestOptions } from "element-plus";
import { ElMessage } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { CommonService } from "@/common/api/common";
import { UserService, type MemberAccountPayload, type MemberDetail, type MemberItem, type MemberLogItem } from "@/common/api/user";
import { RbacService } from "@api/rbac";

const loading = ref(false);
const detailLoading = ref(false);
const detailVisible = ref(false);
const accountDialogVisible = ref(false);
const basicSaving = ref(false);
const accountSaving = ref(false);

const memberList = ref<MemberItem[]>([]);
const detailUser = ref<MemberDetail["user"] | null>(null);
const logs = ref<MemberLogItem[]>([]);

const queryForm = reactive({
	keywords: "",
	status: "" as "" | "normal" | "disabled",
});

const basicForm = reactive({
	id: 0,
	nickname: "",
	mobile: "",
	avatar: "",
	status: "normal" as "normal" | "disabled",
	parent_user_id: null as number | null,
});

const basicSnapshot = ref("");

const accountForm = reactive<MemberAccountPayload>({
	id: 0,
	money_change: 0,
	score_change: 0,
	remark: "",
});

const openTabAfterLoad = ref<"basic" | "account">("basic");

const canShowDetail = computed(() => Boolean(detailUser.value));

const loadMemberList = async () => {
	loading.value = true;
	try {
		const res = await UserService.getMemberList(queryForm);
		memberList.value = res.data || [];
	} finally {
		loading.value = false;
	}
};

const resetQuery = () => {
	queryForm.keywords = "";
	queryForm.status = "";
	loadMemberList();
};

const fillBasicForm = (user: MemberDetail["user"]) => {
	basicForm.id = Number(user.id);
	basicForm.nickname = user.nickname || "";
	basicForm.mobile = user.mobile || "";
	basicForm.avatar = user.avatar || "";
	basicForm.status = (user.status || "normal") as "normal" | "disabled";
	basicForm.parent_user_id = user.parent_user_id || null;
	basicSnapshot.value = JSON.stringify(basicForm);
};

const loadDetail = async (id: number) => {
	detailLoading.value = true;
	try {
		const res = await UserService.getMemberDetail(id);
		detailUser.value = res.data?.user || null;
		logs.value = res.data?.logs || [];
		if (detailUser.value) fillBasicForm(detailUser.value);
	} finally {
		detailLoading.value = false;
	}
};

const openDetail = async (id: number, tab: "basic" | "account" = "basic") => {
	openTabAfterLoad.value = tab;
	detailVisible.value = true;
	await loadDetail(id);
	if (tab === "account" && detailUser.value) {
		openAccountDialog(detailUser.value);
	}
};

const resetBasicForm = () => {
	if (!basicSnapshot.value) return;
	Object.assign(basicForm, JSON.parse(basicSnapshot.value));
};

const saveBasic = async () => {
	basicSaving.value = true;
	try {
		await UserService.updateMemberBasic({ ...basicForm });
		ElMessage.success("会员基本信息已更新");
		await Promise.all([loadMemberList(), loadDetail(basicForm.id)]);
	} catch (error: any) {
		ElMessage.error(error?.message || "保存失败");
	} finally {
		basicSaving.value = false;
	}
};

const resetAccountForm = () => {
	accountForm.id = 0;
	accountForm.money_change = 0;
	accountForm.score_change = 0;
	accountForm.remark = "";
};

const openAccountDialog = (row: Partial<MemberItem> | null) => {
	if (!row?.id) return;
	accountForm.id = Number(row.id);
	accountForm.money_change = 0;
	accountForm.score_change = 0;
	accountForm.remark = "";
	accountDialogVisible.value = true;
};

const saveAccount = async () => {
	accountSaving.value = true;
	try {
		await UserService.updateMemberAccount({ ...accountForm });
		ElMessage.success("会员账户已调整");
		accountDialogVisible.value = false;
		await Promise.all([loadMemberList(), detailVisible.value && canShowDetail.value ? loadDetail(accountForm.id as number) : Promise.resolve()]);
	} catch (error: any) {
		ElMessage.error(error?.message || "账户调整失败");
	} finally {
		accountSaving.value = false;
	}
};

const handleAvatarUpload = async (options: UploadRequestOptions) => {
	try {
		const res = await CommonService.upload(options.file as File);
		const url = res?.data?.url || res?.data?.src || res?.data?.path;
		if (!url) {
			ElMessage.error("上传成功了，但没有返回图片地址");
			return;
		}
		basicForm.avatar = url;
		ElMessage.success("头像上传成功");
	} catch (error: any) {
		ElMessage.error(error?.message || "头像上传失败");
	}
};

onMounted(loadMemberList);
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

.member-cell {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
}

.member-name {
	font-weight: 600;
}

.member-meta {
	margin-top: 4px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.detail-page {
	display: grid;
	gap: 16px;
}

.section-title {
	font-size: 16px;
	font-weight: 600;
}

.detail-card {
	padding: 20px;
	border-radius: 14px;
	background: #f8f8fb;
}

.detail-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 20px;
}

.detail-profile {
	display: flex;
	align-items: center;
	gap: 16px;
}

.profile-name {
	font-size: 16px;
	font-weight: 600;
}

.profile-id {
	margin-top: 6px;
	font-size: 16px;
	color: var(--el-text-color-secondary);
}

.basic-form {
	padding: 18px;
	border-radius: 12px;
	background: #fff;
}

.basic-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 8px 16px;
}

.compact-input {
	width: min(100%, 320px);
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}

.account-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 20px 40px;
	padding: 18px;
	border-radius: 12px;
	background: #fff;
}

.account-label {
	color: var(--el-text-color-secondary);
	font-size: 13px;
}

.account-value {
	margin-top: 10px;
	font-size: 16px;
	line-height: 1.3;
}

.status-cell {
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

@media (max-width: 768px) {
	.basic-grid,
	.account-grid {
		grid-template-columns: 1fr;
	}

	.detail-header {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
