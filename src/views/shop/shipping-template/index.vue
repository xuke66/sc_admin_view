<script setup lang="ts" name="ShopShippingTemplate">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import {
  ShopService,
  type AreaOption,
  type ShippingTemplateItem,
  type ShippingTemplatePayload,
} from "@/common/api/shop";

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const templateList = ref<ShippingTemplateItem[]>([]);
const areaOptions = ref<AreaOption[]>([]);

const queryForm = reactive({
  status: "" as "" | 0 | 1,
  type: "" as "" | 1 | 2 | 3,
});

const editForm = reactive<ShippingTemplatePayload>({
  type: 1,
  first_num: 1,
  first_price: 0,
  additional_num: 0,
  additional_price: 0,
  province_ids: [],
  city_ids: [],
  district_ids: [],
  status: 1,
});

const rules: FormRules<ShippingTemplatePayload> = {
  type: [{ required: true, message: "请选择计费方式", trigger: "change" }],
  first_num: [{ required: true, message: "请输入首件/首重", trigger: "blur" }],
  first_price: [{ required: true, message: "请输入首费", trigger: "blur" }],
};

const typeLabel = computed(
  () =>
    ({
      1: "按件数",
      2: "按重量",
      3: "按体积",
    })[editForm.type]
);

const loadList = async () => {
  loading.value = true;
  try {
    const res = await ShopService.getShippingTemplateList(queryForm);
    templateList.value = res.list;
  } finally {
    loading.value = false;
  }
};

const resetEditForm = () => {
  editForm.id = undefined;
  editForm.type = 1;
  editForm.first_num = 1;
  editForm.first_price = 0;
  editForm.additional_num = 0;
  editForm.additional_price = 0;
  editForm.province_ids = [];
  editForm.city_ids = [];
  editForm.district_ids = [];
  editForm.status = 1;
};

const openCreateDialog = async () => {
  resetEditForm();
  areaOptions.value = await ShopService.getAreaOptions();
  dialogVisible.value = true;
};

const openEditDialog = async (row: ShippingTemplateItem) => {
  const detail = await ShopService.getShippingTemplateDetail(row.id);
  editForm.id = detail.id;
  editForm.type = detail.type;
  editForm.first_num = detail.first_num;
  editForm.first_price = detail.first_price;
  editForm.additional_num = detail.additional_num;
  editForm.additional_price = detail.additional_price;
  editForm.province_ids = [...detail.province_ids];
  editForm.city_ids = [...detail.city_ids];
  editForm.district_ids = [...detail.district_ids];
  editForm.status = detail.status;
  areaOptions.value = await ShopService.getAreaOptions();
  dialogVisible.value = true;
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();
  saving.value = true;
  try {
    await ShopService.saveShippingTemplate(editForm);
    ElMessage.success(editForm.id ? "模板已更新" : "模板已创建");
    dialogVisible.value = false;
    await loadList();
  } catch (error: any) {
    ElMessage.error(error.message || "保存失败");
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (row: ShippingTemplateItem) => {
  try {
    await ElMessageBox.confirm("确认删除这个运费模板吗？", "删除模板", { type: "warning" });
    await ShopService.deleteShippingTemplate(row.id);
    ElMessage.success("模板已删除");
    await loadList();
  } catch (error: any) {
    if (error !== "cancel") ElMessage.error(error.message || "删除失败");
  }
};

const handleStatusChange = async (row: ShippingTemplateItem, value: string | number | boolean) => {
  try {
    await ShopService.updateShippingTemplateStatus(row.id, value ? 1 : 0);
    row.status = value ? 1 : 0;
    ElMessage.success(row.status === 1 ? "模板已启用" : "模板已禁用");
  } catch (error: any) {
    ElMessage.error(error.message || "状态更新失败");
  }
};

onMounted(async () => {
  areaOptions.value = await ShopService.getAreaOptions();
  await loadList();
});
</script>

<template>
  <div class="page">
    <el-card shadow="never">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="模板类型">
          <el-select v-model="queryForm.type" clearable placeholder="全部类型" style="width: 160px">
            <el-option label="按件数" :value="1" />
            <el-option label="按重量" :value="2" />
            <el-option label="按体积" :value="3" />
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
          <el-button
            @click="
              queryForm.status = '';
              queryForm.type = '';
              loadList();
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
            <div class="title">运费模板</div>
            <div class="subtitle">对齐后端 `ShippingTemplate` 字段，支持计费方式、区域和状态管理。</div>
          </div>
          <Auth value="shop:shipping-template:create">
            <el-button type="primary" @click="openCreateDialog">新增模板</el-button>
          </Auth>
        </div>
      </template>

      <el-table v-loading="loading" :data="templateList" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="计费方式" width="120">
          <template #default="{ row }">{{ ShopService.getShippingTypeText(row.type) }}</template>
        </el-table-column>
        <el-table-column label="首费规则" min-width="180">
          <template #default="{ row }">{{ row.first_num }} / {{ row.first_price }} 元</template>
        </el-table-column>
        <el-table-column label="续费规则" min-width="180">
          <template #default="{ row }">{{ row.additional_num }} / {{ row.additional_price }} 元</template>
        </el-table-column>
        <el-table-column label="适用地区" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ ShopService.getShippingAreaText(row) }}</template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" min-width="160" />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <Auth value="shop:shipping-template:status">
              <el-switch
                :model-value="row.status === 1"
                inline-prompt
                active-text="启用"
                inactive-text="禁用"
                @change="value => handleStatusChange(row, value)"
              />
            </Auth>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-space>
              <Auth value="shop:shipping-template:edit">
                <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
              </Auth>
              <Auth value="shop:shipping-template:delete">
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              </Auth>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editForm.id ? '编辑模板' : '新增模板'"
      width="720px"
      destroy-on-close
      @closed="resetEditForm"
    >
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="98px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="计费方式" prop="type">
              <el-select v-model="editForm.type" style="width: 100%">
                <el-option label="按件数" :value="1" />
                <el-option label="按重量" :value="2" />
                <el-option label="按体积" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="editForm.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`首${typeLabel}`" prop="first_num">
              <el-input-number v-model="editForm.first_num" :min="0" :max="999999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="首费" prop="first_price">
              <el-input-number v-model="editForm.first_price" :min="0" :precision="2" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`续${typeLabel}`">
              <el-input-number v-model="editForm.additional_num" :min="0" :max="999999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="续费">
              <el-input-number
                v-model="editForm.additional_price"
                :min="0"
                :precision="2"
                :step="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="省份范围">
              <el-cascader-panel
                v-model="editForm.province_ids"
                :options="areaOptions"
                :props="{ multiple: true, emitPath: false, value: 'id', label: 'name', children: 'children' }"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
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
</style>
