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
  const commentName = document.getElementById('name').value;
  fetch('/load-comments?max=' + commentLimit + '&order=' + commentOrder + '&name=' + commentName).then(response => response.json()).then((comments) => {
    const messageBody = document.getElementById('comment-container');
    const nameSelection = document.getElementById('name');
    messageBody.innerText='';
    comments.forEach((comment) => {
      messageBody.appendChild(createCommentElement(comment));

      // Adds names as a selection option based on whether it's unique.
      var isUnique = true;
      const nameSelectionChildren = document.getElementById('name').children;
      var i = 0;
      while (i < nameSelectionChildren.length && isUnique) {
        if (nameSelectionChildren[i].value === comment.userName) isUnique = false; 
        i += 1;
      }
      if (isUnique) nameSelection.appendChild(createOptionElement(comment));
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
  titleElement.innerText = comment.userName + ': ' + comment.userComment;
  
  const heartElement = createHeartElement('images/emptyHeart.png','heart');
  
  const deleteButtonElement = document.createElement('button');
  deleteButtonElement.innerText = 'Delete';
  deleteButtonElement.addEventListener('click', () => {
    deleteComment(comment).then(() => commentElement.remove());
  });

  commentElement.appendChild(titleElement);
  commentElement.appendChild(deleteButtonElement);
  commentElement.appendChild(heartElement);
  return commentElement;
}


/**
 * Creates a heart image element.
 */
function createHeartElement(src, className) {
  const heartElement = document.createElement('img');
  const heartSrc = document.createAttribute('src');
  const heartClass = document.createAttribute('class');
  const width = document.createAttribute('width');
  const height = document.createAttribute('height');
  const toggle = document.createAttribute('onclick');

  heartSrc.value = src;
  heartClass.value = className;
  width.value='25';
  height.value='23';
  toggle.value='toggleHeart(this)';

  heartElement.setAttributeNode(heartSrc);
  heartElement.setAttributeNode(heartClass);
  heartElement.setAttributeNode(width);
  heartElement.setAttributeNode(height);
  heartElement.setAttributeNode(toggle);
  return heartElement;
}

/**
 * Creates an option element that represents a name.
 */
function createOptionElement(comment) {  
  const commentElement = document.createElement('option');
  commentElement.innerText = comment.userName;
  const nameValue = document.createAttribute('value');
  nameValue.value = comment.userName;
  commentElement.setAttributeNode(nameValue);
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

/**
 * Sets the character limit of the comment feature.
 */
function setMaxLength() {
  const width = window.outerWidth;
  const maxLengthComment = document.getElementById("text-input");
  const maxLengthName = document.getElementById("name-input");
  if (width < 769) {
    maxLengthComment.setAttribute("maxlength","15");
    maxLengthName.setAttribute("maxlength", "5");
  } else {
    maxLengthComment.setAttribute("maxlength","65");
    maxLengthName.setAttribute("maxlength", "10")
  }
}

/**
 * Disables or enables comment submit button based on whether required fields are filled in. 
 */
function setSubmitButtonUsability(){
  const nameInput = document.getElementById("name-input").value;
  const textInput = document.getElementById("text-input").value;
  if (nameInput.length == 0 || textInput.length == 0) {
    document.getElementById('submit').disabled = true;
  } else {
    document.getElementById('submit').disabled = false;
  }
}

/**
 * Toggles between an empty heart and a filled heart image.
 */
function toggleHeart(heart) {
  const src = ['images/emptyHeart.png','images/filledHeart.png'];  
  if (heart.getAttribute('src') === src[1]) {
    heart.src = 'images/emptyHeart.png';
  } else {
    heart.src = 'images/filledHeart.png';
  }
}

/**
 * Creates a map and adds it to the page.
 */
function createMap() {
  const googleplex = {lat: 37.422, lng: -122.084};
  const map = new google.maps.Map(
    document.getElementById('map'),
    {center: googleplex, zoom: 16});
  const image = 'images/marker.png';
  const marker = new google.maps.Marker({position: googleplex, map: map, animation: google.maps.Animation.DROP});
  const draggableMarker = new google.maps.Marker({position: {lat: 37.422, lng: -122.0835}, map: map, title: "drag me", icon: image, draggable: true, animation: google.maps.Animation.DROP});
}

function getMessageDetails() {
  getMessage();
  setMaxLength();
  setSubmitButtonUsability();
  createMap();
}
