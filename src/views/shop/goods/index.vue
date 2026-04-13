<script setup lang="ts" name="ShopGoods">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import {
  ShopService,
  type CategoryItem,
  type GoodsDetail,
  type GoodsPayload,
  type GoodsSkuPriceItem,
  type ShippingTemplateItem,
  type StockLogItem,
} from "@/common/api/shop";

interface SpecGroupForm {
  id: number;
  name: string;
  values: string;
}

interface SkuPriceForm {
  id?: number;
  goods_sku_ids: number[];
  goods_sku_text: string;
  image: string;
  stock: number;
  stock_warning: number;
  sales: number;
  third_sn: string;
  weight: number;
  cost_price: number;
  original_price: number;
  price: number;
  status: 0 | 1;
}

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const stockDialogVisible = ref(false);
const formRef = ref<FormInstance>();
const goodsList = ref<any[]>([]);
const categoryTree = ref<CategoryItem[]>([]);
const shippingTemplates = ref<ShippingTemplateItem[]>([]);
const stockRows = ref<GoodsSkuPriceItem[]>([]);
const stockLogs = ref<StockLogItem[]>([]);
const currentStockGoodsId = ref<number>(0);
const tempSpecSeed = ref(-1);

const queryForm = reactive({
  keywords: "",
  status: "" as "" | 0 | 1,
  cate_id: "" as "" | number,
});

const goodsForm = reactive<GoodsPayload>({
  title: "",
  subtitle: "",
  cate_ids: [],
  image: "",
  images: [],
  content: "",
  is_sku: 0,
  limit_type: 0,
  limit_num: 0,
  shipping_id: 0,
  weigh: 0,
  status: 1,
  sku_list: [],
  sku_price_list: [],
});

const stockForm = reactive({
  goods_id: 0,
  goods_sku_price_id: 0,
  type: 1 as 1 | 2,
  stock: 1,
  msg: "",
});

const specGroups = ref<SpecGroupForm[]>([]);
const priceRows = ref<SkuPriceForm[]>([]);

const rules: FormRules<GoodsPayload> = {
  title: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  cate_ids: [{ required: true, message: "请选择所属分类", trigger: "change" }],
  image: [{ required: true, message: "请输入商品主图地址", trigger: "blur" }],
};

const categorySelectData = computed(() => categoryTree.value);

const resetGoodsForm = () => {
  goodsForm.id = undefined;
  goodsForm.title = "";
  goodsForm.subtitle = "";
  goodsForm.cate_ids = [];
  goodsForm.image = "";
  goodsForm.images = [];
  goodsForm.content = "";
  goodsForm.is_sku = 0;
  goodsForm.limit_type = 0;
  goodsForm.limit_num = 0;
  goodsForm.shipping_id = 0;
  goodsForm.weigh = 0;
  goodsForm.status = 1;
  goodsForm.sku_list = [];
  goodsForm.sku_price_list = [];
  specGroups.value = [];
  priceRows.value = [createEmptyPriceRow()];
  imageText.value = "";
};

const createEmptyPriceRow = (): SkuPriceForm => ({
  goods_sku_ids: [],
  goods_sku_text: "",
  image: "",
  stock: 0,
  stock_warning: 0,
  sales: 0,
  third_sn: "",
  weight: 0,
  cost_price: 0,
  original_price: 0,
  price: 0,
  status: 1,
});

const parseImageLines = (value: string[]) => value.join("\n");
const imageText = ref("");

const syncImageArray = () => {
  goodsForm.images = imageText.value
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
};

const loadOptions = async () => {
  const options = await ShopService.getGoodsOptions();
  categoryTree.value = options.categories;
  shippingTemplates.value = options.shipping_templates;
};

const loadGoodsList = async () => {
  loading.value = true;
  try {
    const res = await ShopService.getGoodsList(queryForm);
    goodsList.value = res.list;
    categoryTree.value = res.filters.categories;
  } finally {
    loading.value = false;
  }
};

const addSpecGroup = () => {
  specGroups.value.push({
    id: tempSpecSeed.value--,
    name: "",
    values: "",
  });
};

const removeSpecGroup = (index: number) => {
  specGroups.value.splice(index, 1);
};

