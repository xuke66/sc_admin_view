<template>
	<div v-loading="loading" class="decorate-page page-index">
		<div class="decorate-header">
			<div class="header-left">
				<el-segmented v-model="state.pageType" :options="headerPageTypes" @change="handlePageTypeChange" />
			</div>
			<div class="header-right">
				<el-button :icon="View" @click="previewVisible = true">预览</el-button>
				<Auth value="decoratePage/edit">
					<el-button type="primary" :loading="saving" :icon="Check" @click="savePage">保存</el-button>
				</Auth>
			</div>
		</div>

		<div class="designer page-main">
			<aside class="panel component-panel left">
				<div class="panel-title">组件库</div>
				<el-scrollbar>
					<template v-if="state.pageType === 'basic'">
						<div class="group">
							<div class="group-title">应用设置</div>
							<button
								v-for="item in basicItems"
								:key="item.type"
								class="library-item"
								:class="{ active: current.type === item.type }"
								type="button"
								@click="selectBasic(item.type)"
							>
								<img :src="assetUrl(`/assets/addons/shopro/img/decorate/${item.type}.png`)" alt="" />
								<span>{{ item.name }}</span>
							</button>
						</div>
						<div class="group">
							<div class="group-title">主题色</div>
							<button
								v-for="theme in themeItems"
								:key="theme.type"
								class="theme-item"
								:class="{ active: template.basic.theme === theme.type }"
								type="button"
								@click="template.basic.theme = theme.type"
							>
								<span class="theme-dot" :style="{ background: themeColor[theme.type].color1 }"></span>
								{{ theme.name }}
							</button>
						</div>
					</template>

					<template v-else>
						<div v-for="group in visibleComponentGroups" :key="group.name" class="group">
							<div class="group-title">{{ group.name }}</div>
							<div class="library-grid">
								<button v-for="item in group.data" :key="item.type" class="library-card" type="button" @click="addComponent(item.type)">
									<img :src="assetUrl(`/assets/addons/shopro/img/decorate/${item.type}.png`)" alt="" />
									<span>{{ item.name }}</span>
								</button>
							</div>
						</div>
					</template>
				</el-scrollbar>
			</aside>

			<main class="preview-panel center" @click.self="selectPage">
				<div id="html2canvasWrap" class="phone-shell center-main" :class="`${state.pageType} is-${state.systemType}`">
					<div class="phone-status">
						<img :src="assetUrl(`/assets/addons/shopro/img/decorate/header-${state.systemType}.png`)" alt="" />
					</div>
					<div v-if="state.pageType !== 'basic'" class="phone-screen" :style="pageBackgroundStyle">
						<div class="phone-navbar" :style="navbarStyle">
							<div v-if="state.pageType === 'diypage'" class="back-dot"></div>
							{{ pageTitle }}
						</div>

						<div class="component-wrap comp-wrap">
							<div
								v-for="(item, index) in activePageData.data"
								:key="item.__id || index"
								class="preview-component comp-item"
								:class="[item.type, { 'is-active': current.index === index }]"
								:style="componentStyle(item)"
								@click="selectComponent(index)"
							>
								<div class="comp-label">{{ compLabel(item.type) }}</div>
								<div class="comp-tools">
									<el-tooltip content="上移"><el-button :icon="ArrowUp" circle size="small" :disabled="index === 0" @click.stop="moveComponent(index, -1)" /></el-tooltip>
									<el-tooltip content="下移"><el-button :icon="ArrowDown" circle size="small" :disabled="index === activePageData.data.length - 1" @click.stop="moveComponent(index, 1)" /></el-tooltip>
									<el-tooltip content="复制"><el-button :icon="CopyDocument" circle size="small" @click.stop="copyComponent(index)" /></el-tooltip>
									<el-tooltip content="删除"><el-button :icon="Delete" circle size="small" type="danger" @click.stop="deleteComponent(index)" /></el-tooltip>
								</div>
								<div class="comp-content">
									<component-preview :item="item" :theme="activeTheme" />
								</div>
							</div>
							<el-empty v-if="!activePageData.data.length" description="从左侧添加组件" />
						</div>
					</div>

					<div v-else class="phone-screen basic-screen">
						<div class="basic-preview-title">基础配置预览</div>
						<component-preview :item="{ type: 'tabbar', data: template.basic.tabbar, style: baseCardStyle }" :theme="activeTheme" />
						<component-preview :item="{ type: 'floatMenu', data: template.basic.floatMenu, style: baseCardStyle }" :theme="activeTheme" />
						<component-preview :item="{ type: 'popupImage', data: template.basic.popupImage, style: baseCardStyle }" :theme="activeTheme" />
					</div>
				</div>
			</main>

			<aside class="panel inspector-panel right">
				<div class="right-title">
					<span>{{ inspectorTitle }}</span>
				</div>
				<div class="right-tab">
					<div v-if="rightTabs.data" class="tab-item" :class="{ active: rightTab === 'data' }" @click="rightTab = 'data'">内容</div>
					<div v-if="rightTabs.style" class="tab-item" :class="{ active: rightTab === 'style' }" @click="rightTab = 'style'">样式</div>
					<div class="tab-item" :class="{ active: rightTab === 'css' }" @click="rightTab = 'css'">数据</div>
				</div>
				<el-scrollbar>
					<div class="inspector-body">
						<template v-if="rightTab === 'data'">
							<settings-card
								v-if="current.type === 'page'"
								title="页面设置"
								:model-value="activePageData.style"
								component-type="page"
								section="data"
							/>
							<settings-card
								v-else-if="current.type && state.pageType === 'basic'"
								:title="compLabel(current.type)"
								:model-value="template.basic[current.type]"
								:component-type="current.type"
								section="data"
							/>
							<settings-card
								v-else-if="current.item?.data"
								:title="`${compLabel(current.item.type)}设置`"
								:model-value="current.item.data"
								:component-type="current.item.type"
								section="data"
							/>
							<el-empty v-else description="暂无数据设置" />
						</template>
						<template v-else-if="rightTab === 'style'">
							<settings-card
								v-if="current.type === 'page'"
								title="页面样式"
								:model-value="activePageData.style"
								component-type="page"
								section="style"
							/>
							<settings-card
								v-else-if="current.item?.style"
								title="组件样式"
								:model-value="current.item.style"
								:component-type="current.item.type"
								section="style"
							/>
							<el-empty v-else description="暂无样式设置" />
						</template>
						<template v-else-if="rightTab === 'css'">
							<pre class="css-card">{{ JSON.stringify(currentCssData, null, 2) }}</pre>
						</template>
						<el-empty v-else description="请选择左侧配置或中间组件" />
					</div>
				</el-scrollbar>
			</aside>
		</div>

		<el-dialog v-model="previewVisible" title="当前装修数据" width="880px">
			<el-input :model-value="JSON.stringify(template[state.pageType], null, 2)" type="textarea" :rows="24" readonly />
			<template #footer>
				<el-button @click="copyCurrentJson">复制</el-button>
				<el-button type="primary" @click="previewVisible = false">关闭</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="ShopDecoratePage">
import { computed, defineComponent, h, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
	ElButton,
	ElButtonGroup,
	ElCard,
	ElCheckbox,
	ElColorPicker,
	ElDivider,
	ElDialog,
	ElEmpty,
	ElFormItem,
	ElIcon,
	ElImage,
	ElInput,
	ElInputNumber,
	ElMessage,
	ElMessageBox,
	ElOption,
	ElRadio,
	ElRadioButton,
	ElRadioGroup,
	ElSelect,
	ElSlider,
	ElSwitch,
	ElTable,
	ElTableColumn,
	ElUpload,
} from "element-plus";
import {
	ArrowDown,
	ArrowUp,
	Bell,
	Check,
	CircleCloseFilled,
	CirclePlus,
	CopyDocument,
	Delete,
	Document,
	Grid,
	House,
	Menu,
	Picture,
	Plus,
	Refresh,
	Search,
	Setting,
	ShoppingBag,
	Tickets,
	User,
	View,
	Wallet,
} from "@element-plus/icons-vue";
import { DecorateService } from "@/common/api/decorate";
import { ShopService } from "@/common/api/shop";
import { useUserStore } from "@/pinia";

type PageType = "basic" | "home" | "user" | "diypage";
type AnyObj = Record<string, any>;

const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);
const saving = ref(false);
const previewVisible = ref(false);
const lastSaved = ref("");
const rightTab = ref<"data" | "style" | "css">("data");

const state = reactive({
	id: Number(route.query.id || 5),
	pageType: "basic" as PageType,
	systemType: "android",
	platformType: "WechatMiniProgram",
});

const themeColor: AnyObj = {
	orange: { color1: "#FF6000", color2: "#FE832A" },
	golden: { color1: "#E9B461", color2: "#EECC89" },
	yellow: { color1: "#FFC300", color2: "#FDDF47" },
	black: { color1: "#484848", color2: "#6D6D6D" },
	green: { color1: "#2AAE67", color2: "#3ACD72" },
	purple: { color1: "#652ABF", color2: "#A36FFF" },
};

const themeItems = [
	{ name: "淘宝橙", type: "orange" },
	{ name: "香槟金", type: "golden" },
	{ name: "美团黄", type: "yellow" },
	{ name: "低奢黑", type: "black" },
	{ name: "微信绿", type: "green" },
	{ name: "尊贵紫", type: "purple" },
];

const platformOptions = [
	{ label: "小程序", value: "WechatMiniProgram" },
	{ label: "公众号", value: "WechatOfficialAccount" },
	{ label: "H5", value: "H5" },
	{ label: "App", value: "App" },
];

const systemOptions = [
	{ label: "Android", value: "android" },
	{ label: "IOS", value: "ios" },
];

const pageTypeOptions = [
	{ label: "基础配置", value: "basic" },
	{ label: "首页", value: "home" },
	{ label: "个人页", value: "user" },
	{ label: "自定义页", value: "diypage" },
];

const headerPageTypes = [
	{ label: "基础配置", value: "basic" },
	{ label: "首页", value: "home" },
	{ label: "个人中心页", value: "user" },
];

const basicItems = [
	{ name: "底部导航", type: "tabbar", icon: Menu },
	{ name: "悬浮按钮", type: "floatMenu", icon: CirclePlus },
	{ name: "弹窗广告", type: "popupImage", icon: Picture },
];

const componentGroups = [
	{
		name: "会员组件",
		show: ["user", "diypage"],
		data: [
			{ name: "会员卡片", type: "userCard", icon: User },
			{ name: "订单卡片", type: "orderCard", icon: Document },
			{ name: "资产卡片", type: "walletCard", icon: Wallet },
			{ name: "卡券卡片", type: "couponCard", icon: Tickets },
		],
	},
	{
		name: "基础组件",
		data: [
			{ name: "搜索框", type: "searchBlock", icon: Search },
			{ name: "公告栏", type: "noticeBlock", icon: Bell },
			{ name: "菜单导航", type: "menuButton", icon: Menu },
			{ name: "列表导航", type: "menuList", icon: Menu },
			{ name: "宫格导航", type: "menuGrid", icon: Grid },
		],
	},
	{
		name: "商品组件",
		data: [
			{ name: "商品卡片", type: "goodsCard", icon: ShoppingBag },
			{ name: "商品栏", type: "goodsShelves", icon: ShoppingBag },
		],
	},
	{
		name: "图文组件",
		data: [
			{ name: "图片展示", type: "imageBlock", icon: Picture },
			{ name: "图片轮播", type: "imageBanner", icon: Picture },
			{ name: "标题栏", type: "titleBlock", icon: Tickets },
			{ name: "广告魔方", type: "imageCube", icon: Grid },
			{ name: "视频播放", type: "videoPlayer", icon: Picture },
			{ name: "辅助线", type: "lineBlock", icon: Tickets },
			{ name: "富文本", type: "richtext", icon: Document },
			{ name: "热区", type: "hotzone", icon: Picture },
		],
	},
	{
		name: "营销组件",
		disabled: true,
		data: [
			{ name: "拼团", type: "groupon", icon: ShoppingBag },
			{ name: "秒杀", type: "seckill", icon: ShoppingBag },
			{ name: "积分商城", type: "scoreGoods", icon: ShoppingBag },
			{ name: "小程序直播", type: "mplive", icon: Picture },
			{ name: "优惠券", type: "coupon", icon: Tickets },
		],
	},
];

