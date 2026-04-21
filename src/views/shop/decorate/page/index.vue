<template>
	<div class="decorate-page page-index">
		<div class="sa-header">
			<div class="header-side">
				<button class="header-button" :class="{ 'is-active': pageType === 'basic' }" type="button" title="基础配置" @click="changePageType('basic')">
					<span class="header-page-icon icon-basic"></span>
				</button>
				<button class="header-button" :class="{ 'is-active': pageType === 'home' }" type="button" title="首页" @click="changePageType('home')">
					<span class="header-page-icon icon-home"></span>
				</button>
				<button class="header-button" :class="{ 'is-active': pageType === 'user' }" type="button" title="个人页" @click="changePageType('user')">
					<span class="header-page-icon icon-user"></span>
				</button>
			</div>

			<div class="header-side header-actions">
				<button class="header-button" type="button">预览</button>
				<button class="header-button" type="button">保存</button>
			</div>
		</div>

		<div class="page-main">
			<aside class="left">
				<div class="left-main">
					<div v-if="pageType === 'basic'" class="collapse-block">
						<div class="collapse-title">应用设置</div>
						<div class="component-grid">
							<div
								class="component-item"
								:class="{ 'is-active': currentType === item.type }"
								v-for="item in basicItems"
								:key="item.type"
								@click="selectBasicItem(item.type)"
							>
								<img :src="`/assets/decorate/${item.type}.png`" alt="" />
								<span>{{ item.name }}</span>
							</div>
						</div>
					</div>
					<div v-else-if="pageType === 'home'" class="collapse-block">
						<div class="collapse-title">基础组件</div>
						<div class="component-grid">
							<div
								v-for="item in homeItems"
								:key="item.type"
								class="component-item"
								:class="{ 'is-active': currentType === item.type }"
								@click="addHomeComponent(item.type)"
							>
								<img :src="`/assets/decorate/${item.type}.png`" alt="" />
								<span>{{ item.name }}</span>
							</div>
						</div>
						<div class="collapse-title">商品组件</div>
						<div class="component-grid">
							<div
								v-for="item in goodsItems"
								:key="item.type"
								class="component-item"
								:class="{ 'is-active': currentType === item.type }"
								@click="addHomeComponent(item.type)"
							>
								<img :src="`/assets/decorate/${item.type}.png`" alt="" />
								<span>{{ item.name }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="left-icon">‹</div>
			</aside>

			<main class="center">
				<div class="center-main is-android">
					<div class="phone-status">
						<img src="/assets/decorate/header-android.png" alt="" />
					</div>
					<div class="phone-navbar">首页</div>
					<div class="comp-wrap">
						<div v-if="pageType === 'basic'" class="empty-tip">中间预览区域</div>
						<div
							v-if="pageType === 'basic' && currentType === 'tabbar'"
							class="tabbar-preview"
							:style="{
								backgroundColor: tabbar.background.type === 'color' ? tabbar.background.bgColor : '',
								backgroundImage: tabbar.background.type === 'image' && tabbar.background.bgImage ? `url('${assetUrl(tabbar.background.bgImage)}')` : '',
							}"
						>
							<div
								v-for="(item, index) in tabbar.list"
								:key="index"
								class="tabbar-preview-item"
								:class="{ 'is-center': tabbar.mode === 2 && index === Math.floor(tabbar.list.length / 2) }"
							>
								<div v-if="tabbar.layout === 1 || tabbar.layout === 3" class="tabbar-icon-wrap">
									<img v-if="item.activeIcon || item.inactiveIcon" :src="assetUrl(item.activeIcon || item.inactiveIcon)" alt="" />
									<span v-else class="tabbar-icon-placeholder"></span>
								</div>
								<div
									v-if="tabbar.layout === 1 || tabbar.layout === 2"
									class="tabbar-text"
									:style="{ color: index === 0 ? tabbar.activeColor : tabbar.inactiveColor }"
								>
									{{ item.text || '导航' }}
								</div>
							</div>
						</div>
						<div v-if="pageType === 'basic' && currentType === 'floatMenu' && floatMenu.show" :class="{ mask: !floatMenuFolded }">
							<div class="float-menu" :class="floatMenu.mode === 2 ? 'horizontal' : 'vertical'">
								<template v-if="!floatMenuFolded">
									<div v-for="(item, index) in floatMenu.list" :key="index" class="float-menu-item">
										<img v-if="item.src" :src="assetUrl(item.src)" alt="" />
										<span v-else class="float-menu-placeholder"></span>
										<div v-if="floatMenu.isText" class="text" :style="{ color: item.title.color }">
											{{ item.title.text }}
										</div>
									</div>
								</template>
								<button
									class="float-menu-button"
									:class="{ fold: !floatMenuFolded }"
									type="button"
									@click="floatMenuFolded = !floatMenuFolded"
								>
									×
								</button>
							</div>
						</div>
						<div v-if="pageType === 'basic' && currentType === 'popupImage'" class="popup-image-preview">
							<div class="mask"></div>
							<div
								v-for="(item, index) in popupImage.list"
								:key="index"
								class="popup-image-item"
								:class="{ 'is-active': popupImageCurrent === index }"
								:style="{
									marginRight: `-${146 + index * 20}px`,
									marginBottom: `-${227 + index * 20}px`,
									zIndex: popupImageCurrent === index ? 200 : index + 6,
								}"
								@click="popupImageCurrent = index"
							>
								<img v-if="item.src" :src="assetUrl(item.src)" alt="" />
								<div v-else class="popup-image-placeholder">广告图</div>
							</div>
						</div>
						<template v-if="pageType === 'home'">
							<div
								v-for="(component, index) in homeComponents"
								:key="component.id"
								class="home-component"
								:class="{ 'is-active': currentHomeIndex === index }"
								@click="selectHomeComponent(index)"
							>
								<div class="comp-label">{{ componentLabel(component.type) }}</div>
								<div class="comp-tools">
									<button type="button" title="上移" :disabled="index === 0" @click.stop="moveHomeComponent(index, -1)">↑</button>
									<button type="button" title="下移" :disabled="index === homeComponents.length - 1" @click.stop="moveHomeComponent(index, 1)">↓</button>
									<button type="button" title="复制" @click.stop="copyHomeComponent(index)">⧉</button>
									<button type="button" title="删除" @click.stop="removeHomeComponent(index)">×</button>
								</div>
								<div class="component-inner" :style="componentWrapStyle(component)">
									<div v-if="component.type === 'searchBlock'" class="search-block" :style="{ borderRadius: `${component.data.borderRadius}px` }">
										<div class="search-placeholder">
											<span class="search-icon"></span>
											<span>{{ component.data.placeholder || '搜索商品' }}</span>
										</div>
										<div class="search-keywords">
											<span v-for="(keyword, keywordIndex) in component.data.keywords" :key="keywordIndex" :style="{ color: keyword.color }">
												{{ keyword.text }}
											</span>
										</div>
									</div>
									<div v-if="component.type === 'noticeBlock'" class="notice-block">
										<img :src="assetUrl(component.data.src)" alt="" />
										<div class="notice-divider"></div>
										<div class="notice-text" :style="{ color: component.data.title.color }">
											{{ component.data.title.text || '请输入公告内容' }}
										</div>
									</div>
									<div v-if="component.type === 'menuButton'" class="menu-button">
										<template v-for="(item, menuIndex) in component.data.list" :key="menuIndex">
											<div v-if="menuIndex < component.data.row * component.data.col" class="menu-button-item" :style="{ width: `${100 / component.data.col}%` }">
												<div v-if="item.badge.show" class="menu-badge" :style="{ background: item.badge.bgColor, color: item.badge.color }">
													{{ item.badge.text }}
												</div>
												<img v-if="item.src" :src="assetUrl(item.src)" alt="" />
												<div v-else class="menu-image-placeholder"></div>
												<div v-if="component.data.layout === 1" class="menu-title" :style="{ color: item.title.color }">
													{{ item.title.text }}
												</div>
											</div>
										</template>
										<div v-if="component.data.list.length > component.data.row * component.data.col" class="menu-indicator">
											<span></span><span></span>
										</div>
									</div>
									<div v-if="component.type === 'menuList'" class="menu-list">
										<div v-for="(item, menuIndex) in component.data.list" :key="menuIndex" class="menu-list-item">
											<div class="menu-list-left">
												<img v-if="item.src" :src="assetUrl(item.src)" alt="" />
												<div class="menu-list-title" :style="{ color: item.title.color }">{{ item.title.text }}</div>
											</div>
											<div class="menu-list-right">
												<div class="menu-list-tip" :style="{ color: item.tip.color }">{{ item.tip.text }}</div>
												<span class="menu-list-arrow">›</span>
											</div>
										</div>
									</div>
									<div v-if="component.type === 'menuGrid'" class="menu-grid">
										<div v-for="(item, gridIndex) in component.data.list" :key="gridIndex" class="menu-grid-item" :style="{ width: `${100 / component.data.col}%` }">
											<div v-if="item.badge.show" class="menu-badge grid-badge" :style="{ background: item.badge.bgColor, color: item.badge.color }">
												{{ item.badge.text }}
											</div>
											<img v-if="item.src" :src="assetUrl(item.src)" alt="" />
											<div v-else class="menu-grid-image-placeholder"></div>
											<div class="menu-grid-title" :style="{ color: item.title.color }">{{ item.title.text }}</div>
											<div class="menu-grid-tip" :style="{ color: item.tip.color }">{{ item.tip.text }}</div>
										</div>
									</div>
									<div v-if="component.type === 'goodsCard'" class="goods-card-preview">
										<div class="goods-card-wrap" :class="`goods-card-${component.data.mode}`" :style="{ margin: `-${component.data.space / 2}px` }">
											<div
												v-for="goods in component.data.goodsList"
												:key="goods.id"
												class="goods-card-item"
												:style="{ width: goodsCardWidth(component.data.mode), padding: `${component.data.space / 2}px` }"
											>
												<div
													class="goods-card-inner"
													:style="{
														borderTopLeftRadius: `${component.data.borderRadiusTop}px`,
														borderTopRightRadius: `${component.data.borderRadiusTop}px`,
														borderBottomLeftRadius: `${component.data.borderRadiusBottom}px`,
														borderBottomRightRadius: `${component.data.borderRadiusBottom}px`,
													}"
												>
													<div v-if="component.data.tagStyle.show && component.data.tagStyle.src" class="goods-tag">
														<img :src="assetUrl(component.data.tagStyle.src)" alt="" />
													</div>
													<img v-if="goods.image" class="goods-image" :src="assetUrl(goods.image)" alt="" />
													<div v-else class="goods-image goods-image-empty">暂无图片</div>
													<div class="goods-desc">
														<div v-if="component.data.goodsFields.title.show" class="goods-title" :style="{ color: component.data.goodsFields.title.color }">{{ goods.title }}</div>
														<div v-if="component.data.goodsFields.subtitle.show" class="goods-subtitle" :style="{ color: component.data.goodsFields.subtitle.color }">{{ goods.subtitle }}</div>
														<div class="goods-price-row">
															<div v-if="component.data.goodsFields.price.show" class="goods-price" :style="{ color: component.data.goodsFields.price.color }">￥{{ formatGoodsPrice(goods.price) }}</div>
															<s v-if="component.data.goodsFields.original_price.show" class="goods-original-price" :style="{ color: component.data.goodsFields.original_price.color }">￥{{ formatGoodsPrice(goods.original_price) }}</s>
														</div>
														<div v-if="component.data.goodsFields.sales.show" class="goods-sales" :style="{ color: component.data.goodsFields.sales.color }">已售{{ goods.sales || 0 }}件</div>
													</div>
													<div class="goods-buy-button" :style="buyButtonStyle(component)">
														<img v-if="component.data.buyNowStyle.mode === 2 && component.data.buyNowStyle.src" :src="assetUrl(component.data.buyNowStyle.src)" alt="" />
														<span v-else>{{ component.data.buyNowStyle.text }}</span>
													</div>
												</div>
											</div>
										</div>
										<div v-if="!component.data.goodsList.length" class="goods-empty">请选择商品</div>
									</div>
									<div v-if="component.type === 'goodsShelves'" class="goods-shelves-preview">
										<div
											class="goods-shelves-wrap"
											:class="`goods-shelves-${component.data.mode}`"
											:style="{
												margin: `-${component.data.space / 2}px`,
												flexWrap: component.data.mode === 3 ? 'nowrap' : 'wrap',
											}"
										>
											<div
												v-for="goods in component.data.goodsList"
												:key="goods.id"
												class="goods-shelves-item"
												:style="{ width: goodsShelvesWidth(component.data.mode), padding: `${component.data.space / 2}px` }"
											>
												<div
													class="goods-shelves-inner"
													:style="{
														borderTopLeftRadius: `${component.data.borderRadiusTop}px`,
														borderTopRightRadius: `${component.data.borderRadiusTop}px`,
														borderBottomLeftRadius: `${component.data.borderRadiusBottom}px`,
														borderBottomRightRadius: `${component.data.borderRadiusBottom}px`,
													}"
												>
													<div v-if="component.data.tagStyle.show && component.data.tagStyle.src" class="goods-tag">
														<img :src="assetUrl(component.data.tagStyle.src)" alt="" />
													</div>
													<img v-if="goods.image" class="goods-shelves-image" :src="assetUrl(goods.image)" alt="" />
													<div v-else class="goods-shelves-image goods-image-empty">暂无图片</div>
													<div class="goods-shelves-desc">
														<div v-if="component.data.goodsFields.title.show" class="goods-title" :style="{ color: component.data.goodsFields.title.color }">{{ goods.title }}</div>
														<div v-if="component.data.goodsFields.price.show" class="goods-price" :style="{ color: component.data.goodsFields.price.color }">￥{{ formatGoodsPrice(goods.price) }}</div>
													</div>
												</div>
											</div>
										</div>
										<div v-if="!component.data.goodsList.length" class="goods-empty">请选择商品</div>
									</div>
								</div>
							</div>
							<div v-if="!homeComponents.length" class="empty-tip">从左侧添加组件</div>
						</template>
					</div>
				</div>
			</main>

			<aside class="right">
				<div class="right-main">
					<div class="right-title">
						<span>{{ currentTitle }}</span>
					</div>
					<el-radio-group v-model="activeTab" class="right-tab">
						<el-radio-button label="data">内容</el-radio-button>
						<el-radio-button
							v-show="availableTabs(currentType).includes('style')"
							label="style"
						>
							样式
						</el-radio-button>
						<el-radio-button label="css">数据</el-radio-button>
					</el-radio-group>

					<div :key="currentType" class="right-panel">
					<template v-if="currentType === 'tabbar'">
						<template v-if="activeTab === 'data'">
						<div class="card">
							<div class="title">导航样式</div>
							<div class="wrap">
								<div class="form-item">
									<div class="form-label">选择样式</div>
									<div class="custom-radio-button">
										<button class="style-button" :class="{ 'is-active': tabbar.mode === 1 }" type="button" @click="tabbar.mode = 1">
											<span class="tabbar-style-icon style-1"></span>
										</button>
										<button class="style-button" :class="{ 'is-active': tabbar.mode === 2 }" type="button" @click="tabbar.mode = 2">
											<span class="tabbar-style-icon style-2"></span>
										</button>
									</div>
								</div>
								<div class="form-item">
									<div class="form-label">导航风格</div>
									<el-radio-group v-model="tabbar.layout" class="radio-row">
										<el-radio :label="1">文字+图片</el-radio>
										<el-radio :label="2">文字</el-radio>
										<el-radio :label="3">图片</el-radio>
									</el-radio-group>
								</div>
								<div class="form-item">
									<div class="form-label">默认颜色</div>
									<div class="color-input">
										<el-color-picker v-model="tabbar.inactiveColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
										<el-input v-model="tabbar.inactiveColor" />
									</div>
								</div>
								<div class="form-item">
									<div class="form-label">选中颜色</div>
									<div class="color-input">
										<el-color-picker v-model="tabbar.activeColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
										<el-input v-model="tabbar.activeColor" />
									</div>
								</div>
							</div>
						</div>

						<div class="card d-list">
							<div class="title">图标设置</div>
							<div v-for="(item, index) in tabbar.list" :key="index" class="list-item">
								<div class="list-move">
									<span>导航 {{ index + 1 }}</span>
									<button class="delete-button" type="button" @click="removeTabbarItem(index)">删除</button>
								</div>
								<div v-if="tabbar.layout === 1 || tabbar.layout === 3" class="form-item">
									<div class="form-label">默认图片</div>
									<label class="upload-box">
										<img v-if="item.inactiveIcon" :src="assetUrl(item.inactiveIcon)" alt="" />
										<span v-else>上传</span>
										<input type="file" accept="image/*" @change="uploadTabbarIcon($event, item, 'inactiveIcon')" />
									</label>
									<span class="tip">建议尺寸：44*44</span>
								</div>
								<div v-if="tabbar.layout === 1 || tabbar.layout === 3" class="form-item">
									<div class="form-label">选中图片</div>
									<label class="upload-box">
										<img v-if="item.activeIcon" :src="assetUrl(item.activeIcon)" alt="" />
										<span v-else>上传</span>
										<input type="file" accept="image/*" @change="uploadTabbarIcon($event, item, 'activeIcon')" />
									</label>
									<span class="tip">建议尺寸：44*44</span>
								</div>
								<div v-if="tabbar.layout === 1 || tabbar.layout === 2" class="form-item">
									<div class="form-label">文字</div>
									<input v-model="item.text" class="text-input" placeholder="请输入文字" />
								</div>
								<div class="form-item">
									<div class="form-label">选择链接</div>
									<input v-model="item.url" class="text-input" placeholder="暂不选择" />
								</div>
							</div>
							<button class="add-button" type="button" @click="addTabbarItem">+ 添加</button>
						</div>
						</template>

						<template v-else-if="activeTab === 'style'">
							<div class="card">
								<div class="title">组件样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">导航背景</div>
										<el-radio-group v-model="tabbar.background.type" class="radio-row">
											<el-radio label="color">纯色</el-radio>
											<el-radio label="image">图片</el-radio>
										</el-radio-group>
									</div>
									<div v-if="tabbar.background.type === 'color'" class="form-item">
										<div class="form-label">选择颜色</div>
										<div class="color-input">
											<el-color-picker v-model="tabbar.background.bgColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											<el-input v-model="tabbar.background.bgColor" />
										</div>
									</div>
									<div v-if="tabbar.background.type === 'image'" class="form-item">
										<div class="form-label">选择图片</div>
										<label class="upload-box wide-upload">
											<img v-if="tabbar.background.bgImage" :src="assetUrl(tabbar.background.bgImage)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadBackgroundImage" />
										</label>
									</div>
								</div>
							</div>
						</template>

						<pre v-else class="css-card">{{ JSON.stringify(tabbar, null, 2) }}</pre>
					</template>

					<template v-else-if="currentType === 'floatMenu'">
						<template v-if="activeTab === 'data'">
							<div class="card">
								<div class="title">展示图标</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">状态</div>
										<el-radio-group v-model="floatMenu.show" class="radio-row">
											<el-radio :label="0">关闭</el-radio>
											<el-radio :label="1">开启</el-radio>
										</el-radio-group>
									</div>
									<div class="form-item">
										<div class="form-label">悬浮样式</div>
										<el-radio-group v-model="floatMenu.mode" class="radio-row">
											<el-radio :label="1">垂直</el-radio>
											<el-radio :label="2">水平</el-radio>
										</el-radio-group>
									</div>
									<div class="form-item">
										<div class="form-label">显示名称</div>
										<el-radio-group v-model="floatMenu.isText" class="radio-row">
											<el-radio :label="0">不显示</el-radio>
											<el-radio :label="1">显示</el-radio>
										</el-radio-group>
									</div>
								</div>
							</div>

							<div class="card d-list">
								<div class="title">功能图标</div>
								<div v-for="(item, index) in floatMenu.list" :key="index" class="list-item">
									<div class="list-move">
										<span>按钮 {{ index + 1 }}</span>
										<button class="delete-button" type="button" @click="removeFloatMenuItem(index)">删除</button>
									</div>
									<div class="form-item">
										<div class="form-label">按钮图片</div>
										<label class="upload-box">
											<img v-if="item.src" :src="assetUrl(item.src)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadFloatMenuIcon($event, item)" />
										</label>
										<span class="tip">建议尺寸：80*80</span>
									</div>
									<div class="form-item">
										<div class="form-label">按钮名称</div>
										<div class="text-color-input">
											<input v-model="item.title.text" class="text-input" maxlength="4" placeholder="请输入按钮名称" />
											<el-color-picker v-model="item.title.color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
										</div>
									</div>
									<div class="form-item">
										<div class="form-label">按钮链接</div>
										<input v-model="item.url" class="text-input" placeholder="暂不选择" />
									</div>
								</div>
								<button class="add-button" type="button" @click="addFloatMenuItem">+ 添加</button>
							</div>
						</template>

						<pre v-else class="css-card">{{ JSON.stringify(floatMenu, null, 2) }}</pre>
					</template>

					<template v-else-if="currentType === 'popupImage'">
						<template v-if="activeTab === 'data'">
							<div class="card d-list">
								<div class="title">展示图标</div>
								<div v-for="(item, index) in popupImage.list" :key="index" class="list-item">
									<div class="list-move">
										<span>广告 {{ index + 1 }}</span>
										<button class="delete-button" type="button" @click="removePopupImageItem(index)">删除</button>
									</div>
									<div class="form-item">
										<div class="form-label">广告图</div>
										<label class="upload-box">
											<img v-if="item.src" :src="assetUrl(item.src)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadPopupImage($event, item)" />
										</label>
									</div>
									<div class="form-item">
										<div class="form-label">选择链接</div>
										<input v-model="item.url" class="text-input" placeholder="暂不选择" />
									</div>
									<div class="form-item">
										<div class="form-label">显示次数</div>
										<el-radio-group v-model="item.show" class="radio-row">
											<el-radio :label="1">仅显示一次</el-radio>
											<el-radio :label="2">每次显示</el-radio>
										</el-radio-group>
									</div>
								</div>
								<button class="add-button" type="button" @click="addPopupImageItem">+ 添加</button>
							</div>
						</template>

						<pre v-else class="css-card">{{ JSON.stringify(popupImage, null, 2) }}</pre>
					</template>

					<template v-else-if="currentType === 'searchBlock' && selectedHomeComponent">
						<template v-if="activeTab === 'data'">
							<div class="card">
								<div class="title">默认文字</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">提示内容</div>
										<el-input v-model="selectedHomeComponent.data.placeholder" placeholder="请输入提示内容" />
									</div>
									<div class="form-item">
										<div class="form-label">圆角</div>
										<el-slider v-model="selectedHomeComponent.data.borderRadius" :min="0" :max="32" class="form-slider" />
									</div>
								</div>
							</div>

							<div class="card d-list">
								<div class="title">
									搜索关键字
									<div class="warning">最多可创建三个</div>
								</div>
								<div v-for="(item, index) in selectedHomeComponent.data.keywords" :key="index" class="list-item">
									<div class="list-move">
										<span>关键字 {{ index + 1 }}</span>
										<button class="delete-button" type="button" @click="removeSearchKeyword(index)">删除</button>
									</div>
									<div class="form-item">
										<div class="form-label">关键字</div>
										<div class="text-color-input">
											<input v-model="item.text" class="text-input" maxlength="4" placeholder="请输入按钮名称" />
											<el-color-picker v-model="item.color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
										</div>
									</div>
								</div>
								<button v-if="selectedHomeComponent.data.keywords.length < 3" class="add-button" type="button" @click="addSearchKeyword">+ 添加</button>
							</div>
						</template>

						<template v-else-if="activeTab === 'style'">
							<div class="card">
								<div class="title">组件样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">组件背景</div>
										<el-radio-group v-model="selectedHomeComponent.style.background.type" class="radio-row">
											<el-radio label="color">纯色</el-radio>
											<el-radio label="image">图片</el-radio>
										</el-radio-group>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'color'" class="form-item">
										<div class="form-label">选择颜色</div>
										<div class="color-input">
											<el-color-picker v-model="selectedHomeComponent.style.background.bgColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											<el-input v-model="selectedHomeComponent.style.background.bgColor" />
										</div>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'image'" class="form-item">
										<div class="form-label">选择图片</div>
										<label class="upload-box wide-upload">
											<img v-if="selectedHomeComponent.style.background.bgImage" :src="assetUrl(selectedHomeComponent.style.background.bgImage)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadHomeBackground($event, selectedHomeComponent)" />
										</label>
									</div>
									<div class="form-item">
										<div class="form-label">上间距</div>
										<el-slider v-model="selectedHomeComponent.style.marginTop" :min="0" :max="60" class="form-slider" />
									</div>
									<div class="form-item">
										<div class="form-label">右间距</div>
										<el-slider v-model="selectedHomeComponent.style.marginRight" :min="0" :max="60" class="form-slider" />
									</div>
									<div class="form-item">
										<div class="form-label">下间距</div>
										<el-slider v-model="selectedHomeComponent.style.marginBottom" :min="0" :max="60" class="form-slider" />
									</div>
									<div class="form-item">
										<div class="form-label">左间距</div>
										<el-slider v-model="selectedHomeComponent.style.marginLeft" :min="0" :max="60" class="form-slider" />
									</div>
									<div class="form-item">
										<div class="form-label">上圆角</div>
										<el-slider v-model="selectedHomeComponent.style.borderRadiusTop" :min="0" :max="32" class="form-slider" />
									</div>
									<div class="form-item">
										<div class="form-label">下圆角</div>
										<el-slider v-model="selectedHomeComponent.style.borderRadiusBottom" :min="0" :max="32" class="form-slider" />
									</div>
									<div class="form-item">
										<div class="form-label">内间距</div>
										<el-slider v-model="selectedHomeComponent.style.padding" :min="0" :max="60" class="form-slider" />
									</div>
								</div>
							</div>
						</template>

						<pre v-else class="css-card">{{ JSON.stringify(selectedHomeComponent, null, 2) }}</pre>
					</template>

					<template v-else-if="currentType === 'noticeBlock' && selectedHomeComponent?.type === 'noticeBlock'">
						<template v-if="activeTab === 'data'">
							<div class="card">
								<div class="title">公告图标</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">公告样式</div>
										<el-radio-group v-model="selectedHomeComponent.data.mode" class="radio-row">
											<el-radio :label="1">系统图标</el-radio>
											<el-radio :label="2">自定义</el-radio>
										</el-radio-group>
									</div>
									<div v-if="selectedHomeComponent.data.mode === 1" class="form-item">
										<div class="form-label">公告图</div>
										<div class="notice-image-list">
											<img
												v-for="item in noticeImages"
												:key="item"
												:class="{ 'is-active': selectedHomeComponent.data.src === item }"
												:src="item"
												alt=""
												@click="selectedHomeComponent.data.src = item"
											/>
										</div>
									</div>
									<div v-if="selectedHomeComponent.data.mode === 2" class="form-item">
										<div class="form-label">图片</div>
										<label class="upload-box">
											<img v-if="selectedHomeComponent.data.src" :src="assetUrl(selectedHomeComponent.data.src)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadNoticeImage($event, selectedHomeComponent)" />
										</label>
										<span class="tip">建议尺寸：24*24</span>
									</div>
								</div>
							</div>
							<div class="card">
								<div class="title">内容设置</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">公告内容</div>
										<div class="text-color-input">
											<input v-model="selectedHomeComponent.data.title.text" class="text-input" placeholder="请输入公告内容" />
											<el-color-picker v-model="selectedHomeComponent.data.title.color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
										</div>
									</div>
									<div class="form-item">
										<div class="form-label">链接</div>
										<input v-model="selectedHomeComponent.data.url" class="text-input" placeholder="暂不选择" />
									</div>
								</div>
							</div>
						</template>
						<template v-else-if="activeTab === 'style'">
							<div class="card">
								<div class="title">组件样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">组件背景</div>
										<el-radio-group v-model="selectedHomeComponent.style.background.type" class="radio-row">
											<el-radio label="color">纯色</el-radio>
											<el-radio label="image">图片</el-radio>
										</el-radio-group>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'color'" class="form-item">
										<div class="form-label">选择颜色</div>
										<div class="color-input">
											<el-color-picker v-model="selectedHomeComponent.style.background.bgColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											<el-input v-model="selectedHomeComponent.style.background.bgColor" />
										</div>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'image'" class="form-item">
										<div class="form-label">选择图片</div>
										<label class="upload-box wide-upload">
											<img v-if="selectedHomeComponent.style.background.bgImage" :src="assetUrl(selectedHomeComponent.style.background.bgImage)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadHomeBackground($event, selectedHomeComponent)" />
										</label>
									</div>
									<div v-for="field in styleSliderFields" :key="field.key" class="form-item">
										<div class="form-label">{{ field.label }}</div>
										<el-slider v-model="selectedHomeComponent.style[field.key]" :min="0" :max="field.max" class="form-slider" />
									</div>
								</div>
							</div>
						</template>
						<pre v-else class="css-card">{{ JSON.stringify(selectedHomeComponent, null, 2) }}</pre>
					</template>

					<template v-else-if="currentType === 'menuButton' && selectedHomeComponent?.type === 'menuButton'">
						<template v-if="activeTab === 'data'">
							<div class="card">
								<div class="title">样式选择</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">菜单布局</div>
										<el-radio-group v-model="selectedHomeComponent.data.layout" class="radio-row">
											<el-radio :label="1">图片+文字</el-radio>
											<el-radio :label="2">图片</el-radio>
										</el-radio-group>
									</div>
									<div class="form-item">
										<div class="form-label">列数</div>
										<el-radio-group v-model="selectedHomeComponent.data.col" class="radio-row">
											<el-radio :label="3">3个</el-radio>
											<el-radio :label="4">4个</el-radio>
											<el-radio :label="5">5个</el-radio>
										</el-radio-group>
									</div>
									<div class="form-item">
										<div class="form-label">行数</div>
										<el-radio-group v-model="selectedHomeComponent.data.row" class="radio-row">
											<el-radio :label="1">1行</el-radio>
											<el-radio :label="2">2行</el-radio>
										</el-radio-group>
									</div>
								</div>
							</div>
							<div class="card d-list">
								<div class="title">图标设置</div>
								<div v-for="(item, index) in selectedHomeComponent.data.list" :key="index" class="list-item">
									<div class="list-move">
										<span>菜单 {{ index + 1 }}</span>
										<button class="delete-button" type="button" @click="removeMenuButtonItem(index)">删除</button>
									</div>
									<div class="form-item">
										<div class="form-label">图标</div>
										<label class="upload-box">
											<img v-if="item.src" :src="assetUrl(item.src)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadMenuButtonImage($event, item)" />
										</label>
										<span class="tip">建议尺寸：98*98</span>
									</div>
									<div class="form-item">
										<div class="form-label">标题</div>
										<div class="text-color-input">
											<input v-model="item.title.text" class="text-input" maxlength="4" placeholder="请输入标题" />
											<el-color-picker v-model="item.title.color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
										</div>
									</div>
									<div class="form-item">
										<div class="form-label">链接</div>
										<input v-model="item.url" class="text-input" placeholder="暂不选择" />
									</div>
									<div class="form-item">
										<div class="form-label">标签</div>
										<el-switch v-model="item.badge.show" :active-value="1" :inactive-value="0" />
									</div>
									<template v-if="item.badge.show">
										<div class="form-item">
											<div class="form-label">标签内容</div>
											<div class="text-color-input">
												<input v-model="item.badge.text" class="text-input" maxlength="4" placeholder="请输入标签内容" />
												<el-color-picker v-model="item.badge.color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											</div>
										</div>
										<div class="form-item">
											<div class="form-label">标签背景</div>
											<div class="color-input">
												<el-color-picker v-model="item.badge.bgColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
												<el-input v-model="item.badge.bgColor" />
											</div>
										</div>
									</template>
								</div>
								<button class="add-button" type="button" @click="addMenuButtonItem">+ 添加</button>
							</div>
						</template>
						<template v-else-if="activeTab === 'style'">
							<div class="card">
								<div class="title">组件样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">组件背景</div>
										<el-radio-group v-model="selectedHomeComponent.style.background.type" class="radio-row">
											<el-radio label="color">纯色</el-radio>
											<el-radio label="image">图片</el-radio>
										</el-radio-group>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'color'" class="form-item">
										<div class="form-label">选择颜色</div>
										<div class="color-input">
											<el-color-picker v-model="selectedHomeComponent.style.background.bgColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											<el-input v-model="selectedHomeComponent.style.background.bgColor" />
										</div>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'image'" class="form-item">
										<div class="form-label">选择图片</div>
										<label class="upload-box wide-upload">
											<img v-if="selectedHomeComponent.style.background.bgImage" :src="assetUrl(selectedHomeComponent.style.background.bgImage)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadHomeBackground($event, selectedHomeComponent)" />
										</label>
									</div>
									<div v-for="field in styleSliderFields" :key="field.key" class="form-item">
										<div class="form-label">{{ field.label }}</div>
										<el-slider v-model="selectedHomeComponent.style[field.key]" :min="0" :max="field.max" class="form-slider" />
									</div>
								</div>
							</div>
						</template>
						<pre v-else class="css-card">{{ JSON.stringify(selectedHomeComponent, null, 2) }}</pre>
					</template>

					<template v-else-if="currentType === 'menuList' && selectedHomeComponent?.type === 'menuList'">
						<template v-if="activeTab === 'data'">
							<div class="card d-list">
								<div class="title">菜单设置</div>
								<div v-for="(item, index) in selectedHomeComponent.data.list" :key="index" class="list-item">
									<div class="list-move">
										<span>菜单 {{ index + 1 }}</span>
										<button class="delete-button" type="button" @click="removeMenuListItem(index)">删除</button>
									</div>
									<div class="form-item">
										<div class="form-label">图标</div>
										<label class="upload-box">
											<img v-if="item.src" :src="assetUrl(item.src)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadMenuListImage($event, item)" />
										</label>
										<span class="tip">建议尺寸：44*44</span>
									</div>
									<div class="form-item">
										<div class="form-label">标题</div>
										<div class="text-color-input">
											<input v-model="item.title.text" class="text-input" maxlength="4" placeholder="请输入标题" />
											<el-color-picker v-model="item.title.color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
										</div>
									</div>
									<div class="form-item">
										<div class="form-label">功能提示</div>
										<div class="text-color-input">
											<input v-model="item.tip.text" class="text-input" maxlength="4" placeholder="请输入功能提示" />
											<el-color-picker v-model="item.tip.color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
										</div>
									</div>
									<div class="form-item">
										<div class="form-label">链接</div>
										<input v-model="item.url" class="text-input" placeholder="暂不选择" />
									</div>
								</div>
								<button class="add-button" type="button" @click="addMenuListItem">+ 添加</button>
							</div>
						</template>
						<template v-else-if="activeTab === 'style'">
							<div class="card">
								<div class="title">组件样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">组件背景</div>
										<el-radio-group v-model="selectedHomeComponent.style.background.type" class="radio-row">
											<el-radio label="color">纯色</el-radio>
											<el-radio label="image">图片</el-radio>
										</el-radio-group>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'color'" class="form-item">
										<div class="form-label">选择颜色</div>
										<div class="color-input">
											<el-color-picker v-model="selectedHomeComponent.style.background.bgColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											<el-input v-model="selectedHomeComponent.style.background.bgColor" />
										</div>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'image'" class="form-item">
										<div class="form-label">选择图片</div>
										<label class="upload-box wide-upload">
											<img v-if="selectedHomeComponent.style.background.bgImage" :src="assetUrl(selectedHomeComponent.style.background.bgImage)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadHomeBackground($event, selectedHomeComponent)" />
										</label>
									</div>
									<div v-for="field in styleSliderFields" :key="field.key" class="form-item">
										<div class="form-label">{{ field.label }}</div>
										<el-slider v-model="selectedHomeComponent.style[field.key]" :min="0" :max="field.max" class="form-slider" />
									</div>
								</div>
							</div>
						</template>
						<pre v-else class="css-card">{{ JSON.stringify(selectedHomeComponent, null, 2) }}</pre>
					</template>

					<template v-else-if="currentType === 'menuGrid' && selectedHomeComponent?.type === 'menuGrid'">
						<template v-if="activeTab === 'data'">
							<div class="card">
								<div class="title">样式选择</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">每行数量</div>
										<el-radio-group v-model="selectedHomeComponent.data.col" class="radio-row">
											<el-radio :label="3">3个</el-radio>
											<el-radio :label="4">4个</el-radio>
										</el-radio-group>
									</div>
								</div>
							</div>
							<div class="card d-list">
								<div class="title">图标设置</div>
								<div v-for="(item, index) in selectedHomeComponent.data.list" :key="index" class="list-item">
									<div class="list-move">
										<span>宫格 {{ index + 1 }}</span>
										<button class="delete-button" type="button" @click="removeMenuGridItem(index)">删除</button>
									</div>
									<div class="form-item">
										<div class="form-label">图标</div>
										<label class="upload-box">
											<img v-if="item.src" :src="assetUrl(item.src)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadMenuGridImage($event, item)" />
										</label>
										<span class="tip">建议尺寸：44*44</span>
									</div>
									<div class="form-item">
										<div class="form-label">标题</div>
										<div class="text-color-input">
											<input v-model="item.title.text" class="text-input" maxlength="4" placeholder="请输入标题" />
											<el-color-picker v-model="item.title.color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
										</div>
									</div>
									<div class="form-item">
										<div class="form-label">功能提示</div>
										<div class="text-color-input">
											<input v-model="item.tip.text" class="text-input" maxlength="4" placeholder="请输入功能提示" />
											<el-color-picker v-model="item.tip.color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
										</div>
									</div>
									<div class="form-item">
										<div class="form-label">链接</div>
										<input v-model="item.url" class="text-input" placeholder="暂不选择" />
									</div>
									<div class="form-item">
										<div class="form-label">标签</div>
										<el-switch v-model="item.badge.show" :active-value="1" :inactive-value="0" />
									</div>
									<template v-if="item.badge.show">
										<div class="form-item">
											<div class="form-label">标签内容</div>
											<div class="text-color-input">
												<input v-model="item.badge.text" class="text-input" maxlength="4" placeholder="请输入标签内容" />
												<el-color-picker v-model="item.badge.color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											</div>
										</div>
										<div class="form-item">
											<div class="form-label">标签背景</div>
											<div class="color-input">
												<el-color-picker v-model="item.badge.bgColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
												<el-input v-model="item.badge.bgColor" />
											</div>
										</div>
									</template>
								</div>
								<button class="add-button" type="button" @click="addMenuGridItem">+ 添加</button>
							</div>
						</template>
						<template v-else-if="activeTab === 'style'">
							<div class="card">
								<div class="title">组件样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">组件背景</div>
										<el-radio-group v-model="selectedHomeComponent.style.background.type" class="radio-row">
											<el-radio label="color">纯色</el-radio>
											<el-radio label="image">图片</el-radio>
										</el-radio-group>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'color'" class="form-item">
										<div class="form-label">选择颜色</div>
										<div class="color-input">
											<el-color-picker v-model="selectedHomeComponent.style.background.bgColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											<el-input v-model="selectedHomeComponent.style.background.bgColor" />
										</div>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'image'" class="form-item">
										<div class="form-label">选择图片</div>
										<label class="upload-box wide-upload">
											<img v-if="selectedHomeComponent.style.background.bgImage" :src="assetUrl(selectedHomeComponent.style.background.bgImage)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadHomeBackground($event, selectedHomeComponent)" />
										</label>
									</div>
									<div v-for="field in styleSliderFields" :key="field.key" class="form-item">
										<div class="form-label">{{ field.label }}</div>
										<el-slider v-model="selectedHomeComponent.style[field.key]" :min="0" :max="field.max" class="form-slider" />
									</div>
								</div>
							</div>
						</template>
						<pre v-else class="css-card">{{ JSON.stringify(selectedHomeComponent, null, 2) }}</pre>
					</template>

					<template v-else-if="currentType === 'goodsCard' && selectedHomeComponent?.type === 'goodsCard'">
						<template v-if="activeTab === 'data'">
							<div class="card">
								<div class="title">选择商品</div>
								<div class="wrap">
									<div class="selected-goods">
										<div v-for="goods in selectedHomeComponent.data.goodsList" :key="goods.id" class="selected-goods-item">
											<img v-if="goods.image" :src="assetUrl(goods.image)" alt="" />
											<div v-else class="selected-goods-empty"></div>
											<span>{{ goods.title }}</span>
											<button class="delete-button" type="button" @click="removeGoodsCardGoods(goods.id)">删除</button>
										</div>
										<div v-if="!selectedHomeComponent.data.goodsList.length" class="selected-empty">请选择商品</div>
									</div>
									<button class="add-button inline-button" type="button" @click="openGoodsPicker">选择商品</button>
								</div>
							</div>
							<div class="card">
								<div class="title">商品样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">选择风格</div>
										<el-radio-group v-model="selectedHomeComponent.data.mode" class="radio-row">
											<el-radio :label="1">单列</el-radio>
											<el-radio :label="2">双列</el-radio>
											<el-radio :label="3">横向</el-radio>
										</el-radio-group>
									</div>
									<div v-for="field in goodsFieldList" :key="field.key" class="form-item">
										<div class="form-label">{{ field.label }}</div>
										<el-switch v-model="selectedHomeComponent.data.goodsFields[field.key].show" :active-value="1" :inactive-value="0" />
										<div class="color-input compact-color">
											<el-color-picker v-model="selectedHomeComponent.data.goodsFields[field.key].color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											<el-input v-model="selectedHomeComponent.data.goodsFields[field.key].color" />
										</div>
									</div>
								</div>
							</div>
							<div class="card">
								<div class="title">商品角标</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">角标选择</div>
										<el-radio-group v-model="selectedHomeComponent.data.tagStyle.show" class="radio-row">
											<el-radio :label="0">不显示</el-radio>
											<el-radio :label="1">显示</el-radio>
										</el-radio-group>
									</div>
									<div v-if="selectedHomeComponent.data.tagStyle.show" class="form-item">
										<div class="form-label">上传图片</div>
										<label class="upload-box">
											<img v-if="selectedHomeComponent.data.tagStyle.src" :src="assetUrl(selectedHomeComponent.data.tagStyle.src)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadGoodsTag($event, selectedHomeComponent)" />
										</label>
										<span class="tip">建议尺寸：56*22</span>
									</div>
								</div>
							</div>
							<div class="card">
								<div class="title">加购设置</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">加购按钮</div>
										<el-radio-group v-model="selectedHomeComponent.data.buyNowStyle.mode" class="radio-row">
											<el-radio :label="1">文字</el-radio>
											<el-radio :label="2">图片</el-radio>
										</el-radio-group>
									</div>
									<template v-if="selectedHomeComponent.data.buyNowStyle.mode === 1">
										<div class="form-item">
											<div class="form-label">文字</div>
											<input v-model="selectedHomeComponent.data.buyNowStyle.text" class="text-input" />
										</div>
										<div class="form-item">
											<div class="form-label">背景1</div>
											<div class="color-input">
												<el-color-picker v-model="selectedHomeComponent.data.buyNowStyle.color1" append-to=".right-main" popper-class="decorate-color-picker-popper" />
												<el-input v-model="selectedHomeComponent.data.buyNowStyle.color1" />
											</div>
										</div>
										<div class="form-item">
											<div class="form-label">背景2</div>
											<div class="color-input">
												<el-color-picker v-model="selectedHomeComponent.data.buyNowStyle.color2" append-to=".right-main" popper-class="decorate-color-picker-popper" />
												<el-input v-model="selectedHomeComponent.data.buyNowStyle.color2" />
											</div>
										</div>
									</template>
									<div v-if="selectedHomeComponent.data.buyNowStyle.mode === 2" class="form-item">
										<div class="form-label">图片</div>
										<label class="upload-box">
											<img v-if="selectedHomeComponent.data.buyNowStyle.src" :src="assetUrl(selectedHomeComponent.data.buyNowStyle.src)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadGoodsBuyButton($event, selectedHomeComponent)" />
										</label>
										<span class="tip">建议尺寸：56*56</span>
									</div>
								</div>
							</div>
							<div class="card">
								<div class="title">样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">上圆角</div>
										<el-slider v-model="selectedHomeComponent.data.borderRadiusTop" :min="0" :max="32" class="form-slider" />
									</div>
									<div class="form-item">
										<div class="form-label">下圆角</div>
										<el-slider v-model="selectedHomeComponent.data.borderRadiusBottom" :min="0" :max="32" class="form-slider" />
									</div>
									<div class="form-item">
										<div class="form-label">间距</div>
										<el-slider v-model="selectedHomeComponent.data.space" :min="0" :max="32" class="form-slider" />
									</div>
								</div>
							</div>
						</template>
						<template v-else-if="activeTab === 'style'">
							<div class="card">
								<div class="title">组件样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">组件背景</div>
										<el-radio-group v-model="selectedHomeComponent.style.background.type" class="radio-row">
											<el-radio label="color">纯色</el-radio>
											<el-radio label="image">图片</el-radio>
										</el-radio-group>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'color'" class="form-item">
										<div class="form-label">选择颜色</div>
										<div class="color-input">
											<el-color-picker v-model="selectedHomeComponent.style.background.bgColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											<el-input v-model="selectedHomeComponent.style.background.bgColor" />
										</div>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'image'" class="form-item">
										<div class="form-label">选择图片</div>
										<label class="upload-box wide-upload">
											<img v-if="selectedHomeComponent.style.background.bgImage" :src="assetUrl(selectedHomeComponent.style.background.bgImage)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadHomeBackground($event, selectedHomeComponent)" />
										</label>
									</div>
									<div v-for="field in styleSliderFields" :key="field.key" class="form-item">
										<div class="form-label">{{ field.label }}</div>
										<el-slider v-model="selectedHomeComponent.style[field.key]" :min="0" :max="field.max" class="form-slider" />
									</div>
								</div>
							</div>
						</template>
						<pre v-else class="css-card">{{ JSON.stringify(selectedHomeComponent, null, 2) }}</pre>
					</template>

					<template v-else-if="currentType === 'goodsShelves' && selectedHomeComponent?.type === 'goodsShelves'">
						<template v-if="activeTab === 'data'">
							<div class="card">
								<div class="title">选择商品</div>
								<div class="wrap">
									<div class="selected-goods">
										<div v-for="goods in selectedHomeComponent.data.goodsList" :key="goods.id" class="selected-goods-item">
											<img v-if="goods.image" :src="assetUrl(goods.image)" alt="" />
											<div v-else class="selected-goods-empty"></div>
											<span>{{ goods.title }}</span>
											<button class="delete-button" type="button" @click="removeGoodsComponentGoods(goods.id)">删除</button>
										</div>
										<div v-if="!selectedHomeComponent.data.goodsList.length" class="selected-empty">请选择商品</div>
									</div>
									<button class="add-button inline-button" type="button" @click="openGoodsPicker">选择商品</button>
								</div>
							</div>
							<div class="card">
								<div class="title">商品样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">选择风格</div>
										<el-radio-group v-model="selectedHomeComponent.data.mode" class="radio-row">
											<el-radio :label="1">双列</el-radio>
											<el-radio :label="2">三列</el-radio>
											<el-radio :label="3">横向</el-radio>
										</el-radio-group>
									</div>
									<div v-for="field in goodsShelvesFieldList" :key="field.key" class="form-item">
										<div class="form-label">{{ field.label }}</div>
										<el-switch v-model="selectedHomeComponent.data.goodsFields[field.key].show" :active-value="1" :inactive-value="0" />
										<div class="color-input compact-color">
											<el-color-picker v-model="selectedHomeComponent.data.goodsFields[field.key].color" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											<el-input v-model="selectedHomeComponent.data.goodsFields[field.key].color" />
										</div>
									</div>
								</div>
							</div>
							<div class="card">
								<div class="title">商品角标</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">角标选择</div>
										<el-radio-group v-model="selectedHomeComponent.data.tagStyle.show" class="radio-row">
											<el-radio :label="0">不显示</el-radio>
											<el-radio :label="1">显示</el-radio>
										</el-radio-group>
									</div>
									<div v-if="selectedHomeComponent.data.tagStyle.show" class="form-item">
										<div class="form-label">上传图片</div>
										<label class="upload-box">
											<img v-if="selectedHomeComponent.data.tagStyle.src" :src="assetUrl(selectedHomeComponent.data.tagStyle.src)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadGoodsShelvesTag($event, selectedHomeComponent)" />
										</label>
										<span class="tip">建议尺寸：56*22</span>
									</div>
								</div>
							</div>
							<div class="card">
								<div class="title">样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">上圆角</div>
										<el-slider v-model="selectedHomeComponent.data.borderRadiusTop" :min="0" :max="32" class="form-slider" />
									</div>
									<div class="form-item">
										<div class="form-label">下圆角</div>
										<el-slider v-model="selectedHomeComponent.data.borderRadiusBottom" :min="0" :max="32" class="form-slider" />
									</div>
									<div class="form-item">
										<div class="form-label">间距</div>
										<el-slider v-model="selectedHomeComponent.data.space" :min="0" :max="32" class="form-slider" />
									</div>
								</div>
							</div>
						</template>
						<template v-else-if="activeTab === 'style'">
							<div class="card">
								<div class="title">组件样式</div>
								<div class="wrap">
									<div class="form-item">
										<div class="form-label">组件背景</div>
										<el-radio-group v-model="selectedHomeComponent.style.background.type" class="radio-row">
											<el-radio label="color">纯色</el-radio>
											<el-radio label="image">图片</el-radio>
										</el-radio-group>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'color'" class="form-item">
										<div class="form-label">选择颜色</div>
										<div class="color-input">
											<el-color-picker v-model="selectedHomeComponent.style.background.bgColor" append-to=".right-main" popper-class="decorate-color-picker-popper" />
											<el-input v-model="selectedHomeComponent.style.background.bgColor" />
										</div>
									</div>
									<div v-if="selectedHomeComponent.style.background.type === 'image'" class="form-item">
										<div class="form-label">选择图片</div>
										<label class="upload-box wide-upload">
											<img v-if="selectedHomeComponent.style.background.bgImage" :src="assetUrl(selectedHomeComponent.style.background.bgImage)" alt="" />
											<span v-else>上传</span>
											<input type="file" accept="image/*" @change="uploadHomeBackground($event, selectedHomeComponent)" />
										</label>
									</div>
									<div v-for="field in styleSliderFields" :key="field.key" class="form-item">
										<div class="form-label">{{ field.label }}</div>
										<el-slider v-model="selectedHomeComponent.style[field.key]" :min="0" :max="field.max" class="form-slider" />
									</div>
								</div>
							</div>
						</template>
						<pre v-else class="css-card">{{ JSON.stringify(selectedHomeComponent, null, 2) }}</pre>
					</template>

					<div v-else class="card">
						<div class="title">配置面板</div>
						<div class="wrap">
							<div class="panel-placeholder">请选择底部导航</div>
						</div>
					</div>
					</div>
				</div>
				<div class="right-icon">›</div>
			</aside>
		</div>
		<el-dialog v-model="goodsPickerVisible" title="选择商品" width="760px" destroy-on-close>
			<div class="dialog-toolbar">
				<el-input v-model="goodsPickerKeyword" clearable placeholder="请输入商品名称" style="width: 220px" />
				<el-button type="primary" @click="loadGoodsOptions">查询</el-button>
			</div>
			<el-table v-loading="goodsPickerLoading" :data="filteredGoodsOptions" border @selection-change="handleGoodsPickerSelection">
				<el-table-column type="selection" width="60" align="center" />
				<el-table-column label="图片" width="90" align="center">
					<template #default="{ row }">
						<el-image v-if="row.image" :src="assetUrl(row.image)" fit="cover" class="goods-thumb" :preview-src-list="[assetUrl(row.image)]" preview-teleported />
						<div v-else class="goods-thumb goods-thumb--empty">暂无图片</div>
					</template>
				</el-table-column>
				<el-table-column prop="title" label="名称" min-width="280" />
				<el-table-column label="价格" width="120" align="center">
					<template #default="{ row }">￥{{ formatGoodsPrice(row.price) }}</template>
				</el-table-column>
			</el-table>
			<template #footer>
				<el-button @click="goodsPickerVisible = false">取消</el-button>
				<el-button type="primary" @click="confirmGoodsPicker">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="ShopDecoratePage">
