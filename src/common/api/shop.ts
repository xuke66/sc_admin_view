export interface CategoryItem {
  id: number;
  name: string;
  parent_id: number;
  image: string;
  description: string;
  weigh: number;
  status: 0 | 1;
  is_effect: 0 | 1;
  create_time: string;
  update_time: string;
  children?: CategoryItem[];
}

export interface ShippingTemplateItem {
  id: number;
  type: 1 | 2 | 3;
  first_num: number;
  first_price: number;
  additional_num: number;
  additional_price: number;
  province_ids: number[];
  city_ids: number[];
  district_ids: number[];
  status: 0 | 1;
  is_effect: 0 | 1;
  create_time: string;
  update_time: string;
}

export interface GoodsSkuItem {
  id: number;
  name: string;
  image: string;
  parent_id: number;
  goods_id: number;
  weigh: number;
}

export interface GoodsSkuPriceItem {
  id: number;
  goods_sku_ids: number[];
  goods_sku_text: string;
  goods_id: number;
  image: string;
  stock: number;
  stock_warning: number;
  sales: number;
  third_sn: string;
  weight: number;
  cost_price: number;
  original_price: number;
  price: number;
  status: 0 | 1;
  is_effect: 0 | 1;
  create_time: string;
  update_time: string;
}

export interface GoodsItem {
  id: number;
  title: string;
  subtitle: string;
  cate_ids: number[];
  image: string;
  images: string[];
  content: string;
  is_sku: 0 | 1;
  limit_type: 0 | 1 | 2;
  limit_num: number;
  sales: number;
  shipping_id: number;
  weigh: number;
  status: 0 | 1;
  is_effect: 0 | 1;
  create_time: string;
  update_time: string;
}

export interface GoodsDetail extends GoodsItem {
  shipping_template: ShippingTemplateItem | null;
  sku_list: GoodsSkuItem[];
  sku_price_list: GoodsSkuPriceItem[];
}

export interface CategoryQuery {
  keywords?: string;
  status?: "" | 0 | 1;
  parent_id?: "" | number;
}

export interface ShippingTemplateQuery {
  status?: "" | 0 | 1;
  type?: "" | 1 | 2 | 3;
}

export interface GoodsQuery {
  keywords?: string;
  status?: "" | 0 | 1;
  cate_id?: "" | number;
}

export interface CategoryPayload {
  id?: number;
  parent_id: number;
  name: string;
  image: string;
  description: string;
  weigh: number;
  status: 0 | 1;
}

export interface ShippingTemplatePayload {
  id?: number;
  type: 1 | 2 | 3;
  first_num: number;
  first_price: number;
  additional_num: number;
  additional_price: number;
  province_ids: number[];
  city_ids: number[];
  district_ids: number[];
  status: 0 | 1;
}

export interface GoodsPayload {
  id?: number;
  title: string;
  subtitle: string;
  cate_ids: number[];
  image: string;
  images: string[];
  content: string;
  is_sku: 0 | 1;
  limit_type: 0 | 1 | 2;
  limit_num: number;
  shipping_id: number;
  weigh: number;
  status: 0 | 1;
  sku_list: Array<{
    id?: number;
    name: string;
    image?: string;
    parent_id: number;
    weigh: number;
  }>;
  sku_price_list: Array<{
    id?: number;
    goods_sku_ids: number[];
    goods_sku_text: string;
    image: string;
    stock: number;
    stock_warning: number;
    sales: number;
    third_sn: string;
    weight: number;
    cost_price: number;
    original_price: number;
    price: number;
    status: 0 | 1;
  }>;
}

export interface StockPayload {
  goods_id: number;
  goods_sku_price_id: number;
  type: 1 | 2;
  stock: number;
  msg: string;
}

export interface StockLogItem {
  id: number;
  goods_id: number;
  admin_id: number;
  goods_sku_price_id: number;
  goods_sku_text: string;
  before: number;
  stock: number;
  msg: string;
  create_time: string;
}

