import type { LoginParams } from "@/common/api/user";
import { ref } from "vue";
import { defineStore } from "pinia";
import { resetRouter } from "@/router";
import { useLayoutStore } from "./layout";
import { UserService } from "@/common/api/user";
export interface UserInfo {
	id?: string;
	nickname?: string;
	username?: string;
	roles?: string[];
}

export const useUserStore = defineStore(
	"userStore",
	() => {
		const accessToken = ref("");
		const userInfo = ref<UserInfo>({});
		const roles = ref<string[]>([]);
		const searchHistory = ref<RouterConfig[]>([]);

		const login = async (loginParams: LoginParams) => {
			// 模拟调用登录接口拿到 token
			return await UserService.login(loginParams).then((res) => {
				accessToken.value = res.data.token;
				setToken(accessToken.value);
				setUserInfo(res.data.user);
				return res.data;
			});
		};

		const getUserInfo = async () => {
			return userInfo;
		};

		const logout = async () => {
			userInfo.value = {};
			clearPermission();

			const layoutStore = useLayoutStore();
			await layoutStore.removeAllTabs();
			await layoutStore.setKeepAliveName();
			resetRouter();
		};

		const clearPermission = () => {
			setToken("");
		};

		const setToken = (newAccessToken: string) => {
			accessToken.value = newAccessToken;
		};

		const getToken = () => {
			return accessToken.value;
		};

		const setUserInfo = (userInfoParam: UserInfo) => {
			userInfo.value = userInfoParam;
		};

		return {
			accessToken,
			userInfo,
			roles,
			searchHistory,
			login,
			logout,
			getUserInfo,
			clearPermission,
			setUserInfo,
			setToken,
			getToken,
		};
	},
	{
		persist: {
			pick: ["accessToken"],
		},
	},
);
