<script setup lang="ts" name="ShopCategory">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { ShopService, type CategoryItem, type CategoryPayload } from "@/common/api/shop";

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const categoryList = ref<CategoryItem[]>([]);
const categoryTree = ref<CategoryItem[]>([]);
const categoryOptions = ref<CategoryItem[]>([]);

const queryForm = reactive({
  keywords: "",
  status: "" as "" | 0 | 1,
  parent_id: "" as "" | number,
});

const editForm = reactive<CategoryPayload>({
  parent_id: 0,
  name: "",
  image: "",
  description: "",
  weigh: 0,
  status: 1,
});

const rules: FormRules<CategoryPayload> = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
};

const loadCategoryList = async () => {
  loading.value = true;
  try {
    const res = await ShopService.getCategoryList(queryForm);
    categoryList.value = res.list;
    categoryTree.value = res.tree;
    categoryOptions.value = res.tree;
  } finally {
    loading.value = false;
  }
};

const resetEditForm = () => {
  editForm.id = undefined;
  editForm.parent_id = 0;
  editForm.name = "";
  editForm.image = "";
  editForm.description = "";
  editForm.weigh = 0;
  editForm.status = 1;
};

const openCreateDialog = async (parentId = 0) => {
  resetEditForm();
  editForm.parent_id = parentId;
  categoryOptions.value = await ShopService.getCategoryOptions(false);
  dialogVisible.value = true;
};

const openEditDialog = async (row: CategoryItem) => {
  const detail = await ShopService.getCategoryDetail(row.id);
  editForm.id = detail.id;
  editForm.parent_id = detail.parent_id;
  editForm.name = detail.name;
  editForm.image = detail.image;
  editForm.description = detail.description;
  editForm.weigh = detail.weigh;
  editForm.status = detail.status;
  categoryOptions.value = await ShopService.getCategoryOptions(false);
  dialogVisible.value = true;
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();
  saving.value = true;
  try {
    await ShopService.saveCategory(editForm);
    ElMessage.success(editForm.id ? "分类已更新" : "分类已创建");
    dialogVisible.value = false;
    await loadCategoryList();
  } catch (error: any) {
    ElMessage.error(error.message || "保存失败");
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (row: CategoryItem) => {
  try {
    await ElMessageBox.confirm(`确认删除分类“${row.name}”及其子分类吗？`, "删除分类", { type: "warning" });
    await ShopService.deleteCategory(row.id);
    ElMessage.success("分类已删除");
    await loadCategoryList();
  } catch (error: any) {
    if (error !== "cancel") ElMessage.error(error.message || "删除失败");
  }
};

const handleStatusChange = async (row: CategoryItem, value: string | number | boolean) => {
  try {
    await ShopService.updateCategoryStatus(row.id, value ? 1 : 0);
    row.status = value ? 1 : 0;
    ElMessage.success(row.status === 1 ? "分类已启用" : "分类已禁用");
  } catch (error: any) {
    ElMessage.error(error.message || "状态更新失败");
  }
};

onMounted(loadCategoryList);
</script>

<template>
  <div class="page">
    <el-card shadow="never">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keywords" clearable placeholder="分类名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" clearable placeholder="全部状态" style="width: 140px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级分类">
          <el-tree-select
            v-model="queryForm.parent_id"
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
          <el-button type="primary" @click="loadCategoryList">查询</el-button>
          <el-button
            @click="
              queryForm.keywords = '';
              queryForm.status = '';
              queryForm.parent_id = '';
              loadCategoryList();
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
            <div class="title">分类管理</div>
            <div class="subtitle">对齐后端 `Category` 模块，支持树形分类、状态和排序维护。</div>
          </div>
          <Auth value="shop:category:create">
            <el-button type="primary" @click="openCreateDialog()">新增分类</el-button>
          </Auth>
        </div>
      </template>

      <el-table v-loading="loading" :data="categoryTree" row-key="id" border default-expand-all>
        <el-table-column prop="name" label="分类名称" min-width="220" />
        <el-table-column label="图片" width="90" align="center">
          <template #default="{ row }">
            <el-image v-if="row.image" :src="row.image" fit="cover" class="thumb" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
        <el-table-column prop="weigh" label="排序" width="90" align="center" />
        <el-table-column prop="update_time" label="更新时间" min-width="160" />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <Auth value="shop:category:status">
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
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-space>
              <Auth value="shop:category:create">
                <el-button link type="primary" @click="openCreateDialog(row.id)">添加子分类</el-button>
              </Auth>
              <Auth value="shop:category:edit">
                <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
              </Auth>
              <Auth value="shop:category:delete">
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              </Auth>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editForm.id ? '编辑分类' : '新增分类'"
      width="640px"
      destroy-on-close
      @closed="resetEditForm"
    >
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="92px">
        <el-form-item label="上级分类">
          <el-tree-select
            v-model="editForm.parent_id"
            check-strictly
            clearable
            default-expand-all
            node-key="id"
            :data="categoryOptions"
            :props="{ label: 'name', children: 'children' }"
            placeholder="顶级分类"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图片地址">
          <el-input v-model="editForm.image" placeholder="请输入分类图片 URL" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入分类描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="editForm.weigh" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
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

.thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
}
</style>
