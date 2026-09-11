# 語音台詞總表（待轉音檔文字）

> 自動整理自 `src/data/*.json`，供錄音／TTS 製作參考。每次資料異動後請重新產生本文件。

狀態圖例：
- ✅ 已有 `audioUrl` 欄位，只是路徑對應的檔案還沒放進 `public/audio`
- 🆕 目前程式**尚未**串接 `audioUrl`（只有 Waveform 假動畫），路徑為建議命名，需要之後補上型別欄位與播放邏輯

## 模組 A・手帳日記（planner）✅

### 1-1 はじめての約束

| id | speaker | 文字 | audioUrl |
|---|---|---|---|
| d1 | haru | 日曜日は公園で会おう！楽しみだな〜 | `/audio/planner/1-1/d1.mp3` |
| d2 | haru | その日はきっとワクワクする気持ちだよ。 | `/audio/planner/1-1/d2.mp3` |
| d3 | haru | 水曜日は図書館で勉強しよう。ちょっと緊張するけど… | `/audio/planner/1-1/d3.mp3` |

### 1-2 單方面留言：出差時的牽掛

| id | speaker | 文字 | audioUrl |
|---|---|---|---|
| d1 | haru | 先輩、お疲れ様です。ハルです。 | `/audio/planner/1-2/d1.mp3` |
| d2 | haru | 僕は今、京都にいます。京都はとても静かです。 | `/audio/planner/1-2/d2.mp3` |
| d3 | haru | 今日、先輩にお土産を買いました。 | `/audio/planner/1-2/d3.mp3` |
| d4 | haru | 月曜日の午後、会社のロビーで少し会いませんか。 | `/audio/planner/1-2/d4.mp3` |
| d5 | haru | 一緒に京都の抹茶ケーキを食べましょう！ | `/audio/planner/1-2/d5.mp3` |

### 1-3 玩家拒絕：改天見面好嗎

| id | speaker | 文字 | audioUrl |
|---|---|---|---|
| d1 | haru | 先輩、木曜日の夜、一緒に晩ごはんを食べませんか。 | `/audio/planner/1-3/d1.mp3` |
| d2 | player | ごめんなさい。木曜日は日本語の教室がありますから、時間がありません。 | `/audio/planner/1-3/d2.mp3` |
| d3 | haru | あ、そうですか…。 | `/audio/planner/1-3/d3.mp3` |
| d4 | haru | じゃ、金曜日はどうですか。 | `/audio/planner/1-3/d4.mp3` |
| d5 | player | 金曜日は暇です。 | `/audio/planner/1-3/d5.mp3` |
| d6 | haru | よかった！じゃあ、金曜日の夜６時に、駅の前で会いましょう。 | `/audio/planner/1-3/d6.mp3` |

### 2-1 生病時的霸道指令

| id | speaker | 文字 | audioUrl |
|---|---|---|---|
| d1 | player | ハルくん、ごめんなさい。火曜日から少し熱があります。 | `/audio/planner/2-1/d1.mp3` |
| d2 | player | でも、水曜日は大切な会議に行きたいです…。 | `/audio/planner/2-1/d2.mp3` |
| d3 | haru | ダメです！水曜日は絶対に会社へ行かないでください！ | `/audio/planner/2-1/d3.mp3` |
| d4 | haru | 家でゆっくり休んでください。 | `/audio/planner/2-1/d4.mp3` |
| d5 | player | …分かりました。じゃあ、家で休みます。 | `/audio/planner/2-1/d5.mp3` |
| d6 | haru | 木曜日の夜、僕がお粥を作りに行きますね。待っていてください。 | `/audio/planner/2-1/d6.mp3` |

### 2-2 藏不住的佔有慾

| id | speaker | 文字 | audioUrl |
|---|---|---|---|
| d1 | haru | 先輩、今週の土曜日は他の人と出かけますか。 | `/audio/planner/2-2/d1.mp3` |
| d2 | haru | 僕は、先輩と二人だけで水族館へ行きたいです。 | `/audio/planner/2-2/d2.mp3` |
| d3 | haru | 水族館の魚を見てから、海辺を散歩しましょう。 | `/audio/planner/2-2/d3.mp3` |
| d4 | haru | 日曜日は、一日中僕と一緒にいてください。 | `/audio/planner/2-2/d4.mp3` |
| d5 | haru | 早く先輩に会いたいです…。 | `/audio/planner/2-2/d5.mp3` |

