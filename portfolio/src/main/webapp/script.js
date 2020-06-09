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

google.charts.load('current', {'packages':['corechart']});

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
 * Creates a map of the Googleplex and adds it to the page.
 */
function createMap() {
  const googleplex = {lat: 37.422, lng: -122.084};
  const map = new google.maps.Map(
    document.getElementById('googleplex-map'),
    {center: googleplex, zoom: 16});

  const image = 'images/marker.png';
  const marker = new google.maps.Marker({position: googleplex, map: map, animation: google.maps.Animation.DROP});
  const draggableMarker = new google.maps.Marker({position: {lat: 37.422, lng: -122.083}, map: map, title: "drag me", icon: image, draggable: true, animation: google.maps.Animation.DROP});
	
  const googleplexInfo = `<h2>Googleplex</h2><p>This is where I would've worked if not for Covid-19</p><img src="images/googleplex.jpg" alt="Googleplex" width="350">`;
  const dragMarkerInfo = '<p>I am a draggable marker. Drag me.</p>';
  const googleplexInfoWindow = new google.maps.InfoWindow({content: googleplexInfo}); 
  const dragMarkerInfoWindow = new google.maps.InfoWindow({content: dragMarkerInfo});

  marker.addListener('click', function() {
    googleplexInfoWindow.open(map, marker);
  });
  draggableMarker.addListener('click', function() {
    dragMarkerInfoWindow.open(map, draggableMarker);
  });
}

/**
 * Creates a map of restaurants and adds it to the page.
 */
function createRestaurantMap() {
  fetch('/restaurant-map-data').then(response => response.json()).then((restaurants) => {
    const map = new google.maps.Map(
      document.getElementById('restaurants-map'),
      {center: {lat: 39.975774, lng: -83.004708}, zoom: 11});

    restaurants.forEach((restaurant) => {
      const marker = new google.maps.Marker(
        {position: {lat: restaurant.lat, lng: restaurant.lng}, map: map});
      const description = '<h2>' + restaurant.name + '</h2><a href=\'' + restaurant.website + '\'><p>' + restaurant.website + '</p></a>';
      const infoWindow = new google.maps.InfoWindow({content: description});
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  });
}

/** Creates a chart and adds it to the page. */
function drawMentalHealthChart() {
  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Year');
  data.addColumn('number', 'Percentage (Men)');
  data.addColumn('number', 'Percentage (Women)');
        data.addRows([
          ['2002', 8.7, 16.9],
          ['2003', 8.5, 17.5],
          ['2004', 8.8, 16.6],
          ['2005', 8.9, 16.8],
          ['2006', 8.9, 16.6],
          ['2007', 9.2, 17.1],
          ['2008', 9.4, 17.3],
          ['2009', 9.3, 17.2],
          ['2010', 9.5, 17.8],
          ['2011', 9.9, 17.1],
          ['2012', 10.2, 18.6],
          ['2013', 10.1, 18.8],
          ['2014', 10.6, 18.8],
          ['2015', 10.3, 17.8],
          ['2016', 9.9, 18.5],
          ['2017', 10.5, 18.8],
          ['2018', 10.1, 19.5]
        ]);

  const options = {
    'title': 'Percentage of U.S. men and women who received mental health treatment or counseling in the past year from 2002 to 2018',
    'width': '100%',
    'height':399
  };

  const chart = new google.visualization.ColumnChart(document.getElementById('mental-health-chart'));
  chart.draw(data, options);
}

/** Fetches emotional health data and uses it to create a chart. */
function drawEmotionalHealthChart() {
  fetch('/emotional-health-data').then(response => response.json())
  .then((emotionalHealthVotes) => {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Frequency');
    data.addColumn('number', 'Votes');
    Object.keys(emotionalHealthVotes).forEach((vote) => {
      data.addRow([vote, emotionalHealthVotes[vote]]);
    });

    const options = {
      'title': 'Tracking Frequency At Which Adults Set Aside Time To Check In With How They Are Feeling',
      'width': '100%',
      'height':400
    };

    const chart = new google.visualization.ColumnChart(
      document.getElementById('emotional-health-chart'));
    chart.draw(data, options);
  });
}


/**
 * Change images to kittens.
 */
function activateKittenMode() {
  const img = document.getElementsByClassName("kitten-mode");
  const kittens = ['images/kittens/kitten0.jpg', 'images/kittens/kitten1.jpg',
    'images/kittens/kitten2.jpg','images/kittens/kitten3.jpg',
    'images/kittens/kitten4.jpg','images/kittens/kitten5.jpg',
    'images/kittens/kitten6.jpg','images/kittens/kitten11.jpg',
    'images/kittens/kitten7.jpg','images/kittens/kitten9.jpg',
    'images/kittens/kitten10.jpg','images/kittens/kitten18.jpg',
    'images/kittens/kitten12.jpg','images/kittens/kitten13.jpg',
    'images/kittens/kitten15.jpg','images/kittens/kitten14.jpg',
    'images/kittens/kitten16.jpg','images/kittens/kitten17.jpg'];
  const normalImgs = ['images/leftTriangle.PNG', 'images/centerRectangle.PNG',
    'images/rightTriangle.PNG', 'images/leftRectangle.PNG',
    'images/circle.PNG', 'images/rightRectangle.PNG',
    'images/aboutMe.PNG', 'images/myProjects.PNG',
    'images/contactMe.PNG', 'images/linkedin.PNG',
    'images/github.PNG', 'images/galleryAbout.PNG',
    'images/puzzle.jpeg', 'images/mirror.jpeg',
    'images/bench.jpeg', 'images/my.PNG',
    'images/midTriangle.PNG', 'images/blog.PNG']; 

  if (img[0].getAttribute('src') === 'images/kittens/kitten0.jpg') {
    for (var i = 0; i < img.length; i++) {  
      img[i].src = normalImgs[i];
      document.getElementById('kitten-mode').innerText = 'KITTEN MODE';  
    }
  } else {
    for (var i = 0; i < img.length; i++) {  
      img[i].src = kittens[i]; 
      document.getElementById('kitten-mode').innerText = 'NORMAL MODE';  
    }  
  } 
}

function getBlogDetails() {
  getMessage();
  setMaxLength();
  setSubmitButtonUsability();
  createMap();
  createRestaurantMap();
  drawMentalHealthChart();
  drawEmotionalHealthChart();
}
