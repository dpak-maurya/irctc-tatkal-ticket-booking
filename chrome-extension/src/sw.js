// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason == chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// function myFunction(details) {
//   // Your code to be executed upon request completion
//   // You can access details about the response here (headers, status code, etc.)
//   console.log("Network request completed for URL:", details.url);
//   console.log("Status code:", details.statusCode);
//   // Perform actions like injecting content script, modifying DOM, etc.
// }
// chrome.webRequest.onCompleted.addListener(
//   (details) => {
//     // Other logic...

//     // Check if the URL matches the specified pattern
//     if (details.url.match(/^https:\/\/www\.irctc\.co\.in\/eticketing\/protected\/mapps1\/avlFarenquiry\/[^\/]+\/(?:[^\/]+\/)?TQ\/N$/)) {
//       // Your logic for matching URLs with "TQ/N" at the end
//       myFunction();
//     }
//   },
//   // Specify the URL patterns to match
//   { urls: ["*://www.irctc.co.in/eticketing/protected/mapps1/avlFarenquiry/*/TQ/N", "*://www.irctc.co.in/eticketing/protected/mapps1/avlFarenquiry/*/TQ/N/"] },
//   ["responseHeaders"]
// );

