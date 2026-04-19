<template>
	<div class="page">
		<el-card shadow="never" class="filter-card">
			<el-form :model="queryForm" label-width="86px">
				<div class="filter-grid">
					<el-form-item label="综合搜索">
						<el-input v-model="queryForm.keywords" clearable placeholder="订单号/会员/收货人/电话" />
					</el-form-item>
					<el-form-item label="订单号">
						<el-input v-model="queryForm.order_sn" clearable placeholder="请输入订单号" />
					</el-form-item>
					<el-form-item label="商品">
						<el-input v-model="queryForm.goods_keywords" clearable placeholder="商品名称/规格" />
					</el-form-item>
					<el-form-item label="收货人">
						<el-input v-model="queryForm.receiver" clearable placeholder="请输入收货人" />
					</el-form-item>
					<el-form-item label="收货电话">
						<el-input v-model="queryForm.receiver_mobile" clearable placeholder="请输入电话" />
					</el-form-item>
					<el-form-item label="发货单号">
						<el-input v-model="queryForm.express_no" clearable placeholder="请输入发货单号" />
					</el-form-item>
					<el-form-item label="创建时间">
						<el-date-picker v-model="queryForm.create_time" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" start-placeholder="开始" end-placeholder="结束" />
					</el-form-item>
					<el-form-item label="支付时间">
						<el-date-picker v-model="queryForm.pay_time" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" start-placeholder="开始" end-placeholder="结束" />
					</el-form-item>
					<el-form-item label="发货时间">
						<el-date-picker v-model="queryForm.send_time" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" start-placeholder="开始" end-placeholder="结束" />
					</el-form-item>
				</div>
				<div class="filter-actions">
					<el-button type="primary" @click="loadList">查询</el-button>
					<el-button @click="resetQuery">重置</el-button>
				</div>
			</el-form>
		</el-card>

		<el-card shadow="never" class="list-card">
			<el-tabs v-model="activeStatus" @tab-change="loadList">
				<el-tab-pane :label="`全部订单 (${counts.all || 0})`" name="" />
				<el-tab-pane :label="`待发货 (${counts[1] || 0})`" name="1" />
				<el-tab-pane :label="`部分发货 (${counts[2] || 0})`" name="2" />
				<el-tab-pane :label="`全部发货 (${counts[3] || 0})`" name="3" />
				<el-tab-pane :label="`交易完成 (${counts[4] || 0})`" name="4" />
			</el-tabs>

			<div v-loading="loading" class="order-list">
				<el-empty v-if="!loading && !orders.length" description="暂无订单" />
				<div v-for="order in orders" :key="order.id" class="order-card">
					<div class="order-top">
						<div>
							<div class="order-title">
								<el-tag :type="order.type === 2 ? 'danger' : 'primary'" effect="light" round>{{ order.type_text }}</el-tag>
								<el-link :underline="false" type="primary" class="plain-link" @click="openDetail(order.id)">{{ order.order_sn }}</el-link>
								<el-icon class="copy-icon" title="复制订单号" @click.stop="copyText(order.order_sn)">
									<DocumentCopy />
								</el-icon>
								<el-link :underline="false" :type="getOrderLinkType(order.status)" class="state-link">{{ order.status_text }}</el-link>
							</div>
							<div class="order-meta">
								<span>下单时间：{{ order.create_time || "-" }}</span>
								<span>支付时间：{{ order.pay_time || "-" }}</span>
								<span>支付渠道：{{ order.pay_channel_text || "-" }}</span>
								<span>发货时间：{{ order.send_time || "-" }}</span>
							</div>
						</div>
						<div class="order-actions">
							<Auth value="order:list:detail">
								<el-button type="primary" plain size="small" @click="openDetail(order.id)">详情</el-button>
							</Auth>
							<Auth value="order:list:ship">
								<el-button v-if="order.status === 1 || order.status === 2" type="success" plain size="small" @click="openShipDialog(order.id)">发货</el-button>
							</Auth>
						</div>
					</div>

					<div class="info-line">
						<span>会员：{{ order.user_nickname || "-" }} / {{ order.user_mobile || "-" }}</span>
						<span>收货：{{ formatReceiver(order.address) }}</span>
						<span>订单 ￥{{ order.order_amount }}</span>
						<span>实付 <b>￥{{ order.pay_fee }}</b></span>
						<span>优惠 ￥{{ order.total_discount_fee }}</span>
					</div>

					<div class="goods-list">
						<div v-for="item in order.items" :key="item.id" class="goods-row">
							<el-image v-if="item.goods_image" :src="item.goods_image" fit="cover" class="goods-image" preview-teleported :preview-src-list="[item.goods_image]" />
							<div v-else class="goods-image goods-image-empty">无图</div>
							<div class="goods-line">
								<span>{{ item.goods_title || "-" }}</span>
								<span class="muted">{{ item.sku_text || "单规格" }}</span>
								<span>￥{{ item.goods_price }}</span>
								<span>x{{ item.goods_num }}</span>
								<span class="danger">实付 ￥{{ item.pay_fee }}</span>
							</div>
						</div>
					</div>

					<div v-if="order.expresses?.length" class="express-list">
						<div v-for="express in order.expresses" :key="express.id" class="express-row">
							<span>{{ express.express_name || "-" }}</span>
							<el-link :underline="false" type="primary" class="plain-link" @click="openExpressDetail(express.id)">运单号：{{ express.express_no || "-" }}</el-link>
							<el-link :underline="false" :type="getExpressTagType(express.status)" class="state-link">{{ express.status_text || "-" }}</el-link>
						</div>
					</div>
				</div>
			</div>
		</el-card>

		<el-dialog v-model="detailVisible" title="订单详情" width="980px" destroy-on-close>
			<div v-loading="detailLoading" v-if="detail">
				<el-descriptions title="支付信息" :column="3">
					<el-descriptions-item label="订单号">{{ detail.order_sn }}</el-descriptions-item>
					<el-descriptions-item label="支付时间">{{ detail.pay_time || "-" }}</el-descriptions-item>
					<el-descriptions-item label="支付渠道">{{ detail.pay_channel_text || "-" }}</el-descriptions-item>
					<el-descriptions-item label="订单金额">￥{{ detail.order_amount }}</el-descriptions-item>
					<el-descriptions-item label="实付金额">￥{{ detail.pay_fee }}</el-descriptions-item>
					<el-descriptions-item label="订单状态">{{ detail.status_text }}</el-descriptions-item>
				</el-descriptions>
				<el-descriptions title="收货信息" :column="3" class="detail-block">
					<el-descriptions-item label="收货人">{{ detail.address?.consignee || "-" }}</el-descriptions-item>
					<el-descriptions-item label="手机号">{{ detail.address?.mobile || "-" }}</el-descriptions-item>
					<el-descriptions-item label="收货地址">{{ formatAddress(detail.address) }}</el-descriptions-item>
				</el-descriptions>

				<div class="detail-title">商品信息</div>
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
					<el-table-column prop="goods_price" label="单价" width="100" align="center" />
					<el-table-column prop="goods_num" label="购买数量" width="100" align="center" />
					<el-table-column prop="shipped_num" label="已发货" width="100" align="center" />
					<el-table-column prop="can_ship_num" label="可发货" width="100" align="center" />
					<el-table-column prop="pay_fee" label="实付" width="100" align="center" />
				</el-table>

				<div class="detail-title">包裹信息</div>
				<el-tabs v-if="detail.expresses?.length" type="border-card" class="express-detail-tabs">
					<el-tab-pane v-for="express in detail.expresses" :key="express.id" :label="express.express_no || '包裹'">
						<el-descriptions :column="3" size="small">
							<el-descriptions-item label="物流公司">{{ express.express_name }}</el-descriptions-item>
							<el-descriptions-item label="运单号">{{ express.express_no }}</el-descriptions-item>
							<el-descriptions-item label="状态">{{ express.status_text }}</el-descriptions-item>
						</el-descriptions>
						<el-timeline v-if="express.delivery_nodes?.length" class="express-timeline">
							<el-timeline-item v-for="(node, index) in express.delivery_nodes" :key="index" :timestamp="node.time || node.datetime">
								{{ node.content || node.context || node.status }}
							</el-timeline-item>
						</el-timeline>
						<div v-else class="compact-empty">暂无物流节点</div>
					</el-tab-pane>
				</el-tabs>
				<div v-else class="compact-empty">暂无包裹信息</div>

				<template v-if="detail.aftersales?.length">
					<div class="detail-title">售后信息</div>
					<el-table :data="detail.aftersales || []">
						<el-table-column prop="aftersale_sn" label="售后单号" min-width="170" align="center" />
						<el-table-column prop="type_text" label="类型" width="90" align="center" />
						<el-table-column prop="status_text" label="状态" width="100" align="center" />
						<el-table-column prop="refund_fee" label="退款金额" width="110" align="center" />
						<el-table-column prop="reason" label="原因" min-width="160" align="center" />
					</el-table>
				</template>
			</div>
			<template #footer>
				<el-button @click="detailVisible = false">关闭</el-button>
				<Auth value="order:list:ship">
					<el-button v-if="detail && (detail.status === 1 || detail.status === 2)" type="success" @click="openShipDialog(detail.id)">发货</el-button>
				</Auth>
			</template>
		</el-dialog>

		<el-dialog v-model="expressDetailVisible" title="发货单详情" width="760px" destroy-on-close>
			<div v-loading="expressDetailLoading" v-if="expressDetail">
				<el-descriptions :column="3">
					<el-descriptions-item label="物流公司">{{ expressDetail.express_name }}</el-descriptions-item>
					<el-descriptions-item label="运单号">{{ expressDetail.express_no }}</el-descriptions-item>
					<el-descriptions-item label="状态">{{ expressDetail.status_text }}</el-descriptions-item>
					<el-descriptions-item label="发货时间">{{ expressDetail.send_time || "-" }}</el-descriptions-item>
					<el-descriptions-item label="收货时间">{{ expressDetail.receive_time || "-" }}</el-descriptions-item>
				</el-descriptions>
				<div class="detail-title">发货商品</div>
				<el-table :data="expressDetail.items || []">
					<el-table-column prop="goods_title" label="商品" min-width="220" align="center" />
					<el-table-column prop="sku_text" label="规格" min-width="120" align="center" />
					<el-table-column prop="num" label="数量" width="90" align="center" />
				</el-table>
				<div class="detail-title">物流节点</div>
				<el-timeline v-if="expressDetail.delivery_nodes?.length" class="express-timeline">
					<el-timeline-item v-for="(node, index) in expressDetail.delivery_nodes" :key="index" :timestamp="node.time || node.datetime">
						{{ node.content || node.context || node.status }}
					</el-timeline-item>
				</el-timeline>
				<div v-else class="compact-empty">暂无物流节点</div>
			</div>
		</el-dialog>

		<el-dialog v-model="shipVisible" title="订单发货" width="900px" destroy-on-close @closed="resetShipForm">
			<div v-loading="shipLoading" v-if="shipOrder">
				<el-descriptions :column="2">
					<el-descriptions-item label="订单号">{{ shipOrder.order_sn }}</el-descriptions-item>
					<el-descriptions-item label="支付时间">{{ shipOrder.pay_time || "-" }}</el-descriptions-item>
					<el-descriptions-item label="支付金额">￥{{ shipOrder.pay_fee }}</el-descriptions-item>
					<el-descriptions-item label="收货信息">{{ formatReceiver(shipOrder.address) }}</el-descriptions-item>
				</el-descriptions>

				<el-table :data="shipOrder.items || []" @selection-change="handleShipSelectionChange">
					<el-table-column type="selection" width="55" align="center" :selectable="(row:any) => row.can_ship_num > 0" />
					<el-table-column prop="goods_title" label="商品" min-width="220" align="center" />
					<el-table-column prop="sku_text" label="规格" min-width="120" align="center" />
					<el-table-column prop="goods_num" label="购买" width="80" align="center" />
					<el-table-column prop="shipped_num" label="已发" width="80" align="center" />
					<el-table-column prop="can_ship_num" label="可发" width="80" align="center" />
					<el-table-column label="本次发货" width="150" align="center">
						<template #default="{ row }">
							<el-input-number v-model="shipNums[row.id]" :min="0" :max="row.can_ship_num" :controls="false" style="width: 100px" />
						</template>
					</el-table-column>
				</el-table>

				<el-form class="ship-form" label-width="90px">
					<el-form-item label="物流公司">
						<el-select v-model="shipForm.express_code" filterable placeholder="请选择物流公司" style="width: 260px" @change="handleExpressChange">
							<el-option v-for="item in expressCompanies" :key="item.id" :label="`${item.company} / ${item.code}`" :value="item.code" />
						</el-select>
					</el-form-item>
					<el-form-item label="运单号">
						<el-input v-model="shipForm.express_no" placeholder="请输入运单号" style="width: 260px" />
					</el-form-item>
				</el-form>
			</div>
			<template #footer>
				<el-button @click="shipVisible = false">取消</el-button>
				<el-button type="primary" :loading="shipSaving" @click="handleShip">确认发货</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="OrderList">