import { computed, reactive, ref, watch } from "vue";
import { useUserStore } from "@/pinia";
import { ShopService } from "@/common/api/shop";

const basicItems = [
	{ name: "底部导航", type: "tabbar" },
	{ name: "悬浮按钮", type: "floatMenu" },
	{ name: "弹窗广告", type: "popupImage" },
];
const homeItems = [
	{ name: "搜索框", type: "searchBlock" },
	{ name: "公告栏", type: "noticeBlock" },
	{ name: "菜单导航", type: "menuButton" },
	{ name: "列表导航", type: "menuList" },
	{ name: "宫格导航", type: "menuGrid" },
];
const goodsItems = [
	{ name: "商品卡片", type: "goodsCard" },
	{ name: "商品栏", type: "goodsShelves" },
];
const noticeImages = ["/assets/decorate/notice/1.png", "/assets/decorate/notice/2.png", "/assets/decorate/notice/3.png"];
const styleSliderFields: { key: keyof Pick<ComponentStyle, "marginTop" | "marginRight" | "marginBottom" | "marginLeft" | "borderRadiusTop" | "borderRadiusBottom" | "padding">; label: string; max: number }[] = [
	{ key: "marginTop", label: "上间距", max: 60 },
	{ key: "marginRight", label: "右间距", max: 60 },
	{ key: "marginBottom", label: "下间距", max: 60 },
	{ key: "marginLeft", label: "左间距", max: 60 },
	{ key: "borderRadiusTop", label: "上圆角", max: 32 },
	{ key: "borderRadiusBottom", label: "下圆角", max: 32 },
	{ key: "padding", label: "内间距", max: 60 },
];

