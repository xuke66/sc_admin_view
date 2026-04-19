<template>
	<div class="page">
		<el-card shadow="never">
			<el-form :inline="true" :model="queryForm">
				<el-form-item label="关键词">
					<el-input v-model="queryForm.keywords" clearable placeholder="售后单/订单号/会员" style="width: 260px" />
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="queryForm.status" clearable placeholder="全部状态" style="width: 140px">
						<el-option label="未处理" :value="0" />
						<el-option label="申请售后" :value="1" />
						<el-option label="已同意" :value="2" />
						<el-option label="已退款" :value="3" />
						<el-option label="已拒绝" :value="-1" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="loadList">查询</el-button>
					<el-button @click="resetQuery">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<el-card shadow="never">
			<el-table v-loading="loading" :data="list">
				<el-table-column prop="aftersale_sn" label="售后单号" min-width="170" align="center" />
				<el-table-column prop="order_sn" label="订单号" min-width="170" align="center" />
				<el-table-column prop="user_nickname" label="会员" min-width="130" align="center" />
				<el-table-column prop="type_text" label="类型" width="90" align="center" />
				<el-table-column prop="status_text" label="状态" width="100" align="center" />
				<el-table-column prop="refund_fee" label="退款金额" width="110" align="center" />
				<el-table-column label="售后商品" min-width="260" align="center">
					<template #default="{ row }">
						<div v-for="item in row.items" :key="item.id" class="goods-name">
							{{ item.goods_title }} {{ item.sku_text || "" }} x{{ item.num }}
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="reason" label="原因" min-width="160" align="center" />
				<el-table-column label="操作" width="230" fixed="right" align="center">
					<template #default="{ row }">
						<el-space>
							<Auth value="order:aftersale:detail">
								<el-button link type="primary" @click="openDetail(row.id)">详情</el-button>
							</Auth>
							<Auth value="order:aftersale:agree">
								<el-button v-if="canAudit(row)" link type="primary" @click="openAction(row, 'agree')">同意</el-button>
							</Auth>
							<Auth value="order:aftersale:refuse">
								<el-button v-if="canAudit(row)" link type="danger" @click="openAction(row, 'refuse')">拒绝</el-button>
							</Auth>
							<Auth value="order:aftersale:refund">
								<el-button v-if="canRefund(row)" link type="warning" @click="openAction(row, 'refund')">财务退款</el-button>
							</Auth>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog v-model="detailVisible" title="售后详情" width="980px" destroy-on-close>
			<div v-loading="detailLoading" v-if="detail">
				<el-descriptions title="订单信息" :column="3">
					<el-descriptions-item label="订单号">{{ detail.order_sn }}</el-descriptions-item>
					<el-descriptions-item label="支付时间">{{ detail.pay_time || "-" }}</el-descriptions-item>
					<el-descriptions-item label="支付金额">￥{{ detail.pay_fee }}</el-descriptions-item>
					<el-descriptions-item label="会员">{{ detail.user_nickname || "-" }} / {{ detail.user_mobile || "-" }}</el-descriptions-item>
					<el-descriptions-item label="收货人">{{ detail.address?.consignee || "-" }}</el-descriptions-item>
					<el-descriptions-item label="收货地址">{{ formatAddress(detail.address) }}</el-descriptions-item>
				</el-descriptions>

				<el-descriptions title="申请信息" :column="3" class="detail-block">
					<el-descriptions-item label="售后单号">{{ detail.aftersale_sn }}</el-descriptions-item>
					<el-descriptions-item label="类型">{{ detail.type_text }}</el-descriptions-item>
					<el-descriptions-item label="状态">{{ detail.status_text }}</el-descriptions-item>
					<el-descriptions-item label="退款金额">￥{{ detail.refund_fee }}</el-descriptions-item>
					<el-descriptions-item label="联系方式">{{ detail.mobile || "-" }}</el-descriptions-item>
					<el-descriptions-item label="申请时间">{{ detail.create_time || "-" }}</el-descriptions-item>
					<el-descriptions-item label="申请原因">{{ detail.reason || "-" }}</el-descriptions-item>
					<el-descriptions-item label="描述">{{ detail.content || "-" }}</el-descriptions-item>
				</el-descriptions>

				<div class="detail-title">售后商品</div>
				<el-table :data="detail.items || []">
					<el-table-column label="商品" min-width="260" align="center">
						<template #default="{ row }">
							<div class="table-goods">
								<el-image v-if="row.goods_image" :src="row.goods_image" fit="cover" class="goods-image" />
								<span>{{ row.goods_title }}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="sku_text" label="规格" min-width="120" align="center" />
					<el-table-column prop="num" label="数量" width="100" align="center" />
					<el-table-column prop="goods_price" label="单价" width="110" align="center" />
				</el-table>

				<div class="detail-title">发货信息</div>
				<el-table :data="detail.expresses || []">
					<el-table-column prop="express_name" label="物流公司" min-width="140" align="center" />
					<el-table-column prop="express_no" label="运单号" min-width="180" align="center" />
					<el-table-column prop="send_time" label="发货时间" min-width="160" align="center" />
					<el-table-column prop="receive_time" label="收货时间" min-width="160" align="center" />
				</el-table>

				<div class="detail-title">操作备注</div>
				<el-table :data="detail.remarks || []">
					<el-table-column prop="title" label="动作" width="120" align="center" />
					<el-table-column prop="remark" label="备注" min-width="220" align="center" />
					<el-table-column prop="create_time" label="时间" min-width="160" align="center" />
				</el-table>
			</div>
			<template #footer>
				<el-button @click="detailVisible = false">关闭</el-button>
				<Auth value="order:aftersale:agree">
					<el-button v-if="detail && canAudit(detail)" type="primary" @click="openAction(detail, 'agree')">同意</el-button>
				</Auth>
				<Auth value="order:aftersale:refuse">
					<el-button v-if="detail && canAudit(detail)" type="danger" @click="openAction(detail, 'refuse')">拒绝</el-button>
				</Auth>
				<Auth value="order:aftersale:refund">
					<el-button v-if="detail && canRefund(detail)" type="warning" @click="openAction(detail, 'refund')">财务退款</el-button>
				</Auth>
			</template>
		</el-dialog>

		<el-dialog v-model="actionVisible" :title="actionTitle" width="460px" destroy-on-close>
			<el-form label-width="80px">
				<el-form-item label="备注">
					<el-input v-model="actionRemark" type="textarea" :rows="4" placeholder="请输入操作备注" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="actionVisible = false">取消</el-button>
				<el-button type="primary" :loading="actionSaving" @click="handleAction">确认</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="OrderAftersale">
