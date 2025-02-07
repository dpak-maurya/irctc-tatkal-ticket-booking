// Function to convert month abbreviation to number
export function monthToNumber(month) {
    const monthMap = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    return monthMap[month];
  }
  // Function to introduce a small delay
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
  // Function to check if searchText exists in text
export function textIncludes(text, searchText) {
    return text.trim().toLowerCase().includes(searchText.trim().toLowerCase());
  }

export async function simulateTyping(element, text) {
    if (!element) return;
    element.focus();
    element.value = '';
    for (let char of text) {
        element.value += char;
        // Simulate typing delay
        await delay(100);
    }
}

export function waitForElementToAppear(selector) {
    return new Promise((resolve) => {
        const observer = new MutationObserver((mutationsList, observer) => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}