const pageType = ref<"basic" | "home" | "user">("basic");
const currentType = ref("");
const currentTitle = computed(() => {
	const items = pageType.value === "home" ? [...homeItems, ...goodsItems] : basicItems;
	return items.find(item => item.type === currentType.value)?.name || "页面设置";
});
const activeTab = ref<"data" | "style" | "css">("data");
const componentTabs = reactive<Record<string, "data" | "style" | "css">>({
	tabbar: "data",
	floatMenu: "data",
	popupImage: "data",
	searchBlock: "data",
	noticeBlock: "data",
	menuButton: "data",
	menuList: "data",
	menuGrid: "data",
	goodsCard: "data",
	goodsShelves: "data",
});
const goodsFieldList: { key: keyof GoodsCardFields; label: string }[] = [
	{ key: "title", label: "商品标题" },
	{ key: "subtitle", label: "副标题" },
	{ key: "price", label: "商品价格" },
	{ key: "original_price", label: "原价" },
	{ key: "sales", label: "销量" },
	{ key: "stock", label: "库存" },
];
const goodsShelvesFieldList: { key: keyof GoodsShelvesFields; label: string }[] = [
	{ key: "title", label: "商品标题" },
	{ key: "price", label: "商品价格" },
];
const userStore = useUserStore();
const floatMenuFolded = ref(false);

