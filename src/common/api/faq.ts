import { http } from "@/common/http";

export const FaqService = {
	async getFaqList(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/faq/index", params || {});
	},

	async getFaqDetail(id: number) {
		return http.get<httpNs.Response>("/faq/detail", { id });
	},

	async saveFaq(param: any) {
		return http.post<httpNs.Response>(param.id ? "/faq/edit" : "/faq/add", param);
	},

	async delFaq(id: number) {
		return http.post<httpNs.Response>("/faq/del", { id });
	},
};
