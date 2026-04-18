<template>
	<el-dialog
		v-model="visible"
		:title="form.id ? '编辑商品' : '新增商品'"
		width="1000px"
		top="3vh"
		destroy-on-close
		append-to-body
		class="goods-editor-dialog"
		@closed="handleClosed"
	>
		<el-tabs v-model="activeTab" class="editor-tabs">
			<el-tab-pane label="基本信息" name="basic">
				<div class="tab-pane">
					<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
						<div class="form-grid">
							<el-form-item label="商品标题" prop="title">
								<el-input v-model="form.title" class="compact-text-input" placeholder="请输入商品标题" maxlength="255" />
							</el-form-item>
							<el-form-item label="副标题">
								<el-input v-model="form.subtitle" class="compact-text-input" placeholder="请输入副标题" maxlength="255" />
							</el-form-item>
							<el-form-item label="商品主图" prop="image">
								<div class="upload-grid">
									<div v-if="form.image" class="image-card">
										<el-image :src="form.image" fit="cover" class="image-thumb" />
										<el-button link type="danger" @click="form.image = ''">删除</el-button>
									</div>
									<el-upload
										v-else
										action="/admin/index/upload"
										:headers="uploadHeader"
										:show-file-list="false"
										:on-success="(res: any) => handleSingleImageSuccess(res, 'image')"
									>
										<div class="upload-trigger">+</div>
									</el-upload>
								</div>
							</el-form-item>
							<el-form-item label="轮播图">
								<div class="upload-grid">
									<div v-for="(item, index) in form.images" :key="`${item}-${index}`" class="image-card">
										<el-image :src="item" fit="cover" class="image-thumb" />
										<el-button link type="danger" @click="removeCarousel(index)">删除</el-button>
									</div>
									<el-upload action="/admin/index/upload" :headers="uploadHeader" :show-file-list="false" multiple :on-success="handleCarouselSuccess">
										<div class="upload-trigger">+</div>
									</el-upload>
								</div>
							</el-form-item>
							<el-form-item label="商品分类" prop="cate_ids">
								<div class="inline-row">
									<el-cascader
                                        style="width: 300px;"
										v-model="form.cate_ids"
										class="compact-cascader"
										:options="localCategoryOptions"
										:props="categoryCascaderProps"
										clearable
										collapse-tags
										collapse-tags-tooltip
										placeholder="请选择商品分类"
									/>
									<el-button link type="primary" @click="categoryDialogVisible = true">添加商品分类</el-button>
								</div>
							</el-form-item>
							<el-form-item label="商品排序">
								<el-input-number v-model="form.sort" :min="0" :controls="false" class="compact-number" />
							</el-form-item>
							<el-form-item label="虚拟销量">
								<el-input-number v-model="form.fake_sales" :min="0" :precision="0" :controls="false" class="compact-number" />
							</el-form-item>
							<el-form-item label="商品状态">
								<el-radio-group v-model="form.status">
									<el-radio :value="1">上架</el-radio>
									<el-radio :value="0">下架</el-radio>
								</el-radio-group>
							</el-form-item>
						</div>
					</el-form>
				</div>
			</el-tab-pane>

			<el-tab-pane label="价格/库存" name="price">
				<div class="tab-pane">
					<el-form label-width="100px">
						<el-form-item label="商品规格">
							<el-radio-group v-model="form.is_sku" :disabled="form.id > 0" @change="handleSkuModeChange">
								<el-radio :value="0">单规格</el-radio>
								<el-radio :value="1">多规格</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-form>

					<div v-if="form.is_sku === 0" class="single-sku">
						<el-form label-width="100px">
							<div class="form-grid">
								<el-form-item label="售价">
									<el-input-number v-model="form.single_sku.price" :min="0" :precision="2" :controls="false" class="compact-number" />
								</el-form-item>
								<el-form-item label="库存">
									<el-input-number v-model="form.single_sku.stock" :min="0" :precision="0" :controls="false" class="compact-number" />
								</el-form-item>
								<el-form-item label="重量(kg)">
									<el-input-number v-model="form.single_sku.weight" :min="0" :precision="2" :controls="false" class="compact-number" />
								</el-form-item>
								<el-form-item label="规格状态">
									<el-radio-group v-model="form.single_sku.status">
										<el-radio :value="1">上架</el-radio>
										<el-radio :value="0">下架</el-radio>
									</el-radio-group>
								</el-form-item>
							</div>
						</el-form>
					</div>

					<div v-else class="multi-sku">
						<div class="sku-group-list">
							<div v-for="(group, groupIndex) in form.sku_groups" :key="groupIndex" class="sku-group-card">
								<div class="sku-group-header">
									<el-input v-model="group.name" class="sku-group-name-input" placeholder="主规格名称" @change="rebuildSkuPrices" />
									<el-button link type="danger" @click="removeSkuGroup(groupIndex)">删除</el-button>
								</div>
								<div class="sku-value-list">
									<div v-for="(value, valueIndex) in group.values" :key="valueIndex" class="sku-value-row">
										<el-input v-model="value.name" class="sku-value-input" placeholder="规格值" @change="rebuildSkuPrices" />
										<el-button link type="danger" @click="removeSkuValue(groupIndex, valueIndex)">删除</el-button>
									</div>
									<el-button type="primary" link @click="addSkuValue(groupIndex)">添加</el-button>
								</div>
							</div>
						</div>
						<el-button type="primary" @click="addSkuGroup">添加主规格</el-button>

						<div class="sku-table-wrap">
							<el-table :data="form.sku_prices" class="sku-table">
								<el-table-column
									align="center"
									v-for="(group, index) in normalizedSkuGroups"
									:key="`${group.name}-${index}`"
									:label="group.name || `规格${index + 1}`"
								>
									<template #default="{ row }">
										{{ row.option_values[index] || "-" }}
									</template>
								</el-table-column>
								<el-table-column label="图片" align="center">
									<template #default="{ row }">
										<el-upload
											action="/admin/index/upload"
											:headers="uploadHeader"
											:show-file-list="false"
											:on-success="(res: any) => handleSkuImageSuccess(res, row)"
										>
											<el-image v-if="row.image" :src="row.image" fit="cover" class="sku-image" />
											<div v-else class="sku-upload-trigger">+</div>
										</el-upload>
									</template>
								</el-table-column>
								<el-table-column label="价格(元)" width="140" align="center">
									<template #default="{ row }">
										<el-input-number v-model="row.price" :min="0" :precision="2" :controls="false" class="compact-number table-number" />
									</template>
								</el-table-column>
								<el-table-column label="库存(件)" width="140" align="center">
									<template #default="{ row }">
										<el-input-number v-model="row.stock" :min="0" :precision="0" :controls="false" class="compact-number table-number" />
									</template>
								</el-table-column>
								<el-table-column label="重量(kg)" width="140" align="center">
									<template #default="{ row }">
										<el-input-number v-model="row.weight" :min="0" :precision="2" :controls="false" class="compact-number table-number" />
									</template>
								</el-table-column>
								<el-table-column label="状态" width="120" align="center">
									<template #default="{ row }">
										<el-select v-model="row.status" class="table-select">
											<el-option label="上架" :value="1" />
											<el-option label="下架" :value="0" />
										</el-select>
									</template>
								</el-table-column>
							</el-table>
						</div>
					</div>
				</div>
			</el-tab-pane>

			<el-tab-pane label="发货设置" name="shipping">
				<div class="tab-pane narrow-pane">
					<el-form label-width="100px">
						<el-form-item label="配送方式">
							<el-radio-group model-value="express">
								<el-radio value="express">物流快递</el-radio>
							</el-radio-group>
						</el-form-item>
						<el-form-item label="运费模板" prop="shipping_template_id">
							<div class="inline-row">
								<el-select v-model="form.shipping_template_id" class="shipping-select" clearable placeholder="请选择快递模板">
									<el-option v-for="item in localShippingTemplateOptions" :key="item.id" :label="item.label" :value="item.id" />
								</el-select>
								<el-button link type="primary" @click="shippingTemplateDialogVisible = true">新增快递模板</el-button>
							</div>
						</el-form-item>
					</el-form>
				</div>
			</el-tab-pane>

			<el-tab-pane label="商品参数" name="attrs">
				<div class="tab-pane narrow-pane">
					<el-form label-width="100px">
						<el-form-item label="服务保障">
							<div class="service-picker-area">
								<div class="selected-service-list">
									<el-tag v-for="item in selectedServiceItems" :key="item.id" closable @close="removeService(item.id)">
										{{ item.name }}
									</el-tag>
                                    <el-button type="primary" link @click="serviceDialogVisible = true">添加服务保障</el-button>

								</div>
							</div>
						</el-form-item>
						<el-form-item label="参数详情">
							<div class="attr-panel">
								<el-table :data="form.attrs" class="attr-table" :show-header="true">
									<el-table-column label="参数名称" align="center">
										<template #default="{ row }">
											<el-input v-model="row.name" class="attr-input" placeholder="请输入名称" />
										</template>
									</el-table-column>
									<el-table-column label="内容" align="center">
										<template #default="{ row }">
											<el-input v-model="row.value" class="attr-input" placeholder="请输入内容" />
										</template>
									</el-table-column>
									<el-table-column label="操作" width="90" align="center">
										<template #default="{ $index }">
											<el-button link type="danger" @click="removeAttr($index)">删除</el-button>
										</template>
									</el-table-column>
								</el-table>
								<el-button type="primary" @click="addAttr">添加</el-button>
							</div>
						</el-form-item>
					</el-form>
				</div>
			</el-tab-pane>

			<el-tab-pane label="商品详情" name="detail">
				<div class="tab-pane">
					<WangEditor v-model="form.content" height="400px" @image-upload="imageUpload" @video-upload="videoUpload" @file-upload="fileUpload" />
				</div>
			</el-tab-pane>
		</el-tabs>

		<el-dialog v-model="serviceDialogVisible" title="选择服务保障" width="760px" append-to-body destroy-on-close>
			<div class="service-dialog-body">
				<el-checkbox-group v-model="serviceDraftIds" class="service-grid">
					<label v-for="item in goodsServiceOptions" :key="item.id" class="service-card">
						<el-checkbox :value="Number(item.id)">
							<span class="service-card-name">{{ item.name }}</span>
						</el-checkbox>
						<span class="service-card-desc">{{ item.description || "暂无描述" }}</span>
					</label>
				</el-checkbox-group>
				<div v-if="!goodsServiceOptions.length" class="empty-text">暂无可选服务保障，请先去商品服务页面维护。</div>
			</div>
			<template #footer>
				<el-button @click="serviceDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="confirmServiceSelection">确认</el-button>
			</template>
		</el-dialog>

		<ShippingTemplateQuickDialog v-model="shippingTemplateDialogVisible" @saved="handleShippingTemplateSaved" />
		<CategoryQuickDialog v-model="categoryDialogVisible" :category-options="localCategoryOptions" @saved="handleCategorySaved" />

		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { CascaderProps, FormInstance, FormRules } from "element-plus";