type TabbarItem = {
	inactiveIcon: string;
	activeIcon: string;
	url: string;
	text: string;
};

type FloatMenuItem = {
	src: string;
	url: string;
	title: {
		text: string;
		color: string;
	};
};

type PopupImageItem = {
	src: string;
	url: string;
	show: number;
};

type SearchKeyword = {
	text: string;
	color: string;
};

type SearchBlockComponent = {
	id: number;
	type: "searchBlock";
	data: {
		placeholder: string;
		borderRadius: number;
		keywords: SearchKeyword[];
	};
	style: {
		background: {
			type: "color" | "image";
			bgImage: string;
			bgColor: string;
		};
		marginLeft: number;
		marginRight: number;
		marginTop: number;
		marginBottom: number;
		borderRadiusTop: number;
		borderRadiusBottom: number;
		padding: number;
	};
};

type NoticeBlockComponent = {
	id: number;
	type: "noticeBlock";
	data: {
		mode: number;
		src: string;
		title: {
			text: string;
			color: string;
		};
		url: string;
	};
	style: ComponentStyle;
};

type MenuButtonItem = {
	src: string;
	title: {
		text: string;
		color: string;
	};
	url: string;
	badge: {
		show: number;
		text: string;
		color: string;
		bgColor: string;
	};
};

