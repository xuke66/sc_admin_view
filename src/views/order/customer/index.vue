<template>
	<div class="customer-order-page">
		<el-card shadow="never" class="toolbar-card">
			<div class="toolbar">
				<el-select
					v-model="selectedUserId"
					filterable
					remote
					clearable
					:remote-method="searchUsers"
					:loading="userLoading"
					placeholder="搜索会员昵称/手机号"
					class="user-select"
				>
					<el-option v-for="user in users" :key="user.id" :label="formatUser(user)" :value="user.id" />
				</el-select>
				<el-input v-model="keywords" clearable placeholder="搜索商品名称" class="goods-search" @keyup.enter="loadGoods" />
				<el-button type="primary" @click="loadGoods">查询商品</el-button>
			</div>
		</el-card>

		<div v-loading="loading" class="goods-grid">
			<el-card v-for="goods in goodsList" :key="goods.id" shadow="hover" class="goods-card">
				<el-image v-if="goods.image" :src="goods.image" fit="cover" class="goods-image" />
				<div v-else class="goods-image empty-image">无图</div>
				<div class="goods-info">
					<div class="goods-title">{{ goods.title }}</div>
					<div class="goods-subtitle">{{ goods.subtitle || "暂无副标题" }}</div>
					<div class="goods-meta">
						<span class="price">¥{{ getSelectedSku(goods)?.price || goods.min_price }}</span>
						<span>库存 {{ getSelectedSku(goods)?.stock || goods.total_stock }}</span>
					</div>
					<el-select v-model="selectedSkuMap[goods.id]" size="small" class="sku-select" placeholder="选择规格">
						<el-option v-for="sku in goods.sku_prices" :key="sku.id" :label="`${sku.text} / ¥${sku.price} / 库存${sku.stock}`" :value="sku.id" />
					</el-select>
					<el-button type="primary" class="add-btn" :disabled="!getSelectedSku(goods) || getSelectedSku(goods)?.stock <= 0" @click="addCart(goods)">
						加入购物车
					</el-button>
				</div>
			</el-card>
			<el-empty v-if="!loading && !goodsList.length" description="暂无商品" />
		</div>

		<div v-if="cartVisible" class="cart-popover">
			<div class="cart-head">
				<span>已选商品</span>
				<el-button link type="danger" @click="clearCart">清空</el-button>
			</div>
			<div v-if="cartItems.length" class="cart-list">
				<div v-for="item in cartItems" :key="item.key" class="cart-row">
					<div class="cart-info">
						<div class="cart-title">{{ item.goods_title }}</div>
						<div class="cart-spec">{{ item.sku_text }}</div>
						<div class="cart-price">¥{{ item.price }}</div>
					</div>
					<el-input-number v-model="item.num" :min="1" :max="item.stock" size="small" />
					<el-button link type="danger" @click="removeCart(item)">删除</el-button>
				</div>
			</div>
			<el-empty v-else description="还没有选择商品" />
			<div class="cart-footer">
				<div>
					<span>共 {{ totalNum }} 件</span>
					<b class="total-price">¥{{ totalAmount }}</b>
				</div>
				<el-button type="primary" :disabled="!cartItems.length || !selectedUserId" @click="submitOrder">生成待支付订单</el-button>
			</div>
		</div>

		<div class="float-cart" @click="cartVisible = !cartVisible">
			<el-badge :value="totalNum" :hidden="totalNum <= 0">
				<el-icon size="28"><ShoppingCart /></el-icon>
			</el-badge>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { ShoppingCart } from "@element-plus/icons-vue";
import { OrderService } from "@/common/api/order";

const loading = ref(false);
const userLoading = ref(false);
const keywords = ref("");
const selectedUserId = ref<number | undefined>();
const users = ref<any[]>([]);
const goodsList = ref<any[]>([]);
const cartVisible = ref(false);
const cartItems = ref<any[]>([]);
const selectedSkuMap = reactive<Record<number, number>>({});

const totalNum = computed(() => cartItems.value.reduce((sum, item) => sum + Number(item.num || 0), 0));
const totalAmount = computed(() => {
	const amount = cartItems.value.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.num || 0), 0);
	return amount.toFixed(2);
});

onMounted(() => {
	searchUsers("");
	loadGoods();
});

async function loadGoods() {
	loading.value = true;
	try {
		const res = await OrderService.getCustomerGoods({ keywords: keywords.value });
		goodsList.value = res.data || [];
		goodsList.value.forEach((goods) => {
			if (!selectedSkuMap[goods.id] && goods.sku_prices?.length) {
				selectedSkuMap[goods.id] = goods.sku_prices[0].id;
			}
		});
	} finally {
		loading.value = false;
	}
}

async function searchUsers(value: string) {
	userLoading.value = true;
	try {
		const res = await OrderService.getCustomerUsers({ keywords: value });
		users.value = res.data || [];
	} finally {
		userLoading.value = false;
	}
}

