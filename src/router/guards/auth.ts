import type { Router } from "vue-router";
import { LOGIN_URL } from "@/common/config";
import { useRouteFn } from "@/composables";
import { useRouteStore, useUserStore } from "@/pinia";
import { resetRouter } from "..";
import {RbacService} from "@/common/api/rbac"
export const createAuthGuard = (router: Router) => {
	/**
	 * 路由跳转开始
	 */
	router.beforeEach(async (to, from) => {
		const userStore = useUserStore();
		const routeStore = useRouteStore();
		const { initDynamicRoutes } = useRouteFn();
		const accessToken = userStore.accessToken;

		// 判断是访问登陆页，有 Token 就在当前页面，没有 Token 重置路由并放行到登陆页
		if (to.path === LOGIN_URL) {
			if (accessToken) return from.fullPath;
			resetRouter();
			return true;
		}

		// 判断是否有 Token，没有重定向到 login
		if (!accessToken) return { path: LOGIN_URL, replace: true };

		// 判断是否加载过路由，如果没有则加载路由
		if (!routeStore.loadedRouteList.length) {
			try {
				await initDynamicRoutes(RbacService.getMenuList);
				return { ...to, replace: true };
			} catch (error) {
				userStore.clearPermission();
				console.log("Auth Router: ", error);
				return { path: LOGIN_URL, replace: true };
			}
		}
	});
};
