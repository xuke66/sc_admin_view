import { http } from "@/common/http";

export const ShopService = {
	async getCategoryList() {
		return http.get<httpNs.Response>("/category/index");
	},

	async saveCategory(param: any) {
		return http.post<httpNs.Response>(param.id ? "/category/edit" : "/category/add", param);
	},

	async updateCategoryStatus(id: number, status: 0 | 1) {
		return http.post<httpNs.Response>("/category/status", { id, status });
	},

	async delCategory(id: number) {
		return http.post<httpNs.Response>("/category/del", { id });
	},

	async getShippingTemplateList(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/shippingTemplate/index", params || {});
	},

	async saveShippingTemplate(param: any) {
		return http.post<httpNs.Response>(param.id ? "/shippingTemplate/edit" : "/shippingTemplate/add", param);
	},

	async updateShippingTemplateStatus(id: number, status: 0 | 1) {
		return http.post<httpNs.Response>("/shippingTemplate/status", { id, status });
	},

	async delShippingTemplate(id: number) {
		return http.post<httpNs.Response>("/shippingTemplate/del", { id });
	},

	async getGoodsServiceList(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/goodsService/index", params || {});
	},

	async saveGoodsService(param: any) {
		return http.post<httpNs.Response>(param.id ? "/goodsService/edit" : "/goodsService/add", param);
	},

	async delGoodsService(id: number) {
		return http.post<httpNs.Response>("/goodsService/del", { id });
	},

	async getGoodsList(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/goods/index", params || {});
	},

	async getGoodsDetail(id: number) {
		return http.get<httpNs.Response>("/goods/detail", { id });
	},

	async saveGoods(param: any) {
		return http.post<httpNs.Response>(param.id ? "/goods/edit" : "/goods/add", param);
	},

	async updateGoodsStatus(id: number, status: 0 | 1) {
		return http.post<httpNs.Response>("/goods/status", { id, status });
	},

	async delGoods(id: number) {
		return http.post<httpNs.Response>("/goods/del", { id });
	},

	async restockGoods(param: { id: number; goods_sku_price_id: number; stock: number; msg?: string }) {
		return http.post<httpNs.Response>("/goods/restock", param);
	},

	async getGoodsScoreList(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/goodsScore/index", params || {});
	},

	async getGoodsScoreDetail(id: number) {
		return http.get<httpNs.Response>("/goodsScore/detail", { id });
	},

	async saveGoodsScore(param: any) {
		return http.post<httpNs.Response>(param.id ? "/goodsScore/edit" : "/goodsScore/add", param);
	},

	async updateGoodsScoreStatus(id: number, status: 0 | 1) {
		return http.post<httpNs.Response>("/goodsScore/status", { id, status });
	},

	async delGoodsScore(id: number) {
		return http.post<httpNs.Response>("/goodsScore/del", { id });
	},

	async getCouponList(params?: Record<string, any>) {
		return http.get<httpNs.Response>("/coupon/index", params || {});
	},

	async getCouponDetail(id: number) {
		return http.get<httpNs.Response>("/coupon/detail", { id });
	},

	async saveCoupon(param: any) {
		return http.post<httpNs.Response>(param.id ? "/coupon/edit" : "/coupon/add", param);
	},

	async updateCouponStatus(id: number, status: 0 | 1) {
		return http.post<httpNs.Response>("/coupon/status", { id, status });
	},

	async delCoupon(id: number) {
		return http.post<httpNs.Response>("/coupon/del", { id });
	},

	async grantCoupon(param: { id: number; user_ids: number[] }) {
		return http.post<httpNs.Response>("/coupon/grant", param);
	},

	async getCouponRecords(id: number, params?: Record<string, any>) {
		return http.get<httpNs.Response>("/coupon/records", { id, ...(params || {}) });
	},
};