import type { FileInsertFnType, ImageInsertFnType, VideoInsertFnType } from "@/components/editor/wang-editor";
import { ElMessage } from "element-plus";
import { computed, reactive, ref, watch } from "vue";
import { WangEditor } from "@/components/editor/wang-editor";
import CategoryQuickDialog from "@/views/shop/components/CategoryQuickDialog.vue";
import ShippingTemplateQuickDialog from "@/views/shop/components/ShippingTemplateQuickDialog.vue";
import { CommonService } from "@/common/api/common";
import { ShopService } from "@/common/api/shop";
import { useUserStore } from "@/pinia";

type CategoryItem = {
	id: number;
	name: string;
	children?: CategoryItem[];
};

type ShippingTemplateItem = {
	id: number;
	name?: string;
	type?: number;
	label: string;
};

type GoodsServiceItem = {
	id: number;
	name: string;
	image?: string;
	description?: string;
};

type GoodsSkuGroup = {
	name: string;
	values: Array<{ name: string }>;
};

type GoodsSkuPriceRow = {
	option_values: string[];
	image: string;
	price: number;
	stock: number;
	weight: number;
	status: number;
};

const props = defineProps<{
	categoryOptions: CategoryItem[];
	shippingTemplateOptions: Array<ShippingTemplateItem>;
	goodsServiceOptions: GoodsServiceItem[];
}>();

