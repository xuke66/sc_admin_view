import { http } from "@/common/http";

export const DecorateService = {
	async getTemplateList(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/decoratePage/index", params || {});
	},

	async getTemplateDetail(id: number) {
		return http.get<httpNs.Response>("/decoratePage/templateDetail", { id });
	},

	async saveTemplate(param: any) {
		return http.post<httpNs.Response>("/decoratePage/saveTemplate", {
			...param,
			template_type: param.type,
		});
	},

	async copyTemplate(id: number) {
		return http.post<httpNs.Response>("/decoratePage/copy", { id });
	},

	async updateTemplateStatus(id: number, status: "enable" | "disabled") {
		return http.post<httpNs.Response>("/decoratePage/status", { id, status });
	},

	async delTemplate(id: number) {
		return http.post<httpNs.Response>("/decoratePage/del", { id });
	},

	async getPageDetail(params: { id: number; type: string }) {
		return http.get<httpNs.Response>("/decoratePage/detail", params);
	},

	async savePage(param: { id: number; type: string; page: string; image?: string }) {
		return http.post<httpNs.Response>("/decoratePage/edit", param);
	},
};