export interface AreaOption {
  id: number;
  name: string;
  children?: AreaOption[];
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const now = () => new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-");

const typeTextMap: Record<ShippingTemplateItem["type"], string> = {
  1: "按件数",
  2: "按重量",
  3: "按体积",
};

const areas: AreaOption[] = [
  {
    id: 110000,
    name: "北京市",
    children: [
      {
        id: 110100,
        name: "北京市",
        children: [
          { id: 110101, name: "东城区" },
          { id: 110105, name: "朝阳区" },
        ],
      },
    ],
  },
  {
    id: 310000,
    name: "上海市",
    children: [
      {
        id: 310100,
        name: "上海市",
        children: [
          { id: 310101, name: "黄浦区" },
          { id: 310115, name: "浦东新区" },
        ],
      },
    ],
  },
  {
    id: 440000,
    name: "广东省",
    children: [
      {
        id: 440100,
        name: "广州市",
        children: [
          { id: 440103, name: "荔湾区" },
          { id: 440106, name: "天河区" },
        ],
      },
      {
        id: 440300,
        name: "深圳市",
        children: [
          { id: 440303, name: "罗湖区" },
          { id: 440305, name: "南山区" },
        ],
      },
    ],
  },
];

let categorySeed = 300;
let templateSeed = 30;
let goodsSeed = 1000;
let skuSeed = 5000;
let skuPriceSeed = 8000;
let stockLogSeed = 1;

let categories: CategoryItem[] = [
  {
    id: 1,
    name: "服饰鞋包",
    parent_id: 0,
    image: "https://dummyimage.com/120x120/e8f0ff/2f54eb&text=%E6%9C%8D%E9%A5%B0",
    description: "服饰类一级分类",
    weigh: 100,
    status: 1,
    is_effect: 1,
    create_time: "2026-04-01 10:00:00",
    update_time: "2026-04-01 10:00:00",
  },
  {
    id: 2,
    name: "数码家电",
    parent_id: 0,
    image: "https://dummyimage.com/120x120/fdf1dc/d46b08&text=%E6%95%B0%E7%A0%81",
    description: "数码类一级分类",
    weigh: 90,
    status: 1,
    is_effect: 1,
    create_time: "2026-04-01 10:00:00",
    update_time: "2026-04-01 10:00:00",
  },
  {
    id: 11,
    name: "男装",
    parent_id: 1,
    image: "",
    description: "男装二级分类",
    weigh: 80,
    status: 1,
    is_effect: 1,
    create_time: "2026-04-01 11:00:00",
    update_time: "2026-04-01 11:00:00",
  },
  {
    id: 12,
    name: "女鞋",
    parent_id: 1,
    image: "",
    description: "女鞋二级分类",
    weigh: 75,
    status: 1,
    is_effect: 1,
    create_time: "2026-04-01 11:00:00",
    update_time: "2026-04-01 11:00:00",
  },
  {
    id: 21,
    name: "手机配件",
    parent_id: 2,
    image: "",
    description: "手机周边",
    weigh: 70,
    status: 1,
    is_effect: 1,
    create_time: "2026-04-01 11:00:00",
    update_time: "2026-04-01 11:00:00",
  },
];

let shippingTemplates: ShippingTemplateItem[] = [
  {
    id: 1,
    type: 1,
    first_num: 1,
    first_price: 8,
    additional_num: 1,
    additional_price: 2,
    province_ids: [110000, 310000],
    city_ids: [],
    district_ids: [],
    status: 1,
    is_effect: 1,
    create_time: "2026-04-01 12:00:00",
    update_time: "2026-04-01 12:00:00",
  },
  {
    id: 2,
    type: 2,
    first_num: 3,
    first_price: 12,
    additional_num: 1,
    additional_price: 4,
    province_ids: [440000],
    city_ids: [440300],
    district_ids: [],
    status: 1,
    is_effect: 1,
    create_time: "2026-04-02 09:00:00",
    update_time: "2026-04-02 09:00:00",
  },
];

let goodsList: GoodsItem[] = [
  {
    id: 101,
    title: "春季轻薄夹克",
    subtitle: "防风面料，日常通勤",
    cate_ids: [1, 11],
    image: "https://dummyimage.com/160x160/e6f4ff/1677ff&text=%E5%A4%B9%E5%85%8B",
    images: [
      "https://dummyimage.com/160x160/e6f4ff/1677ff&text=1",
      "https://dummyimage.com/160x160/fff1f0/c41d7f&text=2",
    ],
    content: "轻薄夹克，适合春秋通勤。",
    is_sku: 1,
    limit_type: 1,
    limit_num: 2,
    sales: 32,
    shipping_id: 1,
    weigh: 90,
    status: 1,
    is_effect: 1,
    create_time: "2026-04-03 10:00:00",
    update_time: "2026-04-08 16:30:00",
  },
  {
    id: 102,
    title: "65W 氮化镓充电器",
    subtitle: "适配手机/平板/笔记本",
    cate_ids: [2, 21],
    image: "https://dummyimage.com/160x160/f6ffed/52c41a&text=%E5%85%85%E7%94%B5%E5%99%A8",
    images: ["https://dummyimage.com/160x160/f6ffed/52c41a&text=A"],
    content: "支持 PD 快充协议。",
    is_sku: 0,
    limit_type: 0,
    limit_num: 0,
    sales: 88,
    shipping_id: 2,
    weigh: 88,
    status: 1,
    is_effect: 1,
    create_time: "2026-04-04 11:00:00",
    update_time: "2026-04-08 12:00:00",
  },
];

let goodsSkus: GoodsSkuItem[] = [
  { id: 1001, name: "颜色", image: "", parent_id: 0, goods_id: 101, weigh: 100 },
  { id: 1002, name: "尺码", image: "", parent_id: 0, goods_id: 101, weigh: 90 },
  { id: 1003, name: "黑色", image: "", parent_id: 1001, goods_id: 101, weigh: 100 },
  { id: 1004, name: "卡其", image: "", parent_id: 1001, goods_id: 101, weigh: 90 },
  { id: 1005, name: "M", image: "", parent_id: 1002, goods_id: 101, weigh: 100 },
  { id: 1006, name: "L", image: "", parent_id: 1002, goods_id: 101, weigh: 90 },
];

let goodsSkuPrices: GoodsSkuPriceItem[] = [
  {
    id: 2001,
    goods_sku_ids: [1003, 1005],
    goods_sku_text: "黑色 / M",
    goods_id: 101,
    image: "",
    stock: 18,
    stock_warning: 5,
    sales: 10,
    third_sn: "JK-BK-M",
    weight: 0.6,
    cost_price: 79,
    original_price: 169,
    price: 129,
    status: 1,
    is_effect: 1,
    create_time: "2026-04-03 10:00:00",
    update_time: "2026-04-08 16:30:00",
  },
  {
    id: 2002,
    goods_sku_ids: [1004, 1006],
    goods_sku_text: "卡其 / L",
    goods_id: 101,
    image: "",
    stock: 10,
    stock_warning: 5,
    sales: 7,
    third_sn: "JK-KQ-L",
    weight: 0.62,
    cost_price: 79,
    original_price: 169,
    price: 129,
    status: 1,
    is_effect: 1,
    create_time: "2026-04-03 10:00:00",
    update_time: "2026-04-08 16:30:00",
  },
  {
    id: 2003,
    goods_sku_ids: [],
    goods_sku_text: "",
    goods_id: 102,
    image: "",
    stock: 66,
    stock_warning: 8,
    sales: 20,
    third_sn: "GAN-65W",
    weight: 0.15,
    cost_price: 45,
    original_price: 99,
    price: 79,
    status: 1,
    is_effect: 1,
    create_time: "2026-04-04 11:00:00",
    update_time: "2026-04-08 12:00:00",
  },
];

const stockLogs: StockLogItem[] = [
  {
    id: stockLogSeed++,
    goods_id: 101,
    admin_id: 1,
    goods_sku_price_id: 2001,
    goods_sku_text: "黑色 / M",
    before: 0,
    stock: 18,
    msg: "商品新增初始化库存",
    create_time: "2026-04-03 10:00:00",
  },
];

const getCategoryChildrenIds = (id: number) => {
  const queue = [id];
  const ids: number[] = [];
  while (queue.length) {
    const current = queue.shift() as number;
    ids.push(current);
    categories.filter(item => item.is_effect === 1 && item.parent_id === current).forEach(item => queue.push(item.id));
  }
  return ids;
};

const buildCategoryTree = (onlyEnabled = false, parentId = 0): CategoryItem[] =>
  categories
    .filter(item => item.is_effect === 1 && item.parent_id === parentId && (!onlyEnabled || item.status === 1))
    .sort((a, b) => b.weigh - a.weigh || a.id - b.id)
    .map(item => ({
      ...item,
      children: buildCategoryTree(onlyEnabled, item.id),
    }));

const categoryMap = () => new Map(categories.filter(item => item.is_effect === 1).map(item => [item.id, item]));

const shippingTemplateMap = () =>
  new Map(shippingTemplates.filter(item => item.is_effect === 1).map(item => [item.id, item]));

const goodsCategoryNames = (cateIds: number[]) =>
  cateIds.map(id => categoryMap().get(id)?.name).filter(Boolean) as string[];

const serializeTemplateAreaText = (template: ShippingTemplateItem) => {
  const texts: string[] = [];
  if (template.province_ids.length) texts.push(`省:${template.province_ids.join(",")}`);
  if (template.city_ids.length) texts.push(`市:${template.city_ids.join(",")}`);
  if (template.district_ids.length) texts.push(`区:${template.district_ids.join(",")}`);
  return texts.join(" | ") || "全国";
};

const getGoodsDetailData = (id: number): GoodsDetail | null => {
  const goods = goodsList.find(item => item.id === id && item.is_effect === 1);
  if (!goods) return null;

  return {
    ...clone(goods),
    shipping_template: shippingTemplateMap().get(goods.shipping_id) || null,
    sku_list: clone(goodsSkus.filter(item => item.goods_id === id)),
    sku_price_list: clone(goodsSkuPrices.filter(item => item.goods_id === id && item.is_effect === 1)),
  };
};

const validateCategory = (payload: CategoryPayload) => {
  const name = payload.name.trim();
  if (!name) throw new Error("分类名称不能为空");
  if (payload.parent_id === (payload.id || 0)) throw new Error("上级分类不能选择自己");
  const parentExists =
    payload.parent_id === 0 || categories.some(item => item.id === payload.parent_id && item.is_effect === 1);
  if (!parentExists) throw new Error("上级分类不存在");
  if (payload.id && getCategoryChildrenIds(payload.id).includes(payload.parent_id))
    throw new Error("上级分类不能选择自己的子分类");

  const exists = categories.find(
    item => item.is_effect === 1 && item.parent_id === payload.parent_id && item.name === name && item.id !== payload.id
  );
  if (exists) throw new Error("同级分类名称已存在");
};

const validateTemplate = (payload: ShippingTemplatePayload) => {
  if (![1, 2, 3].includes(payload.type)) throw new Error("计费方式错误");
  if (payload.first_num < 0 || payload.first_price < 0 || payload.additional_num < 0 || payload.additional_price < 0) {
    throw new Error("运费参数不能为负数");
  }
};

const normalizeSkuList = (goodsId: number, skuList: GoodsPayload["sku_list"]) => {
  const nextSkuIdMap = new Map<number, number>();
  const normalized: GoodsSkuItem[] = [];

  skuList.forEach(item => {
    const nextId = item.id && item.id > 0 ? item.id : ++skuSeed;
    nextSkuIdMap.set(item.id || nextId, nextId);
  });

  skuList.forEach(item => {
    const currentId = nextSkuIdMap.get(item.id || 0) || item.id || ++skuSeed;
    const sourceParentId = item.parent_id;
    const parentId = sourceParentId > 0 ? nextSkuIdMap.get(sourceParentId) || sourceParentId : 0;
    normalized.push({
      id: currentId,
      goods_id: goodsId,
      name: item.name.trim(),
      image: item.image?.trim() || "",
      parent_id: parentId,
      weigh: item.weigh,
    });
  });

  return normalized;
};

const normalizeSkuPriceList = (
  goodsId: number,
  skuPrices: GoodsPayload["sku_price_list"],
  normalizedSkus: GoodsSkuItem[]
) => {
  const skuIdSet = new Set(normalizedSkus.map(item => item.id));
  return skuPrices.map(item => ({
    id: item.id && item.id > 0 ? item.id : ++skuPriceSeed,
    goods_id: goodsId,
    goods_sku_ids: item.goods_sku_ids.filter(id => skuIdSet.has(id)),
    goods_sku_text: item.goods_sku_text.trim(),
    image: item.image.trim(),
    stock: Number(item.stock) || 0,
    stock_warning: Number(item.stock_warning) || 0,
    sales: Number(item.sales) || 0,
    third_sn: item.third_sn.trim(),
    weight: Number(item.weight) || 0,
    cost_price: Number(item.cost_price) || 0,
    original_price: Number(item.original_price) || 0,
    price: Number(item.price) || 0,
    status: item.status,
    is_effect: 1 as const,
    create_time: now(),
    update_time: now(),
  }));
};

const validateGoods = (payload: GoodsPayload) => {
  if (!payload.title.trim()) throw new Error("商品名称不能为空");
  if (!payload.cate_ids.length) throw new Error("所属分类不能为空");
  const validCategoryCount = payload.cate_ids.filter(id => categoryMap().has(id)).length;
  if (validCategoryCount !== payload.cate_ids.length) throw new Error("所属分类不存在");
  if (payload.shipping_id > 0 && !shippingTemplateMap().has(payload.shipping_id)) throw new Error("运费模板不存在");
  if (payload.is_sku === 1) {
    if (!payload.sku_list.length || !payload.sku_price_list.length) throw new Error("多规格商品必须配置规格与价格");
  } else if (!payload.sku_price_list.length) {
    throw new Error("单规格商品必须配置价格");
  }
};

export const ShopService = {
  async getCategoryList(query: CategoryQuery = {}) {
    const keywords = query.keywords?.trim().toLowerCase() || "";
    const list = categories.filter(item => {
      if (item.is_effect !== 1) return false;
      if (keywords && !item.name.toLowerCase().includes(keywords)) return false;
      if (query.status !== "" && query.status !== undefined && item.status !== Number(query.status)) return false;
      if (query.parent_id !== "" && query.parent_id !== undefined && item.parent_id !== Number(query.parent_id))
        return false;
      return true;
    });

    return clone({
      list,
      tree: buildCategoryTree(false),
    });
  },

  async getCategoryOptions(onlyEnabled = true) {
    return clone(buildCategoryTree(onlyEnabled));
  },

  async getCategoryDetail(id: number) {
    const item = categories.find(row => row.id === id && row.is_effect === 1);
    if (!item) throw new Error("分类不存在");
    return clone(item);
  },

  async saveCategory(payload: CategoryPayload) {
    validateCategory(payload);
    const time = now();
    if (payload.id) {
      categories = categories.map(item =>
        item.id === payload.id ? { ...item, ...payload, name: payload.name.trim(), update_time: time } : item
      );
      return { id: payload.id };
    }

    const id = ++categorySeed;
    categories.push({
      id,
      ...payload,
      name: payload.name.trim(),
      is_effect: 1,
      create_time: time,
      update_time: time,
    });
    return { id };
  },

  async updateCategoryStatus(id: number, status: 0 | 1) {
    categories = categories.map(item => (item.id === id ? { ...item, status, update_time: now() } : item));
    return true;
  },

  async deleteCategory(id: number) {
    const ids = getCategoryChildrenIds(id);
    if (!ids.length) throw new Error("分类不存在");
    const usedByGoods = goodsList.some(
      item => item.is_effect === 1 && item.cate_ids.some(cateId => ids.includes(cateId))
    );
    if (usedByGoods) throw new Error("分类下存在商品，无法删除");
    categories = categories.map(item => (ids.includes(item.id) ? { ...item, is_effect: 0, update_time: now() } : item));
    return true;
  },

  async getShippingTemplateList(query: ShippingTemplateQuery = {}) {
    const list = shippingTemplates.filter(item => {
      if (item.is_effect !== 1) return false;
      if (query.status !== "" && query.status !== undefined && item.status !== Number(query.status)) return false;
      if (query.type !== "" && query.type !== undefined && item.type !== Number(query.type)) return false;
      return true;
    });
    return clone({ list });
  },

  async getShippingTemplateOptions(onlyEnabled = true) {
    return clone(shippingTemplates.filter(item => item.is_effect === 1 && (!onlyEnabled || item.status === 1)));
  },

  async getShippingTemplateDetail(id: number) {
    const item = shippingTemplates.find(row => row.id === id && row.is_effect === 1);
    if (!item) throw new Error("运费模板不存在");
    return clone(item);
  },

  async saveShippingTemplate(payload: ShippingTemplatePayload) {
    validateTemplate(payload);
    const time = now();
    if (payload.id) {
      shippingTemplates = shippingTemplates.map(item =>
        item.id === payload.id ? { ...item, ...payload, update_time: time } : item
      );
      return { id: payload.id };
    }

    const id = ++templateSeed;
    shippingTemplates.unshift({
      id,
      ...payload,
      is_effect: 1,
      create_time: time,
      update_time: time,
    });
    return { id };
  },

  async updateShippingTemplateStatus(id: number, status: 0 | 1) {
    shippingTemplates = shippingTemplates.map(item =>
      item.id === id ? { ...item, status, update_time: now() } : item
    );
    return true;
  },

  async deleteShippingTemplate(id: number) {
    const usedByGoods = goodsList.some(item => item.is_effect === 1 && item.shipping_id === id);
    if (usedByGoods) throw new Error("运费模板已被商品使用，无法删除");
    shippingTemplates = shippingTemplates.map(item =>
      item.id === id ? { ...item, is_effect: 0, update_time: now() } : item
    );
    return true;
  },

  async getAreaOptions() {
    return clone(areas);
  },

  async getGoodsList(query: GoodsQuery = {}) {
    const keywords = query.keywords?.trim().toLowerCase() || "";
    const list = goodsList
      .filter(item => {
        if (item.is_effect !== 1) return false;
        if (keywords && !item.title.toLowerCase().includes(keywords)) return false;
        if (query.status !== "" && query.status !== undefined && item.status !== Number(query.status)) return false;
        if (query.cate_id !== "" && query.cate_id !== undefined && !item.cate_ids.includes(Number(query.cate_id)))
          return false;
        return true;
      })
      .map(item => {
        const skuPrices = goodsSkuPrices.filter(row => row.goods_id === item.id && row.is_effect === 1);
        const prices = skuPrices.map(row => row.price);
        const stocks = skuPrices.map(row => row.stock);
        return {
          ...clone(item),
          category_names: goodsCategoryNames(item.cate_ids),
          shipping_template: clone(shippingTemplateMap().get(item.shipping_id) || null),
          shipping_type: shippingTemplateMap().get(item.shipping_id)?.type || 0,
          total_stock: stocks.reduce((sum, value) => sum + value, 0),
          min_price: prices.length ? Math.min(...prices) : 0,
          max_price: prices.length ? Math.max(...prices) : 0,
        };
      });

    return clone({
      list,
      filters: {
        categories: buildCategoryTree(true),
      },
    });
  },

  async getGoodsOptions() {
    return clone({
      categories: buildCategoryTree(true),
      shipping_templates: shippingTemplates.filter(item => item.is_effect === 1 && item.status === 1),
    });
  },

  async getGoodsDetail(id: number) {
    const data = getGoodsDetailData(id);
    if (!data) throw new Error("商品不存在");
    return clone(data);
  },

  async saveGoods(payload: GoodsPayload) {
    validateGoods(payload);
    const time = now();

    if (payload.id) {
      const current = goodsList.find(item => item.id === payload.id && item.is_effect === 1);
      if (!current) throw new Error("商品不存在");

      goodsList = goodsList.map(item =>
        item.id === payload.id
          ? {
              ...item,
              ...payload,
              title: payload.title.trim(),
              subtitle: payload.subtitle.trim(),
              image: payload.image.trim(),
              images: payload.images.map(item => item.trim()).filter(Boolean),
              content: payload.content,
              update_time: time,
            }
          : item
      );
      goodsSkus = goodsSkus.filter(item => item.goods_id !== payload.id);
      goodsSkuPrices = goodsSkuPrices.map(item =>
        item.goods_id === payload.id ? { ...item, is_effect: 0, update_time: time } : item
      );

      const normalizedSkus = payload.is_sku === 1 ? normalizeSkuList(payload.id, payload.sku_list) : [];
      const normalizedSkuPrices = normalizeSkuPriceList(payload.id, payload.sku_price_list, normalizedSkus);
      goodsSkus.push(...normalizedSkus);
      goodsSkuPrices.push(...normalizedSkuPrices);

      return { id: payload.id };
    }

    const id = ++goodsSeed;
    goodsList.unshift({
      id,
      title: payload.title.trim(),
      subtitle: payload.subtitle.trim(),
      cate_ids: [...payload.cate_ids],
      image: payload.image.trim(),
      images: payload.images.map(item => item.trim()).filter(Boolean),
      content: payload.content,
      is_sku: payload.is_sku,
      limit_type: payload.limit_type,
      limit_num: payload.limit_num,
      sales: 0,
      shipping_id: payload.shipping_id,
      weigh: payload.weigh,
      status: payload.status,
      is_effect: 1,
      create_time: time,
      update_time: time,
    });

    const normalizedSkus = payload.is_sku === 1 ? normalizeSkuList(id, payload.sku_list) : [];
    const normalizedSkuPrices = normalizeSkuPriceList(id, payload.sku_price_list, normalizedSkus);
    goodsSkus.push(...normalizedSkus);
    goodsSkuPrices.push(...normalizedSkuPrices);

    normalizedSkuPrices.forEach(item => {
      if (item.stock > 0) {
        stockLogs.unshift({
          id: stockLogSeed++,
          goods_id: id,
          admin_id: 1,
          goods_sku_price_id: item.id,
          goods_sku_text: item.goods_sku_text,
          before: 0,
          stock: item.stock,
          msg: "商品新增初始化库存",
          create_time: time,
        });
      }
    });

    return { id };
  },

  async updateGoodsStatus(id: number, status: 0 | 1) {
    goodsList = goodsList.map(item => (item.id === id ? { ...item, status, update_time: now() } : item));
    return true;
  },

  async deleteGoods(id: number) {
    goodsList = goodsList.map(item => (item.id === id ? { ...item, is_effect: 0, update_time: now() } : item));
    goodsSkuPrices = goodsSkuPrices.map(item =>
      item.goods_id === id ? { ...item, is_effect: 0, update_time: now() } : item
    );
    return true;
  },

  async changeGoodsStock(payload: StockPayload) {
    const row = goodsSkuPrices.find(
      item => item.id === payload.goods_sku_price_id && item.goods_id === payload.goods_id && item.is_effect === 1
    );
    if (!row) throw new Error("规格价格不存在");

    const before = row.stock;
    const after = payload.type === 1 ? before + payload.stock : before - payload.stock;
    if (after < 0) throw new Error("库存不足，无法出库");

    row.stock = after;
    row.update_time = now();
    stockLogs.unshift({
      id: stockLogSeed++,
      goods_id: payload.goods_id,
      admin_id: 1,
      goods_sku_price_id: payload.goods_sku_price_id,
      goods_sku_text: row.goods_sku_text,
      before,
      stock: after,
      msg: payload.msg.trim() || (payload.type === 1 ? "后台手动补货" : "后台手动出库"),
      create_time: now(),
    });
    return clone({ before_stock: before, stock: after });
  },

  async getStockLogs(goodsId: number) {
    return clone(stockLogs.filter(item => item.goods_id === goodsId));
  },

  getShippingTypeText(type: ShippingTemplateItem["type"]) {
    return typeTextMap[type];
  },

  getShippingAreaText(template: ShippingTemplateItem) {
    return serializeTemplateAreaText(template);
  },
};