const labels: AnyObj = {
	tabbar: "底部导航",
	floatMenu: "悬浮按钮",
	popupImage: "弹窗广告",
	page: "页面设置",
	userCard: "会员卡片",
	orderCard: "订单卡片",
	walletCard: "资产卡片",
	couponCard: "卡券卡片",
	searchBlock: "搜索框",
	noticeBlock: "公告栏",
	menuButton: "菜单导航",
	menuList: "列表导航",
	menuGrid: "宫格导航",
	goodsCard: "商品卡片",
	goodsShelves: "商品栏",
	imageBlock: "图片展示",
	imageBanner: "图片轮播",
	titleBlock: "标题栏",
	imageCube: "广告魔方",
	videoPlayer: "视频播放",
	lineBlock: "辅助线",
	richtext: "富文本",
	hotzone: "热区",
	groupon: "拼团",
	seckill: "秒杀",
	scoreGoods: "积分商城",
	mplive: "小程序直播",
	coupon: "优惠券",
};

const fieldLabels: AnyObj = {
	mode: "样式",
	layout: "布局",
	inactiveColor: "未选颜色",
	activeColor: "选中颜色",
	list: "列表",
	background: "背景",
	type: "类型",
	bgImage: "背景图",
	bgColor: "背景色",
	show: "显示",
	isText: "显示文字",
	src: "图片",
	url: "跳转链接",
	title: "标题",
	subtitle: "副标题",
	text: "文字",
	color: "颜色",
	textFontSize: "字号",
	placeholder: "占位文字",
	borderRadius: "圆角",
	keywords: "关键词",
	col: "列数",
	row: "行数",
	tip: "提示",
	badge: "角标",
	goodsFields: "商品字段",
	buyNowStyle: "购买按钮",
	tagStyle: "标签",
	goodsIds: "商品 ID",
	goodsList: "商品列表",
	couponIds: "优惠券 ID",
	couponList: "优惠券列表",
	activityId: "活动 ID",
	activityList: "活动列表",
	mpliveIds: "直播间 ID",
	mpliveList: "直播间列表",
	borderRadiusTop: "上圆角",
	borderRadiusBottom: "下圆角",
	space: "间距",
	marginLeft: "左间距",
	marginRight: "右间距",
	marginTop: "上间距",
	marginBottom: "下间距",
	padding: "内边距",
	height: "高度",
	navbar: "导航栏",
	alwaysShow: "始终显示",
	fill: "填充",
	button: "按钮",
	image: "截图",
	videoUrl: "视频",
	poster: "封面",
	indicator: "指示器",
	autoplay: "自动播放",
	interval: "间隔",
	lineColor: "线条颜色",
	location: "位置",
	skew: "倾斜",
	more: "更多",
	width: "宽度",
	left: "左侧",
	top: "顶部",
	minRow: "起始行",
	maxRow: "结束行",
	minCol: "起始列",
	maxCol: "结束列",
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const id = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const activeTheme = computed(() => themeColor[template.basic.theme || "orange"]);

const baseStyle = () => ({
	background: { type: "color", bgImage: "", bgColor: "#FFFFFF" },
	marginLeft: 0,
	marginRight: 0,
	marginTop: 0,
	marginBottom: 10,
	borderRadiusTop: 0,
	borderRadiusBottom: 0,
	padding: 0,
});

const baseCardStyle = baseStyle();

const defaultTemplate = (): AnyObj => ({
	basic: {
		tabbar: { mode: 1, layout: 1, inactiveColor: "#EEEEEE", activeColor: "#000000", list: [], background: { type: "color", bgImage: "", bgColor: "#FFFFFF" } },
		floatMenu: { show: 0, mode: 1, isText: 0, list: [{ src: "", url: "", title: { text: "", color: "" } }] },
		popupImage: { list: [] },
		theme: "orange",
	},
	home: pageDefault("#F6F6F6"),
	user: {
		...pageDefault("#F6F6F6"),
		data: [{ type: "userCard", __id: id(), style: baseStyle() }],
	},
	diypage: pageDefault(""),
});

function pageDefault(color: string) {
	return {
		data: [],
		style: {
			background: { color, src: "" },
			navbar: { mode: "normal", alwaysShow: 0, type: "color", color: "", src: "", list: { mp: [], app: [] } },
		},
	};
}

const componentDefaults: AnyObj = {
	userCard: () => ({ type: "userCard", style: { ...baseStyle(), padding: 0 } }),
	orderCard: () => ({ type: "orderCard", style: { ...baseStyle(), padding: 0 } }),
	walletCard: () => ({ type: "walletCard", style: { ...baseStyle(), padding: 0 } }),
	couponCard: () => ({ type: "couponCard", style: { ...baseStyle(), padding: 0 } }),
	searchBlock: () => ({ type: "searchBlock", data: { placeholder: "", borderRadius: 0, keywords: [] }, style: baseStyle() }),
	noticeBlock: () => ({ type: "noticeBlock", data: { mode: 1, src: "/assets/addons/shopro/img/decorate/notice/1.png", title: { text: "", color: "#111111" }, url: "" }, style: baseStyle() }),
	menuButton: () => ({ type: "menuButton", data: { layout: 1, col: 3, row: 1, list: [] }, style: baseStyle() }),
	menuList: () => ({ type: "menuList", data: { list: [] }, style: baseStyle() }),
	menuGrid: () => ({ type: "menuGrid", data: { col: 3, list: [arrayItem("menuGrid", "list")] }, style: baseStyle() }),
	goodsCard: () => ({
		type: "goodsCard",
		data: {
			mode: 1,
			goodsFields: goodsFields(["title", "subtitle", "price", "original_price", "sales", "stock"]),
			buyNowStyle: { mode: 1, text: "立即购买", color1: activeTheme.value.color1, color2: activeTheme.value.color2, src: "" },
			tagStyle: { show: 0, src: "" },
			goodsIds: [],
			goodsList: [],
			borderRadiusTop: 0,
			borderRadiusBottom: 0,
			space: 8,
		},
		style: { ...baseStyle(), background: { type: "color", bgImage: "", bgColor: "" }, marginLeft: 8, marginRight: 8 },
	}),
	goodsShelves: () => ({
		type: "goodsShelves",
		data: { mode: 1, goodsFields: goodsFields(["title", "price"]), tagStyle: { show: 0, src: "" }, goodsIds: [], goodsList: [], borderRadiusTop: 0, borderRadiusBottom: 0, space: 0 },
		style: baseStyle(),
	}),
	imageBlock: () => ({ type: "imageBlock", data: { src: "", url: "" }, style: baseStyle() }),
	imageBanner: () => ({ type: "imageBanner", data: { mode: 1, indicator: 1, autoplay: false, interval: 3000, list: [], space: 0 }, style: baseStyle() }),
	titleBlock: () => ({
		type: "titleBlock",
		data: {
			src: "/assets/addons/shopro/img/decorate/title/1.png",
			location: "left",
			skew: 0,
			title: { text: "标题栏", color: "#111111", textFontSize: 14, other: [] },
			subtitle: { text: "副标题", color: "#8c8c8c", textFontSize: 12, other: [] },
			more: { show: 0, url: "" },
		},
		style: { ...baseStyle(), marginBottom: 0, height: 40 },
	}),
	imageCube: () => ({ type: "imageCube", data: { borderRadiusTop: 0, borderRadiusBottom: 0, space: 0, list: [] }, style: baseStyle() }),
	videoPlayer: () => ({ type: "videoPlayer", data: { videoUrl: "", src: "" }, style: { ...baseStyle(), height: 300 } }),
	lineBlock: () => ({ type: "lineBlock", data: { mode: "solid", lineColor: "" }, style: { ...baseStyle(), borderRadiusTop: undefined, borderRadiusBottom: undefined } }),
	richtext: () => ({ type: "richtext", data: { id: "", title: "", richtext: { content: "" } }, style: baseStyle() }),
	hotzone: () => ({ type: "hotzone", data: { src: "", list: [] }, style: { background: { type: "color", bgImage: "", bgColor: "#FFFFFF" } } }),
	groupon: () => marketingDefault("groupon", "立即拼团"),
	seckill: () => marketingDefault("seckill", "去抢购"),
	scoreGoods: () => ({
		type: "scoreGoods",
		data: { goodsIds: [], goodsList: [], mode: 1, goodsFields: goodsFields(["title", "subtitle", "score_price", "price"]), buyNowStyle: { mode: 1, text: "去兑换", color1: activeTheme.value.color1, color2: activeTheme.value.color2, src: "" }, borderRadiusTop: 0, borderRadiusBottom: 0, space: 0 },
		style: baseStyle(),
	}),
	mplive: () => ({
		type: "mplive",
		data: { mode: 1, goodsFields: goodsFields(["name", "anchor_name"], "#FDFDFD"), mpliveIds: [], mpliveList: [], borderRadiusTop: 0, borderRadiusBottom: 0, space: 8 },
		style: { ...baseStyle(), background: { type: "color", bgImage: "", bgColor: "" }, marginLeft: 8, marginRight: 8 },
	}),
	coupon: () => ({ type: "coupon", data: { couponIds: [], couponList: [], mode: 1, fill: { color: "", bgImage: "" }, button: { color: "", bgColor: "" }, space: 0 }, style: baseStyle() }),
};

function marketingDefault(type: string, text: string) {
	return {
		type,
		data: {
			activityId: "",
			activityList: [],
			goodsList: [],
			mode: 1,
			tagStyle: { show: 0, src: "" },
			goodsFields: goodsFields(["title", "subtitle", "price", "original_price", "sales"]),
			buyNowStyle: { mode: 1, text, color1: activeTheme.value.color1, color2: activeTheme.value.color2, src: "" },
			borderRadiusTop: 0,
			borderRadiusBottom: 0,
			space: 0,
		},
		style: baseStyle(),
	};
}

function goodsFields(keys: string[], color = "") {
	return keys.reduce((res: AnyObj, key) => {
		res[key] = { show: key === "stock" ? 0 : 1, color: color || (key.includes("price") ? "#FF3000" : key === "title" ? "#333" : "#999") };
		return res;
	}, {});
}

function arrayItem(componentType: string, key: string) {
	const map: AnyObj = {
		tabbar: { inactiveIcon: "", activeIcon: "", url: "", text: "" },
		floatMenu: { src: "", url: "", title: { text: "", color: "" } },
		popupImage: { src: "", url: "", show: 1 },
		menuButton: { src: "", title: { text: "", color: "#000" }, url: "", badge: { show: 0, text: "", color: "#FFFFFF", bgColor: "#FF6000" } },
		menuList: { src: "", title: { text: "", color: "#333" }, tip: { text: "", color: "#bbb" }, url: "" },
		menuGrid: { src: "", title: { text: "", color: "#333" }, tip: { text: "", color: "#bbb" }, url: "", badge: { show: 0, text: "", color: "#FFFFFF", bgColor: "#FF6000" } },
		imageBanner: { title: "", type: "image", src: "", poster: "", url: "" },
		imageCube: { src: "", url: "", width: 0, height: 0, top: 0, left: 0, minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 },
		hotzone: { name: "热区", url: "", width: 80, height: 40, top: 0, left: 0, show: 0 },
		keywords: { text: "", color: "" },
		other: { text: "", color: "" },
		goodsList: { id: "", title: "商品标题", image: "", price: 0, original_price: 0, subtitle: "", sales: 0, stock: 0 },
		couponList: { id: "", name: "优惠券", amount_text: "", amount: 0 },
		activityList: { id: "", title: "活动" },
		mpliveList: { roomid: "", name: "直播间", anchor_name: "", share_img: "" },
		navbar: { width: 2, left: 0, type: "text", text: "标题", textColor: "#111111", src: "", placeholder: "", borderRadius: 0 },
	};
	if (componentType === "page" && key === "mp") return clone(map.navbar);
	if (componentType === "page" && key === "app") return clone(map.navbar);
	return clone(map[componentType] || map[key] || { text: "" });
}

const template = reactive<AnyObj>(defaultTemplate());
const current = reactive<{ type: string | null; index: number; item: AnyObj | null }>({ type: "page", index: -1, item: null });

const availablePageTypes = computed(() => pageTypeOptions);
const visibleComponentGroups = computed(() => componentGroups.filter(group => !group.disabled && (!group.show || group.show.includes(state.pageType))));
const activePageData = computed<AnyObj>(() => template[state.pageType] || template.home);
const pageTitle = computed(() => (state.pageType === "user" ? "个人中心" : state.pageType === "diypage" ? "自定义页" : "首页"));
const inspectorTitle = computed(() => (current.type ? labels[current.type] || current.type : "属性面板"));
const rightTabs = computed(() => ({
	data: !["userCard", "orderCard", "walletCard", "couponCard"].includes(current.type || ""),
	style: !["floatMenu", "popupImage", "page"].includes(current.type || ""),
}));
const dirty = computed(() => JSON.stringify(template[state.pageType]) !== lastSaved.value);
const currentCssData = computed(() => {
	if (current.type === "page") return activePageData.value.style || {};
	if (state.pageType === "basic" && current.type) return template.basic[current.type] || {};
	return current.item || {};
});

const pageBackgroundStyle = computed(() => {
	const bg = activePageData.value.style?.background || {};
	return {
		backgroundColor: bg.color || "#f6f6f6",
		backgroundImage: bg.src ? `url(${assetUrl(bg.src)})` : "",
	};
});

const navbarStyle = computed(() => {
	const navbar = activePageData.value.style?.navbar || {};
	if (navbar.type === "image" && navbar.src) return { backgroundImage: `url(${assetUrl(navbar.src)})` };
	return { backgroundColor: navbar.color || "#ffffff" };
});

function assetUrl(src?: string) {
	if (!src) return "";
	if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
	return src.startsWith("/") ? src : `/${src}`;
}

function compLabel(type: string) {
	return labels[type] || type;
}

function componentStyle(item: AnyObj) {
	const style = item.style || {};
	const bg = style.background || {};
	return {
		margin: `${style.marginTop || 0}px ${style.marginRight || 0}px ${style.marginBottom || 0}px ${style.marginLeft || 0}px`,
		padding: `${style.padding || 0}px`,
		borderTopLeftRadius: `${style.borderRadiusTop || 0}px`,
		borderTopRightRadius: `${style.borderRadiusTop || 0}px`,
		borderBottomLeftRadius: `${style.borderRadiusBottom || 0}px`,
		borderBottomRightRadius: `${style.borderRadiusBottom || 0}px`,
		backgroundColor: bg.type === "color" ? bg.bgColor : undefined,
		backgroundImage: bg.type === "image" && bg.bgImage ? `url(${assetUrl(bg.bgImage)})` : undefined,
	};
}

function resetRightTab() {
	const tabs = rightTabs.value;
	rightTab.value = tabs.data ? "data" : tabs.style ? "style" : "css";
}

function selectPage() {
	current.type = "page";
	current.index = -1;
	current.item = null;
	resetRightTab();
}

function selectBasic(type: string) {
	current.type = type;
	current.index = -1;
	current.item = null;
	resetRightTab();
}

function toIndex(index: string | number) {
	return Number(index);
}

function selectComponent(index: string | number) {
	index = toIndex(index);
	current.index = index;
	current.item = activePageData.value.data[index];
	current.type = current.item?.type || null;
	resetRightTab();
}

function addComponent(type: string) {
	const item = clone(componentDefaults[type]?.() || { type, data: {}, style: baseStyle() });
	item.__id = id();
	const index = current.index >= 0 ? current.index + 1 : activePageData.value.data.length;
	activePageData.value.data.splice(index, 0, item);
	nextTick(() => selectComponent(index));
}

function moveComponent(index: string | number, direction: -1 | 1) {
	index = toIndex(index);
	const target = index + direction;
	const list = activePageData.value.data;
	if (target < 0 || target >= list.length) return;
	const [item] = list.splice(index, 1);
	list.splice(target, 0, item);
	selectComponent(target);
}

function copyComponent(index: string | number) {
	index = toIndex(index);
	const item = clone(activePageData.value.data[index]);
	item.__id = id();
	activePageData.value.data.splice(index + 1, 0, item);
	selectComponent(index + 1);
}

async function deleteComponent(index: string | number) {
	index = toIndex(index);
	await ElMessageBox.confirm("确定删除当前组件吗？", "提示", { type: "warning", confirmButtonText: "确定", cancelButtonText: "取消" });
	activePageData.value.data.splice(index, 1);
	selectPage();
}

function handlePageTypeChange() {
	selectPage();
	lastSaved.value = JSON.stringify(template[state.pageType]);
}

function normalizePageData(data: AnyObj, pageType: PageType) {
	const fallback = defaultTemplate()[pageType] as AnyObj;
	const page = data && typeof data === "object" ? data : fallback;
	if (["home", "user", "diypage"].includes(pageType)) {
		page.data = Array.isArray(page.data) ? page.data : [];
		page.data.forEach((item: AnyObj) => {
			if (!item.__id) item.__id = id();
			if (!item.style) item.style = baseStyle();
		});
		page.style = { ...fallback.style, ...(page.style || {}) };
		page.style.background = { ...fallback.style.background, ...(page.style.background || {}) };
		page.style.navbar = { ...fallback.style.navbar, ...(page.style.navbar || {}) };
	}
	return page;
}

async function loadAll() {
	loading.value = true;
	try {
		const detail = await DecorateService.getTemplateDetail(state.id);
		if (detail.data?.type === "diypage" || Number(detail.data?.type) === 2) state.pageType = "diypage";
		else state.pageType = "basic";

		await Promise.all((["basic", "home", "user", "diypage"] as PageType[]).map(loadPageType));
		selectPage();
	} catch (error: any) {
		ElMessage.error(error?.message || "装修数据加载失败");
	} finally {
		loading.value = false;
	}
}

async function loadPageType(type: PageType) {
	const res = await DecorateService.getPageDetail({ id: state.id, type });
	const page = res.data?.page;
	template[type] = normalizePageData(typeof page === "string" ? JSON.parse(page || "{}") : page, type);
	if (type === state.pageType) lastSaved.value = JSON.stringify(template[type]);
}

function buildSubmitPage(page: AnyObj) {
	const temp = clone(page);
	if (Array.isArray(temp.data)) {
		temp.data.forEach((item: AnyObj) => {
			delete item.__id;
			if (["goodsCard", "goodsShelves", "scoreGoods"].includes(item.type)) {
				item.data.goodsIds = (item.data.goodsList || []).map((goods: AnyObj) => goods.id).filter(Boolean);
			}
			if (item.type === "coupon") item.data.couponIds = (item.data.couponList || []).map((coupon: AnyObj) => coupon.id).filter(Boolean);
			if (["groupon", "seckill"].includes(item.type)) item.data.activityId = (item.data.activityList || []).map((activity: AnyObj) => activity.id).filter(Boolean).join(",");
			if (item.type === "mplive") item.data.mpliveIds = (item.data.mpliveList || []).map((live: AnyObj) => live.roomid).filter(Boolean);
		});
	}
	return temp;
}

async function savePage() {
	saving.value = true;
	try {
		const page = buildSubmitPage(template[state.pageType]);
		await DecorateService.savePage({
			id: state.id,
			type: state.pageType,
			page: JSON.stringify(page),
			image: "",
		});
		lastSaved.value = JSON.stringify(template[state.pageType]);
		ElMessage.success("保存成功");
	} catch (error: any) {
		ElMessage.error(error?.message || "保存失败");
	} finally {
		saving.value = false;
	}
}

async function copyCurrentJson() {
	await navigator.clipboard.writeText(JSON.stringify(template[state.pageType], null, 2));
	ElMessage.success("已复制");
}

const uploadHeaders = computed(() => ({ token: userStore.getToken() }));

const ImageField = defineComponent({
	name: "ImageField",
	props: { modelValue: { type: String, default: "" } },
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		const onSuccess = (res: any) => {
			const url = res?.data?.url;
			if (!url) return ElMessage.error("上传失败，未获取到地址");
			emit("update:modelValue", url);
		};
		return () =>
			h("div", { class: "image-field" }, [
				props.modelValue ? h("img", { class: "image-preview", src: assetUrl(props.modelValue) }) : h("div", { class: "image-preview empty" }, "+"),
				h(ElInput, { modelValue: props.modelValue, "onUpdate:modelValue": (value: string) => emit("update:modelValue", value), placeholder: "图片/视频地址", clearable: true }),
				h(ElUpload, { action: "/admin/index/upload", headers: uploadHeaders.value, showFileList: false, onSuccess }, () => h(ElButton, null, () => "上传")),
			]);
	},
});