type MenuButtonComponent = {
	id: number;
	type: "menuButton";
	data: {
		layout: number;
		col: number;
		row: number;
		list: MenuButtonItem[];
	};
	style: ComponentStyle;
};

type MenuListItem = {
	src: string;
	title: {
		text: string;
		color: string;
	};
	tip: {
		text: string;
		color: string;
	};
	url: string;
};

type MenuListComponent = {
	id: number;
	type: "menuList";
	data: {
		list: MenuListItem[];
	};
	style: ComponentStyle;
};

type MenuGridItem = MenuListItem & {
	badge: {
		show: number;
		text: string;
		color: string;
		bgColor: string;
	};
};

type MenuGridComponent = {
	id: number;
	type: "menuGrid";
	data: {
		col: number;
		list: MenuGridItem[];
	};
	style: ComponentStyle;
};

type ComponentStyle = {
	background: {
		type: "color" | "image";
		bgImage: string;
		bgColor: string;
	};
	marginLeft: number;
	marginRight: number;
	marginTop: number;
	marginBottom: number;
	borderRadiusTop: number;
	borderRadiusBottom: number;
	padding: number;
};

type GoodsOption = {
	id: number;
	title: string;
	subtitle: string;
	image: string;
	price: number | string;
	original_price: number | string;
	sales: number;
	stock: number;
	promos?: { title: string }[];
};

type GoodsCardField = {
	show: number;
	color: string;
};

type GoodsCardFields = {
	title: GoodsCardField;
	subtitle: GoodsCardField;
	price: GoodsCardField;
	original_price: GoodsCardField;
	sales: GoodsCardField;
	stock: GoodsCardField;
};

type GoodsCardComponent = {
	id: number;
	type: "goodsCard";
	data: {
		mode: number;
		goodsFields: GoodsCardFields;
		buyNowStyle: {
			mode: number;
			text: string;
			color1: string;
			color2: string;
			src: string;
		};
		tagStyle: {
			show: number;
			src: string;
		};
		goodsIds: number[];
		goodsList: GoodsOption[];
		borderRadiusTop: number;
		borderRadiusBottom: number;
		space: number;
	};
	style: ComponentStyle;
};

type GoodsShelvesFields = {
	title: GoodsCardField;
	price: GoodsCardField;
};

type GoodsShelvesComponent = {
	id: number;
	type: "goodsShelves";
	data: {
		mode: number;
		goodsFields: GoodsShelvesFields;
		tagStyle: {
			show: number;
			src: string;
		};
		goodsIds: number[];
		goodsList: GoodsOption[];
		borderRadiusTop: number;
		borderRadiusBottom: number;
		space: number;
	};
	style: ComponentStyle;
};

type GoodsComponent = GoodsCardComponent | GoodsShelvesComponent;

type HomeComponent = SearchBlockComponent | NoticeBlockComponent | MenuButtonComponent | MenuListComponent | MenuGridComponent | GoodsCardComponent | GoodsShelvesComponent;

const tabbar = reactive({
	mode: 1,
	layout: 1,
	inactiveColor: "#EEEEEE",
	activeColor: "#000000",
	list: [
		{ inactiveIcon: "", activeIcon: "", url: "", text: "首页" },
		{ inactiveIcon: "", activeIcon: "", url: "", text: "分类" },
		{ inactiveIcon: "", activeIcon: "", url: "", text: "购物车" },
		{ inactiveIcon: "", activeIcon: "", url: "", text: "我的" },
	] as TabbarItem[],
	background: {
		type: "color",
		bgImage: "",
		bgColor: "#FFFFFF",
	},
});

const floatMenu = reactive({
	show: 0,
	mode: 1,
	isText: 0,
	list: [
		{ src: "", url: "", title: { text: "客服", color: "#333333" } },
	] as FloatMenuItem[],
});

const popupImage = reactive({
	list: [] as PopupImageItem[],
});
const popupImageCurrent = ref(-1);
const homeComponents = reactive<HomeComponent[]>([]);
const currentHomeIndex = ref(-1);
const goodsPickerVisible = ref(false);
const goodsPickerLoading = ref(false);
const goodsPickerKeyword = ref("");
const goodsOptions = ref<GoodsOption[]>([]);
const goodsPickerSelection = ref<GoodsOption[]>([]);
let componentId = 1;

const selectedHomeComponent = computed(() => {
	return homeComponents[currentHomeIndex.value];
});
const filteredGoodsOptions = computed(() => {
	const keyword = goodsPickerKeyword.value.trim().toLowerCase();
	if (!keyword) return goodsOptions.value;
	return goodsOptions.value.filter(item => item.title.toLowerCase().includes(keyword));
});

function changePageType(type: "basic" | "home" | "user") {
	pageType.value = type;
	activeTab.value = "data";
	if (type === "basic") {
		currentType.value = "";
		return;
	}
	if (type === "home") {
		const component = selectedHomeComponent.value;
		currentType.value = component?.type || "";
		return;
	}
	currentType.value = "";
}

function selectBasicItem(type: string) {
	if (currentType.value && availableTabs(currentType.value).includes(activeTab.value)) {
		componentTabs[currentType.value] = activeTab.value;
	}
	const nextTab = normalizeTab(type, componentTabs[type] || "data");
	activeTab.value = nextTab;
	currentType.value = type;
}

function availableTabs(type: string) {
	if (!type) return ["data", "css"];
	return ["floatMenu", "popupImage"].includes(type) ? ["data", "css"] : ["data", "style", "css"];
}

function normalizeTab(type: string, tab: "data" | "style" | "css" = "data") {
	return availableTabs(type).includes(tab) ? tab : "data";
}

watch(activeTab, tab => {
	if (!currentType.value) return;
	const safeTab = normalizeTab(currentType.value, tab);
	if (safeTab !== tab) {
		activeTab.value = safeTab;
		return;
	}
	componentTabs[currentType.value] = safeTab;
});

function createSearchBlock(): SearchBlockComponent {
	return {
		id: componentId++,
		type: "searchBlock",
		data: {
			placeholder: "",
			borderRadius: 0,
			keywords: [],
		},
		style: createComponentStyle(),
	};
}

function createComponentStyle(): ComponentStyle {
	return {
		background: {
			type: "color",
			bgImage: "",
			bgColor: "#FFFFFF",
		},
		marginLeft: 0,
		marginRight: 0,
		marginTop: 0,
		marginBottom: 10,
		borderRadiusTop: 0,
		borderRadiusBottom: 0,
		padding: 0,
	};
}

