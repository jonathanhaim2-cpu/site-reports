/**
 * דיווח יומי - אתרי בנייה — Web App לקבלת דיווחים מטופס מנהלי העבודה
 *
 * הגדרה חד-פעמית:
 * 1. פתח את הגיליון שלך ב-Google Sheets (או צור חדש)
 * 2. הרחבות (Extensions) → Apps Script
 * 3. הדבק את הקוד הזה, שמור
 * 4. עדכן את SHEET_ID למטה (ה-ID מופיע בכתובת ה-URL של הגיליון)
 * 5. פרוס (Deploy) → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. העתק את ה-URL שמתקבל ושים ב-VITE_APPS_SCRIPT_URL באתר (ראה README)
 * 7. בגיליון עצמו: קובץ → שתף → פרסם לאינטרנט (Publish to web) → CSV
 *    את הקישור הזה שים ב-SHEET_URL בהגדרות Vercel (לצורך הדשבורד)
 */

var SHEET_ID = '1I1ZiVRDyj6RI2HXYrlrI17-o8MMZ7b93fip15aniIws'
var SHEET_NAME = 'דיווחים'

var HEADERS = ['תאריך', 'אתר', 'מנהל עבודה', 'חברה', 'עובדים', 'שעות', 'הערות', 'זמן שליחה']

function doPost(e) {
  var out
  try {
    var body = JSON.parse(e.postData.contents)
    var ss = SpreadsheetApp.openById(SHEET_ID)
    var sheet = ss.getSheetByName(SHEET_NAME)
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME)
      sheet.appendRow(HEADERS)
    }
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS)

    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')
    var rows = (body.rows || []).map(function (r) {
      return [body.date, body.site, body.foreman, r.company, r.workers, r.hours, body.notes || '', timestamp]
    })

    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows)
    }

    out = { ok: true, rowsAdded: rows.length }
  } catch (err) {
    out = { ok: false, error: err.toString() }
  }

  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON)
}