const GoodsSelectField = defineComponent({
	name: "GoodsSelectField",
	props: { modelValue: { type: Array, default: () => [] } },
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		const visible = ref(false);
		const loading = ref(false);
		const keyword = ref("");
		const rows = ref<AnyObj[]>([]);
		const selectedMap = ref<Record<string, AnyObj>>({});
		const selectedList = computed(() => Object.values(selectedMap.value));
		const normalizeGoods = (item: AnyObj) => ({
			...item,
			id: item.id,
			title: item.title || item.name || `商品 #${item.id}`,
			name: item.name || item.title || `商品 #${item.id}`,
			image: item.image || item.cover || item.thumb || "",
			price: item.price ?? item.min_price ?? item.market_price ?? 0,
			original_price: item.original_price ?? item.max_price ?? item.price ?? 0,
			stock: item.stock ?? item.total_stock ?? 0,
			sales: item.sales ?? item.sales_count ?? 0,
		});
		const syncSelected = () => {
			selectedMap.value = (Array.isArray(props.modelValue) ? props.modelValue : []).reduce((map: Record<string, AnyObj>, item: AnyObj) => {
				if (item?.id !== undefined && item?.id !== null) map[String(item.id)] = normalizeGoods(item);
				return map;
			}, {});
		};
		const loadGoods = async () => {
			loading.value = true;
			try {
				const res = await ShopService.getGoodsList({ keywords: keyword.value.trim(), status: 1 });
				rows.value = (Array.isArray(res.data) ? res.data : res.data?.list || []).map(normalizeGoods);
			} finally {
				loading.value = false;
			}
		};
		const open = async () => {
			syncSelected();
			visible.value = true;
			await loadGoods();
		};
		const toggle = (row: AnyObj) => {
			const key = String(row.id);
			const next = { ...selectedMap.value };
			if (next[key]) delete next[key];
			else next[key] = normalizeGoods(row);
			selectedMap.value = next;
		};
		const remove = (id: string | number) => {
			const next = { ...selectedMap.value };
			delete next[String(id)];
			selectedMap.value = next;
			emit("update:modelValue", Object.values(next));
		};
		const confirm = () => {
			emit("update:modelValue", selectedList.value);
			visible.value = false;
		};
		watch(() => props.modelValue, syncSelected, { immediate: true, deep: true });
		return () => h("div", { class: "goods-select-field" }, [
			h("div", { class: "selected-goods" }, selectedList.value.length
				? selectedList.value.map(item => h("div", { class: "selected-goods-item", key: item.id }, [
					item.image ? h("img", { src: assetUrl(item.image) }) : h("div", { class: "selected-goods-empty" }, "图"),
					h("span", null, item.title || item.name),
					h(ElButton, { link: true, type: "danger", onClick: () => remove(item.id) }, () => "删除"),
				]))
				: h("div", { class: "selected-empty" }, "暂未选择商品")),
			h(ElButton, { type: "primary", plain: true, onClick: open }, () => "选择商品"),
			h(ElDialog, { modelValue: visible.value, "onUpdate:modelValue": (value: boolean) => (visible.value = value), title: "选择商品", width: "860px", destroyOnClose: true }, {
				default: () => [
					h("div", { class: "goods-select-toolbar" }, [
						h(ElInput, { modelValue: keyword.value, "onUpdate:modelValue": (value: string) => (keyword.value = value), placeholder: "搜索商品标题", clearable: true, onKeyup: (event: KeyboardEvent) => event.key === "Enter" && loadGoods() }),
						h(ElButton, { type: "primary", onClick: loadGoods }, () => "搜索"),
					]),
					h(ElTable, { data: rows.value, loading: loading.value, border: true, height: 420, rowKey: "id" }, () => [
						h(ElTableColumn, { label: "选择", width: 76, align: "center" }, { default: ({ row }: any) => h(ElButton, { size: "small", type: selectedMap.value[String(row.id)] ? "primary" : "default", onClick: () => toggle(row) }, () => selectedMap.value[String(row.id)] ? "已选" : "选择") }),
						h(ElTableColumn, { label: "主图", width: 80, align: "center" }, { default: ({ row }: any) => row.image ? h("img", { class: "goods-select-thumb", src: assetUrl(row.image) }) : "-" }),
						h(ElTableColumn, { prop: "title", label: "商品标题", minWidth: 240, showOverflowTooltip: true }),
						h(ElTableColumn, { label: "价格", width: 120, align: "center" }, { default: ({ row }: any) => `￥${Number(row.price || 0).toFixed(2)}` }),
						h(ElTableColumn, { label: "库存", width: 90, align: "center" }, { default: ({ row }: any) => row.stock ?? 0 }),
					]),
				],
				footer: () => [h(ElButton, { onClick: () => (visible.value = false) }, () => "取消"), h(ElButton, { type: "primary", onClick: confirm }, () => "确定")],
			}),
		]);
	},
});

