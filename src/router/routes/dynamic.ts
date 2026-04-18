import { Compass, Goods } from "@element-plus/icons-vue";
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
		path: "/shop",
		name: "商品管理",
		redirect: "/shop/goods",
		meta: {
			title: "商品管理",
			icon: Goods,
			alwaysShowRoot: true,
		},
		children: [
			{
				path: "/shop/goods",
				name: "商品管理列表",
				component: "/shop/goods/index",
				meta: {
					title: "商品管理",
					icon: Goods,
					auths: ["shop:goods:view", "shop:goods:create", "shop:goods:edit", "shop:goods:delete", "shop:goods:status", "shop:goods:restock"],
				},
			},
			{
				path: "/shop/category",
				name: "分类管理",
				component: "/shop/category/index",
				meta: {
					title: "分类管理",
					icon: Goods,
					auths: ["shop:category:view", "shop:category:create", "shop:category:edit", "shop:category:delete", "shop:category:status"],
				},
			},
			{
				path: "/shop/shipping-template",
				name: "运费模板",
				component: "/shop/shipping-template/index",
				meta: {
					title: "运费模板",
					icon: Goods,
					auths: [
						"shop:shipping-template:view",
						"shop:shipping-template:create",
						"shop:shipping-template:edit",
						"shop:shipping-template:delete",
						"shop:shipping-template:status",
					],
				},
			},
			{
				path: "/shop/goods-service",
				name: "商品服务",
				component: "/shop/goods-service/index",
				meta: {
					title: "商品服务",
					icon: Goods,
					auths: ["shop:goods-service:view", "shop:goods-service:create", "shop:goods-service:edit", "shop:goods-service:delete"],
				},
			},
		],
	},
];
