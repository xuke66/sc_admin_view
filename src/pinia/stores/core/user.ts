import type { LoginParams } from "@/common/api/user";
import { ref } from "vue";
import { defineStore } from "pinia";
import { useRouteFn } from "@/composables";
import { resetRouter } from "@/router";
import { useLayoutStore } from "./layout";
import { UserService } from "@/common/api/user";
export interface UserInfo {
  id?: string;
  nickname?: string;
  username?: string;
  roles ?: string[];
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
      return await UserService.login(loginParams).then(res => {
        accessToken.value = res.data.token;
        setToken(accessToken.value);
        return res.data;
      });
    };

    const getUserInfo = async () => {
      // 模拟获取用户信息
      // return await UserService.getUserInfo().then(res => {
      //   setRoles(res.data.roles);
      //   setUserInfo(res.data);
      //   return res.data;
      // });

      const userInfo = await new Promise<UserInfo>(resolve => {
        setTimeout(() => {
          resolve({
            id: "v10001",
            username: "Admin",
            nickname: "保密",
            roles: ["admin"],
          });
        }, 500);
      });

      setUserInfo(userInfo);
      return userInfo;
    };


    const logout = async () => {

      userInfo.value = {};
      clearPermission();

      const layoutStore = useLayoutStore();
      layoutStore.removeAllTabs();
      layoutStore.setKeepAliveName();
      resetRouter();
    };

    const clearPermission = () => {
      setToken("");
      setRoles([]);
    };

    const changeRoles = async (rolesParam: string[]) => {
      // 模拟新的 token
      const accessToken = rolesParam[0] + "-token";
      setToken(accessToken);
      setRoles(rolesParam); // 正常不是直接赋予角色，而是调用 this.getUserInfo(token)，根据 token 重新获取对应的角色
      // await this.getUserInfo(token);
      resetRouter();
      useRouteFn().initDynamicRoutes(rolesParam);
    };

    const setToken = (newAccessToken: string) => {
      accessToken.value = newAccessToken;
    };

    const setUserInfo = (userInfoParam: UserInfo) => {
      userInfo.value = userInfoParam;
      roles.value = userInfoParam.roles || [];
    };

    const setRoles = (rolesParam: string[]) => (roles.value = rolesParam);


    return {
      accessToken,
      userInfo,
      roles,
      searchHistory,
      login,
      logout,
      getUserInfo,
      clearPermission,
      changeRoles,
      setUserInfo,
      setToken,
      setRoles,
    };
  },
  {
    persist: {
      pick: ["accessToken"],
    },
  }
);
