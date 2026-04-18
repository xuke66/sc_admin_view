<template>
	<div class="page">
		<el-card shadow="never">
			<el-form :inline="true" :model="queryForm">
				<el-form-item label="关键词">
					<el-input v-model="queryForm.keywords" clearable placeholder="商品名称/规格" style="width: 220px" />
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
						<div class="title">积分商品</div>
						<div class="subtitle">管理积分兑换商品，单规格自动绑定默认 SKU，多规格选择具体规格后单独配置。</div>
					</div>
					<Auth value="shop:goods-score:create">
						<el-button type="primary" @click="openCreateDialog">新增积分商品</el-button>
					</Auth>
				</div>
			</template>

			<el-table v-loading="loading" :data="list" border>
				<el-table-column prop="id" label="ID" width="90" align="center" />
				<el-table-column prop="display_title" label="商品名称" min-width="260" align="center" />
				<el-table-column prop="score" label="兑换积分" width="110" align="center" />
				<el-table-column prop="price" label="兑换金额" width="110" align="center" />
				<el-table-column prop="stock" label="可兑换库存" width="120" align="center" />
				<el-table-column prop="sales" label="虚拟销量" width="110" align="center" />
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
				<el-table-column prop="update_time" label="更新时间" min-width="160" align="center" />
				<el-table-column label="操作" width="220" fixed="right" align="center">
					<template #default="{ row }">
						<el-space>
							<Auth value="shop:goods-score:edit">
								<el-button link type="primary" @click="openEditDialog(row.id)">编辑</el-button>
							</Auth>
							<Auth value="shop:goods-score:status">
								<el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="handleStatusChange(row)">
									{{ row.status === 1 ? "禁用" : "启用" }}
								</el-button>
							</Auth>
							<Auth value="shop:goods-score:delete">
								<el-button link type="danger" @click="handleDelete(row)">删除</el-button>
							</Auth>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog
			v-model="dialogVisible"
			:title="form.id ? '编辑积分商品' : '新增积分商品'"
			width="680px"
			destroy-on-close
			@closed="resetForm"
		>
			<el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
				<el-form-item label="商品" prop="goods_id">
					<div class="goods-selector">
						<el-input :model-value="selectedGoodsLabel" readonly placeholder="请选择商品" style="width: 320px" />
						<el-button type="primary" size="small" @click="openGoodsDialog">选择商品</el-button>
					</div>
				</el-form-item>
				<el-form-item v-if="selectedGoodsIsSku" label="规格" prop="sku_price_id">
					<el-select v-model="form.sku_price_id" placeholder="请选择具体规格" style="width: 320px">
						<el-option v-for="item in skuOptions" :key="item.id" :label="item.goods_sku_text" :value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item v-else label="规格">
					<el-input :model-value="singleSkuLabel" readonly style="width: 320px" />
				</el-form-item>
				<el-form-item label="兑换积分" prop="score">
					<el-input-number v-model="form.score" :min="0" :controls="false" class="compact-number" />
				</el-form-item>
				<el-form-item label="兑换金额" prop="price">
					<el-input-number v-model="form.price" :min="0" :precision="2" :controls="false" class="compact-number" />
				</el-form-item>
				<el-form-item label="可兑换库存" prop="stock">
					<el-input-number v-model="form.stock" :min="0" :controls="false" class="compact-number" />
				</el-form-item>
				<el-form-item label="虚拟销量" prop="sales">
					<el-input-number v-model="form.sales" :min="0" :controls="false" class="compact-number" />
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

		<el-dialog v-model="goodsDialogVisible" title="选择商品" width="760px" destroy-on-close class="goods-picker-dialog">
			<div class="goods-dialog-toolbar">
				<el-input
					v-model="goodsKeyword"
					clearable
					placeholder="请输入商品名称"
					size="small"
					style="width: 220px"
					@input="handleGoodsKeywordChange"
				/>
			</div>
			<el-table :data="pagedGoodsOptions" border class="goods-picker-table">
				<el-table-column label="图片" width="84" align="center">
					<template #default="{ row }">
						<el-image
							v-if="row.image"
							:src="row.image"
							fit="cover"
							class="goods-thumb"
							preview-teleported
							:preview-src-list="[row.image]"
						/>
						<div v-else class="goods-thumb goods-thumb--empty">暂无图片</div>
					</template>
				</el-table-column>
				<el-table-column prop="title" label="名称" min-width="420" align="center" />
				<el-table-column label="选择" width="92" align="center">
					<template #default="{ row }">
						<el-button type="primary" size="small" plain @click="selectGoods(row)">
							{{ form.goods_id === row.id ? "已选择" : "选择" }}
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="goods-pagination">
				<el-pagination
					background
					layout="total, prev, pager, next"
					:current-page="goodsPage"
					:page-size="goodsPageSize"
					:total="filteredGoodsOptions.length"
					@current-change="handleGoodsPageChange"
				/>
			</div>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="ShopGoodsScore">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { ShopService } from "@/common/api/shop";

