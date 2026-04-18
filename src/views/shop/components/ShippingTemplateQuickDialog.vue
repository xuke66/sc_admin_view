<template>
	<el-dialog v-model="visible" title="新增快递模板" width="720px" append-to-body destroy-on-close @open="loadRegionOptions" @closed="resetForm">
		<el-alert
			v-if="regionLoadError"
			type="warning"
			show-icon
			:closable="false"
			class="region-alert"
			:title="regionLoadError"
		/>

		<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
			<el-form-item label="模板名称" prop="name">
				<el-input v-model="form.name" class="compact-input" maxlength="120" placeholder="请输入模板名称" />
			</el-form-item>
			<el-form-item label="计费方式" prop="type">
				<el-radio-group v-model="form.type">
					<el-radio :value="1">按件计费</el-radio>
					<el-radio :value="2">按重量计费</el-radio>
				</el-radio-group>
			</el-form-item>
			<div class="form-grid">
				<el-form-item :label="form.type === 2 ? '首重' : '首件'" prop="first_num">
					<el-input-number v-model="form.first_num" :min="0" :precision="0" :controls="false" class="compact-number" />
				</el-form-item>
				<el-form-item label="首费" prop="first_price">
					<el-input-number v-model="form.first_price" :min="0" :precision="2" :controls="false" class="compact-number" />
				</el-form-item>
				<el-form-item :label="form.type === 2 ? '续重' : '续件'" prop="additional_num">
					<el-input-number v-model="form.additional_num" :min="0" :precision="0" :controls="false" class="compact-number" />
				</el-form-item>
				<el-form-item label="续费" prop="additional_price">
					<el-input-number v-model="form.additional_price" :min="0" :precision="2" :controls="false" class="compact-number" />
				</el-form-item>
			</div>
			<el-form-item label="配送地区" prop="district_ids">
				<el-cascader
					v-model="form.district_ids"
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
import type { CascaderProps, FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";
import { CommonService } from "@/common/api/common";
import { ShopService } from "@/common/api/shop";

type RegionOption = {
	label: string;
	value: number;
	children?: RegionOption[];
};

const emit = defineEmits<{
	(e: "saved", value: any): void;
}>();

const visible = defineModel<boolean>({ default: false });
const formRef = ref<FormInstance>();
const saving = ref(false);
const regionOptions = ref<RegionOption[]>([]);
const regionLoadError = ref("");

const form = reactive({
	name: "",
	type: 1,
	first_num: 1,
	first_price: 0,
	additional_num: 1,
	additional_price: 0,
	district_ids: [] as number[],
	status: 1,
});

const regionProps: CascaderProps = {
	label: "label",
	children: "children",
	value: "value",
	multiple: true,
	emitPath: false,
};

const rules: FormRules = {
	name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
	type: [{ required: true, message: "请选择计费方式", trigger: "change" }],
	first_num: [{ required: true, message: "请输入首件/首重", trigger: "blur" }],
	first_price: [{ required: true, message: "请输入首费", trigger: "blur" }],
	additional_num: [{ required: true, message: "请输入续件/续重", trigger: "blur" }],
	additional_price: [{ required: true, message: "请输入续费", trigger: "blur" }],
	district_ids: [{ required: true, type: "array", min: 1, message: "请选择配送地区", trigger: "change" }],
};

const resetForm = () => {
	form.name = "";
	form.type = 1;
	form.first_num = 1;
	form.first_price = 0;
	form.additional_num = 1;
	form.additional_price = 0;
	form.district_ids = [];
	form.status = 1;
	formRef.value?.clearValidate();
};

const loadRegionOptions = async () => {
	if (regionOptions.value.length || saving.value) return;
	try {
		const res = await CommonService.getRegionCascader();
		regionOptions.value = res.data || [];
		regionLoadError.value = "";
	} catch (error: any) {
		regionLoadError.value = error?.message || "地区数据加载失败，请检查后端 region 数据。";
	}
};

const reloadTemplates = async () => {
	const res = await ShopService.getShippingTemplateList();
	return res.data || [];
};

const handleSave = async () => {
	if (!formRef.value) return;
	await formRef.value.validate();
	saving.value = true;
	try {
		const payload = {
			name: form.name.trim(),
			type: Number(form.type),
			first_num: Number(form.first_num),
			first_price: Number(form.first_price),
			additional_num: Number(form.additional_num),
			additional_price: Number(form.additional_price),
			district_ids: [...form.district_ids],
			status: Number(form.status),
		};
		const res = await ShopService.saveShippingTemplate(payload);
		const latestList = await reloadTemplates();
		const matched = res?.data?.id
			? latestList.find((item: any) => Number(item.id) === Number(res.data.id))
			: latestList.find((item: any) => item.name === payload.name);
		ElMessage.success("快递模板已创建");
		emit("saved", matched || { ...(res.data || {}), name: payload.name });
		visible.value = false;
	} catch (error: any) {
		ElMessage.error(error?.message || "保存失败");
	} finally {
		saving.value = false;
	}
};
</script>

<style scoped lang="scss">
.region-alert {
	margin-bottom: 16px;
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 8px 16px;
}

.compact-input {
	width: min(100%, 360px);
}

.compact-number {
	width: 160px;
}

.full-width {
	width: 100%;
}

@media (max-width: 768px) {
	.form-grid {
		grid-template-columns: 1fr;
	}

	.compact-input {
		width: 100%;
	}
}
</style>
