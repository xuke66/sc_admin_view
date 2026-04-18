<template>
	<div class="page">
		<el-card shadow="never">
			<el-form :inline="true" :model="queryForm">
				<el-form-item label="关键词">
					<el-input v-model="queryForm.keywords" clearable placeholder="券名称/备注" style="width: 220px" />
				</el-form-item>
				<el-form-item label="类型">
					<el-select v-model="queryForm.type" clearable placeholder="全部类型" style="width: 140px">
						<el-option label="满减券" :value="1" />
						<el-option label="折扣券" :value="2" />
					</el-select>
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="queryForm.status" clearable placeholder="全部状态" style="width: 140px">
						<el-option label="启用" :value="1" />
						<el-option label="禁用" :value="0" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="loadList">查询</el-button>
					<el-button @click="resetQuery">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<el-card shadow="never">
			<template #header>
				<div class="header">
					<div>
						<div class="title">优惠券管理</div>
						<div class="subtitle">支持优惠券增删改查、手动发放和领取记录查看。</div>
					</div>
					<Auth value="shop:coupon:create">
						<el-button type="primary" @click="openCreateDialog">新增优惠券</el-button>
					</Auth>
				</div>
			</template>

			<el-table v-loading="loading" :data="list" border>
				<el-table-column prop="id" label="ID" width="90" align="center" />
				<el-table-column prop="name" label="优惠券名称" min-width="180" align="center" />
				<el-table-column prop="type_text" label="类型" width="100" align="center" />
				<el-table-column prop="use_scope_text" label="可用范围" min-width="140" align="center" />
				<el-table-column prop="content_text" label="优惠内容" min-width="180" align="center" />
				<el-table-column prop="receive_status_text" label="领取状态" width="110" align="center" />
				<el-table-column prop="receive_count" label="已领取" width="90" align="center" />
				<el-table-column prop="used_count" label="已使用" width="90" align="center" />
				<el-table-column prop="remain_count" label="剩余" width="90" align="center" />
				<el-table-column label="状态" width="110" align="center">
					<template #default="{ row }">
						<div class="status-cell">
							<el-badge
								is-dot
								:type="row.status === 1 ? 'success' : 'danger'"
								class="item"
								:badge-style="{ left: '-20px', top: '12px' }"
							/>
							<span>{{ row.status === 1 ? "启用" : "禁用" }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="300" fixed="right" align="center">
					<template #default="{ row }">
						<el-space>
							<Auth value="shop:coupon:grant">
								<el-button link type="primary" @click="openGrantDialog(row)">手动发放</el-button>
							</Auth>
							<Auth value="shop:coupon:records">
								<el-button link type="primary" @click="openRecordsDialog(row)">领取记录</el-button>
							</Auth>
							<Auth value="shop:coupon:edit">
								<el-button link type="primary" @click="openEditDialog(row.id)">编辑</el-button>
							</Auth>
							<Auth value="shop:coupon:status">
								<el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="handleStatusChange(row)">
									{{ row.status === 1 ? "禁用" : "启用" }}
								</el-button>
							</Auth>
							<Auth value="shop:coupon:delete">
								<el-button link type="danger" @click="handleDelete(row)">删除</el-button>
							</Auth>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog
			v-model="dialogVisible"
			:title="form.id ? '编辑优惠券' : '新增优惠券'"
			width="920px"
			destroy-on-close
			@closed="resetForm"
		>
			<el-form ref="formRef" :model="form" :rules="rules" label-width="92px" class="coupon-form">
				<div class="form-grid">
					<el-form-item label="券名称" prop="name">
						<el-input v-model="form.name" placeholder="例如：国庆优惠券" class="wide-input" />
					</el-form-item>
					<el-form-item label="名称备注" prop="description">
						<el-input v-model="form.description" placeholder="请输入名称备注" class="wide-input" />
					</el-form-item>
				</div>

				<el-form-item label="券类型" prop="type">
					<el-radio-group v-model="form.type">
						<el-radio :value="1">满减券</el-radio>
						<el-radio :value="2">折扣券</el-radio>
					</el-radio-group>
				</el-form-item>

				<div class="form-grid">
					<el-form-item label="消费满" prop="enough">
						<div class="inline-item">
							<el-input-number v-model="form.enough" :controls="false" :min="0" class="small-number" />
							<span class="inline-text">元</span>
						</div>
					</el-form-item>
					<el-form-item :label="form.type === 1 ? '立减' : '折扣'" prop="amount">
						<div class="inline-item">
							<el-input-number v-model="form.amount" :controls="false" :min="0" :max="form.type === 2 ? 10 : 999999" class="small-number" />
							<span class="inline-text">{{ form.type === 1 ? "元" : "折" }}</span>
						</div>
					</el-form-item>
					<el-form-item v-if="form.type === 2" label="最多减" prop="max_amount">
						<div class="inline-item">
							<el-input-number v-model="form.max_amount" :controls="false" :min="0" class="small-number" />
							<span class="inline-text">元</span>
						</div>
					</el-form-item>
				</div>

				<div class="form-grid">
					<el-form-item label="发券总量" prop="stock">
						<div class="inline-item">
							<el-input-number v-model="form.stock" :controls="false" :min="0" class="small-number" />
							<span class="inline-text">张</span>
						</div>
					</el-form-item>
					<el-form-item label="每人限领" prop="limit_num">
						<div class="inline-item">
							<el-input-number v-model="form.limit_num" :controls="false" :min="0" class="small-number" />
							<span class="inline-text">张</span>
						</div>
					</el-form-item>
				</div>

				<el-form-item label="领券时间" prop="receive_time">
					<el-date-picker
						v-model="receiveTimeRange"
						type="datetimerange"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						value-format="YYYY-MM-DD HH:mm:ss"
						range-separator="至"
						class="wide-picker"
					/>
				</el-form-item>

				<el-form-item label="券有效期" prop="use_time_type">
					<el-radio-group v-model="form.use_time_type">
						<el-radio :value="2">相对天数</el-radio>
						<el-radio :value="1">固定区间</el-radio>
					</el-radio-group>
				</el-form-item>

				<div v-if="form.use_time_type === 2" class="form-grid">
					<el-form-item label="领取后" prop="start_days">
						<div class="inline-item">
							<el-input-number v-model="form.start_days" :controls="false" :min="0" class="small-number" />
							<span class="inline-text">天后生效</span>
						</div>
					</el-form-item>
					<el-form-item label="有效期" prop="days">
						<div class="inline-item">
							<el-input-number v-model="form.days" :controls="false" :min="0" class="small-number" />
							<span class="inline-text">天</span>
						</div>
					</el-form-item>
				</div>
				<el-form-item v-else label="固定区间" prop="use_time_range">
					<el-date-picker
						v-model="useTimeRange"
						type="datetimerange"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						value-format="YYYY-MM-DD HH:mm:ss"
						range-separator="至"
						class="wide-picker"
					/>
				</el-form-item>

				<el-form-item label="优惠叠加" prop="is_superpose">
					<div class="switch-row">
						<el-switch v-model="form.is_superpose" :active-value="1" :inactive-value="0" />
						<span>{{ form.is_superpose ? "开启" : "关闭" }}</span>
					</div>
					<div class="field-tip">开启优惠叠加，优惠券将可以和活动一起使用</div>
				</el-form-item>

				<el-form-item label="可用范围" prop="use_scope">
					<el-radio-group v-model="form.use_scope">
						<el-radio :value="1">全场通用</el-radio>
						<el-radio :value="2">指定商品可用</el-radio>
						<el-radio :value="3">指定商品不可用</el-radio>
						<el-radio :value="4">指定分类可用</el-radio>
					</el-radio-group>
				</el-form-item>

				<el-form-item v-if="form.use_scope === 2 || form.use_scope === 3" label="指定商品" prop="use_scope_ids">
					<div class="scope-row">
						<el-input :model-value="selectedGoodsSummary" readonly class="wide-input" />
						<el-button type="primary" @click="openGoodsDialog">选择商品</el-button>
					</div>
				</el-form-item>

				<el-form-item v-if="form.use_scope === 4" label="指定分类" prop="use_scope_ids">
					<el-cascader
						v-model="form.use_scope_ids"
						:options="categoryOptions"
						:props="categoryProps"
						collapse-tags
						collapse-tags-tooltip
						clearable
						class="wide-input"
					/>
				</el-form-item>

				<el-form-item label="状态" prop="status">
					<el-radio-group v-model="form.status">
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

		<el-dialog v-model="goodsDialogVisible" title="选择商品" width="760px" destroy-on-close>
			<div class="dialog-toolbar">
				<el-input v-model="goodsKeyword" clearable placeholder="请输入商品名称" style="width: 220px" />
			</div>
			<el-table :data="filteredGoodsOptions" border @selection-change="handleGoodsSelectionChange">
				<el-table-column type="selection" width="60" align="center" />
				<el-table-column label="图片" width="90" align="center">
					<template #default="{ row }">
						<el-image v-if="row.image" :src="row.image" fit="cover" class="goods-thumb" :preview-src-list="[row.image]" preview-teleported />
						<div v-else class="goods-thumb goods-thumb--empty">暂无图片</div>
					</template>
				</el-table-column>
				<el-table-column prop="title" label="名称" min-width="360" align="center" />
			</el-table>
			<template #footer>
				<el-button @click="goodsDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="confirmGoodsSelection">确定</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="grantDialogVisible" title="手动发放" width="860px" destroy-on-close>
			<div class="grant-header">
				<div class="grant-title">{{ currentCoupon?.name || "-" }}</div>
				<div class="grant-subtitle">已选择 {{ selectedUserIds.length }} 位会员</div>
			</div>
			<div class="dialog-toolbar">
				<el-input v-model="memberKeyword" clearable placeholder="请输入昵称/手机号" style="width: 220px" />
			</div>
			<el-table ref="memberTableRef" :data="filteredMembers" border row-key="id" @selection-change="handleMemberSelectionChange">
				<el-table-column type="selection" width="60" align="center" reserve-selection />
				<el-table-column label="会员信息" min-width="240" align="center">
					<template #default="{ row }">
						<div class="member-cell">
							<el-avatar :src="row.avatar || undefined" :size="36">
								{{ (row.nickname || "U").slice(0, 1) }}
							</el-avatar>
							<div>
								<div class="member-name">{{ row.nickname || "-" }}</div>
								<div class="member-meta">{{ row.mobile || "未绑定手机号" }}</div>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="score" label="积分" width="100" align="center" />
				<el-table-column prop="money" label="余额" width="100" align="center" />
				<el-table-column prop="status_text" label="状态" width="100" align="center" />
			</el-table>
			<template #footer>
				<el-button @click="grantDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="grantSaving" @click="handleGrant">确认发放</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="recordsDialogVisible" title="领取记录" width="900px" destroy-on-close>
			<div class="dialog-toolbar">
				<el-input v-model="recordKeyword" clearable placeholder="请输入昵称/手机号" style="width: 220px" @input="loadRecords" />
			</div>
			<el-table v-loading="recordsLoading" :data="recordList" border>
				<el-table-column prop="id" label="ID" width="80" align="center" />
				<el-table-column label="会员信息" min-width="220" align="center">
					<template #default="{ row }">
						<div class="member-cell">
							<el-avatar :src="row.avatar || undefined" :size="34">
								{{ (row.nickname || "U").slice(0, 1) }}
							</el-avatar>
							<div>
								<div class="member-name">{{ row.nickname || "-" }}</div>
								<div class="member-meta">{{ row.mobile || "未绑定手机号" }}</div>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="领取时间" min-width="160" align="center" />
				<el-table-column prop="use_status_text" label="使用状态" width="100" align="center" />
				<el-table-column prop="use_time" label="使用时间" min-width="160" align="center" />
			</el-table>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="ShopCoupon">
import type { FormInstance, FormRules, TableInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { ShopService } from "@/common/api/shop";
import { UserService, type MemberItem } from "@/common/api/user";

type GoodsOption = {
	id: number;
	title: string;
	image: string;
};

type CategoryOption = {
	value: number;
	label: string;
	children?: CategoryOption[];
};

const categoryProps = {
	multiple: true,
	checkStrictly: true,
	emitPath: false,
	value: "value",
	label: "label",
	children: "children",
};

const loading = ref(false);
const saving = ref(false);
const grantSaving = ref(false);
const recordsLoading = ref(false);
const dialogVisible = ref(false);
const goodsDialogVisible = ref(false);
const grantDialogVisible = ref(false);
const recordsDialogVisible = ref(false);
const formRef = ref<FormInstance>();
const memberTableRef = ref<TableInstance>();

const list = ref<any[]>([]);
const recordList = ref<any[]>([]);
const goodsOptions = ref<GoodsOption[]>([]);
const categoryOptions = ref<CategoryOption[]>([]);
const memberList = ref<MemberItem[]>([]);
const currentCoupon = ref<any | null>(null);
const selectedGoodsBuffer = ref<number[]>([]);
const selectedUserIds = ref<number[]>([]);
const goodsKeyword = ref("");
const memberKeyword = ref("");
const recordKeyword = ref("");
const receiveTimeRange = ref<string[]>([]);
const useTimeRange = ref<string[]>([]);

const queryForm = reactive({
	keywords: "",
	status: "" as "" | 0 | 1,
	type: "" as "" | 1 | 2,
});

const form = reactive({
	id: 0,
	name: "",
	description: "",
	type: 1 as 1 | 2,
	use_scope: 1 as 1 | 2 | 3 | 4,
	use_scope_ids: [] as number[],
	amount: 0,
	max_amount: 0,
	enough: 0,
	stock: 0,
	limit_num: 0,
	start_time: "",
	end_time: "",
	use_time_type: 2 as 1 | 2,
	use_start_time: "",
	use_end_time: "",
	start_days: 0,
	days: 0,
	is_superpose: 0 as 0 | 1,
	status: 1 as 0 | 1,
});

const rules: FormRules = {
	name: [{ required: true, message: "请输入券名称", trigger: "blur" }],
	type: [{ required: true, message: "请选择券类型", trigger: "change" }],
	amount: [{ required: true, message: "请输入优惠值", trigger: "blur" }],
	stock: [{ required: true, message: "请输入发券总量", trigger: "blur" }],
	use_scope: [{ required: true, message: "请选择可用范围", trigger: "change" }],
};

const filteredGoodsOptions = computed(() => {
	const keyword = goodsKeyword.value.trim().toLowerCase();
	if (!keyword) return goodsOptions.value;
	return goodsOptions.value.filter((item) => item.title.toLowerCase().includes(keyword));
});

const filteredMembers = computed(() => {
	const keyword = memberKeyword.value.trim().toLowerCase();
	if (!keyword) return memberList.value;
	return memberList.value.filter((item) => {
		return String(item.nickname || "").toLowerCase().includes(keyword) || String(item.mobile || "").toLowerCase().includes(keyword);
	});
});

const selectedGoodsSummary = computed(() => {
	if (!form.use_scope_ids.length) return "请选择商品";
	const titles = goodsOptions.value.filter((item) => form.use_scope_ids.includes(item.id)).map((item) => item.title);
	if (!titles.length) return `已选 ${form.use_scope_ids.length} 个商品`;
	if (titles.length <= 2) return titles.join("、");
	return `${titles.slice(0, 2).join("、")} 等 ${titles.length} 个商品`;
});

const loadList = async () => {
	loading.value = true;
	try {
		const res = await ShopService.getCouponList(queryForm);
		list.value = res.data || [];
	} finally {
		loading.value = false;
	}
};

const loadGoodsOptions = async () => {
	const res = await ShopService.getGoodsList({ status: 1 });
	goodsOptions.value = (res.data || []).map((item: any) => ({
		id: Number(item.id),
		title: item.title || "",
		image: item.image || item.cover || item.main_image || "",
	}));
};

const mapCategoryOptions = (rows: any[] = []): CategoryOption[] => {
	return rows.map((item) => ({
		value: Number(item.id),
		label: item.title || item.name || "",
		children: mapCategoryOptions(item.children || []),
	}));
};

const loadCategories = async () => {
	const res = await ShopService.getCategoryList();
	categoryOptions.value = mapCategoryOptions(res.data || []);
};

const loadMembers = async () => {
	const res = await UserService.getMemberList();
	memberList.value = res.data || [];
};

const loadRecords = async () => {
	if (!currentCoupon.value?.id) return;
	recordsLoading.value = true;
	try {
		const res = await ShopService.getCouponRecords(currentCoupon.value.id, { keywords: recordKeyword.value });
		recordList.value = res.data || [];
	} finally {
		recordsLoading.value = false;
	}
};

const resetQuery = () => {
	queryForm.keywords = "";
	queryForm.status = "";
	queryForm.type = "";
	loadList();
};

const resetForm = () => {
	form.id = 0;
	form.name = "";
	form.description = "";
	form.type = 1;
	form.use_scope = 1;
	form.use_scope_ids = [];
	form.amount = 0;
	form.max_amount = 0;
	form.enough = 0;
	form.stock = 0;
	form.limit_num = 0;
	form.start_time = "";
	form.end_time = "";
	form.use_time_type = 2;
	form.use_start_time = "";
	form.use_end_time = "";
	form.start_days = 0;
	form.days = 0;
	form.is_superpose = 0;
	form.status = 1;
	receiveTimeRange.value = [];
	useTimeRange.value = [];
	selectedGoodsBuffer.value = [];
	formRef.value?.clearValidate();
};

const assignForm = (detail: any) => {
	form.id = Number(detail.id || 0);
	form.name = detail.name || "";
	form.description = detail.description || "";
	form.type = Number(detail.type || 1) === 2 ? 2 : 1;
	form.use_scope = Number(detail.use_scope || 1) as 1 | 2 | 3 | 4;
	form.use_scope_ids = (detail.use_scope_ids || []).map((item: any) => Number(item));
	form.amount = Number(detail.amount || 0);
	form.max_amount = Number(detail.max_amount || 0);
	form.enough = Number(detail.enough || 0);
	form.stock = Number(detail.stock || 0);
	form.limit_num = Number(detail.limit_num || 0);
	form.start_time = detail.start_time || "";
	form.end_time = detail.end_time || "";
	form.use_time_type = Number(detail.use_time_type || 2) === 1 ? 1 : 2;
	form.use_start_time = detail.use_start_time || "";
	form.use_end_time = detail.use_end_time || "";
	form.start_days = Number(detail.start_days || 0);
	form.days = Number(detail.days || 0);
	form.is_superpose = Number(detail.is_superpose || 0) === 1 ? 1 : 0;
	form.status = Number(detail.status || 0) === 1 ? 1 : 0;
	receiveTimeRange.value = form.start_time && form.end_time ? [form.start_time, form.end_time] : [];
	useTimeRange.value = form.use_start_time && form.use_end_time ? [form.use_start_time, form.use_end_time] : [];
	selectedGoodsBuffer.value = [...form.use_scope_ids];
};

const openCreateDialog = async () => {
	resetForm();
	await Promise.all([loadGoodsOptions(), loadCategories()]);
	dialogVisible.value = true;
};

const openEditDialog = async (id: number) => {
	resetForm();
	await Promise.all([loadGoodsOptions(), loadCategories()]);
	const res = await ShopService.getCouponDetail(id);
	assignForm(res.data || {});
	dialogVisible.value = true;
};

const openGoodsDialog = async () => {
	if (!goodsOptions.value.length) {
		await loadGoodsOptions();
	}
	selectedGoodsBuffer.value = [...form.use_scope_ids];
	goodsDialogVisible.value = true;
};

const handleGoodsSelectionChange = (rows: GoodsOption[]) => {
	selectedGoodsBuffer.value = rows.map((item) => item.id);
};

const confirmGoodsSelection = () => {
	form.use_scope_ids = [...selectedGoodsBuffer.value];
	goodsDialogVisible.value = false;
};

const fillTimeFields = () => {
	form.start_time = receiveTimeRange.value?.[0] || "";
	form.end_time = receiveTimeRange.value?.[1] || "";
	form.use_start_time = useTimeRange.value?.[0] || "";
	form.use_end_time = useTimeRange.value?.[1] || "";
	if (form.use_scope === 1) {
		form.use_scope_ids = [];
	}
};

const handleSave = async () => {
	if (!formRef.value) return;
	fillTimeFields();
	if ((form.use_scope === 2 || form.use_scope === 3 || form.use_scope === 4) && !form.use_scope_ids.length) {
		ElMessage.error("请先设置可用范围");
		return;
	}
	await formRef.value.validate();
	saving.value = true;
	try {
		await ShopService.saveCoupon({ ...form });
		ElMessage.success(form.id ? "优惠券已更新" : "优惠券已创建");
		dialogVisible.value = false;
		await loadList();
	} catch (error: any) {
		ElMessage.error(error?.message || "保存失败");
	} finally {
		saving.value = false;
	}
};

const handleStatusChange = async (row: any) => {
	try {
		await ShopService.updateCouponStatus(row.id, row.status === 1 ? 0 : 1);
		ElMessage.success(row.status === 1 ? "优惠券已禁用" : "优惠券已启用");
		await loadList();
	} catch (error: any) {
		ElMessage.error(error?.message || "状态更新失败");
	}
};

const handleDelete = async (row: any) => {
	ElMessageBox.confirm(`确认删除优惠券 ${row.name} 吗？`, "删除优惠券", {
		type: "warning",
		confirmButtonText: "确认",
		cancelButtonText: "取消",
	}).then(async () => {
		await ShopService.delCoupon(row.id);
		ElMessage.success("优惠券已删除");
		await loadList();
	});
};

const openGrantDialog = async (row: any) => {
	currentCoupon.value = row;
	selectedUserIds.value = [];
	memberKeyword.value = "";
	await loadMembers();
	grantDialogVisible.value = true;
	await nextTick();
	memberTableRef.value?.clearSelection();
};

const handleMemberSelectionChange = (rows: MemberItem[]) => {
	selectedUserIds.value = rows.map((item) => Number(item.id));
};

const handleGrant = async () => {
	if (!currentCoupon.value?.id) return;
	if (!selectedUserIds.value.length) {
		ElMessage.error("请先选择会员");
		return;
	}
	grantSaving.value = true;
	try {
		await ShopService.grantCoupon({ id: currentCoupon.value.id, user_ids: selectedUserIds.value });
		ElMessage.success("优惠券发放成功");
		grantDialogVisible.value = false;
		await loadList();
	} catch (error: any) {
		ElMessage.error(error?.message || "发放失败");
	} finally {
		grantSaving.value = false;
	}
};

const openRecordsDialog = async (row: any) => {
	currentCoupon.value = row;
	recordKeyword.value = "";
	recordsDialogVisible.value = true;
	await loadRecords();
};

onMounted(async () => {
	await Promise.all([loadList(), loadGoodsOptions(), loadCategories()]);
});
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

.status-cell {
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.coupon-form {
	padding-right: 12px;
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	column-gap: 24px;
}

.wide-input {
	width: 360px;
}

.wide-picker {
	width: 400px;
}

.inline-item {
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

.inline-text {
	color: var(--el-text-color-secondary);
}

.small-number {
	width: 120px;
}

.switch-row {
	display: inline-flex;
	align-items: center;
	gap: 10px;
}

.field-tip {
	margin-top: 6px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.scope-row {
	display: inline-flex;
	align-items: center;
	gap: 12px;
}

.dialog-toolbar {
	display: flex;
	justify-content: flex-start;
	margin-bottom: 12px;
}

.goods-thumb {
	width: 40px;
	height: 40px;
	border-radius: 4px;
	border: 1px solid var(--el-border-color-light);
}

.goods-thumb--empty {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	color: var(--el-text-color-secondary);
	background: var(--el-fill-color-light);
}

.grant-header {
	margin-bottom: 12px;
}

.grant-title {
	font-size: 16px;
	font-weight: 600;
}

.grant-subtitle {
	margin-top: 4px;
	font-size: 13px;
	color: var(--el-text-color-secondary);
}

.member-cell {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
}

.member-name {
	font-weight: 600;
}

.member-meta {
	margin-top: 4px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

@media (max-width: 1200px) {
	.form-grid {
		grid-template-columns: 1fr;
	}
}
</style>