type GoodsOption = {
	id: number;
	title: string;
	image: string;
	is_sku: number;
};

type SkuOption = {
	id: number;
	goods_sku_text: string;
};

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const goodsDialogVisible = ref(false);
const formRef = ref<FormInstance>();

const list = ref<any[]>([]);
const goodsOptions = ref<GoodsOption[]>([]);
const skuOptions = ref<SkuOption[]>([]);
const selectedGoodsIsSku = ref(false);
const singleSkuLabel = ref("单规格自动绑定");
const goodsKeyword = ref("");
const goodsPage = ref(1);
const goodsPageSize = 6;

const queryForm = reactive({
	keywords: "",
	status: "" as "" | 0 | 1,
});

const form = reactive({
	id: 0,
	goods_id: 0,
	sku_price_id: 0,
	stock: 0,
	sales: 0,
	price: 0,
	score: 0,
	status: 1 as 0 | 1,
});

const rules: FormRules = {
	goods_id: [{ required: true, message: "请选择商品", trigger: "change" }],
	sku_price_id: [
		{
			validator: (_rule, value, callback) => {
				if (selectedGoodsIsSku.value && !value) {
					callback(new Error("请选择具体规格"));
					return;
				}
				callback();
			},
			trigger: "change",
		},
	],
	score: [{ required: true, message: "请输入兑换积分", trigger: "blur" }],
	stock: [{ required: true, message: "请输入库存", trigger: "blur" }],
};

const filteredGoodsOptions = computed(() => {
	const keyword = goodsKeyword.value.trim().toLowerCase();
	if (!keyword) return goodsOptions.value;
	return goodsOptions.value.filter((item) => item.title.toLowerCase().includes(keyword));
});

const pagedGoodsOptions = computed(() => {
	const start = (goodsPage.value - 1) * goodsPageSize;
	return filteredGoodsOptions.value.slice(start, start + goodsPageSize);
});

const selectedGoodsLabel = computed(() => {
	const current = goodsOptions.value.find((item) => item.id === form.goods_id);
	return current?.title || "";
});

const resetForm = () => {
	form.id = 0;
	form.goods_id = 0;
	form.sku_price_id = 0;
	form.stock = 0;
	form.sales = 0;
	form.price = 0;
	form.score = 0;
	form.status = 1;
	selectedGoodsIsSku.value = false;
	skuOptions.value = [];
	singleSkuLabel.value = "单规格自动绑定";
	goodsKeyword.value = "";
	goodsPage.value = 1;
	formRef.value?.clearValidate();
};

const loadGoodsOptions = async () => {
	const res = await ShopService.getGoodsList({ status: 1 });
	goodsOptions.value = (res.data || []).map((item: any) => ({
		id: Number(item.id),
		title: item.title || "",
		image: item.image || item.cover || item.main_image || "",
		is_sku: Number(item.is_sku || 0),
	}));
};

