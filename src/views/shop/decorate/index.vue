<template>
	<div class="page decorate-template-page">
		<el-card shadow="never">
			<el-form :inline="true" :model="queryForm">
				<el-form-item label="关键词">
					<el-input v-model="queryForm.keywords" clearable placeholder="模板名称" style="width: 220px" />
				</el-form-item>
				<el-form-item label="类型">
					<el-select v-model="queryForm.type" clearable placeholder="全部类型" style="width: 150px">
						<el-option label="首页模板" value="template" />
						<el-option label="自定义页" value="diypage" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="loadTemplateList">查询</el-button>
					<el-button @click="resetQuery">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<el-card shadow="never">
			<template #header>
				<div class="header">
					<div>
						<div class="title">装修模板</div>
						<div class="subtitle">维护模板基础信息，进入页面装修后编辑具体装修数据。</div>
					</div>
					<el-button type="primary" @click="openCreateDialog">新增模板</el-button>
				</div>
			</template>

			<el-table v-loading="loading" :data="templateList" border>
				<el-table-column prop="id" label="ID" width="90" align="center" />
				<el-table-column prop="name" label="模板名称" min-width="180" align="center" show-overflow-tooltip />
				<el-table-column label="类型" width="120" align="center">
					<template #default="{ row }">{{ typeText(row.type) }}</template>
				</el-table-column>
				<el-table-column prop="memo" label="备注" min-width="180" align="center" show-overflow-tooltip />
				<el-table-column label="状态" width="120" align="center">
					<template #default="{ row }">
						<el-switch
							:model-value="normalizeStatus(row.status) === 1"
							inline-prompt
							active-text="启用"
							inactive-text="禁用"
							@change="value => handleStatusChange(row, value)"
						/>
					</template>
				</el-table-column>
				<el-table-column prop="update_time" label="更新时间" width="180" align="center" />
				<el-table-column label="操作" width="300" fixed="right" align="center">
					<template #default="{ row }">
						<el-space>
							<el-button link type="primary" @click="goDecorate(row)">页面装修</el-button>
							<el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
							<el-button link type="primary" @click="handleCopy(row)">复制</el-button>
							<el-button link type="danger" @click="handleDelete(row)">删除</el-button>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog v-model="dialogVisible" :title="form.id ? '编辑模板' : '新增模板'" width="620px" destroy-on-close @closed="resetForm">
			<el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
				<el-form-item label="模板名称" prop="name">
					<el-input v-model="form.name" placeholder="请输入模板名称" />
				</el-form-item>
				<el-form-item label="模板类型" prop="type">
					<el-radio-group v-model="form.type">
						<el-radio value="template">首页模板</el-radio>
						<el-radio value="diypage">自定义页</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="状态" prop="status">
					<el-radio-group v-model="form.status">
						<el-radio value="enable">启用</el-radio>
						<el-radio value="disabled">禁用</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="form.memo" type="textarea" :rows="3" placeholder="请输入备注" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="ShopDecorate">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { DecorateService } from "@/common/api/decorate";

type DecorateTemplate = {
	id: number;
	name: string;
	type: number | string;
	memo?: string;
	status: number | string;
	update_time?: string;
};

const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const templateList = ref<DecorateTemplate[]>([]);
const formRef = ref<FormInstance>();

const queryForm = reactive({
	keywords: "",
	type: "",
});

const form = reactive({
	id: 0,
	name: "",
	type: "template",
	memo: "",
	status: "enable",
});

const rules: FormRules = {
	name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
	type: [{ required: true, message: "请选择模板类型", trigger: "change" }],
	status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

function normalizeType(type: number | string) {
	if (type === 2 || type === "2" || type === "diypage") return "diypage";
	return "template";
}

function typeText(type: number | string) {
	return {
		template: "首页模板",
		diypage: "自定义页",
	}[normalizeType(type)];
}

function normalizeStatus(status: number | string) {
	return status === 1 || status === "1" || status === "enable" || status === "normal" ? 1 : 0;
}

function statusValue(status: number | string) {
	return normalizeStatus(status) === 1 ? "enable" : "disabled";
}

async function loadTemplateList() {
	loading.value = true;
	try {
		const res = await DecorateService.getTemplateList({
			keywords: queryForm.keywords,
			type: queryForm.type,
		});
		templateList.value = Array.isArray(res.data) ? res.data : (res.data?.list || []);
	} finally {
		loading.value = false;
	}
}

function resetQuery() {
	queryForm.keywords = "";
	queryForm.type = "";
	loadTemplateList();
}

function resetForm() {
	form.id = 0;
	form.name = "";
	form.type = "template";
	form.memo = "";
	form.status = "enable";
	formRef.value?.clearValidate();
}

function openCreateDialog() {
	resetForm();
	dialogVisible.value = true;
}

function openEditDialog(row: DecorateTemplate) {
	form.id = row.id;
	form.name = row.name;
	form.type = normalizeType(row.type);
	form.memo = row.memo || "";
	form.status = statusValue(row.status);
	dialogVisible.value = true;
}

async function handleSave() {
	if (!formRef.value) return;
	await formRef.value.validate();
	saving.value = true;
	try {
		await DecorateService.saveTemplate({ ...form });
		ElMessage.success("保存成功");
		dialogVisible.value = false;
		await loadTemplateList();
	} catch (error: any) {
		ElMessage.error(error?.message || "保存失败");
	} finally {
		saving.value = false;
	}
}

async function handleStatusChange(row: DecorateTemplate, value: string | number | boolean) {
	try {
		await DecorateService.updateTemplateStatus(row.id, value ? "enable" : "disabled");
		ElMessage.success("操作成功");
		await loadTemplateList();
	} catch (error: any) {
		ElMessage.error(error?.message || "操作失败");
	}
}

async function handleCopy(row: DecorateTemplate) {
	try {
		await DecorateService.copyTemplate(row.id);
		ElMessage.success("复制成功");
		await loadTemplateList();
	} catch (error: any) {
		ElMessage.error(error?.message || "复制失败");
	}
}

async function handleDelete(row: DecorateTemplate) {
	await ElMessageBox.confirm(`确定删除模板「${row.name}」吗？`, "提示", { type: "warning" });
	try {
		await DecorateService.delTemplate(row.id);
		ElMessage.success("删除成功");
		await loadTemplateList();
	} catch (error: any) {
		ElMessage.error(error?.message || "删除失败");
	}
}

function goDecorate(row: DecorateTemplate) {
	router.push({ path: "/shop/decorate/page", query: { id: row.id, type: normalizeType(row.type) } });
}

onMounted(() => {
	loadTemplateList();
});
</script>

<style scoped lang="scss">
.decorate-template-page {
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.title {
		font-size: 16px;
		font-weight: 600;
		color: var(--el-text-color-primary);
	}

	.subtitle {
		margin-top: 4px;
		font-size: 12px;
		color: var(--el-text-color-secondary);
	}
}
</style>