const CubeField = defineComponent({
	name: "CubeField",
	props: {
		modelValue: { type: Array, default: () => [] },
		scale: { type: Number, default: 66 },
	},
	emits: ["update:modelValue"],
	setup(props, { emit }) {
		const state = reactive({
			start: { row: 0, col: 0 },
			isFlag: false,
			item: { src: "", url: "", width: 0, height: 0, top: 0, left: 0, minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 } as AnyObj,
			active: 0,
		});
		const list = () => (Array.isArray(props.modelValue) ? (props.modelValue as AnyObj[]) : []);
		const emitList = (next = list()) => emit("update:modelValue", next.map(item => {
			const cloned = { ...item };
			delete cloned.minRow;
			delete cloned.maxRow;
			delete cloned.minCol;
			delete cloned.maxCol;
			return cloned;
		}));
		const selected = () => list()[state.active];
		const clear = () => {
			state.item = { src: "", url: "", width: 0, height: 0, top: 0, left: 0, minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };
		};
		const isOverlap = (one: AnyObj, two: AnyObj) => {
			const l1 = { x: Number(one.left || 0), y: Number(one.top || 0) };
			const r1 = { x: l1.x + Number(one.width || 0), y: l1.y + Number(one.height || 0) };
			const l2 = { x: Number(two.left || 0), y: Number(two.top || 0) };
			const r2 = { x: l2.x + Number(two.width || 0), y: l2.y + Number(two.height || 0) };
			return !(l1.x >= r2.x || l2.x >= r1.x || l1.y >= r2.y || l2.y >= r1.y);
		};
		const hover = (row: number, col: number) => {
			if (!state.isFlag) return;
			const minRow = Math.min(state.start.row, row);
			const maxRow = Math.max(state.start.row, row);
			const minCol = Math.min(state.start.col, col);
			const maxCol = Math.max(state.start.col, col);
			const next = {
				src: "",
				url: "",
				width: maxCol - minCol + 1,
				height: maxRow - minRow + 1,
				top: minRow - 1,
				left: minCol - 1,
				minRow,
				maxRow,
				minCol,
				maxCol,
			};
			if (!list().some(item => isOverlap(item, next))) state.item = next;
		};
		const selectCell = (row: number, col: number) => {
			if (!state.isFlag) {
				state.start.row = row;
				state.start.col = col;
			} else if (state.item.width && state.item.height) {
				const next = [...list(), { ...state.item }];
				state.active = next.length - 1;
				emitList(next);
				clear();
			}
			state.isFlag = !state.isFlag;
			hover(row, col);
		};
		const deleteItem = (index: number) => {
			const next = [...list()];
			next.splice(index, 1);
			state.active = Math.max(0, next.length - 1);
			emitList(next);
		};
		const updateSelected = (key: string, value: any) => {
			const next = [...list()];
			if (!next[state.active]) return;
			next[state.active] = { ...next[state.active], [key]: value };
			emitList(next);
		};
		return () => {
			const cells = [1, 2, 3, 4];
			const activeItem = selected();
			return h("div", null, [
				h("div", { class: "d-cube" }, [
					h("table", null, () => h("tbody", null, cells.map(rowIndex =>
						h("tr", { key: rowIndex }, cells.map(colIndex =>
							h("td", {
								key: colIndex,
								class: ["image-cube-item", state.item.minRow <= rowIndex && rowIndex <= state.item.maxRow && state.item.minCol <= colIndex && colIndex <= state.item.maxCol ? "is-active" : ""],
								style: { width: `${props.scale}px`, height: `${props.scale}px` },
								onClick: (event: MouseEvent) => {
									event.stopPropagation();
									selectCell(rowIndex, colIndex);
								},
								onMouseover: () => hover(rowIndex, colIndex),
							}, [h(ElIcon, null, () => h(Plus))])
						))
					))),
					...list().map((item, index) =>
						h("div", {
							key: index,
							class: ["position-item", "sa-flex", "sa-row-center", state.active === index ? "is-active" : ""],
							style: {
								width: `${Number(item.width || 0) * props.scale}px`,
								height: `${Number(item.height || 0) * props.scale}px`,
								top: `${Number(item.top || 0) * props.scale}px`,
								left: `${Number(item.left || 0) * props.scale}px`,
							},
							onMouseover: () => {
								state.isFlag = false;
								clear();
							},
							onClick: (event: MouseEvent) => {
								event.stopPropagation();
								state.active = index;
							},
						}, [
							`${item.width}*${item.height}`,
							h(ElIcon, { class: "circle-close-filled", onClick: (event: MouseEvent) => { event.stopPropagation(); deleteItem(index); } }, () => h(CircleCloseFilled)),
						])
					),
				]),
				activeItem ? h("div", { class: "cube-current" }, [
					h(ElFormItem, { label: "上传图片" }, () => h(ImageField, { modelValue: activeItem.src, "onUpdate:modelValue": (value: string) => updateSelected("src", value) })),
					h(ElFormItem, { label: "链接" }, () => h(ElInput, { modelValue: activeItem.url, "onUpdate:modelValue": (value: string) => updateSelected("url", value), clearable: true })),
				]) : null,
			]);
		};
	},
});

