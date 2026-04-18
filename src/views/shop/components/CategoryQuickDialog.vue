<template>
	<el-dialog v-model="visible" title="新增商品分类" width="660px" append-to-body destroy-on-close @closed="resetForm">
		<el-form ref="formRef" :model="form" :rules="rules" label-width="92px">
			<el-form-item label="上级分类">
				<el-tree-select
					v-model="form.parent_id"
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
				<el-input v-model="form.name" class="compact-input" placeholder="请输入分类名称" />
			</el-form-item>
			<el-form-item label="图片">
				<el-upload
					action="/admin/index/upload"
					:headers="uploadHeader"
					:show-file-list="false"
					auto-upload
					:key="uploadKey"
					:limit="1"
					:on-success="uploadSuccess"
				>
					<img v-if="form.image" :src="form.image" class="avatar" />
					<el-icon v-else class="avatar-uploader-icon">
						<Plus />
					</el-icon>
				</el-upload>
			</el-form-item>
			<el-form-item label="跳转地址">
				<el-input v-model="form.link_path" class="compact-input" placeholder="请输入跳转地址" />
			</el-form-item>
			<el-form-item label="描述">
				<el-input v-model="form.description" class="compact-input" type="textarea" :rows="3" placeholder="请输入分类描述" />
			</el-form-item>
			<el-form-item label="排序">
				<el-input-number v-model="form.sort" :min="0" :max="9999" :controls="false" class="compact-number" />
			</el-form-item>
			<el-form-item label="状态">
				<el-radio-group v-model="form.status">
					<el-radio :value="1">启用</el-radio>
					<el-radio :value="0">禁用</el-radio>
				</el-radio-group>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { computed, reactive, ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ShopService } from "@/common/api/shop";
import { useUserStore } from "@/pinia";

type CategoryItem = {
	id: number;
	name: string;
	children?: CategoryItem[];
};

const props = defineProps<{
	categoryOptions: CategoryItem[];
}>();

const emit = defineEmits<{
	(e: "saved", value: any): void;
}>();

const visible = defineModel<boolean>({ default: false });
const formRef = ref<FormInstance>();
const saving = ref(false);
const uploadKey = ref(Date.now().toString());
const userStore = useUserStore();

const uploadHeader = computed(() => ({
	token: userStore.getToken(),
}));

const form = reactive({
	parent_id: null as number | null,
	name: "",
	image: "",
	link_path: "",
	description: "",
	sort: 0,
	status: 1,
});

const rules: FormRules = {
	name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
};

const resetForm = () => {
	form.parent_id = null;
	form.name = "";
	form.image = "";
	form.link_path = "";
	form.description = "";
	form.sort = 0;
	form.status = 1;
	uploadKey.value = Date.now().toString();
	formRef.value?.clearValidate();
};

const uploadSuccess = (res: any) => {
	const url = res?.data?.url;
	if (!url) {
		ElMessage.error("上传失败，未获取到图片地址");
		return;
	}
	form.image = url;
	uploadKey.value = Date.now().toString();
};

const handleSave = async () => {
	if (!formRef.value) return;
	await formRef.value.validate();
	saving.value = true;
	try {
		const payload = {
			parent_id: form.parent_id ?? 0,
			name: form.name.trim(),
			image: form.image,
			link_path: form.link_path.trim(),
			description: form.description.trim(),
			sort: Number(form.sort || 0),
			status: Number(form.status ?? 1),
		};
		const res = await ShopService.saveCategory(payload);
		ElMessage.success("商品分类已创建");
		emit("saved", { ...(res.data || {}), name: payload.name, parent_id: payload.parent_id });
		visible.value = false;
	} catch (error: any) {
		ElMessage.error(error?.message || "保存失败");
	} finally {
		saving.value = false;
	}
};
</script>

<style scoped lang="scss">
.compact-input {
	width: min(100%, 360px);
}

.compact-number {
	width: 160px;
}

.avatar,
.avatar-uploader-icon {
	width: 88px;
	height: 88px;
	border-radius: 8px;
}

.avatar {
	object-fit: cover;
}

.avatar-uploader-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px dashed var(--el-border-color);
	font-size: 24px;
	color: var(--el-text-color-secondary);
}
</style>
