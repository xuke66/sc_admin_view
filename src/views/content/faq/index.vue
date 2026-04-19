<template>
	<div class="page">
		<el-card shadow="never">
			<el-form :inline="true" :model="queryForm">
				<el-form-item label="标题">
					<el-input v-model="queryForm.keywords" clearable placeholder="请输入标题" style="width: 240px" />
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
						<div class="title">常见问题</div>
						<div class="subtitle">维护前台展示的基础 FAQ 内容。</div>
					</div>
					<Auth value="content:faq:create">
						<el-button type="primary" @click="openCreateDialog">新增常见问题</el-button>
					</Auth>
				</div>
			</template>

			<el-table v-loading="loading" :data="list" border>
				<el-table-column prop="id" label="ID" width="90" align="center" />
				<el-table-column prop="title" label="标题" min-width="420" align="center" />
				<el-table-column prop="create_time" label="创建时间" width="180" align="center" />
				<el-table-column label="操作" width="180" fixed="right" align="center">
					<template #default="{ row }">
						<el-space>
							<Auth value="content:faq:edit">
								<el-button link type="primary" @click="openEditDialog(row.id)">编辑</el-button>
							</Auth>
							<Auth value="content:faq:delete">
								<el-button link type="danger" @click="handleDelete(row)">删除</el-button>
							</Auth>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog
			v-model="dialogVisible"
			:title="form.id ? '编辑常见问题' : '新增常见问题'"
			width="900px"
			top="5vh"
			destroy-on-close
			@closed="resetForm"
		>
			<el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
				<el-form-item label="标题" prop="title">
					<el-input v-model="form.title" maxlength="255" show-word-limit placeholder="请输入标题" />
				</el-form-item>
				<el-form-item label="状态" prop="status">
					<el-radio-group v-model="form.status">
						<el-radio :value="1">显示</el-radio>
						<el-radio :value="0">隐藏</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="内容" prop="content">
					<WangEditor v-model="form.content" height="420px" @image-upload="imageUpload" @video-upload="videoUpload" @file-upload="fileUpload" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="ContentFaq">
import type { FormInstance, FormRules } from "element-plus";
import type { FileInsertFnType, ImageInsertFnType, VideoInsertFnType } from "@/components/editor/wang-editor";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { WangEditor } from "@/components/editor/wang-editor";
import { CommonService } from "@/common/api/common";
import { FaqService } from "@/common/api/faq";

const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const list = ref<any[]>([]);

const queryForm = reactive({
	keywords: "",
});

const form = reactive({
	id: 0,
	title: "",
	content: "",
	status: 1 as 0 | 1,
});

const rules: FormRules = {
	title: [{ required: true, message: "请输入标题", trigger: "blur" }],
	content: [{ required: true, message: "请输入内容", trigger: "change" }],
};

const getUploadUrl = (res: any) => {
	return (
		res?.data?.url ||
		res?.data?.src ||
		res?.data?.fileUrl ||
		res?.data?.path ||
		res?.data?.[0]?.url ||
		res?.data?.[0]?.src ||
		res?.data?.[0]?.fileUrl ||
		res?.data?.[0]?.path
	);
};

const getUploadName = (res: any, file: File) => {
	return (
		res?.data?.name ||
		res?.data?.fileName ||
		res?.data?.originalName ||
		res?.data?.[0]?.name ||
		res?.data?.[0]?.fileName ||
		res?.data?.[0]?.originalName ||
		file.name
	);
};

const imageUpload = async (file: File, insertFn: ImageInsertFnType) => {
	try {
		const res = await CommonService.upload(file);
		const url = getUploadUrl(res);
		const name = getUploadName(res, file);
		if (!url) {
			ElMessage.error("上传成功了，但后端没有返回文件地址，编辑器无法插入图片");
			return;
		}
		insertFn(url, name);
	} catch (error) {
		console.error(error);
		ElMessage.error("图片上传失败");
	}
};

const videoUpload = async (file: File, insertFn: VideoInsertFnType) => {
	try {
		const res = await CommonService.upload(file);
		const url = getUploadUrl(res);
		if (!url) {
			ElMessage.error("上传成功了，但后端没有返回视频地址，编辑器无法插入视频");
			return;
		}
		insertFn(url, "");
	} catch (error) {
		console.error(error);
		ElMessage.error("视频上传失败");
	}
};

const fileUpload = async (file: File, insertFn: FileInsertFnType) => {
	try {
		const res = await CommonService.upload(file);
		const url = getUploadUrl(res);
		const name = getUploadName(res, file);
		if (!url) {
			ElMessage.error("上传成功了，但后端没有返回附件地址，编辑器无法插入附件");
			return;
		}
		insertFn(name, url);
	} catch (error) {
		console.error(error);
		ElMessage.error("附件上传失败");
	}
};

const loadList = async () => {
	loading.value = true;
	try {
		const res = await FaqService.getFaqList(queryForm);
		list.value = res.data || [];
	} finally {
		loading.value = false;
	}
};

const resetQuery = () => {
	queryForm.keywords = "";
	loadList();
};

const resetForm = () => {
	form.id = 0;
	form.title = "";
	form.content = "";
	form.status = 1;
	formRef.value?.clearValidate();
};

const openCreateDialog = () => {
	resetForm();
	dialogVisible.value = true;
};

const openEditDialog = async (id: number) => {
	resetForm();
	const res = await FaqService.getFaqDetail(id);
	const detail = res.data || {};
	form.id = Number(detail.id || 0);
	form.title = detail.title || "";
	form.content = detail.content || "";
	form.status = Number(detail.status || 0) === 1 ? 1 : 0;
	dialogVisible.value = true;
};

const handleSave = async () => {
	if (!formRef.value) return;
	await formRef.value.validate();
	saving.value = true;
	try {
		await FaqService.saveFaq({ ...form });
		ElMessage.success(form.id ? "常见问题已更新" : "常见问题已创建");
		dialogVisible.value = false;
		await loadList();
	} catch (error: any) {
		ElMessage.error(error?.message || "保存失败");
	} finally {
		saving.value = false;
	}
};

const handleDelete = async (row: any) => {
	await ElMessageBox.confirm(`确认删除「${row.title}」吗？`, "删除常见问题", {
		type: "warning",
		confirmButtonText: "确认删除",
		cancelButtonText: "取消",
	});
	await FaqService.delFaq(row.id);
	ElMessage.success("常见问题已删除");
	await loadList();
};

onMounted(loadList);
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
</style>