const emit = defineEmits<{
	(e: "saved"): void;
}>();

const userStore = useUserStore();
const visible = defineModel<boolean>({ default: false });
const formRef = ref<FormInstance>();
const saving = ref(false);
const activeTab = ref("basic");
const serviceDialogVisible = ref(false);
const shippingTemplateDialogVisible = ref(false);
const categoryDialogVisible = ref(false);
const serviceDraftIds = ref<number[]>([]);
const localShippingTemplateOptions = ref<Array<ShippingTemplateItem>>([]);
const localCategoryOptions = ref<CategoryItem[]>([]);

const uploadHeader = computed(() => ({
	token: userStore.getToken(),
}));

const categoryCascaderProps: CascaderProps = {
	label: "name",
	value: "id",
	children: "children",
	multiple: true,
	emitPath: false,
	checkStrictly: false,
};

const createDefaultForm = () => ({
	id: 0,
	title: "",
	subtitle: "",
	image: "",
	images: [] as string[],
	cate_ids: [] as number[],
	sort: 0,
	status: 1,
	is_sku: 0,
	fake_sales: 0,
	shipping_template_id: null as number | null,
	service_ids: [] as number[],
	attrs: [{ name: "", value: "" }],
	content: "",
	single_sku: {
		price: 0,
		stock: 0,
		weight: 0,
		status: 1,
		image: "",
	},
	sku_groups: [] as GoodsSkuGroup[],
	sku_prices: [] as GoodsSkuPriceRow[],
});

