import { http } from "@/common/http";

export const FeedbackService = {
	async getFeedbackList(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/feedback/index", params || {});
	},

	async getFeedbackDetail(id: number) {
		return http.get<httpNs.Response>("/feedback/detail", { id });
	},

	async handleFeedback(param: { id: number; remark?: string }) {
		return http.post<httpNs.Response>("/feedback/handle", param);
	},
};