import { DocumentCopy } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { OrderService } from "@/common/api/order";

const loading = ref(false);
const detailLoading = ref(false);
const shipLoading = ref(false);
const shipSaving = ref(false);
const expressDetailLoading = ref(false);
const detailVisible = ref(false);
const shipVisible = ref(false);
const expressDetailVisible = ref(false);
const activeStatus = ref("");
const orders = ref<any[]>([]);
const counts = ref<Record<string, number>>({ all: 0, 1: 0, 2: 0, 3: 0, 4: 0 });
const detail = ref<any | null>(null);
const expressDetail = ref<any | null>(null);
const shipOrder = ref<any | null>(null);
const expressCompanies = ref<any[]>([]);
const selectedShipRows = ref<any[]>([]);
const shipNums = reactive<Record<number, number>>({});

const queryForm = reactive({
	keywords: "",
	order_sn: "",
	goods_keywords: "",
	receiver: "",
	receiver_mobile: "",
	express_no: "",
	create_time: [] as string[],
	pay_time: [] as string[],
	send_time: [] as string[],
});

const shipForm = reactive({
	express_name: "",
	express_code: "",
	express_no: "",
});

const loadList = async () => {
	loading.value = true;
	try {
		const res = await OrderService.getOrderList({ ...queryForm, status: activeStatus.value });
		orders.value = res.data?.list || [];
		counts.value = res.data?.counts || counts.value;
	} finally {
		loading.value = false;
	}
};

