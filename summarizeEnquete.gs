function setEnqueteValues(){
  const outputSs = SpreadsheetApp.getActiveSpreadsheet();
  const inputEnqueteValues = mergeHospitalBaseInfoToEnquete_();
  // Delete the last row.
  const enqueteValues = inputEnqueteValues.filter((_, idx) => idx != inputEnqueteValues.length - 1);
  const common = init_();
  const outputSheetNames = common.enqueteOutputSheetNameList;
  outputSheetNames.forEach(sheetName => {
    let outputSheetCol = outputSs.getSheetByName(sheetName).getRange(1, 1, 1, outputSs.getSheetByName(sheetName).getLastColumn()).getValues()[0];
    // Add sortOrder column
    outputSheetCol.push('病院コード');
    outputSheetCol.push(common.segmentSortOrderColname);
    const inputColIdx = outputSheetCol.map(x => enqueteValues[0].indexOf(x)).filter(x => x > -1);
    const outputValues = enqueteValues.map(enqueteValue => {
      let temp = [];
      inputColIdx.forEach(idx => temp.push(enqueteValue[idx]));
      return temp;    
    }).filter((_, idx) => idx > 0);
    const targetRange = outputSs.getSheetByName(sheetName).getRange(2, 1, outputValues.length, outputValues[0].length);
    outputSs.getSheetByName(sheetName).getRange(2, 1, outputSs.getSheetByName(sheetName).getLastRow(), outputSs.getSheetByName(sheetName).getLastColumn()).clearContent();
    targetRange.setValues(outputValues);
    targetRange.sort([inputColIdx.length, inputColIdx.length - 1]);
  });
}
/**
 * Returns the results of the survey and basic hospital information merged by hospital name.
 * @param none.
 * @return {Array.string}
 */
function mergeHospitalBaseInfoToEnquete_(){
  const basicHospitalInformation = getHospitalInfomation_();
  // Merge by hospital name.
  const common = init_();
  const enqueteValues = common.inputSheet.getDataRange().getValues();
  const enqueteKeyColIdx = enqueteValues[0].indexOf(common.mergeKeyColname);
  const basicHospitalInformationKeyColIdx = basicHospitalInformation[0].indexOf(common.mergeKeyColname);
  const basicHospitalInformationCategoryKey = basicHospitalInformation[0].indexOf(common.categoryColname);
  const basicHospitalInformationSortOrderKey = basicHospitalInformation[0].indexOf(common.segmentSortOrderColname);
  let anonymity = Array(basicHospitalInformation[0].length).fill('');
  anonymity[basicHospitalInformationKeyColIdx] = common.anonymous;
  anonymity[basicHospitalInformationCategoryKey] = common.anonymous;
  anonymity[basicHospitalInformationSortOrderKey] = 999;
  const mergeValues = enqueteValues.map(enqueteValue => {
    const targetHospitalInformation = basicHospitalInformation.filter(hospitalValue => enqueteValue[enqueteKeyColIdx] == hospitalValue[basicHospitalInformationKeyColIdx])[0];
    const concatHospitalInformation = targetHospitalInformation ? targetHospitalInformation : anonymity;
    const res = enqueteValue.concat(concatHospitalInformation);
    return res;
  });
  // Delete the hospital name entered in the survey.
  const outputValues = mergeValues.map(mergeValue => mergeValue.filter((_, idx) => idx != enqueteKeyColIdx));
  return outputValues;
}
/**
 * Obtain basic hospital information (e.g., name of director).
 * @param none.
 * @return {Array.string} All values on the hospital basic information sheet, sort order of segments.
 */
function getHospitalInfomation_(){
  const basicHospitalInformationUrl = PropertiesService.getScriptProperties().getProperty('basicHospitalInformationUrl');
  const basicHospitalInformationSheetName = PropertiesService.getScriptProperties().getProperty('basicHospitalInformationSheetName');
  const basicHospitalInformationSheet = SpreadsheetApp.openByUrl(basicHospitalInformationUrl).getSheetByName(basicHospitalInformationSheetName);
  const basicHospitalInformation = basicHospitalInformationSheet.getDataRange().getValues();
  const segmentColName = 'セグメント';
  const segmentColIdx = getColIdx_(basicHospitalInformationSheet, 0, segmentColName);
  const common = init_();
  const segmentSortOrder = common.segmentSortOrder;
  const resHospitalInfomation = basicHospitalInformation.map((x, idx) => {
    const sortOrder = idx > 0 ? segmentSortOrder.indexOf(x[segmentColIdx]) : common.segmentSortOrderColname;
    const category = idx > 0 ? x[segmentColIdx] : common.categoryColname;
    return x.concat([sortOrder, category]);
  });
  return resHospitalInfomation;
}
/**
 * Set the properties.
 * @param none.
 * @return none.
 */
function registerScriptProperty(){
  PropertiesService.getScriptProperties().deleteAllProperties;
  // Spreadsheet URL for basic hospital information
  const basicHospitalInformationUrl = 'https://docs.google.com/spreadsheets/d/1pUdd6NJvUsVjRQ-w9OAbT3ISpTsiw6sELtw77ZbgIwo/edit#gid=0';
  const basicHospitalInformationSheetName = 'Base';
  PropertiesService.getScriptProperties().setProperty('basicHospitalInformationUrl', basicHospitalInformationUrl);
  PropertiesService.getScriptProperties().setProperty('basicHospitalInformationSheetName', basicHospitalInformationSheetName);
}
function init_(){
  let res = {};
  res.inputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('フォームの回答 1');
  res.enqueteOutputSheetNameList = ['実績・貢献・環境', '広報', '経費・自由記載'];
  res.mergeKeyColname = '病院名';
  res.categoryColname = 'カテゴリー';
  res.anonymous = '無記名';
  res.commonOutputCols = [res.mergeKeyColname, res.categoryColname, '病院長', 'センター長・部長'];
  res.segmentSortOrderColname = 'segmentSortOrder';
  res.segmentSortOrder = ['センター', '臨床研究部', '院内標榜', '設置なし'];
  return res;
}
/**
 * 
 * @param {Object} The target sheet object.
 * @param {Number} Index of the header line. Line number minus one. Example: 0 for line 1, 8 for line 9.
 * @param {String} Name of the target column.
 * @return {Number}
 */
function getColIdx_(sheet, colRowIdx, colString){
  const target = sheet.getDataRange().getValues()[colRowIdx].map((x, idx) => x == colString ? idx : null).filter(x => x);
  return target[0];
}