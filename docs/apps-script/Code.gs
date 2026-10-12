/**
 * Bereket AI — form receiver.
 * Appends each website submission as a row to the tab named by `sheet`
 * ("waitlist" or "partner"). See docs/apps-script.md for setup.
 *
 * Set the script property SECRET (Project Settings → Script properties)
 * to the same value as APPS_SCRIPT_SECRET in Vercel.
 */

var COLUMNS = {
  waitlist: ["submittedAt", "name", "email", "city", "crop", "consent"],
  partner: ["submittedAt", "name", "organization", "email", "phone", "type", "message"],
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!secret || data.secret !== secret) return reply({ ok: false, error: "unauthorized" });

    var columns = COLUMNS[data.sheet];
    if (!columns) return reply({ ok: false, error: "unknown sheet" });

    var tab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.sheet);
    if (!tab) return reply({ ok: false, error: "missing tab" });

    lock.waitLock(10000);
    if (tab.getLastRow() === 0) tab.appendRow(columns);
    tab.appendRow(
      columns.map(function (c) {
        var v = data[c];
        return v === undefined || v === null ? "" : v;
      })
    );
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
