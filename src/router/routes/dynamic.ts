import { Brush, Compass } from "@element-plus/icons-vue";
import { HOME_NAME, HOME_URL } from "@/common/config";

export const dynamicRoutes: RouterConfigRaw[] = [
	{
		path: HOME_URL,
		name: HOME_NAME,
		component: "/workbenches/index",
		meta: {
			title: "工作台",
			icon: Compass,
			tagText: "Welcome",
			tagProps: { type: "success" },
		},
	},
	{
		path: "/shop/decorate/page",
		name: "ShopDecoratePage",
		component: "/shop/decorate/page/index",
		meta: {
			title: "DIY 首页",
			icon: Brush,
			auths: ["decoratePage/detail", "decoratePage/edit"],
		},
	},
];