const form = reactive(createDefaultForm());

const rules: FormRules = {
	title: [{ required: true, message: "请输入商品标题", trigger: "blur" }],
	image: [{ required: true, message: "请上传商品主图", trigger: "change" }],
	cate_ids: [{ required: true, type: "array", min: 1, message: "请选择商品分类", trigger: "change" }],
};

const normalizedSkuGroups = computed(() => form.sku_groups.filter((group) => group.name.trim() !== "" && group.values.some((value) => value.name.trim() !== "")));

const selectedServiceItems = computed(
	() => form.service_ids.map((id) => props.goodsServiceOptions.find((item) => Number(item.id) === Number(id))).filter(Boolean) as GoodsServiceItem[],
);

const categoryLeafMap = computed(() => {
	const result = new Map<number, number[]>();
	const travel = (nodes: CategoryItem[]): number[] => {
		const leafIds: number[] = [];
		nodes.forEach((node) => {
			const children = Array.isArray(node.children) ? node.children : [];
			const currentLeafIds = children.length ? travel(children) : [Number(node.id)];
			result.set(Number(node.id), currentLeafIds);
			leafIds.push(...currentLeafIds);
		});
		return leafIds;
	};
	travel(localCategoryOptions.value || []);
	return result;
});

watch(
	() => props.shippingTemplateOptions,
	(value) => {
		localShippingTemplateOptions.value = [...value];
	},
	{ deep: true, immediate: true },
);

watch(
	() => props.categoryOptions,
	(value) => {
		localCategoryOptions.value = [...value];
	},
	{ deep: true, immediate: true },
);

watch(
	() => serviceDialogVisible.value,
	(value) => {
		if (value) serviceDraftIds.value = [...form.service_ids];
	},
);

const normalizeSelectedCategoryIds = (ids: number[]) => {
	const leafSet = new Set<number>();
	ids.forEach((id) => {
		(categoryLeafMap.value.get(Number(id)) || []).forEach((leafId) => leafSet.add(Number(leafId)));
	});
	return Array.from(leafSet);
};

const findCategoryNode = (nodes: CategoryItem[], matcher: (item: CategoryItem) => boolean): CategoryItem | null => {
	for (const node of nodes) {
		if (matcher(node)) return node;
		if (node.children?.length) {
			const matched = findCategoryNode(node.children, matcher);
			if (matched) return matched;
		}
	}
	return null;
};

const handleClosed = () => {
	resetForm();
	activeTab.value = "basic";
};

const resetForm = () => {
	Object.assign(form, createDefaultForm());
	serviceDraftIds.value = [];
	formRef.value?.clearValidate();
};

const openCreate = () => {
	resetForm();
	activeTab.value = "basic";
	visible.value = true;
};

