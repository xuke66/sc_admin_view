<template>
	<div class="page">
		<el-card shadow="never">
			<template #header>
				<div class="header">
					<div>
						<div class="title">运费模板</div>
						<div class="subtitle">维护运费规则、模板名称、配送地区和启用状态。</div>
					</div>
					<Auth value="shop:shipping-template:create">
						<el-button type="primary" @click="openCreateDialog()">新增运费模板</el-button>
					</Auth>
				</div>
			</template>

			<div class="toolbar">
				<el-form inline :model="filters">
					<el-form-item label="计费方式">
						<el-select v-model="filters.type" clearable placeholder="全部" style="width: 180px">
							<el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="状态">
						<el-select v-model="filters.status" clearable placeholder="全部" style="width: 180px">
							<el-option label="启用" :value="1" />
							<el-option label="禁用" :value="0" />
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="loadShippingTemplateList()">查询</el-button>
						<el-button @click="resetFilters">重置</el-button>
					</el-form-item>
				</el-form>
			</div>

			<el-table v-loading="loading" :data="templateList" border>
				<el-table-column prop="id" label="ID" width="80" align="center" />
				<el-table-column prop="name" label="模板名称" min-width="180" />
				<el-table-column label="计费方式" min-width="120">
					<template #default="{ row }">
						{{ formatType(row.type) }}
					</template>
				</el-table-column>
				<el-table-column label="首件/首重" min-width="160" align="center">
					<template #default="{ row }"> {{ row.first_num }} / {{ row.first_price }} </template>
				</el-table-column>
				<el-table-column label="续件/续重" min-width="160" align="center">
					<template #default="{ row }"> {{ row.additional_num }} / {{ row.additional_price }} </template>
				</el-table-column>
				<el-table-column prop="update_time" label="更新时间" min-width="170" align="center" />
				<el-table-column label="状态" width="120" align="center">
					<template #default="{ row }">
						<Auth value="shop:shipping-template:status">
							<el-switch
								:model-value="Number(row.status) === 1"
								inline-prompt
								active-text="启用"
								inactive-text="禁用"
								@change="(value) => handleStatusChange(row, value)"
							/>
						</Auth>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180" align="center">
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

		<el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑运费模板' : '新增运费模板'" width="760px" destroy-on-close @closed="resetEditForm">
			<el-alert v-if="regionLoadError" type="warning" show-icon :closable="false" class="region-alert" :title="regionLoadError" />

			<el-form ref="formRef" :model="editForm" :rules="rules" label-width="108px">
				<el-form-item label="模板名称" prop="name">
					<el-input v-model="editForm.name" placeholder="请输入模板名称" maxlength="120" />
				</el-form-item>
				<el-form-item label="计费方式" prop="type">
					<el-radio-group v-model="editForm.type">
						<el-radio v-for="item in typeOptions" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-row :gutter="16">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="editForm.type === 2 ? '首重' : '首件'" prop="first_num">
							<el-input-number v-model="editForm.first_num" :min="0" :precision="0" :controls="false" class="full-width" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12">
						<el-form-item label="首费" prop="first_price">
							<el-input-number v-model="editForm.first_price" :min="0" :precision="2" :controls="false" class="full-width" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="16">
					<el-col :xs="24" :sm="12">
						<el-form-item :label="editForm.type === 2 ? '续重' : '续件'" prop="additional_num">
							<el-input-number v-model="editForm.additional_num" :min="0" :precision="0" :controls="false" class="full-width" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12">
						<el-form-item label="续费" prop="additional_price">
							<el-input-number v-model="editForm.additional_price" :min="0" :precision="2" :controls="false" class="full-width" />
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="配送地区" prop="district_ids">
					<el-cascader
						v-model="editForm.district_ids"
						class="full-width"
						:options="regionOptions"
						:props="regionProps"
						clearable
						filterable
						collapse-tags
						collapse-tags-tooltip
						placeholder="请选择配送地区"
					/>
				</el-form-item>
				<el-form-item label="状态" prop="status">
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

<script setup lang="ts" name="ShopShippingTemplate">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { CommonService } from "@/common/api/common";
import { ShopService } from "@/common/api/shop";

type RegionOption = {
	label: string;
	value: number;
	children?: RegionOption[];
};

type ShippingTemplateItem = {
	id: number;
	name?: string;
	type: number | string;
	first_num: number | string;
	first_price: number | string;
	additional_num: number | string;
	additional_price: number | string;
	district_ids: string | number[] | number;
	status: number | string;
	update_time?: string;
};

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const templateList = ref<ShippingTemplateItem[]>([]);
const regionOptions = ref<RegionOption[]>([]);
const regionLoadError = ref("");

const filters = reactive({
	type: undefined as number | undefined,
	status: undefined as number | undefined,
});

const typeOptions = [
	{ label: "按件计费", value: 1 },
	{ label: "按重量计费", value: 2 },
];

const regionProps = {
	label: "label",
	children: "children",
	value: "value",
	multiple: true,
	emitPath: false,
};

const editForm = reactive({
	id: 0,
	name: "",
	type: 1,
	first_num: 1,
	first_price: 0,
	additional_num: 1,
	additional_price: 0,
	district_ids: [] as number[],
	status: 1,
});

