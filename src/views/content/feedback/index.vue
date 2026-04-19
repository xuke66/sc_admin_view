<template>
	<div class="page">
		<el-card shadow="never">
			<el-form :inline="true" :model="queryForm">
				<el-form-item label="关键词">
					<el-input v-model="queryForm.keywords" clearable placeholder="用户/电话/类型/内容/备注" style="width: 260px" />
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="queryForm.status" clearable placeholder="全部状态" style="width: 140px">
						<el-option label="未处理" :value="0" />
						<el-option label="已处理" :value="1" />
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
						<div class="title">意见反馈</div>
						<div class="subtitle">查看用户反馈，并标记处理结果。</div>
					</div>
				</div>
			</template>

			<el-table v-loading="loading" :data="list" border>
				<el-table-column prop="id" label="ID" width="80" align="center" />
				<el-table-column prop="user_label" label="用户" min-width="150" align="center" show-overflow-tooltip />
				<el-table-column prop="type" label="类型" min-width="120" align="center" show-overflow-tooltip />
				<el-table-column prop="content" label="反馈内容" min-width="320" align="center" show-overflow-tooltip />
				<el-table-column prop="phone" label="联系电话" min-width="140" align="center" show-overflow-tooltip />
				<el-table-column prop="remark" label="处理备注" min-width="200" align="center" show-overflow-tooltip />
				<el-table-column label="状态" width="110" align="center">
					<template #default="{ row }">
						<div class="status-cell">
							<el-badge
								is-dot
								:type="row.status === 1 ? 'success' : 'warning'"
								class="item"
								:badge-style="{ left: '-20px', top: '12px' }"
							/>
							<span class="one-line">{{ row.status_text }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="创建时间" width="170" align="center" show-overflow-tooltip />
				<el-table-column label="操作" width="170" fixed="right" align="center">
					<template #default="{ row }">
						<el-space>
							<Auth value="content:feedback:detail">
								<el-button link type="primary" @click="openDetail(row.id)">详情</el-button>
							</Auth>
							<Auth value="content:feedback:handle">
								<el-button v-if="row.status !== 1" link type="success" @click="openHandleDialog(row)">已处理</el-button>
							</Auth>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog v-model="detailVisible" title="反馈详情" width="720px" destroy-on-close>
			<div v-loading="detailLoading" v-if="detail" class="detail-body">
				<el-descriptions :column="2">
					<el-descriptions-item label="用户">{{ detail.user_label }}</el-descriptions-item>
					<el-descriptions-item label="联系电话">{{ detail.phone || "-" }}</el-descriptions-item>
					<el-descriptions-item label="反馈类型">{{ detail.type || "-" }}</el-descriptions-item>
					<el-descriptions-item label="状态">{{ detail.status_text }}</el-descriptions-item>
					<el-descriptions-item label="创建时间">{{ detail.create_time || "-" }}</el-descriptions-item>
					<el-descriptions-item label="更新时间">{{ detail.update_time || "-" }}</el-descriptions-item>
				</el-descriptions>
				<div class="detail-section">
					<div class="section-title">反馈内容</div>
					<div class="section-content">{{ detail.content || "-" }}</div>
				</div>
				<div v-if="detail.images?.length" class="detail-section">
					<div class="section-title">反馈图片</div>
					<div class="image-list">
						<el-image
							v-for="image in detail.images"
							:key="image"
							:src="image"
							fit="cover"
							class="feedback-image"
							preview-teleported
							:preview-src-list="detail.images"
						/>
					</div>
				</div>
				<div class="detail-section">
					<div class="section-title">处理备注</div>
					<div class="section-content">{{ detail.remark || "-" }}</div>
				</div>
			</div>
			<template #footer>
				<el-button @click="detailVisible = false">关闭</el-button>
				<Auth value="content:feedback:handle">
					<el-button v-if="detail && detail.status !== 1" type="primary" @click="openHandleDialog(detail)">标记已处理</el-button>
				</Auth>
			</template>
		</el-dialog>

		<el-dialog v-model="handleVisible" title="标记已处理" width="480px" destroy-on-close @closed="resetHandleForm">
			<div class="handle-tip">确认将这条反馈标记为已处理吗？备注可以不填。</div>
			<el-form label-width="82px">
				<el-form-item label="处理备注">
					<el-input
						v-model="handleForm.remark"
						type="textarea"
						:rows="4"
						maxlength="255"
						show-word-limit
						placeholder="请输入处理备注（非必填）"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="handleVisible = false">取消</el-button>
				<el-button type="primary" :loading="handleSaving" @click="handleFeedback">确认处理</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="ContentFeedback">
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { FeedbackService } from "@/common/api/feedback";

const loading = ref(false);
const detailLoading = ref(false);
const handleSaving = ref(false);
const detailVisible = ref(false);
const handleVisible = ref(false);
const list = ref<any[]>([]);
const detail = ref<any | null>(null);

const queryForm = reactive({
	keywords: "",
	status: "" as "" | 0 | 1,
});

const handleForm = reactive({
	id: 0,
	remark: "",
});

const loadList = async () => {
	loading.value = true;
	try {
		const res = await FeedbackService.getFeedbackList(queryForm);
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

const openDetail = async (id: number) => {
	detailVisible.value = true;
	detailLoading.value = true;
	try {
		const res = await FeedbackService.getFeedbackDetail(id);
		detail.value = res.data || null;
	} finally {
		detailLoading.value = false;
	}
};

const openHandleDialog = (row: any) => {
	handleForm.id = row.id;
	handleForm.remark = row.remark || "";
	handleVisible.value = true;
};

const resetHandleForm = () => {
	handleForm.id = 0;
	handleForm.remark = "";
};

const handleFeedback = async () => {
	if (!handleForm.id) return;
	handleSaving.value = true;
	try {
		await FeedbackService.handleFeedback({ ...handleForm });
		ElMessage.success("反馈已标记为已处理");
		handleVisible.value = false;
		await loadList();
		if (detailVisible.value && detail.value?.id) {
			await openDetail(detail.value.id);
		}
	} catch (error: any) {
		ElMessage.error(error?.message || "处理失败");
	} finally {
		handleSaving.value = false;
	}
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

.status-cell {
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.one-line {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.detail-body {
	display: grid;
	gap: 16px;
}

.detail-section {
	display: grid;
	gap: 8px;
}

.section-title {
	font-size: 14px;
	font-weight: 600;
}

.section-content {
	padding: 12px;
	border-radius: 8px;
	background: var(--el-fill-color-light);
	line-height: 1.7;
	white-space: pre-wrap;
}

.image-list {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}

.feedback-image {
	width: 72px;
	height: 72px;
	border-radius: 8px;
	border: 1px solid var(--el-border-color-light);
}

.handle-tip {
	margin-bottom: 14px;
	color: var(--el-text-color-secondary);
}
</style>
