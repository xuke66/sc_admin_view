import type { UserInfo } from "@/pinia";
import { http } from "@/common/http";

export interface LoginParams {
	username: string;
	password: string;
	verifyCode?: string;
}

export interface Token {
	user: UserInfo;
	token: string;
}

export const UserService = {
	// 登录
	login(params: LoginParams) {
		return http.post<httpNs.Response<Token>>("/index/login", params);
	},
};
