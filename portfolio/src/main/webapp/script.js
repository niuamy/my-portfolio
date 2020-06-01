// Copyright 2019 Google LLC
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

/**
 * Generates a random link on the page.
 */
function generateLink() {
    const links = 
      ['https://www.allrecipes.com/recipe/51301/sarahs-applesauce/','https://www.pexels.com/photo/brown-cattle-on-green-lawn-grass-during-daytime-162240/'];

    // Pick a random link.
    const link = links[Math.floor(Math.random() * links.length)];

    // Add it to the page.
    const linkContainer = document.getElementById('generate-link');
    linkContainer.href = link;
}

/** 
 * Displays and hides navigation menu links.
 */
function navbar() {
  const navDisplay = document.getElementById('nav-links');
  
  if(navDisplay.style.display === "block") {
    navDisplay.style.display = "none";
  } else {
    navDisplay.style.display = "block";    
  }
}

/**
 * Fetches a message from the server and adds it to the DOM.
 */
function getMessage() {
  // The fetch() function returns a Promise because the request is asynchronous.
  const responsePromise = fetch('/data');

  // When the request is complete, pass the response into handleResponse().
  responsePromise.then(handleResponse);
}

/**
 * Handles response by converting it to text and passing the result to
 * addMessageToDom().
 */
function handleResponse(response) {
  // response.text() returns a Promise, because the response is a stream of
  // content and not a simple variable.
  const textPromise = response.text();

  // When the response is converted to text, pass the result into the
  // addQuoteToDom() function.
  textPromise.then(addMessageToDom);
}

/** Adds a server message to the DOM. */
function addMessageToDom(msg) {
  const messageContainer = document.getElementById('quote-container');
  messageContainer.innerText = msg;
}