const SettingsCard = defineComponent({
	name: "SettingsCard",
	props: {
		title: { type: String, default: "设置" },
		modelValue: { type: Object, default: () => ({}) },
		componentType: { type: String, default: "" },
		section: { type: String, default: "data" },
	},
	setup(props) {
		const model = () => (props.modelValue && typeof props.modelValue === "object" ? props.modelValue : {}) as AnyObj;
		const get = (path: string, fallback: any = "") => path.split(".").reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), model()) ?? fallback;
		const set = (path: string, value: any) => {
			const keys = path.split(".");
			let target = model();
			keys.slice(0, -1).forEach(key => {
				if (!target[key] || typeof target[key] !== "object") target[key] = {};
				target = target[key];
			});
			target[keys[keys.length - 1]] = value;
		};
		const row = (label: string, path: string, control: any) => h(ElFormItem, { label }, () => control(path));
		const input = (path: string, placeholder = "") => h(ElInput, { modelValue: get(path), "onUpdate:modelValue": (value: string) => set(path, value), placeholder, clearable: true });
		const number = (path: string) => h(ElInputNumber, { modelValue: Number(get(path, 0)), "onUpdate:modelValue": (value: number | undefined) => set(path, value ?? 0), class: "full-width" });
		const toggle = (path: string) => h(ElSwitch, { modelValue: get(path, 0), "onUpdate:modelValue": (value: any) => set(path, value), activeValue: 1, inactiveValue: 0 });
		const radios = (path: string, options: Array<{ label: string; value: any }>) =>
			h(ElRadioGroup, { modelValue: get(path), "onUpdate:modelValue": (value: any) => set(path, value) }, () =>
				options.map(option => h(ElRadio, { label: option.value }, () => option.label))
			);
		const radioButtons = (path: string, options: Array<{ label: string; value: any; icon?: string }>) =>
			h(ElRadioGroup, { class: "custom-radio-button", modelValue: get(path), "onUpdate:modelValue": (value: any) => set(path, value) }, () =>
				options.map(option => h(ElRadioButton, { label: option.value }, () => option.icon ? h("i", { class: ["iconfont", option.icon] }) : option.label))
			);
		const color = (path: string) =>
			h("div", { class: "d-color-picker-like" }, [
				h(ElColorPicker, { modelValue: get(path), "onUpdate:modelValue": (value: any) => set(path, value || ""), showAlpha: true }),
				h(ElInput, { modelValue: get(path), "onUpdate:modelValue": (value: string) => set(path, value), placeholder: "#FFFFFF" }),
			]);
		const slider = (path: string) =>
			h("div", { class: "d-slider-like" }, [
				h(ElSlider, { modelValue: Number(get(path, 0)), "onUpdate:modelValue": (value: any) => set(path, Number(value || 0)), showTooltip: false }),
				h(ElInput, { modelValue: get(path, 0), "onUpdate:modelValue": (value: string) => set(path, Number(value || 0)), type: "number" }, { suffix: () => h("span", null, "PX") }),
			]);
		const image = (path: string) => h(ImageField, { modelValue: get(path), "onUpdate:modelValue": (value: string) => set(path, value) });
		const goodsSelect = (path = "goodsList") => h(GoodsSelectField, {
			modelValue: get(path, []),
			"onUpdate:modelValue": (value: AnyObj[]) => {
				set(path, value);
				set("goodsIds", value.map(item => item.id).filter(Boolean));
			},
		});
		const textColor = (path: string, placeholder = "") =>
			h("div", { class: "d-text-color-like" }, [
				h(ElInput, { modelValue: get(`${path}.text`), "onUpdate:modelValue": (value: string) => set(`${path}.text`, value), placeholder, clearable: true }),
				color(`${path}.color`),
			]);
		const card = (title: string, children: any[]) => h("div", { class: "setting-card card" }, [h("div", { class: "setting-title title" }, title), h("div", { class: "setting-wrap wrap" }, children)]);
		const listCard = (title: string, path: string, factoryType: string, fields: (prefix: string) => any[]) => {
			const list = get(path, []);
			const data = Array.isArray(list) ? list : [];
			if (!Array.isArray(list)) set(path, data);
			return h("div", { class: "setting-card card d-list-like" }, [
				h("div", { class: "setting-title title list-title" }, [
					h("span", null, title),
					h(ElButton, { size: "small", icon: Plus, onClick: () => data.push(arrayItem(factoryType, path.split(".").pop() || "list")) }, () => "添加"),
				]),
				h("div", { class: "setting-wrap wrap" }, data.map((_, index) =>
					h("div", { class: "list-item" }, [
						h("div", { class: "list-item-title" }, [
							h("span", null, `${title}${index + 1}`),
							h(ElButton, { link: true, type: "danger", onClick: () => data.splice(index, 1) }, () => "删除"),
						]),
						...fields(`${path}.${index}`),
					])
				)),
			]);
		};
		const goodsFieldRows = (path = "goodsFields") =>
			Object.entries(get(path, {})).map(([key, value]) =>
				h(ElFormItem, { label: fieldLabels[key] || key }, () =>
					h("div", { class: "goods-field-row" }, [
						h(ElSwitch, { modelValue: (value as AnyObj).show, "onUpdate:modelValue": (next: any) => set(`${path}.${key}.show`, next), activeValue: 1, inactiveValue: 0 }),
						color(`${path}.${key}.color`),
					])
				)
			);
		const styleCards = () => {
			const cards = [];
			if ("background" in model()) {
				cards.push(card("背景设置", [
					row("背景", "background.type", path => radios(path, [{ label: "纯色", value: "color" }, { label: "图片", value: "image" }])),
					get("background.type", "color") === "image" ? row("选择图片", "background.bgImage", image) : row("选择颜色", "background.bgColor", color),
				]));
			}
			cards.push(card("组件样式", [
				..."marginTop,marginRight,marginBottom,marginLeft,borderRadiusTop,borderRadiusBottom,padding,height".split(",")
					.filter(key => model()[key] !== undefined)
					.map(key => row(fieldLabels[key] || key, key, slider)),
			]));
			return cards;
		};
		const dataCards = () => {
			const type = props.componentType;
			if (type === "page") {
				return [
					card("页面背景", [row("背景色", "background.color", color), row("背景图片", "background.src", image)]),
					card("头部设置", [
						row("头部样式", "navbar.mode", path => radios(path, [{ label: "标准", value: "normal" }, { label: "沉浸式", value: "inner" }])),
						get("navbar.mode") === "inner" ? row("常驻显示", "navbar.alwaysShow", path => radios(path, [{ label: "关闭", value: 0 }, { label: "开启", value: 1 }])) : null,
						row("背景", "navbar.type", path => radios(path, [{ label: "纯色", value: "color" }, { label: "图片", value: "image" }])),
						get("navbar.type") === "image" ? row("选择图片", "navbar.src", image) : row("选择颜色", "navbar.color", color),
					].filter(Boolean)),
				];
			}
			if (type === "tabbar") return [
				card("导航样式", [
					row("选择样式", "mode", path => radioButtons(path, [{ label: "样式1", value: 1, icon: "icontabbar-1" }, { label: "样式2", value: 2, icon: "icontabbar-2" }])),
					row("导航风格", "layout", path => radios(path, [{ label: "文字+图片", value: 1 }, { label: "文字", value: 2 }, { label: "图片", value: 3 }])),
					row("默认颜色", "inactiveColor", color),
					row("选中颜色", "activeColor", color),
				]),
				listCard("图标设置", "list", "tabbar", prefix => [
					[1, 3].includes(Number(get("layout", 1))) ? row("默认图片", `${prefix}.inactiveIcon`, image) : null,
					[1, 3].includes(Number(get("layout", 1))) ? row("选中图片", `${prefix}.activeIcon`, image) : null,
					[1, 2].includes(Number(get("layout", 1))) ? row("文字", `${prefix}.text`, input) : null,
					row("选择链接", `${prefix}.url`, input),
				].filter(Boolean)),
			];
			if (type === "floatMenu") return [
				card("展示图标", [
					row("状态", "show", path => radios(path, [{ label: "关闭", value: 0 }, { label: "开启", value: 1 }])),
					row("悬浮样式", "mode", path => radios(path, [{ label: "垂直", value: 1 }, { label: "水平", value: 2 }])),
					row("显示名称", "isText", path => radios(path, [{ label: "不显示", value: 0 }, { label: "显示", value: 1 }])),
				]),
				listCard("功能图标", "list", "floatMenu", prefix => [row("按钮图片", `${prefix}.src`, image), row("按钮名称", `${prefix}.title`, path => textColor(path, "请输入按钮名称")), row("按钮链接", `${prefix}.url`, input)]),
			];
			if (type === "popupImage") return [listCard("展示图标", "list", "popupImage", prefix => [row("广告图", `${prefix}.src`, image), row("选择链接", `${prefix}.url`, input), row("显示次数", `${prefix}.show`, path => radios(path, [{ label: "仅显示一次", value: 1 }, { label: "每次显示", value: 2 }]))])];
			if (type === "searchBlock") return [card("搜索设置", [row("提示内容", "placeholder", input), row("圆角", "borderRadius", slider)]), listCard("搜索关键字", "keywords", "keywords", prefix => [row("关键字", prefix, path => textColor(path, "请输入关键字"))])];
			if (type === "noticeBlock") return [
				card("公告图标", [row("公告样式", "mode", path => radios(path, [{ label: "系统图标", value: 1 }, { label: "自定义", value: 2 }])), row("公告图", "src", image)]),
				card("内容设置", [row("公告内容", "title", path => textColor(path, "请输入公告内容")), row("链接", "url", input)]),
			];
			if (["menuButton", "menuGrid"].includes(type)) return [
				card("样式选择", [
					type === "menuButton" ? row("菜单布局", "layout", path => radios(path, [{ label: "图片+文字", value: 1 }, { label: "图片", value: 2 }])) : null,
					row(type === "menuButton" ? "列数" : "每行数量", "col", path => radios(path, [{ label: "3个", value: 3 }, { label: "4个", value: 4 }, { label: "5个", value: 5 }])),
					type === "menuButton" ? row("行数", "row", path => radios(path, [{ label: "1行", value: 1 }, { label: "2行", value: 2 }])) : null,
				].filter(Boolean)),
				listCard("图标设置", "list", type, prefix => [row("图标", `${prefix}.src`, image), row("标题", `${prefix}.title`, path => textColor(path, "请输入标题")), row("功能提示", `${prefix}.tip`, path => textColor(path, "请输入提示")), row("链接", `${prefix}.url`, input), row("标签", `${prefix}.badge.show`, toggle)]),
			];
			if (type === "menuList") return [listCard("菜单设置", "list", "menuList", prefix => [row("图标", `${prefix}.src`, image), row("标题", `${prefix}.title`, path => textColor(path, "请输入标题")), row("功能提示", `${prefix}.tip`, path => textColor(path, "请输入提示")), row("链接", `${prefix}.url`, input)])];
			if (["goodsCard", "goodsShelves", "groupon", "seckill", "scoreGoods", "mplive"].includes(type)) return [
				card("商品选择", [goodsSelect("goodsList")]),
				card(type === "mplive" ? "直播样式" : "商品样式", [row("选择风格", "mode", path => radioButtons(path, [
					{ label: "样式1", value: 1, icon: type === "goodsShelves" ? "iconmode-4" : "iconmode-1" },
					{ label: "样式2", value: 2, icon: "iconmode-2" },
					{ label: "样式3", value: 3, icon: type === "goodsShelves" ? "iconmode-5" : "iconmode-3" },
				])), ...goodsFieldRows()]),
				card("商品角标", [row("角标选择", "tagStyle.show", path => radios(path, [{ label: "不显示", value: 0 }, { label: "显示", value: 1 }])), get("tagStyle.show") ? row("上传图片", "tagStyle.src", image) : null].filter(Boolean)),
				model().buyNowStyle ? card("按钮设置", [row("按钮文字", "buyNowStyle.text", input), row("按钮色1", "buyNowStyle.color1", color), row("按钮色2", "buyNowStyle.color2", color), row("按钮图片", "buyNowStyle.src", image)]) : null,
				card("样式", [row("上圆角", "borderRadiusTop", slider), row("下圆角", "borderRadiusBottom", slider), row("间距", "space", slider)]),
			].filter(Boolean);
			if (type === "imageBlock") return [card("添加图片", [row("上传图片", "src", image), row("链接", "url", input)])];
			if (type === "imageBanner") return [
				card("样式设置", [row("Dot样式", "indicator", path => radioButtons(path, [{ label: "点", value: 1, icon: "icondot-1" }, { label: "条", value: 2, icon: "icondot-2" }])), row("间距", "space", slider), row("是否轮播", "autoplay", path => h(ElSwitch, { modelValue: get(path), "onUpdate:modelValue": (value: any) => set(path, value) })), get("autoplay") ? row("时间间隔", "interval", input) : null].filter(Boolean)),
				listCard("图片上传", "list", "imageBanner", prefix => [row("标题", `${prefix}.title`, input), row("选择类型", `${prefix}.type`, path => radios(path, [{ label: "图片", value: "image" }, { label: "视频", value: "video" }])), row("上传", `${prefix}.src`, image), get(`${prefix}.type`) === "video" ? row("视频封面", `${prefix}.poster`, image) : null, row("链接", `${prefix}.url`, input)].filter(Boolean)),
			];
			if (type === "titleBlock") return [
				card("选择风格", [row("背景图片", "src", image)]),
				card("显示设置", [row("位置", "location", path => radios(path, [{ label: "居左", value: "left" }, { label: "居中", value: "center" }])), row("偏移", "skew", number)]),
				card("标题设置", [row("文字", "title", path => textColor(path, "请输入文字")), row("字号", "title.textFontSize", slider)]),
				card("副标题设置", [row("文字", "subtitle", path => textColor(path, "请输入文字")), row("字号", "subtitle.textFontSize", slider)]),
				card("更多设置", [row("显示更多", "more.show", path => radios(path, [{ label: "不显示", value: 0 }, { label: "显示", value: 1 }])), get("more.show") ? row("链接", "more.url", input) : null].filter(Boolean)),
			];
			if (type === "imageCube") return [
				card("魔方样式", [
					h("div", { class: "title-tip" }, "每格尺寸：187*187"),
					h(CubeField, { modelValue: get("list", []), "onUpdate:modelValue": (value: AnyObj[]) => set("list", value) }),
					row("上圆角", "borderRadiusTop", slider),
					row("下圆角", "borderRadiusBottom", slider),
					row("间距", "space", slider),
				]),
			];
			if (type === "videoPlayer") return [card("视频设置", [row("视频", "videoUrl", image), row("封面", "src", image)])];
			if (type === "lineBlock") return [card("辅助线", [row("线条样式", "mode", path => radioButtons(path, [{ label: "实线", value: "solid", icon: "iconline-1" }, { label: "点线", value: "dotted", icon: "iconline-2" }, { label: "虚线", value: "dashed", icon: "iconline-3" }])), row("线条颜色", "lineColor", color)])];
			if (type === "richtext") return [card("富文本", [row("标题", "title", input), row("内容", "richtext.content", path => h(ElInput, { modelValue: get(path), "onUpdate:modelValue": (value: string) => set(path, value), type: "textarea", rows: 8 }))])];
			if (type === "hotzone") return [card("热区图片", [row("图片", "src", image)]), listCard("热区设置", "list", "hotzone", prefix => [row("名称", `${prefix}.name`, input), row("链接", `${prefix}.url`, input), row("宽", `${prefix}.width`, number), row("高", `${prefix}.height`, number), row("左", `${prefix}.left`, number), row("上", `${prefix}.top`, number)])];
			if (type === "coupon") return [
				card("优惠券选择", [row("优惠券ID", "couponIds", input)]),
				card("优惠券样式", [row("选择风格", "mode", path => radioButtons(path, [{ label: "样式1", value: 1, icon: "iconmode-7" }, { label: "样式2", value: 2, icon: "iconmode-8" }, { label: "样式3", value: 3, icon: "iconmode-9" }])), row("填充色", "fill.color", color), row("背景图", "fill.bgImage", image), row("按钮文字色", "button.color", color), row("按钮背景", "button.bgColor", color), row("间距", "space", slider)]),
			];
			return [];
		};
		return () => {
			const cards = props.section === "style" ? styleCards() : dataCards();
			return h("div", { class: "settings-panel" }, [
				...cards,
				!cards.length ? h("div", { class: "setting-card card" }, [
					h("div", { class: "setting-title title" }, props.title),
					h("div", { class: "setting-wrap wrap" }, [
					h(ObjectEditor, {
						modelValue: props.modelValue,
						componentType: props.componentType,
					}),
					]),
				]) : null,
			]);
		};
	},
});

