const segmentSortOrder = new Map(
  [
    ['センター', 10000],
    ['臨床研究部', 20000],
    ['院内標榜', 30000],
    ['設置なし', 40000],
    ['無記名', 90000],
  ],
);
function main(){
  summarizeEnquete_(PropertiesService.getScriptProperties().getProperty('inputFileId1'), PropertiesService.getScriptProperties().getProperty('inputFileId1'));
  summarizeEnquete_(PropertiesService.getScriptProperties().getProperty('inputFileId2'), PropertiesService.getScriptProperties().getProperty('inputFileId2'));
}
function summarizeEnquete_(inputSsId, outputSsId){
  const outputHospInfoHospNameIdx = 1;
  const inputSs = SpreadsheetApp.openById(inputSsId);
  const outputSs = SpreadsheetApp.openById(outputSsId);
  const inputSheetName = 'フォームの回答 1';
  const inputValues = inputSs.getSheetByName(inputSheetName).getDataRange().getValues();
  const basicHospitalInformation = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('basicHospitalInformationId')).getSheetByName(PropertiesService.getScriptProperties().getProperty('basicHospitalInformationSheetName')).getDataRange().getValues();
  const hospNameIdx = 1;
  const outputHospInfo = basicHospitalInformation.map((x, idx) => 
    idx > 0 ? [segmentSortOrder.get(x[3])  + Number(x[0]), x[7], x[3], x[4], x[5]]
            : ['ソート順', '病院名', 'カテゴリー', '病院長', 'センター長・部長']
  );
  const enqueteOutputList = new Map([
    ['実績・貢献・環境', [1, 2, 3, 4, 5, 8, 9, 10, 11]],
    ['広報', [1, 2, 3, 4, 5, 12, 13, 14, 15, 16]],
    ['経費・自由記載', [1, 2, 3, 4, 5, 17, 18, 19, 20, 21]],
  ]);
  const colWidthsList = new Map([
    ['実績・貢献・環境', [21, 140, 74, 77, 85, 80, 80, 80, 80]],
    ['広報', [21, 140, 74, 77, 85, 80, 80, 295, 80, 295]],
    ['経費・自由記載', [21, 140, 74, 77, 85, 80, 80, 80, 295, 295]],
  ]);
  const dummyHospInfo = new Array(outputHospInfo[0].length).fill('');
  const sortOrderIdx = 0;
  const mergeValues = inputValues.map(value => {
    const tempHospName = value[hospNameIdx].replace(/^NHO/i, "");
    const hospName = tempHospName === '弘前病院' ? '弘前総合医療センター' 
                                                : tempHospName !== '' 
                                                  ? tempHospName 
                                                  : value[0] !== "" 
                                                    ? '無記名' 
                                                    : "";
    const target = outputHospInfo.filter(x => x[hospNameIdx] === hospName);
    let hospInfo;
    if (target.length === 1) {
      hospInfo = [...target[0]];
    } else {
      hospInfo = [...dummyHospInfo];
    }
    if (hospName === "無記名") {
      hospInfo[outputHospInfoHospNameIdx] = '無記名';
    } else if (tempHospName === '弘前病院') {
      hospInfo[outputHospInfoHospNameIdx] = '弘前総合医療センター';
    } else {
      hospInfo[outputHospInfoHospNameIdx] = value[hospNameIdx];
    }
    const sortOrder = hospInfo[sortOrderIdx] !== '' 
                                              ? hospInfo[sortOrderIdx]
                                              : segmentSortOrder.get('無記名');
    return [sortOrder, ...hospInfo, ...value, hospName];
  }).sort((x, y) => x[sortOrderIdx] - y[sortOrderIdx]);
  enqueteOutputList.forEach((inputValueIdxList, sheetName) => {
    spreadSheetCommon.insertSheetBySheetName(outputSs.getId(), sheetName);
    const outputSheet = outputSs.getSheetByName(sheetName);
    const outputValues = mergeValues.map(value => inputValueIdxList.map(idx => value[idx]));
    if (outputSheet.getLastRow() > 0) {
      outputSheet.getRange(1, 1, outputSheet.getLastRow(), outputValues[0].length).clearContent();
    } 
    outputSheet.getRange(1, 1, outputValues.length, outputValues[0].length).setValues(outputValues);
    SpreadsheetApp.flush();
    colWidthsList.get(sheetName).forEach((colWidth, idx) => outputSheet.setColumnWidth(idx + 1, colWidth));
    setConditionalFormatRulesColor_(outputSheet);
    outputSheet.getDataRange().setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    outputSheet.getRange('1:1').setFontWeight('bold').setVerticalAlignment('top');
    outputSheet.setFrozenRows(1);
    outputSheet.hideColumn(outputSheet.getRange('A:A'));
  });
}
function setConditionalFormatRulesColor_(targetSheet){
  const colNamesConstant = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ'];
  targetSheet.clearConditionalFormatRules();
  let rules = targetSheet.getConditionalFormatRules();
  const ruleMap = new Map([
    ['1', '#fcd4ec'],
    ['2', '#fcfcd4'],
    ['3', '#d4fcd4'],
    ['4', '#d4ecfc'],
  ]);
  const startColName = 'E';
  const endColName = colNamesConstant[targetSheet.getLastColumn()];
  ruleMap.forEach((color, key) => {
    const addRule = SpreadsheetApp.newConditionalFormatRule()
      .setRanges([targetSheet.getRange(`${startColName}2:${endColName}`)])
      .whenTextEqualTo(key)
      .setBackground(color)
      .build();
    rules = [...rules, addRule];
  });
  targetSheet.setConditionalFormatRules(rules);
}
