<template>
    <div class="page">
        <el-card shadow="never">
            <template #header>
                <div class="header">
                    <div>
                        <div class="title">商品管理</div>
                        <div class="subtitle">支持单规格、多规格、运费模板、商品参数、详情编辑和单 SKU 补货。</div>
                    </div>
                    <Auth value="shop:goods:create">
                        <el-button type="primary" @click="openCreate">新增商品</el-button>
                    </Auth>
                </div>
            </template>

            <div class="toolbar">
                <el-form inline :model="filters">
                    <el-form-item label="关键词">
                        <el-input v-model="filters.keywords" clearable placeholder="搜索商品标题" style="width: 240px" @keyup.enter="loadGoodsList" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="filters.status" clearable placeholder="全部" style="width: 160px">
                            <el-option label="上架" :value="1" />
                            <el-option label="下架" :value="0" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="loadGoodsList">查询</el-button>
                        <el-button @click="resetFilters">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <el-table v-loading="loading" :data="goodsList" border row-key="id">
                <el-table-column prop="id" label="ID" width="70" align="center" />
                <el-table-column label="主图" width="90" align="center">
                    <template #default="{ row }">
                        <el-image v-if="row.image" :src="row.image" fit="cover" class="thumb" />
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="商品标题" min-width="220" show-overflow-tooltip />
                <el-table-column label="分类" min-width="180" show-overflow-tooltip>
                    <template #default="{ row }">
                        {{ row.cate_names?.join(' / ') || '-' }}
                    </template>
                </el-table-column>
                <el-table-column label="规格类型" width="110" align="center">
                    <template #default="{ row }">
                        {{ Number(row.is_sku) === 1 ? "多规格" : "单规格" }}
                    </template>
                </el-table-column>
                <el-table-column label="价格区间" min-width="140" align="center">
                    <template #default="{ row }">
                        {{ formatPriceRange(row.min_price, row.max_price) }}
                    </template>
                </el-table-column>
                <el-table-column label="库存" width="100" align="center">
                    <template #default="{ row }">
                        {{ row.total_stock ?? 0 }}
                    </template>
                </el-table-column>
                <el-table-column label="运费模板" min-width="150" show-overflow-tooltip>
                    <template #default="{ row }">
                        {{ row.shipping_template_name || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="update_time" label="更新时间" min-width="170" align="center" />
                <el-table-column label="状态" width="110" align="center">
                    <template #default="{ row }">
                        <Auth value="shop:goods:status">
                            <el-switch
                                :model-value="Number(row.status) === 1"
                                inline-prompt
                                active-text="上架"
                                inactive-text="下架"
                                @change="value => handleStatusChange(row, value)"
                            />
                        </Auth>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="240" align="center">
                    <template #default="{ row }">
                        <el-space>
                            <Auth value="shop:goods:edit">
                                <el-button link type="primary" @click="openEdit(row.id)">编辑</el-button>
                            </Auth>
                            <Auth value="shop:goods:restock">
                                <el-button link type="primary" @click="openRestock(row.id)">补货</el-button>
                            </Auth>
                            <Auth value="shop:goods:delete">
                                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
                            </Auth>
                        </el-space>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <GoodsEditorDialog
            ref="editorRef"
            v-model="editorVisible"
            :category-options="categoryOptions"
            :shipping-template-options="shippingTemplateOptions"
            :goods-service-options="goodsServiceOptions"
            @saved="loadGoodsList"
        />

        <el-dialog v-model="restockVisible" title="商品补货" width="980px" destroy-on-close>
            <el-table v-loading="restockLoading" :data="restockRows" border>
                <el-table-column label="规格" min-width="200">
                    <template #default="{ row }">
                        {{ row.goods_sku_text || "单规格" }}
                    </template>
                </el-table-column>
                <el-table-column label="当前库存" width="110" align="center">
                    <template #default="{ row }">
                        {{ row.stock }}
                    </template>
                </el-table-column>
                <el-table-column label="补货数量" width="160" align="center">
                    <template #default="{ row }">
                        <el-input-number v-model="row.restock_stock" :min="1" :precision="0" class="full-width" />
                    </template>
                </el-table-column>
                <el-table-column label="备注" min-width="220">
                    <template #default="{ row }">
                        <el-input v-model="row.restock_msg" placeholder="选填补货备注" maxlength="255" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="center">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleRestock(row)">确认补货</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <template #footer>
                <el-button @click="restockVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="ShopGoods">
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import GoodsEditorDialog from "@/views/shop/components/GoodsEditorDialog.vue";
import { ShopService } from "@/common/api/shop";

type GoodsItem = {
    id: number;
    title: string;
    image?: string;
    cate_names?: string[];
    is_sku?: number;
    min_price?: number;
    max_price?: number;
    total_stock?: number;
    shipping_template_name?: string;
    status?: number;
    update_time?: string;
};

type CategoryItem = {
    id: number;
    name: string;
    children?: CategoryItem[];
};

type GoodsServiceItem = {
    id: number;
    name: string;
    image?: string;
    description?: string;
};

type RestockRow = {
    id: number;
    goods_sku_text: string;
    stock: number;
    restock_stock: number;
    restock_msg: string;
};

const editorRef = ref<any>();
const editorVisible = ref(false);
const loading = ref(false);
const restockLoading = ref(false);
const restockVisible = ref(false);
const currentRestockGoodsId = ref(0);
const goodsList = ref<GoodsItem[]>([]);
const categoryOptions = ref<CategoryItem[]>([]);
const shippingTemplateOptions = ref<any[]>([]);
const goodsServiceOptions = ref<GoodsServiceItem[]>([]);
const restockRows = ref<RestockRow[]>([]);

const filters = reactive({
    keywords: "",
    status: undefined as number | undefined,
});

const formatTemplateLabel = (item: any) => item.name || `${Number(item.type) === 2 ? "按重量" : "按件"}模板 #${item.id}`;
const formatPriceRange = (minPrice = 0, maxPrice = 0) =>
    Number(minPrice) === Number(maxPrice) ? `￥${Number(minPrice).toFixed(2)}` : `￥${Number(minPrice).toFixed(2)} - ￥${Number(maxPrice).toFixed(2)}`;

const loadBaseOptions = async () => {
    const [categoryRes, shippingRes, serviceRes] = await Promise.all([
        ShopService.getCategoryList(),
        ShopService.getShippingTemplateList(),
        ShopService.getGoodsServiceList(),
    ]);
    categoryOptions.value = categoryRes.data || [];
    shippingTemplateOptions.value = (shippingRes.data || []).map((item: any) => ({
        ...item,
        label: formatTemplateLabel(item),
    }));
    goodsServiceOptions.value = serviceRes.data || [];
};

const loadGoodsList = async () => {
    loading.value = true;
    try {
        const params: Record<string, any> = { keywords: filters.keywords.trim() };
        if (filters.status !== undefined) params.status = filters.status;
        const res = await ShopService.getGoodsList(params);
        goodsList.value = res.data || [];
    } finally {
        loading.value = false;
    }
};

const resetFilters = async () => {
    filters.keywords = "";
    filters.status = undefined;
    await loadGoodsList();
};

const openCreate = () => {
    editorVisible.value = true;
    editorRef.value?.openCreate();
};

const openEdit = async (id: number) => {
    editorVisible.value = true;
    await editorRef.value?.openEdit(id);
};

const handleDelete = async (row: GoodsItem) => {
    try {
        await ElMessageBox.confirm(`确定删除商品“${row.title}”吗？`, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        });
        await ShopService.delGoods(row.id);
        ElMessage.success("商品已删除");
        await loadGoodsList();
    } catch (error: any) {
        if (error !== "cancel") ElMessage.error(error?.message || "删除失败");
    }
};

const handleStatusChange = async (row: GoodsItem, value: string | number | boolean) => {
    const nextStatus = value ? 1 : 0;
    const previousStatus = Number(row.status ?? 0);
    row.status = nextStatus;
    try {
        await ShopService.updateGoodsStatus(row.id, nextStatus as 0 | 1);
        ElMessage.success(nextStatus === 1 ? "商品已上架" : "商品已下架");
    } catch (error: any) {
        row.status = previousStatus;
        ElMessage.error(error?.message || "状态更新失败");
    }
};

const openRestock = async (goodsId: number) => {
    currentRestockGoodsId.value = goodsId;
    restockVisible.value = true;
    restockLoading.value = true;
    try {
        const res = await ShopService.getGoodsDetail(goodsId);
        const rows = res.data?.sku_prices || [];
        restockRows.value = rows.map((item: any) => ({
            id: Number(item.id),
            goods_sku_text: item.goods_sku_text || "",
            stock: Number(item.stock || 0),
            restock_stock: 1,
            restock_msg: "",
        }));
    } finally {
        restockLoading.value = false;
    }
};

const handleRestock = async (row: RestockRow) => {
    try {
        await ShopService.restockGoods({
            id: currentRestockGoodsId.value,
            goods_sku_price_id: row.id,
            stock: Number(row.restock_stock || 0),
            msg: row.restock_msg.trim(),
        });
        ElMessage.success("补货成功");
        await openRestock(currentRestockGoodsId.value);
        await loadGoodsList();
    } catch (error: any) {
        ElMessage.error(error?.message || "补货失败");
    }
};

onMounted(async () => {
    await loadBaseOptions();
    await loadGoodsList();
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

.toolbar {
    margin-bottom: 16px;
}

.thumb {
    width: 44px;
    height: 44px;
    border-radius: 8px;
}

.full-width {
    width: 100%;
}
</style>