function formatUser(user: any) {
	return `${user.nickname || "用户" + user.id} / ${user.mobile || "未绑定手机"}`;
}

function getSelectedSku(goods: any) {
	const skuId = selectedSkuMap[goods.id];
	return (goods.sku_prices || []).find((sku: any) => sku.id === skuId);
}

function addCart(goods: any) {
	const sku = getSelectedSku(goods);
	if (!sku) {
		ElMessage.warning("请选择规格");
		return;
	}
	const key = `${goods.id}_${sku.id}`;
	const exists = cartItems.value.find((item) => item.key === key);
	if (exists) {
		if (exists.num >= exists.stock) {
			ElMessage.warning("库存不足");
			return;
		}
		exists.num += 1;
	} else {
		cartItems.value.push({
			key,
			goods_id: goods.id,
			sku_price_id: sku.id,
			goods_title: goods.title,
			sku_text: sku.text,
			price: sku.price,
			stock: sku.stock,
			num: 1,
		});
	}
	cartVisible.value = true;
}

function removeCart(item: any) {
	cartItems.value = cartItems.value.filter((goods) => goods.key !== item.key);
}

function clearCart() {
	cartItems.value = [];
}

async function submitOrder() {
	if (!selectedUserId.value) {
		ElMessage.warning("请选择会员");
		return;
	}
	if (!cartItems.value.length) {
		ElMessage.warning("请选择商品");
		return;
	}

	const res = await OrderService.createCustomerOrder({
		user_id: selectedUserId.value,
		items: cartItems.value.map((item) => ({
			goods_id: item.goods_id,
			sku_price_id: item.sku_price_id,
			num: item.num,
		})),
	});
	ElMessage.success(`已生成待支付订单：${res.data?.order_sn || ""}`);
	clearCart();
	cartVisible.value = false;
	loadGoods();
}
</script>

<style lang="scss" scoped>
.customer-order-page {
	position: relative;
	min-height: calc(100vh - 120px);
	padding-bottom: 110px;
}

.customer-order-page :deep(.el-button--primary) {
	--el-button-bg-color: #2bbd38;
	--el-button-border-color: #2bbd38;
	--el-button-hover-bg-color: #25a931;
	--el-button-hover-border-color: #25a931;
	--el-button-active-bg-color: #1f982a;
	--el-button-active-border-color: #1f982a;
}

.toolbar-card {
	margin-bottom: 16px;
}

.toolbar {
	display: flex;
	gap: 12px;
	align-items: center;
}

.user-select {
	width: 280px;
}

.goods-search {
	width: 260px;
}

.goods-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 16px;
}

.goods-card :deep(.el-card__body) {
	display: flex;
	gap: 14px;
}

.goods-image {
	flex: none;
	width: 96px;
	height: 96px;
	border-radius: 8px;
	background: #f1f1f1;
}

.empty-image {
	display: flex;
	align-items: center;
	justify-content: center;
	color: #999;
}

.goods-info {
	display: flex;
	flex: 1;
	min-width: 0;
	flex-direction: column;
}

.goods-title {
	overflow: hidden;
	color: #222;
	font-weight: 700;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.goods-subtitle {
	overflow: hidden;
	margin-top: 6px;
	color: #999;
	font-size: 12px;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.goods-meta {
	display: flex;
	justify-content: space-between;
	margin-top: 10px;
	color: #777;
	font-size: 13px;
}

.price,
.cart-price,
.total-price {
	color: #f04b2f;
}

.sku-select {
	margin-top: 10px;
}

.add-btn {
	margin-top: 10px;
}

.float-cart {
	position: fixed;
	right: 34px;
	bottom: 34px;
	z-index: 20;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 64px;
	height: 64px;
	border-radius: 50%;
	background: #2bbd38;
	color: #fff;
	box-shadow: 0 10px 28px rgb(43 189 56 / 35%);
	cursor: pointer;
}

.cart-popover {
	position: fixed;
	right: 34px;
	bottom: 112px;
	z-index: 19;
	width: 520px;
	max-height: 520px;
	padding: 18px;
	border-radius: 10px;
	background: #fff;
	box-shadow: 0 12px 36px rgb(0 0 0 / 18%);
}

.cart-head,
.cart-row,
.cart-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.cart-head {
	margin-bottom: 12px;
	font-size: 16px;
	font-weight: 700;
}

.cart-list {
	max-height: 340px;
	overflow-y: auto;
}

.cart-row {
	gap: 12px;
	padding: 12px 0;
	border-bottom: 1px solid #eee;
}

.cart-info {
	flex: 1;
	min-width: 0;
}

.cart-title,
.cart-spec {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.cart-title {
	color: #222;
	font-weight: 700;
}

.cart-spec {
	margin-top: 4px;
	color: #999;
	font-size: 12px;
}

.cart-price {
	margin-top: 6px;
}

.cart-footer {
	padding-top: 16px;
}

.total-price {
	margin-left: 12px;
	font-size: 20px;
}
</style>