const resetQuery = () => {
	Object.assign(queryForm, {
		keywords: "",
		order_sn: "",
		goods_keywords: "",
		receiver: "",
		receiver_mobile: "",
		express_no: "",
		create_time: [],
		pay_time: [],
		send_time: [],
	});
	loadList();
};

const openDetail = async (id: number) => {
	detailVisible.value = true;
	detailLoading.value = true;
	try {
		const res = await OrderService.getOrderDetail(id);
		detail.value = res.data || null;
	} finally {
		detailLoading.value = false;
	}
};

const openExpressDetail = async (id: number) => {
	expressDetailVisible.value = true;
	expressDetailLoading.value = true;
	try {
		const res = await OrderService.getExpressDetail(id);
		expressDetail.value = res.data || null;
	} finally {
		expressDetailLoading.value = false;
	}
};

const openShipDialog = async (id: number) => {
	shipVisible.value = true;
	shipLoading.value = true;
	try {
		const [detailRes, companyRes] = await Promise.all([OrderService.getOrderDetail(id), OrderService.getExpressCompanies()]);
		shipOrder.value = detailRes.data || null;
		expressCompanies.value = companyRes.data || [];
		(shipOrder.value?.items || []).forEach((item: any) => {
			shipNums[item.id] = item.can_ship_num > 0 ? 1 : 0;
		});
	} finally {
		shipLoading.value = false;
	}
};