let ObjectEditor: any;
ObjectEditor = defineComponent({
	name: "ObjectEditor",
	props: {
		modelValue: { type: Object, default: () => ({}) },
		componentType: { type: String, default: "" },
	},
	setup(props) {
		const renderValue = (obj: AnyObj, key: string, value: any): any => {
			const label = fieldLabels[key] || key;
			if (key === "__id") return null;
			if (Array.isArray(value)) {
				return h("div", { class: "editor-array", key }, [
					h("div", { class: "editor-array-title" }, [
						h("span", null, label),
						h(ElButton, { icon: Plus, size: "small", onClick: () => value.push(arrayItem(props.componentType, key)) }, () => "添加"),
					]),
					value.map((item: any, index: number) =>
						h(ElCard, { class: "array-card", shadow: "never", key: index }, () => [
							h("div", { class: "array-card-title" }, [
								h("span", null, `${label} ${index + 1}`),
								h(ElButton, { link: true, type: "danger", onClick: () => value.splice(index, 1) }, () => "删除"),
							]),
							typeof item === "object"
								? h(ObjectEditor, { modelValue: item, componentType: props.componentType })
								: h(ElInput, { modelValue: item, "onUpdate:modelValue": (next: string) => (value[index] = next) }),
						])
					),
				]);
			}
			if (value && typeof value === "object") {
				return h("div", { class: "editor-object", key }, [
					h("div", { class: "sub-title" }, label),
					h(ObjectEditor, { modelValue: value, componentType: props.componentType }),
				]);
			}
			if (typeof value === "boolean") return h(ElFormItem, { label, key }, () => h(ElSwitch, { modelValue: value, "onUpdate:modelValue": (next: any) => (obj[key] = next) }));
			if (typeof value === "number") return h(ElFormItem, { label, key }, () => h(ElInputNumber, { modelValue: value, "onUpdate:modelValue": (next: number | undefined) => (obj[key] = next ?? 0), class: "full-width" }));
			if (isColorKey(key)) return h(ElFormItem, { label, key }, () => h("div", { class: "d-color-picker-like" }, [
				h(ElColorPicker, { modelValue: value, "onUpdate:modelValue": (next: any) => (obj[key] = next || ""), showAlpha: true }),
				h(ElInput, { modelValue: value, "onUpdate:modelValue": (next: string) => (obj[key] = next), placeholder: "#FFFFFF" }),
			]));
			if (isMediaKey(key)) return h(ElFormItem, { label, key }, () => h(ImageField, { modelValue: value, "onUpdate:modelValue": (next: string) => (obj[key] = next) }));
			if (key === "type" && ["background", "navbar"].includes(props.componentType)) return null;
			return h(ElFormItem, { label, key }, () => {
				if (isSliderKey(key)) return h("div", { class: "d-slider-like" }, [
					h(ElSlider, { modelValue: Number(value || 0), "onUpdate:modelValue": (next: any) => (obj[key] = Number(next || 0)), showTooltip: false }),
					h(ElInput, { modelValue: value, "onUpdate:modelValue": (next: string) => (obj[key] = Number(next || 0)), type: "number" }, { suffix: () => h("span", null, "PX") }),
				]);
				if (key === "mode" || key === "layout") return h(ElInputNumber, { modelValue: Number(value || 0), "onUpdate:modelValue": (next: number | undefined) => (obj[key] = next ?? 0), class: "full-width" });
				return h(ElInput, { modelValue: value, "onUpdate:modelValue": (next: string) => (obj[key] = next), type: String(value || "").length > 80 ? "textarea" : "text", autosize: { minRows: 2, maxRows: 6 } });
			});
		};

		return () => {
			const model = (props.modelValue && typeof props.modelValue === "object" ? props.modelValue : {}) as AnyObj;
			return h("div", { class: "object-editor" }, Object.entries(model).map(([key, value]) => renderValue(model, key, value)));
		};
	},
});

function isColorKey(key: string) {
	return key.toLowerCase().includes("color") || ["lineColor"].includes(key);
}

function isMediaKey(key: string) {
	return ["src", "bgImage", "image", "poster", "videoUrl", "inactiveIcon", "activeIcon"].includes(key);
}

function isSliderKey(key: string) {
	return [
		"borderRadius",
		"borderRadiusTop",
		"borderRadiusBottom",
		"space",
		"marginLeft",
		"marginRight",
		"marginTop",
		"marginBottom",
		"padding",
		"height",
		"width",
		"left",
		"top",
		"textFontSize",
		"interval",
	].includes(key);
}

const ComponentPreview = defineComponent({
	name: "ComponentPreview",
	props: { item: { type: Object, required: true }, theme: { type: Object, required: true } },
	setup(props) {
		const d = () => (props.item as AnyObj).data || {};
		const renderImg = (src: string, cls = "preview-img") => (src ? h("img", { class: cls, src: assetUrl(src) }) : h("div", { class: cls + " empty" }, "图片"));
		const goods = (list: AnyObj[] = []) => (list.length ? list : [arrayItem("goodsList", "goodsList"), arrayItem("goodsList", "goodsList")]);

		return () => {
			const item = props.item as AnyObj;
			switch (item.type) {
				case "tabbar":
					return h("div", { class: "tabbar-preview" }, (d().list || []).map((nav: AnyObj) => h("div", null, [renderImg(nav.activeIcon || nav.inactiveIcon, "tabbar-icon"), h("span", null, nav.text || "导航")])));
				case "floatMenu":
					return h("div", { class: "float-preview" }, d().show ? (d().list || []).map((nav: AnyObj) => h("div", { class: "float-item" }, [renderImg(nav.src, "float-icon"), h("span", null, nav.title?.text)])) : "未启用");
				case "popupImage":
					return h("div", { class: "popup-preview" }, (d().list || []).map((img: AnyObj) => renderImg(img.src)));
				case "userCard":
					return h("div", { class: "member-card" }, [h(House), h("div", null, [h("strong", null, "会员昵称"), h("p", null, "欢迎回来")])]);
				case "orderCard":
					return h("div", { class: "metric-card" }, ["待付款", "待发货", "待收货", "售后"].map(text => h("span", null, text)));
				case "walletCard":
					return h("div", { class: "metric-card" }, ["余额", "积分", "优惠券"].map(text => h("span", null, text)));
				case "couponCard":
					return h("div", { class: "coupon-preview" }, "我的优惠券");
				case "searchBlock":
					return h("div", { class: "search-preview", style: { borderRadius: `${d().borderRadius || 0}px` } }, [h(ElIcon, null, () => h(Search)), h("span", null, d().placeholder || "搜索商品")]);
				case "noticeBlock":
					return h("div", { class: "notice-preview" }, [renderImg(d().src, "notice-icon"), h("span", { style: { color: d().title?.color } }, d().title?.text || "公告内容")]);
				case "menuButton":
				case "menuGrid":
					return h("div", { class: "menu-grid-preview", style: { gridTemplateColumns: `repeat(${d().col || 3}, 1fr)` } }, (d().list || []).map((m: AnyObj) => h("div", { class: "menu-cell" }, [renderImg(m.src, "menu-img"), h("span", { style: { color: m.title?.color } }, m.title?.text || "菜单")])));
				case "menuList":
					return h("div", { class: "menu-list-preview" }, (d().list || []).map((m: AnyObj) => h("div", { class: "menu-row" }, [renderImg(m.src, "menu-row-img"), h("span", null, m.title?.text || "列表导航"), h("small", null, m.tip?.text)])));
				case "goodsCard":
				case "goodsShelves":
				case "groupon":
				case "seckill":
				case "scoreGoods":
					return h("div", { class: ["goods-preview", `mode-${d().mode || 1}`] }, goods(d().goodsList).map((g: AnyObj) => h("div", { class: "goods-card" }, [renderImg(g.image, "goods-img"), h("div", { class: "goods-name" }, g.title || g.name || "商品标题"), h("div", { class: "goods-price", style: { color: d().goodsFields?.price?.color || props.theme.color1 } }, `￥${g.price || 0}`)])));
				case "imageBlock":
					return renderImg(d().src, "image-block");
				case "imageBanner":
					return h("div", { class: "banner-preview" }, (d().list || [arrayItem("imageBanner", "list")]).map((img: AnyObj) => renderImg(img.src, "banner-img")));
				case "titleBlock":
					return h("div", { class: "title-preview", style: { backgroundImage: d().src ? `url(${assetUrl(d().src)})` : "" } }, [h("strong", { style: { color: d().title?.color, fontSize: `${d().title?.textFontSize || 14}px` } }, d().title?.text), h("span", { style: { color: d().subtitle?.color } }, d().subtitle?.text)]);
				case "imageCube":
					const cubeStyle = (props.item as AnyObj).style || {};
					const scale = (375 - Number(cubeStyle.marginLeft || 0) - Number(cubeStyle.marginRight || 0) - Number(cubeStyle.padding || 0) * 2 + Number(d().space || 0)) / 4;
					const maxItem = (d().list || []).length
						? (d().list || []).reduce((prev: AnyObj, next: AnyObj) => (Number(prev.top || 0) > Number(next.top || 0) || (Number(prev.top || 0) === Number(next.top || 0) && Number(prev.height || 0) > Number(next.height || 0)) ? prev : next))
						: { top: 0, height: 1 };
					return h("div", { class: "image-cube" }, [
						h("div", {
							class: "image-cube-wrap",
							style: {
								margin: `-${Number(d().space || 0) / 2}px`,
								height: `${(Number(maxItem.top || 0) + Number(maxItem.height || 1)) * scale}px`,
								position: "relative",
							},
						}, (d().list || []).map((img: AnyObj) =>
							h("div", {
								class: "image-cube-item",
								style: {
									width: `${Number(img.width || 0) * scale}px`,
									height: `${Number(img.height || 0) * scale}px`,
									top: `${Number(img.top || 0) * scale}px`,
									left: `${Number(img.left || 0) * scale}px`,
									padding: `${Number(d().space || 0) / 2}px`,
								},
							}, [renderImg(img.src, "cube-img")])
						)),
					]);
				case "videoPlayer":
					return d().videoUrl ? h("video", { class: "video-preview", src: assetUrl(d().videoUrl), poster: assetUrl(d().src), controls: true }) : renderImg(d().src, "video-preview");
				case "lineBlock":
					return h("div", { class: "line-preview", style: { borderTopStyle: d().mode, borderTopColor: d().lineColor || "#e5e7eb" } });
				case "richtext":
					return h("div", { class: "richtext-preview", innerHTML: d().richtext?.content || d().title || "富文本内容" });
				case "hotzone":
					return h("div", { class: "hotzone-preview" }, [renderImg(d().src, "image-block"), ...(d().list || []).map((zone: AnyObj) => h("div", { class: "hotzone-item", style: { width: `${zone.width}px`, height: `${zone.height}px`, left: `${zone.left}px`, top: `${zone.top}px` } }, zone.name || "热区"))]);
				case "mplive":
					return h("div", { class: "live-preview" }, (d().mpliveList || [arrayItem("mpliveList", "mpliveList")]).map((live: AnyObj) => h("div", { class: "live-card" }, [renderImg(live.share_img, "goods-img"), h("strong", null, live.name || "直播间"), h("span", null, live.anchor_name || "主播")])));
				case "coupon":
					return h("div", { class: "coupon-list-preview" }, (d().couponList || [arrayItem("couponList", "couponList")]).map((coupon: AnyObj) => h("div", { class: "coupon-ticket", style: { backgroundImage: d().fill?.bgImage ? `url(${assetUrl(d().fill.bgImage)})` : "" } }, [h("strong", null, coupon.amount_text || coupon.name || "优惠券"), h("button", { style: { background: d().button?.bgColor || props.theme.color1, color: d().button?.color || "#fff" } }, "领取")])));
				default:
					return h("div", { class: "unknown-preview" }, labels[item.type] || item.type);
			}
		};
	},
});