### 2-3 深夜的迎接與協商

| id | speaker | 文字 | audioUrl |
|---|---|---|---|
| d1 | haru | 先輩、金曜日は部署の飲み会ですね。 | `/audio/planner/2-3/d1.mp3` |
| d2 | haru | 夜遅いですから、僕が駅まで迎えに行ってもいいですか。 | `/audio/planner/2-3/d2.mp3` |
| d3 | player | ありがとう。でも、金曜日は遅くまで飲みますから、ハルくんは先に休んでください。 | `/audio/planner/2-3/d3.mp3` |
| d4 | haru | そうですか…少し寂しいです。 | `/audio/planner/2-3/d4.mp3` |
| d5 | haru | じゃあ、土曜日の朝、一緒に朝ごはんを食べてもいいですか。 | `/audio/planner/2-3/d5.mp3` |
| d6 | player | もちろんいいですよ！ | `/audio/planner/2-3/d6.mp3` |
| d7 | haru | やった！じゃあ、美味しいパンを買っていきますね。 | `/audio/planner/2-3/d7.mp3` |

### 2-4 雨天的強勢迎接

| id | speaker | 文字 | audioUrl |
|---|---|---|---|
| d1 | haru | 先輩、火曜日の夕方は雨が降りますよ。傘を持っていますか。 | `/audio/planner/2-4/d1.mp3` |
| d2 | player | あ、忘れました！でも大丈夫です、走って帰りますから。 | `/audio/planner/2-4/d2.mp3` |
| d3 | haru | ダメです！風邪をひきますから、走らないでください。 | `/audio/planner/2-4/d3.mp3` |
| d4 | haru | 僕が駅まで傘を持っていきましょうか。 | `/audio/planner/2-4/d4.mp3` |
| d5 | player | えっと…じゃあ、すみません。お願いします。 | `/audio/planner/2-4/d5.mp3` |
| d6 | haru | はい！仕事が終わってから、駅の前で待っていますね。 | `/audio/planner/2-4/d6.mp3` |

### 2-5 幫忙打掃與藉機獨處

| id | speaker | 文字 | audioUrl |
|---|---|---|---|
| d1 | player | 土曜日は、一日中部屋の掃除をします。とても大変です…。 | `/audio/planner/2-5/d1.mp3` |
| d2 | haru | えっ？一人で？僕が手伝いに行きましょうか。 | `/audio/planner/2-5/d2.mp3` |
| d3 | player | だめです！部屋が汚いですから、来ないでください！ | `/audio/planner/2-5/d3.mp3` |
| d4 | haru | 大丈夫ですよ。僕は全然気にしません。 | `/audio/planner/2-5/d4.mp3` |
| d5 | haru | 掃除が終わってから、一緒にピザを食べたいです。 | `/audio/planner/2-5/d5.mp3` |
| d6 | haru | お願いします、土曜日、先輩の家へ行ってもいいですか。 | `/audio/planner/2-5/d6.mp3` |
| d7 | player | …仕方ないですね。じゃあ、お願いします。 | `/audio/planner/2-5/d7.mp3` |

### 2-6 無法見面時的撒嬌

| id | speaker | 文字 | audioUrl |
|---|---|---|---|
| d1 | haru | 先輩、今、木曜日の夜です。僕は実家に帰りました。 | `/audio/planner/2-6/d1.mp3` |
| d2 | haru | 金曜日は、家族と食事をしなければなりません。 | `/audio/planner/2-6/d2.mp3` |
| d3 | haru | でも、早く東京へ帰りたいです。先輩の顔が見たいですから…。 | `/audio/planner/2-6/d3.mp3` |
| d4 | haru | 日曜日の午後、僕に少しだけ時間をください。 | `/audio/planner/2-6/d4.mp3` |
| d5 | haru | 先輩の声を聞いてから、寝ます。おやすみなさい。 | `/audio/planner/2-6/d5.mp3` |