function createNoticeBlock(): NoticeBlockComponent {
	return {
		id: componentId++,
		type: "noticeBlock",
		data: {
			mode: 1,
			src: noticeImages[0],
			title: {
				text: "",
				color: "#111111",
			},
			url: "",
		},
		style: createComponentStyle(),
	};
}

function createMenuButtonItem(): MenuButtonItem {
	return {
		src: "",
		title: {
			text: "",
			color: "#000000",
		},
		url: "",
		badge: {
			show: 0,
			text: "",
			color: "#FFFFFF",
			bgColor: "#FF6000",
		},
	};
}

function createMenuButton(): MenuButtonComponent {
	return {
		id: componentId++,
		type: "menuButton",
		data: {
			layout: 1,
			col: 3,
			row: 1,
			list: [],
		},
		style: createComponentStyle(),
	};
}

function createMenuListItem(): MenuListItem {
	return {
		src: "",
		title: {
			text: "",
			color: "#333333",
		},
		tip: {
			text: "",
			color: "#bbbbbb",
		},
		url: "",
	};
}

function createMenuList(): MenuListComponent {
	return {
		id: componentId++,
		type: "menuList",
		data: {
			list: [],
		},
		style: createComponentStyle(),
	};
}

function createMenuGridItem(): MenuGridItem {
	return {
		...createMenuListItem(),
		badge: {
			show: 0,
			text: "",
			color: "#FFFFFF",
			bgColor: "#FF6000",
		},
	};
}

function createMenuGrid(): MenuGridComponent {
	return {
		id: componentId++,
		type: "menuGrid",
		data: {
			col: 3,
			list: [createMenuGridItem()],
		},
		style: createComponentStyle(),
	};
}

function createGoodsCard(): GoodsCardComponent {
	const style = createComponentStyle();
	style.background.bgColor = "";
	style.marginLeft = 8;
	style.marginRight = 8;
	return {
		id: componentId++,
		type: "goodsCard",
		data: {
			mode: 1,
			goodsFields: {
				title: { show: 1, color: "#000000" },
				subtitle: { show: 1, color: "#999999" },
				price: { show: 1, color: "#ff3000" },
				original_price: { show: 1, color: "#c4c4c4" },
				sales: { show: 1, color: "#c4c4c4" },
				stock: { show: 0, color: "#c4c4c4" },
			},
			buyNowStyle: {
				mode: 1,
				text: "立即购买",
				color1: "#ff6000",
				color2: "#fe8c00",
				src: "",
			},
			tagStyle: {
				show: 0,
				src: "",
			},
			goodsIds: [],
			goodsList: [],
			borderRadiusTop: 0,
			borderRadiusBottom: 0,
			space: 8,
		},
		style,
	};
}

function createGoodsShelves(): GoodsShelvesComponent {
	const style = createComponentStyle();
	style.background.bgColor = "#FFFFFF";
	return {
		id: componentId++,
		type: "goodsShelves",
		data: {
			mode: 1,
			goodsFields: {
				title: { show: 1, color: "#333333" },
				price: { show: 1, color: "#ff3000" },
			},
			tagStyle: {
				show: 0,
				src: "",
			},
			goodsIds: [],
			goodsList: [],
			borderRadiusTop: 0,
			borderRadiusBottom: 0,
			space: 0,
		},
		style,
	};
}

function addHomeComponent(type: string) {
	const componentMap: Record<string, () => HomeComponent> = {
		searchBlock: createSearchBlock,
		noticeBlock: createNoticeBlock,
		menuButton: createMenuButton,
		menuList: createMenuList,
		menuGrid: createMenuGrid,
		goodsCard: createGoodsCard,
		goodsShelves: createGoodsShelves,
	};
	const component = componentMap[type]?.();
	if (!component) return;
	homeComponents.push(component);
	selectHomeComponent(homeComponents.length - 1);
}

function cloneHomeComponent(component: HomeComponent): HomeComponent {
	return JSON.parse(JSON.stringify({ ...component, id: componentId++ }));
}

function selectHomeComponent(index: number) {
	const component = homeComponents[index];
	if (!component) return;
	currentHomeIndex.value = index;
	currentType.value = component.type;
	activeTab.value = normalizeTab(component.type, componentTabs[component.type] || "data");
}

function moveHomeComponent(index: number, offset: number) {
	const nextIndex = index + offset;
	if (nextIndex < 0 || nextIndex >= homeComponents.length) return;
	const [component] = homeComponents.splice(index, 1);
	homeComponents.splice(nextIndex, 0, component);
	selectHomeComponent(nextIndex);
}

function copyHomeComponent(index: number) {
	const component = homeComponents[index];
	if (!component) return;
	homeComponents.splice(index + 1, 0, cloneHomeComponent(component));
	selectHomeComponent(index + 1);
}

function removeHomeComponent(index: number) {
	homeComponents.splice(index, 1);
	if (!homeComponents.length) {
		currentHomeIndex.value = -1;
		currentType.value = "";
		activeTab.value = "data";
		return;
	}
	selectHomeComponent(Math.min(index, homeComponents.length - 1));
}

function componentLabel(type: string) {
	return homeItems.find(item => item.type === type)?.name || type;
}

function componentWrapStyle(component: HomeComponent) {
	const style = component.style;
	return {
		backgroundColor: style.background.type === "color" ? style.background.bgColor : "",
		backgroundImage: style.background.type === "image" && style.background.bgImage ? `url('${assetUrl(style.background.bgImage)}')` : "",
		margin: `${style.marginTop}px ${style.marginRight}px ${style.marginBottom}px ${style.marginLeft}px`,
		borderRadius: `${style.borderRadiusTop}px ${style.borderRadiusTop}px ${style.borderRadiusBottom}px ${style.borderRadiusBottom}px`,
		padding: `${style.padding}px`,
	};
}

function goodsCardWidth(mode: number) {
	return mode === 2 ? "50%" : "100%";
}

function goodsShelvesWidth(mode: number) {
	if (mode === 1) return "50%";
	if (mode === 2) return "33.333%";
	return "32%";
}

function formatGoodsPrice(value: number | string = 0) {
	const num = Number(Array.isArray(value) ? value[0] : value);
	return Number.isFinite(num) ? num.toFixed(2) : "0.00";
}

function buyButtonStyle(component: GoodsCardComponent) {
	const style = component.data.buyNowStyle;
	return {
		background: style.mode === 1 ? `linear-gradient(90deg, ${style.color1}, ${style.color2})` : "transparent",
	};
}

function assetUrl(src: string) {
	if (!src) return "";
	const normalized = String(src).replace(/\\/g, "/");
	if (/^(https?:)?\/\//.test(normalized) || normalized.startsWith("data:")) return encodeURI(normalized);
	return encodeURI(normalized.startsWith("/") ? normalized : `/${normalized}`);
}

function addTabbarItem() {
	tabbar.list.push({ inactiveIcon: "", activeIcon: "", url: "", text: "" });
}

function removeTabbarItem(index: number) {
	tabbar.list.splice(index, 1);
}

function addFloatMenuItem() {
	floatMenu.list.push({ src: "", url: "", title: { text: "", color: "#333333" } });
}

function removeFloatMenuItem(index: number) {
	floatMenu.list.splice(index, 1);
}

function addPopupImageItem() {
	popupImage.list.push({ src: "", url: "", show: 1 });
	popupImageCurrent.value = popupImage.list.length - 1;
}

function removePopupImageItem(index: number) {
	popupImage.list.splice(index, 1);
	if (popupImageCurrent.value >= popupImage.list.length) {
		popupImageCurrent.value = popupImage.list.length - 1;
	}
}

function addSearchKeyword() {
	const component = selectedHomeComponent.value;
	if (component?.type !== "searchBlock" || component.data.keywords.length >= 3) return;
	component.data.keywords.push({ text: "", color: "#8C8C8C" });
}

function removeSearchKeyword(index: number) {
	const component = selectedHomeComponent.value;
	if (component?.type !== "searchBlock") return;
	component.data.keywords.splice(index, 1);
}

function addMenuButtonItem() {
	const component = selectedHomeComponent.value;
	if (component?.type !== "menuButton") return;
	component.data.list.push(createMenuButtonItem());
}

function removeMenuButtonItem(index: number) {
	const component = selectedHomeComponent.value;
	if (component?.type !== "menuButton") return;
	component.data.list.splice(index, 1);
}

function addMenuListItem() {
	const component = selectedHomeComponent.value;
	if (component?.type !== "menuList") return;
	component.data.list.push(createMenuListItem());
}

function removeMenuListItem(index: number) {
	const component = selectedHomeComponent.value;
	if (component?.type !== "menuList") return;
	component.data.list.splice(index, 1);
}

function addMenuGridItem() {
	const component = selectedHomeComponent.value;
	if (component?.type !== "menuGrid") return;
	component.data.list.push(createMenuGridItem());
}

function removeMenuGridItem(index: number) {
	const component = selectedHomeComponent.value;
	if (component?.type !== "menuGrid") return;
	component.data.list.splice(index, 1);
}

function removeGoodsCardGoods(id: number) {
	const component = selectedHomeComponent.value;
	if (component?.type !== "goodsCard") return;
	removeGoodsFromComponent(component, id);
}

function removeGoodsComponentGoods(id: number) {
	const component = selectedHomeComponent.value;
	if (component?.type !== "goodsCard" && component?.type !== "goodsShelves") return;
	removeGoodsFromComponent(component, id);
}

function removeGoodsFromComponent(component: GoodsComponent, id: number) {
	component.data.goodsList = component.data.goodsList.filter(item => item.id !== id);
	component.data.goodsIds = component.data.goodsList.map(item => item.id);
}

async function openGoodsPicker() {
	goodsPickerVisible.value = true;
	const component = selectedHomeComponent.value;
	goodsPickerSelection.value = component?.type === "goodsCard" || component?.type === "goodsShelves" ? [...component.data.goodsList] : [];
	if (!goodsOptions.value.length) await loadGoodsOptions();
}

async function loadGoodsOptions() {
	goodsPickerLoading.value = true;
	try {
		const res = await ShopService.getGoodsList({ status: 1, keywords: goodsPickerKeyword.value.trim() });
		goodsOptions.value = (res.data || []).map(mapGoodsOption);
	} finally {
		goodsPickerLoading.value = false;
	}
}

function mapGoodsOption(item: any): GoodsOption {
	return {
		id: Number(item.id),
		title: item.title || item.name || "",
		subtitle: item.subtitle || item.description || "",
		image: item.image || item.cover || item.main_image || "",
		price: item.price ?? item.min_price ?? item.price_min ?? 0,
		original_price: item.original_price ?? item.market_price ?? 0,
		sales: Number(item.sales || item.sales_count || 0),
		stock: Number(item.stock || 0),
		promos: item.promos || [],
	};
}

function handleGoodsPickerSelection(rows: GoodsOption[]) {
	goodsPickerSelection.value = rows;
}

function confirmGoodsPicker() {
	const component = selectedHomeComponent.value;
	if (component?.type !== "goodsCard" && component?.type !== "goodsShelves") return;
	component.data.goodsList = [...goodsPickerSelection.value];
	component.data.goodsIds = component.data.goodsList.map(item => item.id);
	goodsPickerVisible.value = false;
}

async function uploadFile(file: File) {
	const form = new FormData();
	form.append("file", file);
	const response = await fetch("/admin/index/upload", {
		method: "POST",
		headers: { token: userStore.getToken() },
		body: form,
	});
	const result = await response.json();
	return result?.data?.url || result?.url || "";
}

async function uploadTabbarIcon(event: Event, item: TabbarItem, key: "inactiveIcon" | "activeIcon") {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) item[key] = url;
	input.value = "";
}

async function uploadFloatMenuIcon(event: Event, item: FloatMenuItem) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) item.src = url;
	input.value = "";
}

async function uploadPopupImage(event: Event, item: PopupImageItem) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) item.src = url;
	input.value = "";
}

async function uploadHomeBackground(event: Event, component: HomeComponent) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) component.style.background.bgImage = url;
	input.value = "";
}

async function uploadNoticeImage(event: Event, component: NoticeBlockComponent) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) component.data.src = url;
	input.value = "";
}

async function uploadMenuButtonImage(event: Event, item: MenuButtonItem) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) item.src = url;
	input.value = "";
}

async function uploadMenuListImage(event: Event, item: MenuListItem) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) item.src = url;
	input.value = "";
}

async function uploadMenuGridImage(event: Event, item: MenuGridItem) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) item.src = url;
	input.value = "";
}

async function uploadGoodsTag(event: Event, component: GoodsCardComponent) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) component.data.tagStyle.src = url;
	input.value = "";
}

async function uploadGoodsBuyButton(event: Event, component: GoodsCardComponent) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) component.data.buyNowStyle.src = url;
	input.value = "";
}

