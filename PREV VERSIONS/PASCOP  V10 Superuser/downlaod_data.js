function saveCSVData(csvData) {
	// Get existing CSV data from storage or initialize an empty array
	chrome.storage.local.get({ 'csvDataArray': [] }, function(result) {
	  let data = result.csvDataArray;
	  data.push(csvData);
  
	  // Save updated CSV data back to storage
	  chrome.storage.local.set({ 'csvDataArray': data }, function() {
		console.log('CSV data saved:', csvData);
	  });
	});
  }
  
  chrome.webRequest.onCompleted.addListener(
	function(details) {
	  const { requestId, url, statusCode, type, timeStamp } = details;
  
	  // Convert UNIX timestamp to readable format
	  const timestamp = new Date(timeStamp).toISOString();
  
	  // Escape commas in the URL to prevent CSV formatting issues
	  const escapedURL = url.replace(/,/g, '%2C');
  
	  const csvData = `${requestId},${escapedURL},${statusCode},${type},${timestamp}\n`;
  
	  // Save CSV data to Chrome storage
	  saveCSVData(csvData);
	},
	{ urls: ['<all_urls>'] },
	['responseHeaders']
  );
  