import { ElMessage } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { OrderService } from "@/common/api/order";

const loading = ref(false);
const detailLoading = ref(false);
const actionSaving = ref(false);
const detailVisible = ref(false);
const actionVisible = ref(false);
const list = ref<any[]>([]);
const detail = ref<any | null>(null);
const currentRow = ref<any | null>(null);
const currentAction = ref<"agree" | "refuse" | "refund">("agree");
const actionRemark = ref("");

const queryForm = reactive({
	keywords: "",
	status: "" as "" | number,
});

const actionTitle = computed(() => {
	const map = { agree: "同意售后", refuse: "拒绝售后", refund: "财务退款" };
	return map[currentAction.value];
});

const loadList = async () => {
	loading.value = true;
	try {
		const res = await OrderService.getAftersaleList(queryForm);
		list.value = res.data || [];
	} finally {
		loading.value = false;
	}
};

const resetQuery = () => {
	queryForm.keywords = "";
	queryForm.status = "";
	loadList();
};

const openDetail = async (id: number) => {
	detailVisible.value = true;
	detailLoading.value = true;
	try {
		const res = await OrderService.getAftersaleDetail(id);
		detail.value = res.data || null;
	} finally {
		detailLoading.value = false;
	}
};

const openAction = (row: any, action: "agree" | "refuse" | "refund") => {
	currentRow.value = row;
	currentAction.value = action;
	actionRemark.value = "";
	actionVisible.value = true;
};

const handleAction = async () => {
	if (!currentRow.value?.id) return;
	actionSaving.value = true;
	try {
		const payload = { id: currentRow.value.id, remark: actionRemark.value };
		if (currentAction.value === "agree") await OrderService.agreeAftersale(payload);
		if (currentAction.value === "refuse") await OrderService.refuseAftersale(payload);
		if (currentAction.value === "refund") await OrderService.refundAftersale(payload);
		ElMessage.success(`${actionTitle.value}成功`);
		actionVisible.value = false;
		await loadList();
		if (detailVisible.value && detail.value?.id) {
			await openDetail(detail.value.id);
		}
	} catch (error: any) {
		ElMessage.error(error?.message || "操作失败");
	} finally {
		actionSaving.value = false;
	}
};

const canAudit = (row: any) => Number(row.status) === 0 || Number(row.status) === 1;
const canRefund = (row: any) => Number(row.status) === 1 || Number(row.status) === 2;

const formatAddress = (address: any) => {
	if (!address) return "-";
	return `${address.province_name || ""}${address.city_name || ""}${address.district_name || ""}${address.address || ""}` || "-";
};

onMounted(loadList);
</script>

<style scoped lang="scss">
.page {
	display: grid;
	gap: 16px;
}

.goods-name + .goods-name {
	margin-top: 4px;
}

.detail-block,
.detail-title {
	margin-top: 18px;
}

.detail-title {
	margin-bottom: 10px;
	font-size: 15px;
	font-weight: 600;
}

.table-goods {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
}

.goods-image {
	width: 40px;
	height: 40px;
	border-radius: 5px;
	border: 1px solid var(--el-border-color-light);
}
</style>
