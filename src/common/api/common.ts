import { http } from "@/common/http";

export const CommonService = {
	async getRegionCascader(pid = 0) {
		return http.get<httpNs.Response>("/region/cascader", { pid });
	},
	async upload(file: File, fieldName = "file") {
		const formData = new FormData();
		formData.append(fieldName, file);

		return http.post<httpNs.Response>("/index/upload", formData, {
			contentType: "multipart",
		});
	},
};
