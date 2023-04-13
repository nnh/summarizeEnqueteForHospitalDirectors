# summarizeEnqueteForHospitalDirectors
## 概要
研究事業に関するアンケートの回答結果を集計するスクリプトです。  
## 参照設定
### ライブラリ
下記ライブラリを設定してください。  
nnh/spreadSheetCommon  
https://github.com/nnh/spreadSheetCommon  
### Google Sheets APIサービスを設定してください。  
```
参考：appsscript.json

{
  "timeZone": "America/New_York",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Sheets",
        "version": "v4",
        "serviceId": "sheets"
      }
    ],
    "libraries": [
      {
        "userSymbol": "spreadSheetCommon",
        "version": "0",
        "libraryId": "ライブラリID",
        "developmentMode": true
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```
### スクリプトプロパティ
- basicHospitalInformationId  
NHO施設基本情報のスプレッドシートのIDを設定してください。  
- basicHospitalInformationSheetName  
NHO施設基本情報のシート名を設定してください。  
- inputFileId1  
臨床研究に関する病院長アンケート（回答）のスプレッドシートのIDを設定してください。
- inputFileId2  
臨床研究に関するセンター長・部長アンケート（回答）のスプレッドシートのIDを設定してください。
