import { http } from "@/common/http";

export const OrderService = {
	async getOrderList(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/order/index", params || {});
	},
	async getOrderDetail(id: number) {
		return http.get<httpNs.Response>("/order/detail", { id });
	},
	async getExpressCompanies(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/order/expressCompanies", params || {});
	},
	async getExpressDetail(id: number) {
		return http.get<httpNs.Response>("/order/expressDetail", { id });
	},
	async shipOrder(param: any) {
		return http.post<httpNs.Response>("/order/ship", param);
	},
	async getAftersaleList(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/orderAftersale/index", params || {});
	},
	async getAftersaleDetail(id: number) {
		return http.get<httpNs.Response>("/orderAftersale/detail", { id });
	},
	async agreeAftersale(param: { id: number; remark?: string }) {
		return http.post<httpNs.Response>("/orderAftersale/agree", param);
	},
	async refuseAftersale(param: { id: number; remark?: string }) {
		return http.post<httpNs.Response>("/orderAftersale/refuse", param);
	},
	async refundAftersale(param: { id: number; remark?: string }) {
		return http.post<httpNs.Response>("/orderAftersale/refund", param);
	},
};