async function uploadGoodsShelvesTag(event: Event, component: GoodsShelvesComponent) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) component.data.tagStyle.src = url;
	input.value = "";
}

async function uploadBackgroundImage(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const url = await uploadFile(file);
	if (url) tabbar.background.bgImage = url;
	input.value = "";
}
</script>

<style scoped lang="scss">
.decorate-page {
	--sa-bg-assist-1: #f5f6f8;
	--sa-background-assist: #fff;
	--sa-table-header-bg: #f7f8fa;
	--sa-border: #e5e6eb;
	--sa-space: #eef0f4;
	--sa-title: #1f2329;
	--sa-font: #4e5969;
	--sa-subtitle: #86909c;
	--t-bg-active: #ecf5ff;
	--t-bg-hover: #f5f7fa;
	height: calc(100vh - 110px);
	min-height: 720px;
	background: var(--sa-bg-assist-1);
	color: var(--sa-font);
	font-size: 12px;
}

.sa-header {
	height: 41px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: var(--sa-background-assist);
	border-bottom: 1px solid var(--sa-border);
}

.header-side,
.header-center {
	height: 100%;
	display: flex;
	align-items: center;
}

.header-center {
	padding: 0 8px;
	border-left: 1px solid var(--sa-border);
	border-right: 1px solid var(--sa-border);
}

.header-button {
	width: 48px;
	height: 40px;
	border: none;
	border-right: 1px solid var(--sa-border);
	background: transparent;
	color: var(--sa-subtitle);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}

.header-actions .header-button {
	border-right: none;
	border-left: 1px solid var(--sa-border);
}

.header-button.is-active {
	background: var(--el-color-primary);
	color: #fff;
}

.header-page-icon {
	position: relative;
	display: block;
	width: 24px;
	height: 24px;
	color: currentcolor;
}

.header-page-icon::before,
.header-page-icon::after {
	content: "";
	position: absolute;
	box-sizing: border-box;
}

.icon-basic::before {
	left: 3px;
	top: 4px;
	width: 18px;
	height: 16px;
	border: 2px solid currentcolor;
	border-radius: 3px;
}

.icon-basic::after {
	left: 7px;
	top: 8px;
	width: 10px;
	height: 2px;
	background: currentcolor;
	box-shadow: 0 4px 0 currentcolor, 0 8px 0 currentcolor;
}

.icon-home::before {
	left: 3px;
	top: 10px;
	width: 18px;
	height: 11px;
	border: 2px solid currentcolor;
	border-top: none;
	border-radius: 0 0 3px 3px;
}

.icon-home::after {
	left: 4px;
	top: 4px;
	width: 16px;
	height: 16px;
	border-left: 2px solid currentcolor;
	border-top: 2px solid currentcolor;
	transform: rotate(45deg);
	transform-origin: center;
}

.icon-user::before {
	left: 8px;
	top: 4px;
	width: 8px;
	height: 8px;
	border: 2px solid currentcolor;
	border-radius: 50%;
}

.icon-user::after {
	left: 4px;
	top: 15px;
	width: 16px;
	height: 7px;
	border: 2px solid currentcolor;
	border-radius: 10px 10px 3px 3px;
}

.header-icon {
	height: 40px;
	padding: 0 8px;
	border: none;
	background: transparent;
	color: var(--sa-subtitle);
	cursor: pointer;
}

.header-icon.is-active {
	color: var(--el-color-primary);
}

.header-divider {
	width: 1px;
	height: 40px;
	margin: 0 8px;
	background: var(--sa-border);
}

.page-main {
	height: calc(100% - 41px);
	display: flex;
	background: var(--sa-bg-assist-1);
	overflow: hidden;
}

.left,
.right {
	flex-shrink: 0;
	height: 100%;
	background: var(--sa-background-assist);
	box-shadow: 0 0 0.24rem rgb(0 0 0 / 16%);
	position: relative;
	transition: all 0.2s;
}

.left {
	width: 260px;
}

.right {
	width: 344px;
}

.left-main,
.right-main {
	height: 100%;
	overflow: auto;
	background: var(--sa-background-assist);
	position: relative;
	z-index: 2;
}

.left-icon,
.right-icon {
	width: 24px;
	height: 84px;
	position: absolute;
	top: 50%;
	z-index: 1;
	margin-top: -42px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--sa-font);
	background: var(--sa-space);
	border: 1px solid var(--sa-space);
	box-shadow: 0 0 4px rgb(0 0 0 / 8%), 0 2px 6px rgb(0 0 0 / 6%), 0 4px 8px 2px rgb(0 0 0 / 4%);
	cursor: pointer;
}

.left-icon {
	right: -20px;
	border-radius: 0 24px 24px 0;
}

.right-icon {
	left: -20px;
	border-radius: 24px 0 0 24px;
}

.collapse-title {
	height: 32px;
	line-height: 32px;
	padding: 0 12px;
	background: var(--sa-table-header-bg);
	border-bottom: 1px solid var(--sa-border);
	color: var(--sa-title);
}

.component-grid {
	display: flex;
	flex-wrap: wrap;
}

.component-item {
	width: 86px;
	height: 86px;
	border-right: 1px solid var(--sa-space);
	border-bottom: 1px solid var(--sa-space);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.component-item:nth-of-type(3n) {
	border-right: none;
}

.component-item:hover {
	background: var(--t-bg-hover);
}

.component-item.is-active {
	background: var(--t-bg-active);
}

.component-item img {
	width: 40px;
	height: 40px;
	margin-bottom: 8px;
	object-fit: contain;
}

.center {
	height: 100%;
	flex: 1;
	padding-top: 10px;
	background: var(--sa-bg-assist-1);
	overflow-y: auto;
	position: relative;
	z-index: 0;
}

.center-main {
	position: absolute;
	top: 18px;
	left: 50%;
	width: 375px;
	min-height: calc(100% - 26px);
	margin-left: -187.5px;
	background: var(--sa-background-assist);
	display: flex;
	flex-direction: column;
}

.center-main::before {
	content: "";
	position: absolute;
	top: -8px;
	left: 50%;
	right: 0;
	bottom: -8px;
	z-index: 1;
	margin-left: -195.5px;
	width: 375px;
	height: inherit;
	border: 8px solid var(--sa-title);
	box-sizing: content-box;
	pointer-events: none;
	overflow: hidden;
}

.center-main.is-android::before {
	border-radius: 16px;
}

.phone-status {
	height: 28px;
	overflow: hidden;
	background: #fff;
}

.phone-status img {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: cover;
}

.phone-navbar {
	height: 44px;
	line-height: 44px;
	text-align: center;
	color: var(--sa-title);
	background: #fff;
	font-size: 14px;
	font-weight: 500;
	border-bottom: 1px solid #f3f3f3;
}

.comp-wrap {
	position: relative;
	flex: 1;
	min-height: 620px;
	background: #f6f6f6;
	padding-bottom: 58px;
}

.empty-tip {
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--sa-subtitle);
}

.mask {
	position: absolute;
	inset: 0;
	background: rgb(238 238 238 / 72%);
	z-index: 5;
}

.float-menu {
	position: absolute;
	right: 30px;
	bottom: 50px;
	z-index: 6;
	display: flex;
	align-items: center;
	justify-content: center;
}

.float-menu.vertical {
	flex-direction: column;
}