const getSpecValueGroups = () =>
  specGroups.value
    .map(group => ({
      groupId: group.id,
      groupName: group.name.trim(),
      values: Array.from(
        new Set(
          group.values
            .split(/[,\n，]/)
            .map(item => item.trim())
            .filter(Boolean)
        )
      ),
    }))
    .filter(group => group.groupName && group.values.length);

const buildCombinations = (groups: ReturnType<typeof getSpecValueGroups>) => {
  const result: Array<{ text: string; goods_sku_ids: number[] }> = [];
  let childTempId = -1000;
  const childIdMap = new Map<string, number>();

  const walk = (index: number, labels: string[], ids: number[]) => {
    if (index >= groups.length) {
      result.push({ text: labels.join(" / "), goods_sku_ids: [...ids] });
      return;
    }

    groups[index].values.forEach(value => {
      const key = `${groups[index].groupId}:${value}`;
      if (!childIdMap.has(key)) childIdMap.set(key, childTempId--);
      walk(index + 1, [...labels, value], [...ids, childIdMap.get(key) as number]);
    });
  };

  walk(0, [], []);
  return { result, childIdMap };
};

const generateSkuRows = () => {
  const groups = getSpecValueGroups();
  if (!groups.length) {
    ElMessage.warning("请先配置规格组和值");
    return;
  }

  const existsMap = new Map(priceRows.value.map(row => [row.goods_sku_text, row]));
  const { result } = buildCombinations(groups);
  priceRows.value = result.map(item => {
    const exists = existsMap.get(item.text);
    return exists
      ? { ...exists, goods_sku_text: item.text, goods_sku_ids: item.goods_sku_ids }
      : { ...createEmptyPriceRow(), goods_sku_text: item.text, goods_sku_ids: item.goods_sku_ids };
  });
};

const buildGoodsPayload = (): GoodsPayload => {
  syncImageArray();
  const payload: GoodsPayload = {
    ...goodsForm,
    cate_ids: [...goodsForm.cate_ids],
    images: [...goodsForm.images],
    sku_list: [],
    sku_price_list: [],
  };

  if (payload.is_sku === 0) {
    payload.sku_price_list = priceRows.value
      .slice(0, 1)
      .map(row => ({ ...row, goods_sku_ids: [], goods_sku_text: "" }));
    return payload;
  }

  const groups = getSpecValueGroups();
  const parentRows: GoodsPayload["sku_list"] = [];
  const childRows: GoodsPayload["sku_list"] = [];
  const groupIdMap = new Map<number, number>();
  let tempId = -1;

  groups.forEach(group => {
    const parentId = group.groupId > 0 ? group.groupId : tempId--;
    groupIdMap.set(group.groupId, parentId);
    parentRows.push({ id: parentId, name: group.groupName, image: "", parent_id: 0, weigh: 0 });
    group.values.forEach((value, index) => {
      const childId = tempId--;
      childRows.push({ id: childId, name: value, image: "", parent_id: parentId, weigh: group.values.length - index });
    });
  });

  const childByName = new Map(childRows.map(item => [`${item.parent_id}:${item.name}`, item.id as number]));

  payload.sku_list = [...parentRows, ...childRows];
  payload.sku_price_list = priceRows.value.map(row => {
    const names = row.goods_sku_text
      .split("/")
      .map(item => item.trim())
      .filter(Boolean);
    const goods_sku_ids = names.map((name, index) => {
      const parent = parentRows[index];
      return childByName.get(`${parent.id}:${name}`) as number;
    });
    return { ...row, goods_sku_ids };
  });

  return payload;
};

const hydrateSpecGroups = (detail: GoodsDetail) => {
  const parents = detail.sku_list.filter(item => item.parent_id === 0);
  const children = detail.sku_list.filter(item => item.parent_id !== 0);
  specGroups.value = parents.map(parent => ({
    id: parent.id,
    name: parent.name,
    values: children
      .filter(child => child.parent_id === parent.id)
      .map(child => child.name)
      .join(","),
  }));
};

const openCreateDialog = async () => {
  resetGoodsForm();
  await loadOptions();
  dialogVisible.value = true;
};