const openEdit = async (id: number) => {
	resetForm();
	activeTab.value = "basic";
	const res = await ShopService.getGoodsDetail(id);
	const detail = res.data;
	const goods = detail.goods || {};
	form.id = Number(goods.id || 0);
	form.title = goods.title || "";
	form.subtitle = goods.subtitle || "";
	form.image = goods.image || "";
	form.images = goods.images || [];
	form.cate_ids = Array.isArray(goods.cate_ids) ? goods.cate_ids.map((item: any) => Number(item)) : [];
	form.sort = Number(goods.sort || 0);
	form.status = Number(goods.status ?? 1);
	form.is_sku = Number(goods.is_sku ?? 0);
	form.fake_sales = Number(goods.fake_sales || 0);
	form.shipping_template_id = goods.shipping_template_id ? Number(goods.shipping_template_id) : null;
	form.service_ids = Array.isArray(goods.service_ids) ? goods.service_ids.map((item: any) => Number(item)) : [];
	form.attrs = Array.isArray(goods.attrs) && goods.attrs.length ? goods.attrs : [{ name: "", value: "" }];
	form.content = goods.content || "";
	form.single_sku = detail.single_sku
		? {
				price: Number(detail.single_sku.price || 0),
				stock: Number(detail.single_sku.stock || 0),
				weight: Number(detail.single_sku.weight || 0),
				status: Number(detail.single_sku.status ?? 1),
				image: detail.single_sku.image || "",
			}
		: createDefaultForm().single_sku;
	form.sku_groups = Array.isArray(detail.sku_groups)
		? detail.sku_groups.map((item: any) => ({
				name: item.name || "",
				values: Array.isArray(item.values) ? item.values.map((value: any) => ({ name: value.name || "" })) : [],
			}))
		: [];
	form.sku_prices = Array.isArray(detail.sku_prices)
		? detail.sku_prices.map((item: any) => ({
				option_values: Array.isArray(item.option_values) ? item.option_values : [],
				image: item.image || "",
				price: Number(item.price || 0),
				stock: Number(item.stock || 0),
				weight: Number(item.weight || 0),
				status: Number(item.status ?? 1),
			}))
		: [];
	visible.value = true;
};

const getUploadUrl = (res: any) =>
	res?.data?.url || res?.data?.src || res?.data?.fileUrl || res?.data?.path || res?.data?.[0]?.url || res?.data?.[0]?.src || res?.data?.[0]?.fileUrl || res?.data?.[0]?.path;

const getUploadName = (res: any, file: File) =>
	res?.data?.name || res?.data?.fileName || res?.data?.originalName || res?.data?.[0]?.name || res?.data?.[0]?.fileName || res?.data?.[0]?.originalName || file.name;

const handleSingleImageSuccess = (res: any, field: "image") => {
	const url = getUploadUrl(res);
	if (!url) {
		ElMessage.error("上传成功了，但后端没有返回文件地址");
		return;
	}
	form[field] = url;
};

const handleCarouselSuccess = (res: any) => {
	const url = getUploadUrl(res);
	if (!url) {
		ElMessage.error("上传成功了，但后端没有返回文件地址");
		return;
	}
	if (!form.images.includes(url)) form.images.push(url);
};

const removeCarousel = (index: number) => {
	form.images.splice(index, 1);
};

const handleSkuImageSuccess = (res: any, row: GoodsSkuPriceRow) => {
	const url = getUploadUrl(res);
	if (!url) {
		ElMessage.error("上传成功了，但后端没有返回文件地址");
		return;
	}
	row.image = url;
};

const addSkuGroup = () => {
	form.sku_groups.push({ name: "", values: [{ name: "" }] });
};

const removeSkuGroup = (index: number) => {
	form.sku_groups.splice(index, 1);
	rebuildSkuPrices();
};

const addSkuValue = (groupIndex: number) => {
	form.sku_groups[groupIndex].values.push({ name: "" });
};

const removeSkuValue = (groupIndex: number, valueIndex: number) => {
	form.sku_groups[groupIndex].values.splice(valueIndex, 1);
	rebuildSkuPrices();
};

const buildComboKey = (values: string[]) => values.join("||");

const buildCombinations = (groups: string[][]) => {
	let result: string[][] = [[]];
	for (const values of groups) {
		const next: string[][] = [];
		result.forEach((item) => {
			values.forEach((value) => next.push([...item, value]));
		});
		result = next;
	}
	return result;
};