const rules: FormRules = {
	name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
	type: [{ required: true, message: "请选择计费方式", trigger: "change" }],
	first_num: [{ required: true, message: "请输入首件/首重", trigger: "blur" }],
	first_price: [{ required: true, message: "请输入首费", trigger: "blur" }],
	additional_num: [{ required: true, message: "请输入续件/续重", trigger: "blur" }],
	additional_price: [{ required: true, message: "请输入续费", trigger: "blur" }],
	district_ids: [{ required: true, type: "array", min: 1, message: "请选择配送地区", trigger: "change" }],
	status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

const formatType = (value: number | string) => {
	const item = typeOptions.find((option) => option.value === Number(value));
	return item?.label || "-";
};

const parseDistrictIds = (districtIds: ShippingTemplateItem["district_ids"]) => {
	if (Array.isArray(districtIds)) return districtIds.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
	if (districtIds === null || districtIds === undefined || districtIds === "") return [];
	return String(districtIds)
		.split(",")
		.map((item) => Number(item.trim()))
		.filter((item) => !Number.isNaN(item));
};

const buildPayload = () => ({
	id: editForm.id,
	name: editForm.name.trim(),
	type: Number(editForm.type),
	first_num: Number(editForm.first_num),
	first_price: Number(editForm.first_price),
	additional_num: Number(editForm.additional_num),
	additional_price: Number(editForm.additional_price),
	district_ids: [...editForm.district_ids],
	status: Number(editForm.status),
});

const resetEditForm = () => {
	editForm.id = 0;
	editForm.name = "";
	editForm.type = 1;
	editForm.first_num = 1;
	editForm.first_price = 0;
	editForm.additional_num = 1;
	editForm.additional_price = 0;
	editForm.district_ids = [];
	editForm.status = 1;
	formRef.value?.clearValidate();
};

const normalizeTemplateList = (list: ShippingTemplateItem[] = []) =>
	list.map((item) => ({
		...item,
		name: item.name || "",
		type: Number(item.type ?? 1),
		first_num: Number(item.first_num ?? 0),
		first_price: Number(item.first_price ?? 0),
		additional_num: Number(item.additional_num ?? 0),
		additional_price: Number(item.additional_price ?? 0),
		status: Number(item.status ?? 0),
	}));

const loadShippingTemplateList = async () => {
	loading.value = true;
	try {
		const params: Record<string, number> = {};
		if (filters.type !== undefined) params.type = filters.type;
		if (filters.status !== undefined) params.status = filters.status;
		const res = await ShopService.getShippingTemplateList(params);
		templateList.value = normalizeTemplateList(res.data || []);
	} finally {
		loading.value = false;
	}
};

const loadRegionOptions = async () => {
	try {
		const res = await CommonService.getRegionCascader();
		regionOptions.value = res.data || [];
		regionLoadError.value = "";
	} catch (error: any) {
		regionOptions.value = [];
		regionLoadError.value = error?.message || "地区数据加载失败，请检查后端 region 数据。";
	}
};

const openCreateDialog = async () => {
	resetEditForm();
	dialogVisible.value = true;
	if (!regionOptions.value.length) await loadRegionOptions();
};

const openEditDialog = async (row: ShippingTemplateItem) => {
	resetEditForm();
	editForm.id = row.id;
	editForm.name = row.name || "";
	editForm.type = Number(row.type ?? 1);
	editForm.first_num = Number(row.first_num ?? 0);
	editForm.first_price = Number(row.first_price ?? 0);
	editForm.additional_num = Number(row.additional_num ?? 0);
	editForm.additional_price = Number(row.additional_price ?? 0);
	editForm.district_ids = parseDistrictIds(row.district_ids);
	editForm.status = Number(row.status ?? 1);
	dialogVisible.value = true;
	if (!regionOptions.value.length) await loadRegionOptions();
};

const handleSave = async () => {
	if (!formRef.value) return;
	await formRef.value.validate();
	saving.value = true;
	try {
		await ShopService.saveShippingTemplate(buildPayload());
		ElMessage.success(editForm.id ? "运费模板已更新" : "运费模板已创建");
		dialogVisible.value = false;
		await loadShippingTemplateList();
	} catch (error: any) {
		ElMessage.error(error?.message || "保存失败");
	} finally {
		saving.value = false;
	}
};

const handleDelete = async (row: ShippingTemplateItem) => {
	try {
		await ElMessageBox.confirm("确定删除这条运费模板吗？", "提示", {
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			type: "warning",
		});
		await ShopService.delShippingTemplate(row.id);
		ElMessage.success("运费模板已删除");
		await loadShippingTemplateList();
	} catch (error: any) {
		if (error !== "cancel") ElMessage.error(error?.message || "删除失败");
	}
};

const handleStatusChange = async (row: ShippingTemplateItem, value: string | number | boolean) => {
	const nextStatus = value ? 1 : 0;
	const previousStatus = Number(row.status ?? 0);
	row.status = nextStatus;
	try {
		await ShopService.updateShippingTemplateStatus(row.id, nextStatus as 0 | 1);
		ElMessage.success(nextStatus === 1 ? "运费模板已启用" : "运费模板已禁用");
	} catch (error: any) {
		row.status = previousStatus;
		ElMessage.error(error?.message || "状态更新失败");
	}
};

const resetFilters = async () => {
	filters.type = undefined;
	filters.status = undefined;
	await loadShippingTemplateList();
};

onMounted(async () => {
	await Promise.all([loadShippingTemplateList(), loadRegionOptions()]);
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

.full-width {
	width: 100%;
}

.region-alert {
	margin-bottom: 16px;
}
</style>