## 詞彙庫（vocabularyNotes）✅

| module | stageId | 單字 | 讀音 | 意思 | audioUrl |
|---|---|---|---|---|---|
| planner | 1-1 | 約束 | やくそく | 約定 | `/audio/vocab/yakusoku.mp3` |
| planner | 1-1 | 図書館 | としょかん | 圖書館 | `/audio/vocab/toshokan.mp3` |
| planner | 1-1 | 緊張 | きんちょう | 緊張 | `/audio/vocab/kinchou.mp3` |
| navigation | 1-1 | 郵便局 | ゆうびんきょく | 郵局 | `/audio/vocab/yuubinkyoku.mp3` |
| navigation | 1-1 | 切手 | きって | 郵票 | `/audio/vocab/kitte.mp3` |
| call | 1-1 | 週末 | しゅうまつ | 週末 | `/audio/vocab/shuumatsu.mp3` |

## 模組 B・走路小遊戲（navigation）🆕

建議路徑慣例：`/audio/navigation/{stageId}/{taskId}.mp3`

### 1-1 公司的午休時光

| taskId | 類型 | 文字 | 建議 audioUrl |
|---|---|---|---|
| t1 | 方位提示 hint | 先輩、すみません。会社の後ろに郵便局があります。郵便局へ行ってください。 | `/audio/navigation/1-1/t1.mp3` |
| t2 | 室內台詞 haruLine | ありがとうございます。そこで切手を２枚買ってください。 | `/audio/navigation/1-1/t2.mp3` |
| t3 | 方位提示 hint | 終わりましたか？じゃあ、お昼ご飯を食べましょう。駅の右にカフェがあります。僕は今そこにいます。 | `/audio/navigation/1-1/t3.mp3` |
| t4 | 室內台詞 haruLine | 先輩、ここです！席は２階です。一緒に行きましょう。 | `/audio/navigation/1-1/t4.mp3` |
| t5 | 室內台詞 haruLine | 僕はサンドイッチを食べます。先輩は何を食べますか。 | `/audio/navigation/1-1/t5.mp3` |
| successLine | 過關台詞 | 一緒にお昼ご飯、嬉しいです。また明日も一緒に食べましょうね。 | `/audio/navigation/1-1/success.mp3` |

### 1-2 週末的站前約會

| taskId | 類型 | 文字 | 建議 audioUrl |
|---|---|---|---|
| t1 | 方位提示 hint | 先輩、おはようございます。駅の下に本屋があります。先に行ってください。 | `/audio/navigation/1-2/t1.mp3` |
| t2 | 室內台詞 haruLine | 僕は今、カメラの本の隣にいます。 | `/audio/navigation/1-2/t2.mp3` |
| t3 | 方位提示 hint | 本を買いました。じゃあ、美術館へ行きましょう。美術館は本屋の右です。 | `/audio/navigation/1-2/t3.mp3` |
| t4 | 室內台詞 haruLine | 人が多いですね。僕がチケットを買います。大人が２人ですね。 | `/audio/navigation/1-2/t4.mp3` |
| t5 | 室內台詞 haruLine | 今日は日本の古い写真の展覧会です。あ、ここですね。 | `/audio/navigation/1-2/t5.mp3` |
| successLine | 過關台詞 | 写真、とてもきれいでしたね。先輩と一緒に見られて嬉しかったです。 | `/audio/navigation/1-2/success.mp3` |

### 1-3 突然的大雨