const rebuildSkuPrices = () => {
	const groups = normalizedSkuGroups.value.map((group) => group.values.map((value) => value.name.trim()).filter(Boolean));
	if (!groups.length || groups.some((group) => group.length === 0)) {
		form.sku_prices = [];
		return;
	}
	const existingMap = new Map(form.sku_prices.map((item) => [buildComboKey(item.option_values), item]));
	form.sku_prices = buildCombinations(groups).map((combo) => {
		const key = buildComboKey(combo);
		return (
			existingMap.get(key) || {
				option_values: combo,
				image: "",
				price: 0,
				stock: 0,
				weight: 0,
				status: 1,
			}
		);
	});
};

const handleSkuModeChange = () => {
	if (form.is_sku === 0) {
		form.sku_groups = [];
		form.sku_prices = [];
	} else if (!form.sku_groups.length) {
		addSkuGroup();
		rebuildSkuPrices();
	}
};

const addAttr = () => {
	form.attrs.push({ name: "", value: "" });
};

const removeAttr = (index: number) => {
	form.attrs.splice(index, 1);
	if (!form.attrs.length) addAttr();
};

const removeService = (id: number) => {
	form.service_ids = form.service_ids.filter((item) => Number(item) !== Number(id));
};

const confirmServiceSelection = () => {
	form.service_ids = [...serviceDraftIds.value];
	serviceDialogVisible.value = false;
};

const validateBeforeSave = () => {
	if (!form.cate_ids.length) {
		activeTab.value = "basic";
		ElMessage.error("请选择商品分类");
		return false;
	}
	if (!form.shipping_template_id) {
		activeTab.value = "shipping";
		ElMessage.error("请选择运费模板");
		return false;
	}
	if (form.is_sku === 1) {
		for (const group of form.sku_groups) {
			const values = group.values.map((item) => item.name.trim()).filter(Boolean);
			if (new Set(values).size !== values.length) {
				activeTab.value = "price";
				ElMessage.error("同一规格组内规格值不能重复");
				return false;
			}
		}
		if (!form.sku_prices.length) {
			activeTab.value = "price";
			ElMessage.error("请完善多规格库存信息");
			return false;
		}
	}
	return true;
};

const buildTemplateLabel = (item: any) => item.name || `${Number(item.type) === 2 ? "按重量" : "按件"}模板 #${item.id}`;

const reloadShippingTemplateOptions = async () => {
	const res = await ShopService.getShippingTemplateList();
	localShippingTemplateOptions.value = (res.data || []).map((item: any) => ({
		...item,
		label: buildTemplateLabel(item),
	}));
};

const reloadCategoryOptions = async () => {
	const res = await ShopService.getCategoryList();
	localCategoryOptions.value = res.data || [];
};

const handleShippingTemplateSaved = async (item: any) => {
	await reloadShippingTemplateOptions();
	const matched = item?.id
		? localShippingTemplateOptions.value.find((option) => Number(option.id) === Number(item.id))
		: localShippingTemplateOptions.value.find((option) => option.name === item?.name);
	form.shipping_template_id = matched ? Number(matched.id) : form.shipping_template_id;
};

const handleCategorySaved = async (item: any) => {
	await reloadCategoryOptions();
	const matched = item?.id
		? findCategoryNode(localCategoryOptions.value, (option) => Number(option.id) === Number(item.id))
		: findCategoryNode(localCategoryOptions.value, (option) => option.name === item?.name);
	if (matched) {
		form.cate_ids = Array.from(new Set([...form.cate_ids, Number(matched.id)]));
	}
};