const openEditDialog = async (row: any) => {
  const detail = await ShopService.getGoodsDetail(row.id);
  goodsForm.id = detail.id;
  goodsForm.title = detail.title;
  goodsForm.subtitle = detail.subtitle;
  goodsForm.cate_ids = [...detail.cate_ids];
  goodsForm.image = detail.image;
  goodsForm.images = [...detail.images];
  goodsForm.content = detail.content;
  goodsForm.is_sku = detail.is_sku;
  goodsForm.limit_type = detail.limit_type;
  goodsForm.limit_num = detail.limit_num;
  goodsForm.shipping_id = detail.shipping_id;
  goodsForm.weigh = detail.weigh;
  goodsForm.status = detail.status;
  imageText.value = parseImageLines(detail.images);

  if (detail.is_sku === 1) {
    hydrateSpecGroups(detail);
    priceRows.value = detail.sku_price_list.map(item => ({
      ...item,
      goods_sku_ids: [...item.goods_sku_ids],
    }));
  } else {
    specGroups.value = [];
    priceRows.value = detail.sku_price_list.length
      ? detail.sku_price_list.map(item => ({ ...item }))
      : [createEmptyPriceRow()];
  }

  await loadOptions();
  dialogVisible.value = true;
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();
  saving.value = true;
  try {
    const payload = buildGoodsPayload();
    await ShopService.saveGoods(payload);
    ElMessage.success(goodsForm.id ? "商品已更新" : "商品已创建");
    dialogVisible.value = false;
    await loadGoodsList();
  } catch (error: any) {
    ElMessage.error(error.message || "保存失败");
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认删除商品“${row.title}”吗？`, "删除商品", { type: "warning" });
    await ShopService.deleteGoods(row.id);
    ElMessage.success("商品已删除");
    await loadGoodsList();
  } catch (error: any) {
    if (error !== "cancel") ElMessage.error(error.message || "删除失败");
  }
};

const handleStatusChange = async (row: any, value: string | number | boolean) => {
  try {
    await ShopService.updateGoodsStatus(row.id, value ? 1 : 0);
    row.status = value ? 1 : 0;
    ElMessage.success(row.status === 1 ? "商品已上架" : "商品已下架");
  } catch (error: any) {
    ElMessage.error(error.message || "状态更新失败");
  }
};

const openStockDialog = async (row: any) => {
  const detail = await ShopService.getGoodsDetail(row.id);
  stockRows.value = detail.sku_price_list;
  stockLogs.value = await ShopService.getStockLogs(row.id);
  currentStockGoodsId.value = row.id;
  stockForm.goods_id = row.id;
  stockForm.goods_sku_price_id = detail.sku_price_list[0]?.id || 0;
  stockForm.type = 1;
  stockForm.stock = 1;
  stockForm.msg = "";
  stockDialogVisible.value = true;
};

const handleStockChange = async () => {
  try {
    await ShopService.changeGoodsStock(stockForm);
    ElMessage.success(stockForm.type === 1 ? "补货成功" : "出库成功");
    const detail = await ShopService.getGoodsDetail(currentStockGoodsId.value);
    stockRows.value = detail.sku_price_list;
    stockLogs.value = await ShopService.getStockLogs(currentStockGoodsId.value);
    await loadGoodsList();
  } catch (error: any) {
    ElMessage.error(error.message || "库存调整失败");
  }
};

watch(
  () => goodsForm.is_sku,
  value => {
    if (value === 0 && !priceRows.value.length) {
      priceRows.value = [createEmptyPriceRow()];
    }
  }
);

onMounted(async () => {
  await loadOptions();
  await loadGoodsList();
});
</script>

<template>
  <div class="page">
    <el-card shadow="never">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keywords" clearable placeholder="商品名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" clearable placeholder="全部状态" style="width: 140px">
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-tree-select
            v-model="queryForm.cate_id"
            clearable
            check-strictly
            default-expand-all
            node-key="id"
            :data="categoryTree"
            :props="{ label: 'name', children: 'children' }"
            placeholder="全部分类"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadGoodsList">查询</el-button>
          <el-button
            @click="
              queryForm.keywords = '';
              queryForm.status = '';
              queryForm.cate_id = '';
              loadGoodsList();
            "
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div>
            <div class="title">商品管理</div>
            <div class="subtitle">对齐后端 `Goods` 模块，包含分类、运费模板、多规格和库存调整。</div>
          </div>
          <Auth value="shop:goods:create">
            <el-button type="primary" @click="openCreateDialog">新增商品</el-button>
          </Auth>
        </div>
      </template>

      <el-table v-loading="loading" :data="goodsList" border>
        <el-table-column label="商品" min-width="260">
          <template #default="{ row }">
            <div class="goods-cell">
              <el-image :src="row.image" fit="cover" class="thumb" />
              <div>
                <div class="goods-title">{{ row.title }}</div>
                <div class="goods-subtitle">{{ row.subtitle || "-" }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" min-width="180">
          <template #default="{ row }">{{ row.category_names.join(" / ") }}</template>
        </el-table-column>
        <el-table-column label="价格区间" min-width="140">
          <template #default="{ row }">
            {{ row.min_price === row.max_price ? row.min_price : `${row.min_price} ~ ${row.max_price}` }}
          </template>
        </el-table-column>
        <el-table-column prop="total_stock" label="总库存" width="100" align="center" />
        <el-table-column label="规格" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_sku === 1 ? 'warning' : 'success'">
              {{ row.is_sku === 1 ? "多规格" : "单规格" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="运费模板" min-width="140">
          <template #default="{ row }">
            {{ row.shipping_template ? ShopService.getShippingTypeText(row.shipping_template.type) : "免运费" }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <Auth value="shop:goods:status">
              <el-switch
                :model-value="row.status === 1"
                inline-prompt
                active-text="上架"
                inactive-text="下架"
                @change="value => handleStatusChange(row, value)"
              />
            </Auth>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-space>
              <Auth value="shop:goods:edit">
                <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
              </Auth>
              <Auth value="shop:goods:stock">
                <el-button link type="warning" @click="openStockDialog(row)">库存</el-button>
              </Auth>
              <Auth value="shop:goods:delete">
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              </Auth>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="goodsForm.id ? '编辑商品' : '新增商品'"
      width="1100px"
      destroy-on-close
      @closed="resetGoodsForm"
    >
      <el-form ref="formRef" :model="goodsForm" :rules="rules" label-width="96px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="title">
              <el-input v-model="goodsForm.title" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副标题">
              <el-input v-model="goodsForm.subtitle" placeholder="请输入副标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属分类" prop="cate_ids">
              <el-tree-select
                v-model="goodsForm.cate_ids"
                multiple
                show-checkbox
                check-strictly
                default-expand-all
                node-key="id"
                :data="categorySelectData"
                :props="{ label: 'name', children: 'children' }"
                placeholder="请选择分类"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运费模板">
              <el-select v-model="goodsForm.shipping_id" placeholder="请选择模板" style="width: 100%">
                <el-option :value="0" label="免运费" />
                <el-option
                  v-for="item in shippingTemplates"
                  :key="item.id"
                  :label="`#${item.id} ${ShopService.getShippingTypeText(item.type)}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主图地址" prop="image">
              <el-input v-model="goodsForm.image" placeholder="请输入主图 URL" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="goodsForm.weigh" :min="0" :max="9999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="轮播图">
              <el-input
                v-model="imageText"
                type="textarea"
                :rows="3"
                placeholder="每行一个图片 URL"
                @change="syncImageArray"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="详情内容">
              <el-input v-model="goodsForm.content" type="textarea" :rows="4" placeholder="请输入商品详情" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="规格类型">
              <el-radio-group v-model="goodsForm.is_sku">
                <el-radio :value="0">单规格</el-radio>
                <el-radio :value="1">多规格</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="限购类型">
              <el-select v-model="goodsForm.limit_type" style="width: 100%">
                <el-option :value="0" label="不限购" />
                <el-option :value="1" label="每日限购" />
                <el-option :value="2" label="累计限购" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="限购数量">
              <el-input-number v-model="goodsForm.limit_num" :min="0" :max="99999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上架状态">
              <el-radio-group v-model="goodsForm.status">
                <el-radio :value="1">上架</el-radio>
                <el-radio :value="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <div v-if="goodsForm.is_sku === 1" class="spec-panel">
          <div class="panel-header">
            <div class="panel-title">规格配置</div>
            <div class="panel-actions">
              <el-button @click="addSpecGroup">新增规格组</el-button>
              <el-button type="primary" @click="generateSkuRows">生成规格组合</el-button>
            </div>
          </div>
          <div v-for="(group, index) in specGroups" :key="group.id" class="spec-row">
            <el-input v-model="group.name" placeholder="规格名，如颜色" />
            <el-input v-model="group.values" placeholder="规格值，逗号分隔，如黑色,卡其" />
            <el-button link type="danger" @click="removeSpecGroup(index)">删除</el-button>
          </div>
        </div>

        <div class="spec-panel">
          <div class="panel-header">
            <div class="panel-title">{{ goodsForm.is_sku === 1 ? "规格价格" : "单规格价格" }}</div>
            <el-button v-if="goodsForm.is_sku === 0" @click="priceRows = [createEmptyPriceRow()]">重置价格行</el-button>
          </div>
          <el-table :data="priceRows" border>
            <el-table-column prop="goods_sku_text" label="规格组合" min-width="180">
              <template #default="{ row }">
                <span>{{ row.goods_sku_text || "默认规格" }}</span>
              </template>
            </el-table-column>
            <el-table-column label="售价" min-width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.price" :min="0" :precision="2" />
              </template>
            </el-table-column>
            <el-table-column label="原价" min-width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.original_price" :min="0" :precision="2" />
              </template>
            </el-table-column>
            <el-table-column label="成本价" min-width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.cost_price" :min="0" :precision="2" />
              </template>
            </el-table-column>
            <el-table-column label="库存" min-width="110">
              <template #default="{ row }">
                <el-input-number v-model="row.stock" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="库存预警" min-width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.stock_warning" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="第三方编码" min-width="160">
              <template #default="{ row }">
                <el-input v-model="row.third_sn" />
              </template>
            </el-table-column>
            <el-table-column label="重量(KG)" min-width="120">
              <template #default="{ row }">
                <el-input-number v-model="row.weight" :min="0" :precision="2" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="stockDialogVisible" title="库存调整" width="960px">
      <el-row :gutter="16">
        <el-col :span="10">
          <el-card shadow="never">
            <el-form label-width="92px">
              <el-form-item label="规格">
                <el-select v-model="stockForm.goods_sku_price_id" style="width: 100%">
                  <el-option
                    v-for="item in stockRows"
                    :key="item.id"
                    :label="item.goods_sku_text || '默认规格'"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="类型">
                <el-radio-group v-model="stockForm.type">
                  <el-radio :value="1">补货</el-radio>
                  <el-radio :value="2">出库</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="数量">
                <el-input-number v-model="stockForm.stock" :min="1" :max="999999" style="width: 100%" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="stockForm.msg" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleStockChange">提交</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="14">
          <el-card shadow="never" class="mb16">
            <template #header>当前库存</template>
            <el-table :data="stockRows" border max-height="240">
              <el-table-column label="规格" min-width="180">
                <template #default="{ row }">{{ row.goods_sku_text || "默认规格" }}</template>
              </el-table-column>
              <el-table-column prop="stock" label="库存" width="90" />
              <el-table-column prop="price" label="售价" width="100" />
              <el-table-column prop="third_sn" label="编码" min-width="120" />
            </el-table>
          </el-card>
          <el-card shadow="never">
            <template #header>库存日志</template>
            <el-table :data="stockLogs" border max-height="280">
              <el-table-column prop="create_time" label="时间" min-width="150" />
              <el-table-column prop="goods_sku_text" label="规格" min-width="140" />
              <el-table-column prop="before" label="调整前" width="90" />
              <el-table-column prop="stock" label="调整后" width="90" />
              <el-table-column prop="msg" label="备注" min-width="180" show-overflow-tooltip />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

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

.goods-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thumb {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  flex-shrink: 0;
}

.goods-title {
  font-weight: 600;
}

.goods-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.spec-panel {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.spec-row {
  display: grid;
  grid-template-columns: 200px 1fr 60px;
  gap: 12px;
  margin-bottom: 12px;
}

.mb16 {
  margin-bottom: 16px;
}
</style>