const resetShipForm = () => {
	shipOrder.value = null;
	selectedShipRows.value = [];
	shipForm.express_name = "";
	shipForm.express_code = "";
	shipForm.express_no = "";
	Object.keys(shipNums).forEach((key) => delete shipNums[Number(key)]);
};

const handleShipSelectionChange = (rows: any[]) => {
	selectedShipRows.value = rows;
};

const handleExpressChange = (code: string) => {
	const current = expressCompanies.value.find((item) => item.code === code);
	shipForm.express_name = current?.company || "";
};

const handleShip = async () => {
	if (!shipOrder.value) return;
	const items = selectedShipRows.value
		.map((item) => ({ order_item_id: item.id, num: shipNums[item.id] || 0 }))
		.filter((item) => item.num > 0);
	if (!items.length) {
		ElMessage.error("请选择发货商品并设置数量");
		return;
	}
	if (!shipForm.express_code || !shipForm.express_no) {
		ElMessage.error("请选择物流公司并填写运单号");
		return;
	}
	shipSaving.value = true;
	try {
		await OrderService.shipOrder({ order_id: shipOrder.value.id, items, ...shipForm });
		ElMessage.success("发货成功");
		shipVisible.value = false;
		await loadList();
		if (detailVisible.value && detail.value?.id) {
			await openDetail(detail.value.id);
		}
	} catch (error: any) {
		ElMessage.error(error?.message || "发货失败");
	} finally {
		shipSaving.value = false;
	}
};

const formatAddress = (address: any) => {
	if (!address) return "-";
	return `${address.province_name || ""}${address.city_name || ""}${address.district_name || ""}${address.address || ""}` || "-";
};

const formatReceiver = (address: any) => {
	if (!address) return "-";
	return `${address.consignee || "-"} / ${address.mobile || "-"} / ${formatAddress(address)}`;
};