const handleSave = async () => {
	if (!formRef.value) return;
	await formRef.value.validate();
	if (!validateBeforeSave()) return;

	saving.value = true;
	try {
		await ShopService.saveGoods({
			id: form.id,
			title: form.title.trim(),
			subtitle: form.subtitle.trim(),
			cate_ids: normalizeSelectedCategoryIds(form.cate_ids),
			image: form.image,
			images: [...form.images],
			content: form.content,
			is_sku: form.is_sku,
			attrs: form.attrs.filter((item) => item.name.trim() || item.value.trim()),
			fake_sales: Number(form.fake_sales || 0),
			shipping_template_id: form.shipping_template_id ? Number(form.shipping_template_id) : "",
			sort: Number(form.sort || 0),
			status: Number(form.status ?? 1),
			service_ids: [...form.service_ids],
			single_sku: {
				price: Number(form.single_sku.price || 0),
				stock: Number(form.single_sku.stock || 0),
				weight: Number(form.single_sku.weight || 0),
				status: Number(form.single_sku.status ?? 1),
				image: form.single_sku.image || "",
			},
			sku_groups: form.sku_groups.map((group) => ({
				name: group.name.trim(),
				values: group.values.map((value) => ({ name: value.name.trim() })).filter((value) => value.name),
			})),
			sku_prices: form.sku_prices.map((item) => ({
				option_values: [...item.option_values],
				image: item.image,
				price: Number(item.price || 0),
				stock: Number(item.stock || 0),
				weight: Number(item.weight || 0),
				status: Number(item.status ?? 1),
			})),
		});
		ElMessage.success(form.id ? "商品已更新" : "商品已创建");
		visible.value = false;
		emit("saved");
	} catch (error: any) {
		ElMessage.error(error?.message || "保存失败");
	} finally {
		saving.value = false;
	}
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

defineExpose({
	openCreate,
	openEdit,
});
</script>

<style scoped lang="scss">
.tab-pane {
	min-height: 520px;
	padding: 8px 0;
}

.narrow-pane {
	max-width: 920px;
}

.form-grid {
	display: grid;
	gap: 8px;
}

.compact-text-input,
.compact-cascader {
	width: 50%;
}

.compact-number {
	width: 160px;
}

.upload-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
}

.image-card {
	display: grid;
	justify-items: center;
	gap: 4px;
}

.image-thumb,
.upload-trigger {
	width: 86px;
	height: 86px;
	border-radius: 8px;
}

.image-thumb,
.sku-image {
	object-fit: cover;
}

.upload-trigger,
.sku-upload-trigger {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px dashed var(--el-border-color);
	color: var(--el-text-color-secondary);
	font-size: 28px;
}

.inline-row {
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
}

.service-picker-area {
	display: grid;
	gap: 10px;
}

.selected-service-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.empty-text {
	font-size: 13px;
	color: var(--el-text-color-secondary);
}

.sku-group-list {
	display: grid;
	gap: 14px;
	margin-bottom: 20px;
}

.sku-group-card {
	gap: 10px;
}

.sku-group-header {
	display: flex;
	align-items: center;
	gap: 8px;
}

.sku-group-name-input {
	width: 150px;
	margin-bottom: 10px;
}

.sku-value-list {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}

.sku-value-row {
	display: flex;
	align-items: center;
	gap: 8px;
}

.sku-value-input {
	width: 150px;
}

.sku-table-wrap {
	width: 100%;
}

.sku-table {
	margin-top: 16px;
}

.sku-image,
.sku-upload-trigger {
	width: 50px;
	height: 50px;
	border-radius: 6px;
}

.table-number,
.table-select {
	width: 100%;
}

.attr-panel {
	display: grid;
	gap: 12px;
	width: 100%;
	max-width: 560px;
}

.attr-input {
	width: 160px;
}

.attr-table :deep(.el-table__inner-wrapper::before),
.attr-table :deep(.el-table__border-left-patch),
.attr-table :deep(td.el-table__cell),
.attr-table :deep(th.el-table__cell.is-leaf) {
	border: none;
}

.attr-table :deep(.el-table__inner-wrapper::before) {
	display: none;
}

.attr-table :deep(.el-table__cell) {
	padding: 8px 0;
	text-align: center;
}

.shipping-select {
	width: 150px;
}

.service-dialog-body {
	max-height: 420px;
	overflow: auto;
}

.service-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;
}

.service-card {
	display: grid;
	gap: 6px;
	padding: 12px;
	border: 1px solid var(--el-border-color-light);
	border-radius: 10px;
	background: var(--el-fill-color-extra-light);
	cursor: pointer;
}

.service-card-name {
	font-weight: 600;
}

.service-card-desc {
	font-size: 12px;
	color: var(--el-text-color-secondary);
	line-height: 1.5;
}

@media (max-width: 1200px) {
	.sku-group-list {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.sku-table-wrap {
		width: 100%;
		min-width: 0;
	}
}

@media (max-width: 900px) {
	.service-grid {
		grid-template-columns: 1fr;
	}

	.attr-input,
	.compact-text-input,
	.compact-cascader,
	.shipping-select {
		width: 100%;
	}
}
</style>
