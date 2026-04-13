import { http } from "@/common/http";

export const RbacService = {
	status_map: reactive({
		0: "禁用",
		1: "启用",
	}),

	async getAdminList(param: any) {
		return http.get<httpNs.Response>("/admin/index", param);
	},
	async getAdminOptions() {
		return http.get<httpNs.Response>("/admin/options");
	},
	async saveAdmin(param: any) {
		return http.post<httpNs.Response>(param.id ? "/admin/edit" : "/admin/add", param);
	},

	async updateAdminStatus(id: string, status: number) {
		return http.post<httpNs.Response>("/admin/status", { id: id, status: status });
	},

	async delAdmin(id: number) {
		return http.post<httpNs.Response>("/admin/del", { id: id });
	},

	async getPermissionGroupOptions() {
		return http.get<httpNs.Response>("/authGroup/options");
	},

	async getPermissionList() {
		return http.get<httpNs.Response>("/auth/index");
	},
	async savePermission(param: any) {
		return http.post<httpNs.Response>(param.id ? "/auth/edit" : "/auth/add", param);
	},
	async delPermission(id: number) {
		return http.post<httpNs.Response>("/auth/del", { id: id });
	},
	async getPermissionGroupList(param: any) {
		return http.get<httpNs.Response>("/authGroup/index", param);
	},
	async savePermissionGroup(param: any) {
		return http.post<httpNs.Response>(param.id ? "/authGroup/edit" : "/authGroup/add", param);
	},
	async delPermissionGroup(id: number) {
		return http.post<httpNs.Response>("/authGroup/del", { id: id });
	},

	async updatePermissionGroupStatus(id: string, status: number) {
		return http.post<httpNs.Response>("/authGroup/status", { id: id, status: status });
	},
};
