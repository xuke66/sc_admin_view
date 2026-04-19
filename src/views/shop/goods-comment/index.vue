<template>
	<div class="page">
		<el-card shadow="never">
			<el-form :inline="true" :model="queryForm">
				<el-form-item label="关键词">
					<el-input v-model="queryForm.keywords" clearable placeholder="商品/订单/会员/评价/回复" style="width: 260px" />
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="queryForm.status" clearable placeholder="全部状态" style="width: 140px">
						<el-option label="启用" :value="1" />
						<el-option label="禁用" :value="0" />
					</el-select>
				</el-form-item>
				<el-form-item label="回复">
					<el-select v-model="queryForm.reply_status" clearable placeholder="全部回复" style="width: 140px">
						<el-option label="已回复" :value="1" />
						<el-option label="未回复" :value="0" />
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
						<div class="title">商品评价</div>
						<div class="subtitle">管理商品评价展示状态，并对用户评价进行后台回复。</div>
					</div>
				</div>
			</template>

			<el-table v-loading="loading" :data="list" border>
				<el-table-column prop="id" label="ID" width="80" align="center" />
				<el-table-column label="商品信息" min-width="240" align="center">
					<template #default="{ row }">
						<div class="goods-cell">
							<el-image
								v-if="row.goods_image"
								:src="row.goods_image"
								fit="cover"
								class="goods-thumb"
								preview-teleported
								:preview-src-list="[row.goods_image]"
							/>
							<div v-else class="goods-thumb goods-thumb--empty">无图</div>
							<div class="goods-info">
								<div>{{ row.goods_title || "-" }}</div>
								<div class="muted">{{ row.sku_text || "单规格" }}</div>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="order_sn" label="订单号" min-width="170" align="center" />
				<el-table-column label="会员" min-width="160" align="center">
					<template #default="{ row }">
						<div class="user-cell">
							<el-avatar :src="row.user_avatar" :size="30">{{ getAvatarText(row.user_nickname) }}</el-avatar>
							<span>{{ row.user_nickname || "-" }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="评分" width="150" align="center">
					<template #default="{ row }">
						<el-rate :model-value="Number(row.level || 0)" disabled />
					</template>
				</el-table-column>
				<el-table-column label="评价内容" min-width="260" align="center">
					<template #default="{ row }">
						<div class="content-cell">
							<div>{{ row.content || "-" }}</div>
							<div v-if="row.images?.length" class="comment-images">
								<el-image
									v-for="image in row.images"
									:key="image"
									:src="image"
									fit="cover"
									class="comment-image"
									preview-teleported
									:preview-src-list="row.images"
								/>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="回复内容" min-width="240" align="center">
					<template #default="{ row }">
						<div class="content-cell">
							<div>{{ row.reply_content || "未回复" }}</div>
							<div v-if="row.reply_time" class="muted">{{ row.reply_time }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="状态" width="100" align="center">
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
				<el-table-column prop="create_time" label="评价时间" min-width="160" align="center" />
				<el-table-column label="操作" width="220" fixed="right" align="center">
					<template #default="{ row }">
						<el-space>
							<Auth value="shop:goods-comment:reply">
								<el-button link type="primary" @click="openReplyDialog(row)">回复</el-button>
							</Auth>
							<Auth value="shop:goods-comment:status">
								<el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="handleStatusChange(row)">
									{{ row.status === 1 ? "禁用" : "启用" }}
								</el-button>
							</Auth>
							<Auth value="shop:goods-comment:delete">
								<el-button link type="danger" @click="handleDelete(row)">删除</el-button>
							</Auth>
						</el-space>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog v-model="replyVisible" title="回复评价" width="520px" destroy-on-close @closed="resetReplyForm">
			<div v-if="currentRow" class="reply-preview">
				<div class="preview-title">用户评价</div>
				<div>{{ currentRow.content || "-" }}</div>
			</div>
			<el-form ref="replyFormRef" :model="replyForm" :rules="replyRules" label-width="84px">
				<el-form-item label="回复内容" prop="reply_content">
					<el-input
						v-model="replyForm.reply_content"
						type="textarea"
						:rows="5"
						maxlength="512"
						show-word-limit
						placeholder="请输入回复内容"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="replyVisible = false">取消</el-button>
				<el-button type="primary" :loading="replySaving" @click="handleReply">确认回复</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="ShopGoodsComment">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { ShopService } from "@/common/api/shop";

const loading = ref(false);
const replySaving = ref(false);
const replyVisible = ref(false);
const replyFormRef = ref<FormInstance>();
const list = ref<any[]>([]);
const currentRow = ref<any | null>(null);

const queryForm = reactive({
	keywords: "",
	status: "" as "" | 0 | 1,
	reply_status: "" as "" | 0 | 1,
});

const replyForm = reactive({
	id: 0,
	reply_content: "",
});

const replyRules: FormRules = {
	reply_content: [{ required: true, message: "请输入回复内容", trigger: "blur" }],
};

const loadList = async () => {
	loading.value = true;
	try {
		const res = await ShopService.getGoodsCommentList(queryForm);
		list.value = res.data || [];
	} finally {
		loading.value = false;
	}
};

const resetQuery = () => {
	queryForm.keywords = "";
	queryForm.status = "";
	queryForm.reply_status = "";
	loadList();
};

const openReplyDialog = (row: any) => {
	currentRow.value = row;
	replyForm.id = row.id;
	replyForm.reply_content = row.reply_content || "";
	replyVisible.value = true;
};

const resetReplyForm = () => {
	currentRow.value = null;
	replyForm.id = 0;
	replyForm.reply_content = "";
	replyFormRef.value?.clearValidate();
};

const handleReply = async () => {
	if (!replyFormRef.value) return;
	await replyFormRef.value.validate();
	try {
		await ElMessageBox.confirm("确认提交这条回复吗？提交后会展示给用户查看。", "确认回复", {
			type: "warning",
			confirmButtonText: "确认回复",
			cancelButtonText: "取消",
		});
	} catch {
		return;
	}

	replySaving.value = true;
	try {
		await ShopService.replyGoodsComment({ ...replyForm });
		ElMessage.success("回复成功");
		replyVisible.value = false;
		await loadList();
	} catch (error: any) {
		ElMessage.error(error?.message || "回复失败");
	} finally {
		replySaving.value = false;
	}
};

const handleStatusChange = async (row: any) => {
	const nextStatus = row.status === 1 ? 0 : 1;
	await ShopService.updateGoodsCommentStatus(row.id, nextStatus);
	ElMessage.success(nextStatus === 1 ? "评价已启用" : "评价已禁用");
	await loadList();
};

const handleDelete = async (row: any) => {
	await ElMessageBox.confirm(`确认删除用户 ${row.user_nickname || "-"} 的这条评价吗？`, "删除评价", {
		type: "warning",
		confirmButtonText: "确认删除",
		cancelButtonText: "取消",
	});
	await ShopService.delGoodsComment(row.id);
	ElMessage.success("评价已删除");
	await loadList();
};

const getAvatarText = (name?: string) => {
	return (name || "评").slice(0, 1);
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

.subtitle,
.muted {
	color: var(--el-text-color-secondary);
	font-size: 13px;
}

.subtitle {
	margin-top: 4px;
}

.goods-cell,
.user-cell,
.status-cell {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
}

.goods-cell {
	text-align: left;
}

.goods-info {
	display: grid;
	gap: 4px;
}

.goods-thumb {
	width: 42px;
	height: 42px;
	flex: 0 0 42px;
	border-radius: 6px;
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

.content-cell {
	display: grid;
	gap: 8px;
	justify-items: center;
	line-height: 1.5;
}

.comment-images {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	gap: 6px;
}

.comment-image {
	width: 38px;
	height: 38px;
	border-radius: 5px;
	border: 1px solid var(--el-border-color-light);
}

.reply-preview {
	margin-bottom: 16px;
	padding: 12px;
	border-radius: 8px;
	background: var(--el-fill-color-light);
	line-height: 1.6;
}

.preview-title {
	margin-bottom: 4px;
	color: var(--el-text-color-secondary);
	font-size: 13px;
}
</style>