const loadList = async () => {
	loading.value = true;
	try {
		const res = await ShopService.getGoodsScoreList(queryForm);
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

const handleGoodsChange = async (goodsId: number) => {
	form.sku_price_id = 0;
	skuOptions.value = [];
	if (!goodsId) {
		selectedGoodsIsSku.value = false;
		singleSkuLabel.value = "单规格自动绑定";
		return;
	}

	const res = await ShopService.getGoodsDetail(goodsId);
	const detail = res.data || {};
	const goods = detail.goods || {};
	selectedGoodsIsSku.value = Number(goods.is_sku || 0) === 1;

	if (selectedGoodsIsSku.value) {
		skuOptions.value = (detail.sku_prices || []).map((item: any) => ({
			id: Number(item.id),
			goods_sku_text: item.goods_sku_text || "",
		}));
		return;
	}

	const singleSku = detail.single_sku;
	form.sku_price_id = Number(singleSku?.id || 0);
	singleSkuLabel.value = singleSku?.id ? "单规格自动绑定默认规格" : "单规格未找到默认规格";
};

const openGoodsDialog = async () => {
	if (!goodsOptions.value.length) {
		await loadGoodsOptions();
	}
	goodsKeyword.value = "";
	goodsPage.value = 1;
	goodsDialogVisible.value = true;
};

const selectGoods = async (row: GoodsOption) => {
	form.goods_id = row.id;
	await handleGoodsChange(row.id);
	goodsDialogVisible.value = false;
};

const handleGoodsKeywordChange = () => {
	goodsPage.value = 1;
};

const handleGoodsPageChange = (page: number) => {
	goodsPage.value = page;
};

const openCreateDialog = async () => {
	resetForm();
	await loadGoodsOptions();
	dialogVisible.value = true;
};

const openEditDialog = async (id: number) => {
	resetForm();
	await loadGoodsOptions();
	const res = await ShopService.getGoodsScoreDetail(id);
	const detail = res.data || {};
	form.id = Number(detail.id || 0);
	form.goods_id = Number(detail.goods_id || 0);
	form.sku_price_id = Number(detail.sku_price_id || 0);
	form.stock = Number(detail.stock || 0);
	form.sales = Number(detail.sales || 0);
	form.price = Number(detail.price || 0);
	form.score = Number(detail.score || 0);
	form.status = Number(detail.status || 0) === 1 ? 1 : 0;
	await handleGoodsChange(form.goods_id);
	if (!selectedGoodsIsSku.value) {
		form.sku_price_id = Number(detail.sku_price_id || form.sku_price_id || 0);
	}
	dialogVisible.value = true;
};

const handleSave = async () => {
	if (!formRef.value) return;
	await formRef.value.validate();
	saving.value = true;
	try {
		await ShopService.saveGoodsScore({ ...form });
		ElMessage.success(form.id ? "积分商品已更新" : "积分商品已创建");
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
		await ShopService.updateGoodsScoreStatus(row.id, row.status === 1 ? 0 : 1);
		ElMessage.success(row.status === 1 ? "积分商品已禁用" : "积分商品已启用");
		await loadList();
	} catch (error: any) {
		ElMessage.error(error?.message || "状态更新失败");
	}
};

const handleDelete = async (row: any) => {
	ElMessageBox.confirm(`确认删除积分商品 ${row.display_title} 吗？`, "删除积分商品", {
		type: "warning",
		confirmButtonText: "确认",
		cancelButtonText: "取消",
	}).then(async () => {
		await ShopService.delGoodsScore(row.id);
		ElMessage.success("积分商品已删除");
		await loadList();
	});
};

onMounted(async () => {
	await Promise.all([loadGoodsOptions(), loadList()]);
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

.compact-number {
	width: 220px;
}

.status-cell {
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.goods-selector {
	display: inline-flex;
	align-items: center;
	gap: 12px;
}

.goods-picker-dialog :deep(.el-dialog__header) {
	padding-bottom: 12px;
	border-bottom: 1px solid var(--el-border-color-lighter);
}

.goods-picker-dialog :deep(.el-dialog__title) {
	font-size: 15px;
	font-weight: 600;
}

.goods-dialog-toolbar {
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

.goods-picker-table :deep(.el-table__cell) {
	padding: 8px 0;
}

.goods-picker-table :deep(.cell) {
	line-height: 1.4;
}

.goods-pagination {
	display: flex;
	justify-content: flex-end;
	margin-top: 12px;
}
</style>
