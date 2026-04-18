import { Compass, Goods, User } from "@element-plus/icons-vue";
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
		path: "/user",
		name: "会员管理",
		redirect: "/user/member",
		meta: {
			title: "会员管理",
			icon: User,
			alwaysShowRoot: true,
		},
		children: [
			{
				path: "/user/member",
				name: "会员列表",
				component: "/user/member/index",
				meta: {
					title: "会员列表",
					icon: User,
					auths: ["user:member:view", "user:member:detail", "user:member:edit", "user:member:account", "user:member:logs"],
				},
			},
		],
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
			{
				path: "/shop/goods-score",
				name: "积分商品",
				component: "/shop/goods-score/index",
				meta: {
					title: "积分商品",
					icon: Goods,
					auths: [
						"shop:goods-score:view",
						"shop:goods-score:create",
						"shop:goods-score:edit",
						"shop:goods-score:delete",
						"shop:goods-score:status",
					],
				},
			},
			{
				path: "/shop/coupon",
				name: "优惠券管理",
				component: "/shop/coupon/index",
				meta: {
					title: "优惠券管理",
					icon: Goods,
					auths: [
						"shop:coupon:view",
						"shop:coupon:create",
						"shop:coupon:edit",
						"shop:coupon:delete",
						"shop:coupon:status",
						"shop:coupon:grant",
						"shop:coupon:records",
					],
				},
			},
		],
	},
];
