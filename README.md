# まるっとWeb（静的サイト）

Hirameki 7 で公開していた https://marutto.hirameki7.site/ を、外部CMSに依存しない HTML / CSS / JavaScript だけの静的サイトとして再構築したものです。ビルド不要で、Cloudflare Pages にそのまま配置できます。

## フォルダ構成

```
index.html            トップページ（全セクション）
404.html              404ページ
favicon.svg           ファビコン
robots.txt / sitemap.xml
_headers              Cloudflare Pages 用HTTPヘッダー
assets/
  css/style.css       スタイル（色は :root の変数で管理）
  js/main.js          お問い合わせフォーム表示・確認画面・住所検索・送信
  images/             画像（hero.jpg / works-*.jpg / ogp.jpg）
serve.ps1             ローカル確認用サーバー
```

## ローカル確認

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

ブラウザで http://localhost:5173/ を開きます。

## 公開前に設定すること

1. **本番URL**：`index.html`・`robots.txt`・`sitemap.xml` 内の `https://example.com` を実際のドメインに置換。
2. **フォーム送信先**：FormSubmit（https://formsubmit.co/）経由で shota.nakabayashi0517@gmail.com 宛てに届きます（`index.html` の `data-endpoint`）。
   - 初回送信時に FormSubmit から「有効化（Activate）」メールが届くので、リンクをクリックして有効化してください。有効化前の送信は届きません。
   - 有効化後に表示される英数字のエイリアスを、`data-endpoint` のメールアドレス部分と置き換えると、ソース上にアドレスが出なくなります（スパム対策）。
3. **ロゴ**：現在はテキスト「まるっとWeb」。画像にする場合はヘッダー／フッターの `site-header__logo` を差し替え。

## Cloudflare Pages 設定

- Framework preset: None
- Build command: （空欄）
- Build output directory: `/`

## 画像について

`assets/images/` の写真は元サイトで使用されていた Unsplash の画像（Unsplash License）をダウンロードしたものです。差し替える場合は同じファイル名で上書きするか、`index.html` の `src` を変更してください。