const getOrderLinkType = (status: number) => {
	const map: Record<number, "primary" | "success" | "warning" | "danger" | "info"> = {
		1: "warning",
		2: "primary",
		3: "success",
		4: "info",
	};
	return map[Number(status)] || "info";
};

const getExpressTagType = (status: number) => {
	const map: Record<number, "primary" | "success" | "warning" | "danger" | "info"> = {
		0: "primary",
		1: "warning",
		3: "success",
		4: "danger",
		5: "danger",
	};
	return map[Number(status)] || "info";
};

const copyText = async (text: string) => {
	if (!text) return;
	try {
		await navigator.clipboard.writeText(text);
		ElMessage.success("订单号已复制");
	} catch {
		const input = document.createElement("input");
		input.value = text;
		document.body.appendChild(input);
		input.select();
		document.execCommand("copy");
		document.body.removeChild(input);
		ElMessage.success("订单号已复制");
	}
};

onMounted(loadList);
</script>

<style scoped lang="scss">
.page {
	display: grid;
	gap: 16px;
	background: linear-gradient(135deg, rgba(48, 111, 255, 0.06), rgba(255, 139, 76, 0.04));
}

.filter-card,
.list-card {
	border: 0;
	box-shadow: 0 12px 30px rgba(31, 45, 61, 0.08);
}

.filter-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	column-gap: 16px;
}

.filter-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
}

.order-list {
	display: grid;
	gap: 12px;
	min-height: 160px;
}

.order-card {
	overflow: hidden;
	border: 1px solid rgba(80, 105, 150, 0.12);
	background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
	box-shadow: 0 10px 24px rgba(40, 55, 90, 0.06);
}

.order-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 12px 16px;
	border-bottom: 1px solid rgba(80, 105, 150, 0.1);
}

.order-title,
.order-meta,
.info-line,
.goods-line,
.express-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 10px 14px;
	font-size: 14px;
	font-weight: 400;
}

.order-meta {
	margin-top: 5px;
	font-size: 13px;
	color: var(--el-text-color-secondary);
}

.order-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.plain-link,
.state-link {
	cursor: default;
	font-weight: 400;
}

.plain-link {
	cursor: pointer;
}

.copy-icon {
	cursor: pointer;
	color: var(--el-text-color-secondary);
	transition: color 0.15s ease;
}

.copy-icon:hover {
	color: var(--el-color-primary);
}

.state-link :deep(.el-link__inner),
.plain-link :deep(.el-link__inner) {
	transition: none;
}

.state-link:hover,
.state-link:hover :deep(.el-link__inner) {
	opacity: 1;
	filter: none;
}

.info-line {
	padding: 10px 16px;
	border-bottom: 1px solid rgba(80, 105, 150, 0.1);
	color: var(--el-text-color-regular);
}

.info-line b,
.danger {
	color: #e85b38;
}

.goods-list {
	display: grid;
	gap: 6px;
	padding: 10px 16px;
	border-bottom: 1px solid rgba(80, 105, 150, 0.08);
}

.goods-row {
	display: grid;
	grid-template-columns: 46px minmax(0, 1fr);
	align-items: center;
	gap: 8px;
	padding: 6px 8px;
	border-radius: 10px;
	background: rgba(245, 247, 250, 0.75);
}

.goods-image {
	width: 40px;
	height: 40px;
	border-radius: 8px;
	border: 1px solid var(--el-border-color-light);
}

.goods-image-empty {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	color: var(--el-text-color-secondary);
	background: var(--el-fill-color-light);
}

.muted {
	color: var(--el-text-color-secondary);
}

.express-list {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 6px;
	padding: 7px 16px;
}

.express-row {
	justify-content: flex-end;
	padding: 4px 9px;
	border-radius: 999px;
	background: #f4f8ff;
	line-height: 22px;
	color: var(--el-text-color-secondary);
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

.ship-form {
	display: flex;
	gap: 12px;
	margin-top: 18px;
}

.express-detail-tabs :deep(.el-tabs__content) {
	padding: 10px 12px;
}

.express-detail-tabs :deep(.el-tabs__header) {
	margin-bottom: 0;
}

.express-timeline {
	margin-top: 8px;
}

.express-timeline :deep(.el-timeline-item) {
	padding-bottom: 8px;
}

.compact-empty {
	padding: 10px 12px;
	border-radius: 8px;
	color: var(--el-text-color-secondary);
	background: var(--el-fill-color-light);
	font-size: 13px;
}

@media (max-width: 1280px) {
	.filter-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
</style>
TEST202604190003222222333335***
