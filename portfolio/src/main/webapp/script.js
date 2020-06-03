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
  
  if(navDisplay.style.display === 'block') {
    navDisplay.style.display = 'none';
  } else {
    navDisplay.style.display = 'block';    
  }
}

/**
 * Fetches the current state of the main page and builds the UI.
 */
function getMessage() {
  const commentLimit = document.getElementById('max').value;
  const commentOrder = document.getElementById('order').value;
  fetch('/load-comments?max=' + commentLimit + '&order=' + commentOrder).then(response => response.json()).then((comments) => {
    const messageBody = document.getElementById('comment-container');
    messageBody.innerText='';
    comments.forEach((comment) => {
        messageBody.appendChild(createCommentElement(comment));
    })
  });
}

/**
 * Creates an element that represents a comment, including its delete button.
 */
function createCommentElement(comment) {
  const commentElement = document.createElement('li');
  commentElement.className = 'comment';

  const titleElement = document.createElement('span');
  titleElement.innerText = comment.userComment;

  const deleteButtonElement = document.createElement('button');
  deleteButtonElement.innerText = 'Delete';
  deleteButtonElement.addEventListener('click', () => {
    deleteComment(comment).then(() => commentElement.remove());
  });

  commentElement.appendChild(titleElement);
  commentElement.appendChild(deleteButtonElement);
  return commentElement;
}

/** 
 * Tells the server to delete the message. 
 */
function deleteComment(comment) {
  const params = new URLSearchParams();
  params.append('id', comment.id);
  return fetch('/delete-data', {method: 'POST', body: params});
}