| taskId | 類型 | 文字 | 建議 audioUrl |
|---|---|---|---|
| t1 | 方位提示 hint | あ、雨です！先輩、急ぎましょう！前にデパートがあります。 | `/audio/navigation/1-3/t1.mp3` |
| t2 | 室內台詞 haruLine | 濡れましたね。デパートの中で少し休みましょうか。 | `/audio/navigation/1-3/t2.mp3` |
| t3 | 方位提示 hint | 雨がやまないですね。駅の下のコンビニで傘を買いましょう。 | `/audio/navigation/1-3/t3.mp3` |
| t4 | 室內台詞 haruLine | 先輩は青い傘が好きですか、白い傘が好きですか。僕は白い傘がいいです。 | `/audio/navigation/1-3/t4.mp3` |
| t5 | 室內台詞 haruLine | 傘、ありがとうございます。先輩は今日、電車で帰りますか、タクシーで帰りますか。 | `/audio/navigation/1-3/t5.mp3` |
| successLine | 過關台詞 | 僕も電車です！じゃあ、一緒に帰りましょう。今日は楽しかったです。 | `/audio/navigation/1-3/success.mp3` |

## 模組 C・通話（call）🆕

建議路徑慣例：`/audio/call/{stageId}/{lineId}.mp3`（cloze 台詞為 before+answer+after 組合後的完整句子）

### 1-1 鼓起勇氣的週末邀約（來電者：陽）

| lineId | 類型 | speaker | 文字 | 建議 audioUrl |
|---|---|---|---|---|
| p1-1 | 填空 cloze | haru | 先輩、こんばんは。ハルです。今、少し時間がありますか？ | `/audio/call/1-1/p1-1.mp3` |
| p1-2 | 填空 cloze | haru | よかった…。実は、土曜日に新しい美術館へ行きます。先輩は、土曜日、忙しいですか？ | `/audio/call/1-1/p1-2.mp3` |
| p2-1 | 口說 speak（玩家跟讀範例音） | player | いいえ、忙しくないです。暇です。 | `/audio/call/1-1/p2-1.mp3` |
| p3-1 | 填空 cloze | haru | 本当ですか！じゃあ、一緒に行きませんか。 | `/audio/call/1-1/p3-1.mp3` |
| p4-1 | 口說 speak（玩家跟讀範例音） | player | ええ、行きましょう！ | `/audio/call/1-1/p4-1.mp3` |
| successLine | 過關台詞 | haru | ありがとうございます！すごく嬉しいです。じゃあ、おやすみなさい！ | `/audio/call/1-1/success.mp3` |

### 1-2 加班後的微弱討拍（來電者：陽）

| lineId | 類型 | speaker | 文字 | 建議 audioUrl |
|---|---|---|---|---|
| p1-1 | 口說 speak（玩家跟讀範例音） | player | ハルくん、こんばんは。どうしましたか。 | `/audio/call/1-2/p1-1.mp3` |
| p2-1 | 填空 cloze | haru | 先輩の声… 僕は今、まだ会社にいます。 | `/audio/call/1-2/p2-1.mp3` |
| p2-2 | 填空 cloze | haru | 今日は仕事がたくさんありましたから、とても疲れました。 | `/audio/call/1-2/p2-2.mp3` |
| p3-1 | 口說 speak（玩家跟讀範例音） | player | 大変でしたね。明日は日曜日ですね。 | `/audio/call/1-2/p3-1.mp3` |
| p4-1 | 填空 cloze | haru | はい。でも、先輩と話しましたから、今は元気です。 | `/audio/call/1-2/p4-1.mp3` |
| successLine | 過關台詞 | haru | 先輩、ありがとうございます。少し休みます。おやすみなさい。 | `/audio/call/1-2/success.mp3` |

### 1-3 出差帶回的期待（來電者：陽）

| lineId | 類型 | speaker | 文字 | 建議 audioUrl |
|---|---|---|---|---|
| p1-1 | 填空 cloze | haru | 先輩！夜遅くにすみません。今、京都から東京へ帰りました。 | `/audio/call/1-3/p1-1.mp3` |
| p2-1 | 口說 speak（玩家跟讀範例音） | player | お疲れ様でした。一人ですか？ | `/audio/call/1-3/p2-1.mp3` |
| p3-1 | 填空 cloze | haru | はい、一人です。あの… 今日、京都で先輩に抹茶のお土産を買いました。 | `/audio/call/1-3/p3-1.mp3` |
| p3-2 | 填空 cloze | haru | 月曜日、会社で一緒に食べませんか？ | `/audio/call/1-3/p3-2.mp3` |
| p4-1 | 口說 speak（玩家跟讀範例音） | player | ありがとうございます！とても嬉しいです。 | `/audio/call/1-3/p4-1.mp3` |
| successLine | 過關台詞 | haru | ふふっ、よかったです。じゃあ、月曜日に！おやすみなさい。 | `/audio/call/1-3/success.mp3` |

