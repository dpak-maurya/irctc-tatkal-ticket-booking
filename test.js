var trainNumber = '12562';
var accommodatiaonClass = '3A';


// Function to click the "Modify Search" button
async function clickModifySearchButton() {
  // Find the current date element
  // var currentDateElement = document.querySelector('.h_head1 > span');

  // Find the "Modify Search" button
  var modifySearchButton = document.querySelector('button.hidden-xs.search_btn');
  if (modifySearchButton) {
    // Simulate a click on the button
    modifySearchButton.click();
  } else {
    console.log('Modify Search button not found.');
    return false; // Return false if the button is not found
  }
}

// Function to wait for the page content to load completely
function waitForPageLoad() {
    return new Promise((resolve) => {
      document.addEventListener('DOMContentLoaded', () => {
        // Resolve the promise when the DOM content is fully loaded
        resolve();
      });
    });
}

function scrollToAndClickLink(trainNumber, accommodationClass) {
  // Find all elements with the class 'train-heading'
  var trainHeadingElements = document.querySelectorAll('.train-heading');
  var commonAncestor = null; // Initialize commonAncestor variable

  // Loop through each train heading element
  for (var i = 0; i < trainHeadingElements.length; i++) {
    var trainHeadingElement = trainHeadingElements[i];
    // Check if the train number is found in the train heading
    if (trainHeadingElement.textContent.includes(trainNumber)) {
      // Scroll to the train heading element
      trainHeadingElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Find the common ancestor of the train heading and the table
      commonAncestor = trainHeadingElement.closest('.ng-star-inserted');

      // Find the table element within the common ancestor
      var tableElement = commonAncestor.querySelector('table');

      // Find all <td> elements within the table
      var tdElements = tableElement.querySelectorAll('td');

      // Loop through each <td> element
      for (var j = 0; j < tdElements.length; j++) {
        // Check if the <td> element contains the desired accommodation class
        if (tdElements[j].textContent.trim().includes(accommodationClass)) {
          // Find the link element within the <td> element
          var linkElement = tdElements[j].querySelector('.link');

          // Check if the link element is found
          if (linkElement) {
            // Trigger a click event on the link element
            linkElement.click();
            console.log('Clicked on link for train:', trainNumber);

            return commonAncestor; // Return the common ancestor if the link is clicked
          } else {
            console.log('Link not found for train:', trainNumber);
            return commonAncestor; // Return the common ancestor if the link is not found
          }
        }
      }
      // Log a message if the accommodation class is not found
      console.log(
        'Accommodation class',
        accommodationClass,
        'not found for train:',
        trainNumber
      );
      return commonAncestor; // Return the common ancestor if the accommodation class is not found
    }
  }

  // Log a message if the train number is not found
  console.log('Train number', trainNumber, 'not found.');
  return commonAncestor; // Return null if the train number is not found
}

function closeOtherDates(commonAncestor) {
  var closelink = commonAncestor.querySelector(
    '.ng-star-inserted div div.link'
  );
  if (closelink) {
    closelink.click();
  }
}

async function bookTicket(trainNumber, accommodationClass) {
    var commonAncestor = scrollToAndClickLink(trainNumber, accommodationClass);
    closeOtherDates(commonAncestor);
  
    // Click the "Modify Search" button
    await clickModifySearchButton();
  
    // Wait for the page content to load completely
    await waitForPageLoad();
  
    // Continue with further actions
    var bookNowButton = commonAncestor.parentNode.querySelector('.btnDefault.train_Search.ng-star-inserted');
  
    // Check if the bookNow button exists
    if (bookNowButton && !bookNowButton.classList.contains('disable-book')) {
      clearInterval(intervalId);
      // If bookNow button exists and not disabled, proceed with further actions
      // bookNowButton.click(); // Uncomment this line if you want to click the button automatically
    } else {
      console.log('Book now button not found or disabled.');
    }
  
  }
  
  // Start the interval and store its ID
  var intervalId = setInterval(function () {
    bookTicket(trainNumber, accommodatiaonClass);
  }, 1000); // 1000 milliseconds = 1 second