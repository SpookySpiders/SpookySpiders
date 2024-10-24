const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const takePhotoButton = document.getElementById('take-photo');
const savePhotoButton = document.getElementById('save-photo');
const resetPhotoButton = document.getElementById('reset-photo');
const countdownElement = document.getElementById('countdown');

let photos = []; // Store the three photos
let photoTaken = false;

// Initialize camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Error accessing camera: ", err);
  });

// Countdown before taking a photo
function countdown(seconds, callback) {
    countdownElement.innerText = seconds;
    if (seconds > 0) {
        setTimeout(() => countdown(seconds - 1, callback), 1000);
    } else {
        countdownElement.innerText = ''; // Hide countdown
        callback();
    }
}

// Take three photos with a delay between them
takePhotoButton.addEventListener('click', () => {
    let photoIndex = 0;

    function takeNextPhoto() {
        if (photoIndex < 3) {
            countdown(3, () => {
                const photoCanvas = document.createElement('canvas');
                photoCanvas.width = canvas.width;
                photoCanvas.height = canvas.height;
                const photoCtx = photoCanvas.getContext('2d');
                photoCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
                photos.push(photoCanvas); // Save the photo
                photoIndex++;
                takeNextPhoto();
            });
        } else {
            createCollage(); // After 3 photos, create the collage
        }
    }

    takeNextPhoto();
});

// Create the collage of three photos
function createCollage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    let collageHeight = canvas.height / 3; // Divide canvas into three sections

    photos.forEach((photo, index) => {
        ctx.drawImage(photo, 0, collageHeight * index, canvas.width, collageHeight);
    });

    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height); // Add overlay
    photoTaken = true;
    savePhotoButton.disabled = false;
    resetPhotoButton.disabled = false;
    takePhotoButton.disabled = true;
}

// Save photo and upload to Google Drive
savePhotoButton.addEventListener('click', () => {
    if (photoTaken) {
        const imageData = canvas.toDataURL();
        uploadToDrive(imageData);
    }
});

// Reset the photobooth
resetPhotoButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    photos = [];
    photoTaken = false;
    savePhotoButton.disabled = true;
    resetPhotoButton.disabled = true;
    takePhotoButton.disabled = false;
});

// Google Drive API upload
function uploadToDrive(imageData) {
    gapi.load('client:auth2', initClient);

    function initClient() {
        gapi.client.init({
            apiKey: 'AIzaSyB714HMCg52XzNm2aXnZOvFJhH4SM0gXww',
            clientId: '121891098679-ur6k1fpgoq3flcb9g41gbs3btvndi2gd.apps.googleusercontent.com',
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            scope: 'https://www.googleapis.com/auth/drive.file'
        }).then(() => {
            return gapi.auth2.getAuthInstance().signIn();
        }).then(() => {
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";
            const contentType = 'image/png';
            const metadata = {
                'name': 'spooky-photo.png',
                'mimeType': contentType,
                'parents': ['1hQp5hQ-lo2vCOOZCH2VOvi1uIaqzEFAV'] // Set folder to upload the image
            };
            const multipartRequestBody =
                delimiter + 'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter + 'Content-Type: ' + contentType + '\r\n' + '\r\n' +
                imageData.split(',')[1] +
                close_delim;

            gapi.client.request({
                'path': '/upload/drive/v3/files?uploadType=multipart',
                'method': 'POST',
                'params': { 'uploadType': 'multipart' },
                'headers': {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            }).then((response) => {
                console.log('Image uploaded:', response);
            }, (error) => {
                console.error('Error uploading image:', error);
            });
        });
    }
}
