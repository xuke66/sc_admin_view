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

export interface MemberItem {
	id: number;
	nickname: string;
	mobile: string;
	avatar: string;
	level: number;
	level_id: number;
	money: string;
	commission: string;
	score: number;
	status: "normal" | "disabled";
	status_text: string;
	parent_user_id: number | null;
	parent_user_name: string;
	total_consume: string;
	create_time: string;
	update_time: string;
}

export interface MemberLogItem {
	id: number;
	user_id: number;
	admin_id: number;
	admin_name: string;
	action: string;
	title: string;
	before_data: Record<string, any>;
	after_data: Record<string, any>;
	change_money: string;
	change_score: number;
	remark: string;
	create_time: string;
}

export interface MemberDetail {
	user: MemberItem & {
		parent_user?: {
			id: number;
			nickname: string;
			mobile: string;
		} | null;
	};
	logs: MemberLogItem[];
}

export interface MemberQuery {
	keywords?: string;
	status?: "" | "normal" | "disabled";
}

export interface MemberBasicPayload {
	id: number;
	nickname: string;
	mobile: string;
	avatar: string;
	status: "normal" | "disabled";
	parent_user_id?: number | null;
}

export interface MemberAccountPayload {
	id: number;
	money_change?: number;
	score_change?: number;
	remark?: string;
}

export const UserService = {
	login(params: LoginParams) {
		return http.post<httpNs.Response<Token>>("/index/login", params);
	},
	getMemberList(params: MemberQuery = {}) {
		return http.get<httpNs.Response<MemberItem[]>>("/user/index", params);
	},
	getMemberDetail(id: number) {
		return http.get<httpNs.Response<MemberDetail>>("/user/detail", { id });
	},
	updateMemberBasic(params: MemberBasicPayload) {
		return http.post<httpNs.Response>("/user/basic", params);
	},
	updateMemberAccount(params: MemberAccountPayload) {
		return http.post<httpNs.Response>("/user/account", params);
	},
	getMemberLogs(id: number, limit = 20) {
		return http.get<httpNs.Response<MemberLogItem[]>>("/user/logs", { id, limit });
	},
};
