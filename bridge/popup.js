// Popup script to query active DNR rules and status
document.addEventListener("DOMContentLoaded", async () => {
  const statusBadge = document.getElementById("statusBadge");

  try {
    if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.getMatchedRules) {
      // Available if declarativeNetRequestFeedback permission exists
      console.log("DeclarativeNetRequest feedback available");
    }
  } catch (e) {
    console.warn("Could not check matched rules:", e);
  }
});