### 2-1 不想掛斷的撒嬌通話（來電者：陽）

| lineId | 類型 | speaker | 文字 | 建議 audioUrl |
|---|---|---|---|---|
| p1-1 | 填空 cloze | haru | 先輩… 家に着きましたか。あの、今、少しだけ電話をかけてもいいですか？ | `/audio/call/2-1/p1-1.mp3` |
| p2-1 | 口說 speak（玩家跟讀範例音） | player | はい、いいですよ。どうしましたか。 | `/audio/call/2-1/p2-1.mp3` |
| p3-1 | 填空 cloze | haru | さっき別れたばかりですが、もう先輩の声が聞きたいです。 | `/audio/call/2-1/p3-1.mp3` |
| p3-2 | 填空 cloze | haru | 明日も会いたいです。僕の夢を見てくださいね。 | `/audio/call/2-1/p3-2.mp3` |
| p4-1 | 口說 speak（玩家跟讀範例音） | player | ふふっ、分かりました。おやすみなさい。 | `/audio/call/2-1/p4-1.mp3` |
| successLine | 過關台詞 | haru | はい、おやすみなさい。大好きですよ。 | `/audio/call/2-1/success.mp3` |

### 2-2 微吃醋的佔有慾（來電者：陽）

| lineId | 類型 | speaker | 文字 | 建議 audioUrl |
|---|---|---|---|---|
| p1-1 | 填空 cloze | haru | 先輩… 起きていますか。今日、他の男の人と楽しく話さないでください。 | `/audio/call/2-2/p1-1.mp3` |
| p2-1 | 口說 speak（玩家跟讀範例音） | player | 仕事の話ですから、心配しないでください。 | `/audio/call/2-2/p2-1.mp3` |
| p3-1 | 填空 cloze | haru | 分かっています…。でも、仕事が終わってから、僕だけを見てください。 | `/audio/call/2-2/p3-1.mp3` |
| p3-2 | 填空 cloze | haru | 明日は、僕と一緒に帰りませんか？ | `/audio/call/2-2/p3-2.mp3` |
| p4-1 | 口說 speak（玩家跟讀範例音） | player | ええ、一緒に帰りましょう。 | `/audio/call/2-2/p4-1.mp3` |
| successLine | 過關台詞 | haru | 本当ですね？約束ですよ。じゃあ、明日待っています。 | `/audio/call/2-2/success.mp3` |

### 2-3 想要照顧妳的強勢（來電者：陽）

| lineId | 類型 | speaker | 文字 | 建議 audioUrl |
|---|---|---|---|---|
| p1-1 | 口說 speak（玩家跟讀範例音） | player | もしもし、ハルくん。遅くまでお疲れ様。 | `/audio/call/2-3/p1-1.mp3` |
| p2-1 | 填空 cloze | haru | 先輩、声がとても疲れていますよ。今日も晩ご飯を食べていませんね？今から、僕がご飯を作りに行きましょうか！ | `/audio/call/2-3/p2-1.mp3` |
| p3-1 | 口說 speak（玩家跟讀範例音） | player | だめです。もう遅いですから、来ないでください。 | `/audio/call/2-3/p3-1.mp3` |
| p4-1 | 填空 cloze | haru | …分かりました。今日は行きません。でも、少しでも何か食べてください。そして、明日は必ず僕と一緒にご飯を食べなければなりませんよ。 | `/audio/call/2-3/p4-1.mp3` |
| p5-1 | 口說 speak（玩家跟讀範例音） | player | 分かりました。明日は一緒に食べます。 | `/audio/call/2-3/p5-1.mp3` |
| successLine | 過關台詞 | haru | はい。ちゃんと約束を守ってくださいね。おやすみなさい。 | `/audio/call/2-3/success.mp3` |

