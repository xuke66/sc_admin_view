import { Compass, Goods, Tickets, User } from "@element-plus/icons-vue";
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
	}
];