.float-menu-item {
	margin-right: 10px;
	margin-bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.float-menu.vertical .float-menu-item {
	margin-right: 0;
	margin-bottom: 10px;
}

.float-menu-item img,
.float-menu-placeholder {
	width: 26px;
	height: 26px;
	display: block;
	object-fit: cover;
	border-radius: 0;
}

.float-menu-placeholder {
	border: 1px solid var(--sa-border);
	background: #fff;
}

.float-menu-item .text {
	margin-top: 2px;
	font-size: 12px;
	line-height: 16px;
}

.float-menu-button {
	width: 42px;
	height: 42px;
	border: none;
	border-radius: 50%;
	color: #fff;
	background: var(--el-color-primary);
	transition: all 0.3s linear;
	cursor: pointer;
	transform: rotateZ(135deg);
	font-size: 26px;
	line-height: 42px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.float-menu-button.fold {
	transform: rotateZ(0deg);
}

.popup-image-preview {
	position: absolute;
	inset: 0;
	z-index: 5;
}

.popup-image-item {
	position: absolute;
	right: 50%;
	bottom: 50%;
	width: 292px;
	height: 454px;
	border: 1px solid var(--sa-border);
	border-radius: 4px;
	background: #fff;
	overflow: hidden;
	cursor: pointer;
}

.popup-image-item.is-active {
	border-color: var(--el-color-primary);
	box-shadow: 0 0 0 2px rgb(64 158 255 / 16%);
}

.popup-image-item img,
.popup-image-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	object-fit: cover;
	color: var(--sa-subtitle);
	background: #fff;
}

.home-component {
	position: relative;
	cursor: pointer;
}

.component-inner {
	background-repeat: no-repeat;
	background-size: 100% 100%;
}

.home-component.is-active {
	outline: 1px solid var(--el-color-primary);
}

.home-component .comp-label,
.home-component .comp-tools {
	position: absolute;
	top: 50%;
	z-index: 4;
	background: var(--sa-background-assist);
	border-radius: 2px;
	box-shadow: 0 0 4px rgb(0 0 0 / 8%), 0 2px 6px rgb(0 0 0 / 6%), 0 4px 8px 2px rgb(0 0 0 / 4%);
	transform: translateY(-50%);
	opacity: 0;
}

.home-component .comp-label {
	left: -92px;
	width: 80px;
	height: 32px;
	line-height: 32px;
	color: var(--sa-font);
	text-align: center;
}

.home-component .comp-tools {
	right: -48px;
	width: 40px;
	padding: 8px 0 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.home-component:hover .comp-label,
.home-component:hover .comp-tools,
.home-component.is-active .comp-label,
.home-component.is-active .comp-tools {
	opacity: 1;
}

.home-component.is-active .comp-label {
	color: #fff;
	background: var(--el-color-primary);
}

.comp-tools button {
	width: 30px;
	height: 30px;
	margin: 0 0 8px;
	padding: 0;
	border: 1px solid var(--sa-border);
	border-radius: 50%;
	color: var(--sa-font);
	background: #fff;
	cursor: pointer;
	font-size: 18px;
	line-height: 28px;
	font-weight: 600;
	box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
}

.comp-tools button:hover {
	color: var(--el-color-primary);
	background: var(--t-bg-hover);
}

.comp-tools button:disabled {
	color: #c0c4cc;
	cursor: not-allowed;
	background: transparent;
}

.comp-tools button:last-child {
	color: #ff4d4f;
}

.search-block {
	height: 32px;
	padding: 0 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border: 1px solid #eee;
	background: #fff;
	color: #b0b3bf;
	font-size: 14px;
	overflow: hidden;
}

.search-placeholder,
.search-keywords {
	display: flex;
	align-items: center;
	min-width: 0;
}

.search-placeholder {
	flex-shrink: 0;
}

.search-icon {
	position: relative;
	width: 14px;
	height: 14px;
	margin-right: 8px;
	border: 2px solid currentcolor;
	border-radius: 50%;
	box-sizing: border-box;
}

.search-icon::after {
	content: "";
	position: absolute;
	right: -5px;
	bottom: -3px;
	width: 6px;
	height: 2px;
	background: currentcolor;
	transform: rotate(45deg);
	transform-origin: center;
}

.search-keywords {
	height: 32px;
	margin-left: 8px;
	font-size: 14px;
	overflow: hidden;
}

.search-keywords span {
	padding: 5px 4px;
	white-space: nowrap;
}

.notice-block {
	height: 24px;
	display: flex;
	align-items: center;
	overflow: hidden;
}

.notice-block img {
	width: 24px;
	height: 24px;
	display: block;
	object-fit: cover;
}

.notice-divider {
	width: 1px;
	height: 16px;
	margin: 0 0 0 8px;
	background: #eee;
}

.notice-text {
	height: 14px;
	line-height: 1;
	padding: 0 0 0 12px;
	overflow: hidden;
	font-size: 14px;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.menu-button {
	padding-bottom: 10px;
	display: flex;
	flex-wrap: wrap;
}

.menu-button-item {
	position: relative;
	margin: 15px 0 5px;
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 16px;
}

.menu-button-item img,
.menu-image-placeholder {
	width: 49px;
	height: 49px;
	display: block;
	object-fit: cover;
}

.menu-image-placeholder {
	border: 1px dashed var(--sa-border);
	background: #fff;
}

.menu-title {
	height: 16px;
	line-height: 16px;
	margin-top: 8px;
	font-size: 12px;
	max-width: 90%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.menu-badge {
	position: absolute;
	top: 0;
	left: 50%;
	z-index: 1;
	transform: translateX(8px);
	height: 20px;
	line-height: 20px;
	padding: 0 6px;
	border-radius: 6px 6px 6px 0;
	font-size: 12px;
	text-align: center;
	white-space: nowrap;
}

.menu-indicator {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
}

.menu-indicator span {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: #333;
}

.menu-list-item {
	height: 42px;
	padding: 0 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid #eee;
}

.menu-list-item:last-child {
	border-bottom: none;
}

.menu-list-left,
.menu-list-right {
	display: flex;
	align-items: center;
	min-width: 0;
}

.menu-list-left img {
	width: 16px;
	height: 16px;
	margin-right: 8px;
	object-fit: cover;
}

.menu-list-title {
	font-size: 16px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.menu-list-tip {
	font-size: 12px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.menu-list-arrow {
	margin-left: 6px;
	color: #999;
	font-size: 22px;
	line-height: 1;
}

.menu-grid {
	display: flex;
	flex-wrap: wrap;
}

.menu-grid-item {
	position: relative;
	min-height: 82px;
	padding: 12px 6px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.menu-grid-item img,
.menu-grid-image-placeholder {
	width: 28px;
	height: 28px;
	display: block;
	object-fit: cover;
}

.menu-grid-image-placeholder {
	border: 1px dashed var(--sa-border);
	background: #fff;
}

.menu-grid-title {
	height: 16px;
	line-height: 16px;
	margin-top: 6px;
	font-size: 12px;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.menu-grid-tip {
	height: 14px;
	line-height: 14px;
	margin-top: 6px;
	font-size: 12px;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.grid-badge {
	top: 8px;
	transform: translateX(6px);
}

.goods-card-preview {
	position: relative;
}

.goods-card-wrap {
	display: flex;
	flex-wrap: wrap;
}

.goods-card-item {
	box-sizing: border-box;
	flex-shrink: 0;
}

.goods-card-inner {
	position: relative;
	overflow: hidden;
	background: #fff;
}

.goods-card-3 .goods-card-inner {
	display: grid;
	grid-template-columns: 120px minmax(0, 1fr);
	min-height: 120px;
}

.goods-image {
	width: 100%;
	aspect-ratio: 1 / 1;
	display: flex;
	align-items: center;
	justify-content: center;
	object-fit: cover;
	background: #f2f3f5;
	color: var(--sa-subtitle);
}

.goods-card-3 .goods-image {
	width: 120px;
	height: 120px;
	aspect-ratio: auto;
	grid-row: span 2;
}

.goods-desc {
	padding: 8px;
	min-width: 0;
}

.goods-title,
.goods-subtitle {
	height: 18px;
	line-height: 18px;
	font-size: 13px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.goods-subtitle,
.goods-sales {
	font-size: 12px;
}

.goods-price-row {
	height: 22px;
	display: flex;
	align-items: baseline;
	gap: 6px;
}

.goods-price {
	font-size: 16px;
	font-weight: 600;
}

.goods-original-price,
.goods-sales {
	font-size: 12px;
}

.goods-buy-button {
	min-width: 68px;
	height: 24px;
	line-height: 24px;
	margin: 0 8px 8px auto;
	padding: 0 10px;
	border-radius: 14px;
	color: #fff;
	text-align: center;
	font-size: 12px;
	overflow: hidden;
}

.goods-card-3 .goods-buy-button {
	align-self: end;
}

.goods-buy-button img {
	width: 24px;
	height: 24px;
	object-fit: contain;
}

.goods-tag {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 2;
}

.goods-tag img {
	width: 56px;
	height: 22px;
	object-fit: cover;
}

.goods-empty {
	height: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--sa-subtitle);
	border: 1px dashed var(--sa-border);
	background: #fff;
}

.goods-shelves-preview {
	position: relative;
	overflow: hidden;
}

.goods-shelves-wrap {
	display: flex;
	overflow: hidden;
}

.goods-shelves-item {
	box-sizing: border-box;
	flex-shrink: 0;
}

.goods-shelves-inner {
	position: relative;
	overflow: hidden;
	background: #fff;
}

.goods-shelves-image {
	width: 100%;
	aspect-ratio: 1 / 1;
	display: flex;
	align-items: center;
	justify-content: center;
	object-fit: cover;
	background: #f2f3f5;
	color: var(--sa-subtitle);
}

.goods-shelves-desc {
	padding: 6px;
}

.goods-shelves-3 {
	overflow-x: hidden;
}

.goods-shelves-3 .goods-shelves-inner {
	width: 100%;
}

.goods-shelves-3 .goods-title {
	font-size: 12px;
}

.selected-goods {
	width: 100%;
}

.selected-goods-item {
	display: grid;
	grid-template-columns: 42px minmax(0, 1fr) 40px;
	align-items: center;
	gap: 8px;
	padding: 6px;
	margin-bottom: 6px;
	background: var(--sa-bg-assist-1);
	border: 1px solid var(--sa-border);
	border-radius: 2px;
}

.selected-goods-item img,
.selected-goods-empty,
.goods-thumb {
	width: 42px;
	height: 42px;
	object-fit: cover;
	background: var(--el-fill-color-light);
	border-radius: 2px;
}

.selected-goods-item span {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.selected-empty {
	padding: 10px;
	color: var(--sa-subtitle);
	background: var(--sa-bg-assist-1);
	border: 1px dashed var(--sa-border);
	border-radius: 2px;
}

.inline-button {
	margin-left: 0;
}

.compact-color {
	width: 130px;
	margin-left: 8px;
}

.dialog-toolbar {
	margin-bottom: 12px;
	display: flex;
	gap: 8px;
}

.goods-thumb--empty {
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--sa-subtitle);
	font-size: 12px;
}

.notice-image-list {
	display: flex;
	gap: 8px;
}

.notice-image-list img {
	width: 32px;
	height: 32px;
	padding: 4px;
	border: 1px solid var(--sa-border);
	border-radius: 4px;
	object-fit: contain;
	cursor: pointer;
}

.notice-image-list img.is-active {
	border-color: var(--el-color-primary);
}

.tabbar-preview {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	height: 58px;
	display: flex;
	background-repeat: no-repeat;
	background-position: center;
	background-size: 100% 100%;
	box-shadow: 0 -1px 0 rgb(0 0 0 / 4%);
	z-index: 4;
}

.tabbar-preview-item {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	font-size: 12px;
}

.tabbar-icon-wrap {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 2px;
}

.tabbar-icon-wrap img {
	width: 26px;
	height: 26px;
	object-fit: contain;
}

.tabbar-icon-placeholder {
	width: 26px;
	height: 26px;
	border: 1px solid currentcolor;
	opacity: 0.35;
}

.tabbar-text {
	max-width: 100%;
	height: 16px;
	line-height: 16px;
	padding: 0 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.tabbar-preview-item.is-center .tabbar-icon-wrap {
	width: 49px;
	height: 49px;
	border-radius: 50%;
	margin-bottom: 4px;
	background: linear-gradient(123deg, #fe8c00 0%, #ff6000 100%);
	box-shadow: 0 9px 13px 5px rgb(254 129 0 / 22%);
	transform: translateY(-10px);
}

.tabbar-preview-item.is-center .tabbar-text {
	display: none;
}

.right-title {
	padding: 8px 12px;
	color: var(--sa-subtitle);
	font-size: 14px;
}

.right-tab {
	margin: 16px 20px;
	display: flex;
	width: calc(100% - 40px);
	overflow: hidden;
}

.right-tab :deep(.el-radio-button) {
	flex: 1 1 0;
	min-width: 0;
}

.right-tab :deep(.el-radio-button__inner) {
	width: 100%;
}

.title {
	height: 40px;
	line-height: 40px;
	background: var(--sa-table-header-bg);
	margin-bottom: 16px;
	padding: 0 20px;
	font-size: 14px;
	color: var(--sa-subtitle);
	display: flex;
	align-items: center;
}

.warning {
	margin-left: 8px;
	color: #ff4d4f;
	font-size: 12px;
	font-weight: 400;
}

.wrap {
	padding: 0 20px;
}

.form-item {
	display: flex;
	align-items: center;
	min-height: 32px;
	margin-bottom: 18px;
}

.form-label {
	width: 76px;
	flex-shrink: 0;
	color: var(--sa-font);
}

.form-slider {
	flex: 1;
	min-width: 0;
}

.custom-radio-button,
.radio-row {
	display: flex;
	align-items: center;
	gap: 0;
}

.radio-row :deep(.el-radio) {
	margin-right: 14px;
	height: 32px;
	color: var(--sa-font);
}

.radio-row :deep(.el-radio:last-child) {
	margin-right: 0;
}

.style-button {
	width: 48px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	border: 1px solid var(--sa-border);
	border-radius: 4px;
	color: var(--sa-font);
	cursor: pointer;
}

.style-button.is-active {
	color: var(--el-color-primary);
	border-color: var(--el-color-primary);
}

.tabbar-style-icon {
	position: relative;
	display: block;
	width: 28px;
	height: 18px;
}

.tabbar-style-icon::before,
.tabbar-style-icon::after {
	content: "";
	position: absolute;
	box-sizing: border-box;
}

.tabbar-style-icon.style-1::before {
	inset: 1px 2px;
	border: 1px solid currentcolor;
	border-top: none;
}

.tabbar-style-icon.style-1::after {
	left: 7px;
	right: 7px;
	bottom: 4px;
	height: 2px;
	background: currentcolor;
	box-shadow: -6px -5px 0 currentcolor, 6px -5px 0 currentcolor;
}

.tabbar-style-icon.style-2::before {
	left: 4px;
	right: 4px;
	bottom: 3px;
	height: 8px;
	border: 1px solid currentcolor;
	border-radius: 2px;
}

.color-input {
	display: flex;
	align-items: center;
	width: 196px;
}

.text-input {
	height: 32px;
	box-sizing: border-box;
	border: 1px solid var(--sa-border);
	border-radius: 4px;
	padding: 0 10px;
	color: var(--sa-font);
	outline: none;
}

.color-input :deep(.el-color-picker) {
	height: 32px;
	flex-shrink: 0;
}

.color-input :deep(.el-color-picker__trigger) {
	width: 32px;
	height: 32px;
	padding: 0;
	border-radius: 4px 0 0 4px;
	border-right: none;
	overflow: hidden;
}

.color-input :deep(.el-color-picker__color) {
	border: none;
}

.color-input :deep(.el-color-picker__empty) {
	display: none;
}

.color-input :deep(.el-input) {
	flex: 1;
}

.color-input :deep(.el-input__wrapper) {
	height: 32px;
	border-radius: 0 4px 4px 0;
}

.text-input {
	flex: 1;
	min-width: 0;
}

.text-color-input {
	display: flex;
	align-items: center;
	width: 196px;
}

.text-color-input .text-input {
	border-radius: 4px 0 0 4px;
}

.text-color-input :deep(.el-color-picker) {
	height: 32px;
	flex-shrink: 0;
}

.text-color-input :deep(.el-color-picker__trigger) {
	width: 32px;
	height: 32px;
	padding: 0;
	border-radius: 0 4px 4px 0;
	border-left: none;
	overflow: hidden;
}

.text-color-input :deep(.el-color-picker__color) {
	border: none;
}

.text-color-input :deep(.el-color-picker__empty) {
	display: none;
}

.d-list .title {
	margin-bottom: 0;
}

.d-list .list-item {
	padding: 8px 20px;
	border-bottom: 1px solid var(--sa-space);
	background: var(--sa-background-assist);
}

.list-move {
	height: 32px;
	line-height: 32px;
	margin-bottom: 12px;
	color: var(--sa-subtitle);
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.delete-button {
	border: none;
	background: transparent;
	color: #ff4d4f;
	cursor: pointer;
}

.upload-box {
	width: 52px;
	height: 52px;
	border: 1px dashed var(--sa-border);
	border-radius: 4px;
	background: #fff;
	color: var(--sa-subtitle);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.upload-box input {
	display: none;
}

.upload-box img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}


.tip {
	margin-left: 8px;
	color: #999;
}

.add-button {
	width: fit-content;
	height: 32px;
	margin: 16px 20px;
	padding: 0 12px;
	border: 1px dashed var(--sa-border);
	border-radius: 4px;
	background: #fff;
	color: var(--sa-font);
	cursor: pointer;
}

.panel-placeholder {
	height: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--sa-subtitle);
	border: 1px dashed var(--sa-border);
	border-radius: 4px;
}

.css-card {
	margin: 0 20px;
	padding: 10px;
	min-height: 320px;
	background: #1e1e1e;
	color: #ccc;
	border-radius: 4px;
	white-space: pre-wrap;
	word-break: break-all;
	font-size: 12px;
	line-height: 1.6;
}
</style>