watch(() => route.query.id, value => {
	const nextId = Number(value || 0);
	if (nextId && nextId !== state.id) {
		state.id = nextId;
		loadAll();
	}
});

onMounted(loadAll);
</script>

<style scoped lang="scss">
.decorate-page {
	--sa-bg-assist-1: #f5f6f8;
	--sa-background-assist: var(--el-bg-color);
	--sa-table-header-bg: var(--el-fill-color-lighter);
	--sa-border: var(--el-border-color-light);
	--sa-space: #eef0f4;
	--sa-title: #222831;
	--sa-font: var(--el-text-color-regular);
	--sa-subtitle: var(--el-text-color-secondary);
	--t-bg-active: var(--el-color-primary-light-9);
	--t-bg-hover: var(--el-fill-color-light);
	display: flex;
	flex-direction: column;
	height: calc(100vh - 96px);
	min-height: 720px;
	gap: 8px;
}

.decorate-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding: 0;
	margin: 0;
	background: transparent;
	border: none;
	border-radius: 0;
	box-shadow: none;
}

.header-left,
.header-right {
	display: flex;
	align-items: center;
	gap: 8px;
}

.panel,
.preview-panel {
	background: var(--el-bg-color);
	border: 1px solid var(--el-border-color-light);
	border-radius: 8px;
}

.designer {
	display: flex;
	gap: 0;
	min-height: 0;
	flex: 1;
	background: var(--sa-bg-assist-1);
}

.panel {
	min-height: 0;
	overflow: hidden;
	border-radius: 0;
}

.inspector-panel :deep(.el-scrollbar) {
	height: calc(100% - 94px);
}

.component-panel :deep(.el-scrollbar) {
	height: calc(100% - 44px);
}

.component-panel.left {
	flex-shrink: 0;
	width: 260px;
	height: 100%;
	background: var(--sa-background-assist);
	box-shadow: 0 0 0.24rem rgb(0 0 0 / 16%);
	border: none;
}

.inspector-panel.right {
	flex-shrink: 0;
	width: 344px;
	height: 100%;
	background: var(--sa-background-assist);
	box-shadow: 0 0 0.24rem rgb(0 0 0 / 16%);
	border: none;
	font-size: 12px;
}

.inspector-panel.right * {
	font-size: inherit;
}

.component-panel .panel-title {
	height: 44px;
	line-height: 44px;
	padding: 0 16px;
	font-weight: 600;
	border-bottom: 1px solid var(--el-border-color-light);
}

.right-title {
	height: 40px;
	line-height: 40px;
	padding: 0 12px;
	font-size: 14px;
	font-weight: 600;
	color: var(--el-text-color-regular);
	background: var(--el-fill-color-lighter);
	border-bottom: 1px solid var(--el-border-color-light);
}

.right-tab {
	display: flex;
	margin: 10px 12px;
	border: 1px solid var(--el-border-color);
	border-radius: 4px;
	overflow: hidden;
}

.tab-item {
	width: 33.333%;
	height: 30px;
	line-height: 30px;
	text-align: center;
	font-size: 12px;
	background: var(--el-fill-color-light);
	border-right: 1px solid var(--el-border-color);
	cursor: pointer;
}

.tab-item:last-child {
	border-right: none;
}

.tab-item.active {
	background: var(--el-bg-color);
	color: var(--el-color-primary);
}

.group {
	padding: 14px;
}

.group-title,
.section-title {
	margin-bottom: 10px;
	color: var(--el-text-color-secondary);
	font-size: 13px;
	font-weight: 600;
}

.library-grid {
	display: grid;
	grid-template-columns: repeat(3, 86px);
	gap: 0;
}

.library-card,
.library-item,
.theme-item {
	border: 1px solid var(--el-border-color);
	border-radius: 8px;
	background: var(--el-fill-color-extra-light);
	cursor: pointer;
	color: var(--el-text-color-regular);
}

.library-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	width: 86px;
	height: 86px;
	border-top: none;
	border-left: none;
	border-radius: 0;
}

.library-card .el-icon {
	font-size: 22px;
}

.library-card img,
.library-item img {
	width: 40px;
	height: 40px;
	margin-bottom: 2px;
	object-fit: contain;
}

.library-item,
.theme-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	float: left;
	width: 86px;
	height: 86px;
	padding: 0;
	margin: 0;
	border-top: none;
	border-left: none;
	border-radius: 0;
}

.theme-dot {
	width: 40px;
	height: 40px;
	border-radius: 50%;
}

.active,
.library-card:hover,
.library-item:hover,
.theme-item:hover {
	color: var(--el-color-primary);
	border-color: var(--el-color-primary);
}

.preview-panel {
	min-width: 0;
	flex: 1;
	padding: 10px 0 0;
	overflow: auto;
	position: relative;
	z-index: 0;
	background: var(--sa-bg-assist-1);
	border: none;
	border-radius: 0;
}

.phone-shell {
	position: relative;
	width: 375px;
	min-height: calc(100% - 26px);
	margin: 0 auto;
	padding: 0;
	background: var(--sa-background-assist);
	border-radius: 0;
	box-shadow: none;
	display: flex;
	flex-direction: column;
	overflow: visible;
}

.phone-shell::before {
	content: "";
	position: absolute;
	top: -8px;
	left: 50%;
	right: 0;
	bottom: -8px;
	z-index: 1;
	margin-left: -195.5px;
	width: 375px;
	height: inherit;
	border: 8px solid var(--sa-title);
	box-sizing: content-box;
	pointer-events: none;
	overflow: hidden;
}

.phone-shell.is-android::before {
	border-radius: 16px;
}

.phone-shell.is-ios::before {
	border-radius: 40px;
}

.phone-status {
	height: 28px;
	overflow: hidden;
	background: #fff;
}

.phone-status img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.phone-screen {
	position: relative;
	min-height: 762px;
	flex: 1;
	overflow: visible;
	background-repeat: no-repeat;
	background-size: cover;
	border-radius: 0;
	display: flex;
	flex-direction: column;
}

.phone-navbar {
	position: relative;
	height: 44px;
	line-height: 44px;
	text-align: center;
	font-weight: 600;
	background-repeat: no-repeat;
	background-size: cover;
}

.back-dot {
	position: absolute;
	top: 15px;
	left: 16px;
	width: 10px;
	height: 10px;
	border-left: 2px solid #333;
	border-bottom: 2px solid #333;
	transform: rotate(45deg);
}

.component-wrap {
	position: relative;
	flex: 1;
	min-height: 718px;
	padding: 1px 0 24px;
	background-repeat: no-repeat !important;
	background-size: contain !important;
	overflow: visible;
}

.preview-component {
	position: relative;
	z-index: 20;
	background-repeat: no-repeat;
	background-size: cover;
	cursor: pointer;
}

.preview-component:hover,
.preview-component.is-active {
	box-shadow: none;
}

.preview-component::before {
	content: "";
	position: absolute;
	inset: 0;
	z-index: 1;
	pointer-events: none;
	display: none;
}

.preview-component:hover::before {
	display: block;
	border: 1px dashed var(--el-color-primary);
}

.preview-component.is-active::before {
	display: block;
	border: 1px solid var(--el-color-primary);
}

.comp-label,
.comp-tools {
	position: absolute;
	z-index: 80;
	opacity: 0;
	transition: opacity 0.16s;
	pointer-events: auto;
}

.comp-label {
	top: 50%;
	left: -92px;
	transform: translateY(-50%);
	width: 80px;
	height: 32px;
	line-height: 32px;
	text-align: center;
	font-size: 14px;
	color: var(--sa-font);
	background: var(--sa-background-assist);
	border-radius: 2px;
	box-shadow: 0 0 4px rgb(0 0 0 / 8%), 0 2px 6px rgb(0 0 0 / 6%), 0 4px 8px 2px rgb(0 0 0 / 4%);
}

.comp-tools {
	top: 50%;
	right: -44px;
	width: 36px;
	padding: 8px 0 0;
	display: none;
	flex-direction: column;
	align-items: center;
	background: var(--sa-background-assist);
	border-radius: 2px;
	box-shadow: 0 0 4px rgb(0 0 0 / 8%), 0 2px 6px rgb(0 0 0 / 6%), 0 4px 8px 2px rgb(0 0 0 / 4%);
}

.preview-component:hover .comp-label,
.preview-component.is-active .comp-label {
	opacity: 1;
}

.preview-component.is-active .comp-label {
	color: #fff;
	background: var(--el-color-primary);
}

.preview-component.is-active .comp-tools {
	display: flex;
	opacity: 1;
}

.comp-tools .el-icon {
	margin-bottom: 8px;
	font-size: 16px;
	cursor: pointer;
}

.comp-tools :deep(.el-button) {
	width: 24px;
	height: 24px;
	min-height: 24px;
	margin: 0 0 8px;
	padding: 0;
}

.comp-content {
	min-height: 30px;
	overflow: hidden;
	background-size: 100% !important;
	background-repeat: no-repeat !important;
}

.basic-screen {
	padding: 16px;
	background: #f6f6f6;
}

.basic-preview-title {
	margin-bottom: 16px;
	font-weight: 600;
}

.inspector-body {
	padding: 0 12px 16px;
}

:deep(.settings-panel) {
	padding-bottom: 4px;
}

:deep(.image-field) {
	display: flex;
	align-items: center;
	width: 100%;
	gap: 8px;
}

:deep(.image-preview) {
	flex: 0 0 50px;
	width: 50px;
	height: 50px;
	object-fit: cover;
	border: 1px solid var(--el-border-color);
	border-radius: 4px;
	background: var(--el-fill-color-light);
}

:deep(.image-preview.empty) {
	display: grid;
	place-items: center;
	color: var(--el-text-color-secondary);
	font-size: 18px;
}

:deep(.full-width) {
	width: 100%;
}

:deep(.setting-card) {
	margin-bottom: 8px;
	overflow: hidden;
	border: 1px solid var(--el-border-color-light);
	border-radius: 2px;
	background: var(--el-bg-color);
}

:deep(.setting-title) {
	min-height: 36px;
	line-height: 36px;
	padding: 0 10px;
	font-size: 12px;
	font-weight: 600;
	background: var(--el-fill-color-lighter);
	border-bottom: 1px solid var(--el-border-color-light);
}

:deep(.setting-wrap) {
	padding: 12px 10px 4px;
}

:deep(.setting-wrap .el-form-item) {
	margin-bottom: 14px;
}

:deep(.setting-wrap .el-form-item__label) {
	height: 32px;
	line-height: 32px;
	color: var(--sa-font);
	font-weight: 400;
}

:deep(.custom-radio-button .el-radio-button__inner) {
	min-width: 54px;
	height: 36px;
	padding: 8px 10px;
	border-radius: 0;
}

:deep(.custom-radio-button .iconfont) {
	position: relative;
	display: inline-block;
	width: 34px;
	height: 18px;
	vertical-align: middle;
}

