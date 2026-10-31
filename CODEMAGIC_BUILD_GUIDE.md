# maxAOZ — Codemagic 云端打包 IPA 指南

项目已接入 **Capacitor** 并生成 iOS 原生工程，`codemagic.yaml` 已配置好云端构建。你只需完成以下三步即可在云端打出 `.ipa`。



***

## ✅ 已经帮你做好的（本地）



* Git 仓库已初始化，代码已提交（121 个文件，不含任何证书）

* Capacitor iOS 工程已生成：`ios/App/`（Bundle ID：`com.maxaozx.www`）

* iOS App 图标已替换为你提供的 logo（1024×1024 不透明）

* 云端构建配置 `codemagic.yaml` 已写好



***

## 第一步：推送代码到 GitHub



1. 在 [github.com](https://github.com) 新建一个**空**仓库（不要勾选 README/.gitignore，保持空），比如命名 `maxaoz`

2. 复制仓库地址，例如：`https://github.com/你的用户名/maxaoz.git`

3. 在终端执行（在 `crypto-analytics` 目录下）：



```
cd /Users/john/Doubao/chats/2026-10-20/new-chat-1/crypto-analytics
git remote add origin https://github.com/你的用户名/maxaoz.git
git push -u origin main
```

> 如果 GitHub 要求输入用户名 / Token：登录 GitHub → Settings → Developer settings → Personal access tokens → 生成一个有 
>
> `repo`
>
>  权限的 token，密码处粘贴 token。



***

## 第二步：在 Codemagic 注册并连接仓库



1. 打开 [https://codemagic.io/start/](https://codemagic.io/start/) ，用 GitHub / Google / 邮箱 注册登录

2. 登录后进入 **Teams** → 你的账号 → **Add application**

3. 选择 **GitHub**（授权 Codemagic 访问你的仓库）→ 选择刚推送的 `maxaoz` 仓库

4. 如果提示选择工作流，选 **maxAOZ iOS IPA（ios-native）**（来自 `codemagic.yaml`）



***

## 第三步：上传签名证书并触发构建

Codemagic 需要用你的 Apple 证书给 IPA 签名。证书位置：



```
/Users/john/Documents/work/ME/App/马甲包/maxAOZX/shu/
├── 证书.p12                        ← distribution 证书（密码：123456）
└── maxAOZX.mobileprovision         ← provisioning profile
```

在 Codemagic 里：



1. 打开应用 → 顶部 **Signing** 标签

2. 找到 **iOS signing** 区域 → **Provisioning profiles** → 上传 `maxAOZX.mobileprovision`

3. **Codesigning certificates** → 上传 `证书.p12`，密码填 `123456`

4. 确认 signing 里自动匹配的 **bundle identifier** 是 `com.maxaozx.www`

5. 回到 **Build** 标签 → 点 **Start new build**

6. 选 **ios-native** 工作流 → 开始构建



***

## 第四步：下载 IPA



* 构建成功约 3–8 分钟（Codemagic 免费额度每月 500 分钟）

* 构建完成后，在构建详情页的 **Artifacts** 里找到 `.ipa` 文件下载

* 构建结果也会发送到邮箱 `th682319@gmail.com`



***

## 常见问题



| 现象                        | 处理                                                                               |
| ------------------------- | -------------------------------------------------------------------------------- |
| 提示证书与 profile 不匹配         | 确认上传的是同一批的 `证书.p12` 和 `maxAOZX.mobileprovision`，且 bundle id 都是 `com.maxaozx.www` |
| `distribution_type` 报错    | 如果你的 profile 是 Ad Hoc 类型，把 `codemagic.yaml` 里的 `app_store` 改成 `ad_hoc`           |
| 需要上传 TestFlight/App Store | 在 Codemagic 配置 App Store Connect API key（设置 → Integrations）                      |
| 构建日志里有环境 / 依赖错误           | 把报错贴给我，我来改 `codemagic.yaml`                                                      |