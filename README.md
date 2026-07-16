# Road GIF Loader

Chrome の通常ページ読み込み中に、設定した Tenor GIF をオーバーレイ表示する拡張機能です。

Chrome の組み込みロード画面自体は拡張機能から差し替えられないため、この拡張機能では `http` / `https` ページを開いた直後に GIF ローダーを重ねて表示します。

## 使い方

1. Chrome で `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」を押す
4. この `roadgif` フォルダを選択する
5. ツールバーの拡張機能アイコンをクリックする
6. Tenor の埋め込み URL を入力して保存する

URL は1行につき1つです。テキストボックスは折り返さないため、長いURLは横に伸びます。Enter を押したときだけ改行されます。

例:

```text
https://tenor.com/embed/123456789
https://tenor.com/ja/view/example-gif-123456789
```

## 対応URL

- `https://tenor.com/embed/...`
- `https://tenor.com/ja/view/...`
- `https://tenor.com/view/...`
- `https://media.tenor.com/...`

複数のURLを入れると、初期設定ではページ読み込みごとにランダムで1つ表示します。

## 制限

- `chrome://`、Chrome ウェブストア、拡張機能管理画面など、Chrome が拡張機能の注入を禁止しているページでは表示できません。
- サイトや Tenor 側の仕様変更により、一部GIFが表示できない場合があります。
- 保存データは Chrome の `storage.sync` に URL 文字列として保存されます。