:deep(.custom-radio-button .iconfont::before),
:deep(.custom-radio-button .iconfont::after) {
	content: "";
	position: absolute;
	box-sizing: border-box;
	border: 1px solid currentcolor;
	border-radius: 2px;
}

:deep(.icontabbar-1::before) {
	inset: 1px 2px;
	border-top: none;
}

:deep(.icontabbar-1::after) {
	left: 8px;
	right: 8px;
	bottom: 3px;
	height: 3px;
	border-width: 1px 0 0;
	border-radius: 0;
}

:deep(.icontabbar-2::before) {
	left: 4px;
	right: 4px;
	bottom: 2px;
	height: 6px;
}

:deep(.iconmode-1::before) {
	inset: 0 2px;
}

:deep(.iconmode-2::before) {
	left: 1px;
	top: 0;
	width: 14px;
	height: 18px;
}

:deep(.iconmode-2::after) {
	right: 1px;
	top: 0;
	width: 14px;
	height: 18px;
}

:deep(.iconmode-3::before) {
	left: 0;
	top: 1px;
	width: 12px;
	height: 7px;
	box-shadow: 0 9px 0 -1px currentcolor;
}

:deep(.iconmode-3::after) {
	right: 0;
	top: 1px;
	width: 18px;
	height: 16px;
}

:deep(.iconmode-4::before) {
	left: 0;
	top: 0;
	width: 15px;
	height: 15px;
	box-shadow: 18px 0 0 -1px currentcolor;
}

:deep(.iconmode-5::before) {
	left: 0;
	top: 1px;
	width: 9px;
	height: 16px;
	box-shadow: 12px 0 0 -1px currentcolor, 24px 0 0 -1px currentcolor;
}

:deep(.icondot-1::before) {
	left: 10px;
	top: 7px;
	width: 4px;
	height: 4px;
	border-radius: 50%;
	box-shadow: 8px 0 0 currentcolor;
}

:deep(.icondot-2::before) {
	left: 8px;
	top: 7px;
	width: 18px;
	height: 4px;
	border-radius: 4px;
	background: currentcolor;
}

:deep(.iconline-1::before),
:deep(.iconline-2::before),
:deep(.iconline-3::before) {
	left: 2px;
	right: 2px;
	top: 8px;
	height: 0;
	border-width: 1px 0 0;
	border-radius: 0;
}

:deep(.iconline-2::before) {
	border-top-style: dotted;
}

:deep(.iconline-3::before) {
	border-top-style: dashed;
}

:deep(.iconmode-7::before) {
	left: 0;
	top: 3px;
	width: 30px;
	height: 12px;
	border-radius: 8px;
}

:deep(.iconmode-8::before) {
	left: 1px;
	top: 2px;
	width: 14px;
	height: 14px;
	border-radius: 8px;
	box-shadow: 17px 0 0 -1px currentcolor;
}

:deep(.iconmode-9::before) {
	left: 0;
	top: 2px;
	width: 9px;
	height: 14px;
	border-radius: 6px;
	box-shadow: 12px 0 0 -1px currentcolor, 24px 0 0 -1px currentcolor;
}

:deep(.list-title),
:deep(.list-item-title) {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

:deep(.list-item) {
	padding: 10px;
	margin-bottom: 10px;
	background: var(--sa-bg-assist-1);
	border: 1px solid var(--sa-border);
	border-radius: 2px;
}

:deep(.list-item-title) {
	margin-bottom: 10px;
	color: var(--sa-title);
	font-weight: 600;
}

:deep(.d-text-color-like) {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	width: 100%;
	gap: 8px;
}

:deep(.goods-field-row) {
	display: grid;
	grid-template-columns: 52px minmax(0, 1fr);
	align-items: center;
	width: 100%;
	gap: 8px;
}

:deep(.title-tip) {
	margin: -2px 0 8px;
	color: var(--sa-subtitle);
	font-size: 12px;
	text-align: right;
}

:deep(.d-cube) {
	position: relative;
	display: inline-block;
	margin-bottom: 12px;
	line-height: 0;
	user-select: none;
}

:deep(.d-cube table) {
	border-spacing: 0;
	border-collapse: collapse;
}

:deep(.d-cube .image-cube-item) {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	border: 1px solid var(--sa-border);
	background: var(--sa-background-assist);
	cursor: pointer;
}

:deep(.d-cube .image-cube-item .el-icon) {
	color: var(--sa-subtitle);
	font-size: 20px;
}

:deep(.d-cube .image-cube-item.is-active) {
	background-color: var(--t-bg-active);
}

:deep(.d-cube .position-item) {
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	border: 1px solid var(--el-color-primary);
	background: rgb(64 158 255 / 12%);
	color: var(--el-color-primary);
	font-size: 12px;
	line-height: 1;
	cursor: pointer;
}

:deep(.d-cube .position-item.is-active) {
	background: rgb(64 158 255 / 22%);
}

:deep(.d-cube .circle-close-filled) {
	position: absolute;
	top: -7px;
	right: -7px;
	color: var(--el-color-danger);
	background: #fff;
	border-radius: 50%;
	font-size: 16px;
	line-height: 1;
}

:deep(.cube-current) {
	margin-bottom: 8px;
}

:deep(.editor-array-title),
:deep(.array-card-title),
:deep(.sub-title) {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
	font-weight: 600;
	color: var(--el-text-color-regular);
}

:deep(.array-card) {
	margin-bottom: 10px;
}

:deep(.editor-object) {
	padding: 10px;
	margin-bottom: 12px;
	border: 1px solid var(--el-border-color-light);
	border-radius: 4px;
	background: var(--el-fill-color-extra-light);
}

:deep(.d-slider-like) {
	display: flex;
	align-items: center;
	width: 100%;
	gap: 12px;
}

:deep(.d-slider-like .el-slider) {
	flex: 1;
}

:deep(.d-slider-like .el-input) {
	width: 76px;
}

:deep(.d-color-picker-like) {
	display: flex;
	align-items: center;
	width: 100%;
	gap: 8px;
}

:deep(.d-color-picker-like .el-color-picker__trigger) {
	border-radius: 4px;
}

:deep(.d-color-picker-like .el-input) {
	flex: 1;
}

:deep(.goods-select-field) {
	width: 100%;
}

:deep(.selected-goods) {
	width: 100%;
	margin-bottom: 8px;
}

:deep(.selected-goods-item) {
	display: grid;
	grid-template-columns: 42px minmax(0, 1fr) 40px;
	align-items: center;
	gap: 8px;
	padding: 6px;
	margin-bottom: 6px;
	background: var(--sa-bg-assist-1);
	border: 1px solid var(--sa-border);
	border-radius: 2px;
}

:deep(.selected-goods-item img),
:deep(.selected-goods-empty),
:deep(.goods-select-thumb) {
	width: 42px;
	height: 42px;
	object-fit: cover;
	background: var(--el-fill-color-light);
	border-radius: 2px;
}

:deep(.selected-goods-item span) {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

:deep(.selected-empty) {
	padding: 10px;
	color: var(--sa-subtitle);
	background: var(--sa-bg-assist-1);
	border: 1px dashed var(--sa-border);
	border-radius: 2px;
}

:deep(.goods-select-toolbar) {
	display: flex;
	gap: 8px;
	margin-bottom: 12px;
}

.css-card {
	min-height: 420px;
	padding: 12px;
	margin: 0;
	overflow: auto;
	color: #3f4656;
	background: var(--el-fill-color-lighter);
	border: 1px solid var(--el-border-color-light);
	border-radius: 4px;
	font-size: 12px;
	line-height: 1.6;
}

:deep(.preview-img),
:deep(.image-block),
:deep(.banner-img),
:deep(.video-preview) {
	width: 100%;
	min-height: 90px;
	object-fit: cover;
	background: #e8edf5;
}

:deep(.empty) {
	display: grid;
	place-items: center;
	color: #8a93a3;
}

:deep(.tabbar-preview),
:deep(.metric-card),
:deep(.menu-grid-preview),
:deep(.goods-preview),
:deep(.coupon-list-preview),
:deep(.live-preview) {
	display: grid;
	gap: 8px;
	padding: 12px;
	background: #fff;
}

:deep(.tabbar-preview) {
	grid-template-columns: repeat(4, 1fr);
	text-align: center;
	font-size: 12px;
}

:deep(.tabbar-icon),
:deep(.float-icon),
:deep(.menu-img),
:deep(.menu-row-img),
:deep(.notice-icon) {
	width: 34px;
	height: 34px;
	object-fit: cover;
	border-radius: 8px;
	background: #edf2f7;
}

:deep(.float-preview),
:deep(.popup-preview),
:deep(.notice-preview),
:deep(.search-preview),
:deep(.member-card),
:deep(.coupon-preview),
:deep(.title-preview),
:deep(.richtext-preview) {
	display: flex;
	align-items: center;
	gap: 10px;
	min-height: 42px;
	padding: 10px 12px;
	background: #fff;
}

:deep(.search-preview) {
	color: #8a93a3;
	border-radius: 18px;
}

:deep(.member-card) {
	min-height: 86px;
	color: #fff;
	background: linear-gradient(135deg, #30343f, #111827);
}

:deep(.metric-card) {
	grid-template-columns: repeat(4, 1fr);
	text-align: center;
}

:deep(.menu-grid-preview) {
	text-align: center;
}

:deep(.menu-cell) {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	font-size: 12px;
}

:deep(.menu-row) {
	display: flex;
	align-items: center;
	gap: 10px;
	min-height: 44px;
	border-bottom: 1px solid #f0f2f5;
}

:deep(.menu-row small) {
	margin-left: auto;
	color: #9ca3af;
}

:deep(.goods-preview) {
	grid-template-columns: repeat(2, 1fr);
	background: transparent;
}

:deep(.goods-preview.mode-3) {
	grid-template-columns: 1fr;
}

:deep(.goods-card),
:deep(.live-card),
:deep(.coupon-ticket) {
	overflow: hidden;
	background: #fff;
	border-radius: 8px;
}

:deep(.goods-img) {
	width: 100%;
	height: 118px;
	object-fit: cover;
	background: #e8edf5;
}

:deep(.goods-name),
:deep(.goods-price),
:deep(.live-card strong),
:deep(.live-card span) {
	display: block;
	padding: 6px 8px 0;
	font-size: 12px;
}

:deep(.goods-price) {
	padding-bottom: 8px;
	font-weight: 600;
}

:deep(.banner-preview) {
	display: flex;
	gap: 8px;
	overflow: hidden;
}

:deep(.banner-img) {
	flex: 0 0 100%;
	height: 130px;
}

:deep(.title-preview) {
	justify-content: space-between;
	background-repeat: no-repeat;
	background-size: 100% 100%;
}

:deep(.cube-preview) {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 4px;
}

:deep(.image-cube .image-cube-item) {
	position: absolute;
	box-sizing: border-box;
}

:deep(.cube-img) {
	width: 100%;
	height: 100%;
	min-height: 100%;
	object-fit: cover;
	background: #e8edf5;
}

:deep(.line-preview) {
	height: 0;
	border-top-width: 1px;
}

:deep(.hotzone-preview) {
	position: relative;
}

:deep(.hotzone-item) {
	position: absolute;
	display: grid;
	place-items: center;
	border: 1px solid var(--el-color-primary);
	background: rgb(64 158 255 / 18%);
	color: var(--el-color-primary);
	font-size: 12px;
}

:deep(.coupon-list-preview) {
	grid-template-columns: 1fr;
}

:deep(.coupon-ticket) {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px;
	color: #fff;
	background: #ff6b35;
}

:deep(.coupon-ticket button) {
	border: none;
	border-radius: 14px;
	padding: 4px 10px;
	cursor: pointer;
}

:deep(.unknown-preview) {
	padding: 16px;
	text-align: center;
	color: #8a93a3;
	background: #fff;
}
</style>
