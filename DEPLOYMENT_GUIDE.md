# 租客费用计算器 - 部署指南

## 📱 PWA功能已启用

您的计算器应用现在支持：
- ✅ 添加到手机桌面
- ✅ 全屏运行（类似原生应用）
- ✅ 离线缓存功能
- ✅ 移动端优化

## 🚀 部署到免费平台

### 选项1: GitHub Pages（推荐）

**步骤：**
1. 创建GitHub账号（如果没有）
2. 创建新的代码仓库
3. 上传所有文件到仓库
4. 开启GitHub Pages功能

**具体操作：**
```bash
# 初始化Git仓库
git init
git add .
git commit -m "初始提交：租客费用计算器PWA"

# 连接到GitHub仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

**GitHub Pages设置：**
1. 进入仓库 → Settings → Pages
2. Source选择 "main" 分支
3. 等待几分钟，访问生成的URL（如：`https://你的用户名.github.io/你的仓库名`）

### 选项2: Vercel（更简单）

**步骤：**
1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 导入您的GitHub仓库
4. 自动部署完成

### 选项3: Netlify

**步骤：**
1. 访问 [netlify.com](https://netlify.com)
2. 拖拽整个文件夹到部署区域
3. 自动获得一个URL

## 📲 手机端安装指南

### iOS (Safari浏览器)
1. 用Safari打开您的应用URL
2. 点击分享按钮 (📤)
3. 选择"添加到主屏幕"
4. 点击"添加"

### Android (Chrome浏览器)
1. 用Chrome打开您的应用URL
2. 点击菜单按钮 (⋮)
3. 选择"添加到主屏幕"
4. 点击"添加"

## 🎨 图标定制建议

当前使用的是临时SVG图标，建议替换为专业图标：
- 尺寸：192x192 和 512x512 像素
- 格式：PNG（透明背景）
- 设计：简洁的货币符号或计算器图标

替换方法：
1. 准备两个尺寸的PNG图标
2. 重命名为 `icon-192x192.png` 和 `icon-512x512.png`
3. 替换当前目录下的SVG文件

## 🔧 本地测试

在部署前，您可以在本地测试：
1. 用浏览器打开 `index.html`
2. 检查控制台是否有错误
3. 测试计算功能是否正常

## 📞 技术支持

如果遇到问题：
1. 检查浏览器控制台错误信息
2. 确保所有文件路径正确
3. 确认服务器支持HTTPS

## 🌐 最终URL

部署完成后，您的应用将通过以下方式访问：
- 电脑：直接打开URL
- 手机：添加到主屏幕后像原生应用一样使用

祝您部署顺利！