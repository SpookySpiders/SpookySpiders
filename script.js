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
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Error accessing camera: ", err);
    alert("Could not access camera. Please allow camera access in your browser settings.");
  });

// Countdown before taking a photo
function countdown(seconds, callback) {
    countdownElement.innerText = seconds;
    countdownElement.style.display = 'block'; // Show countdown
    if (seconds > 0) {
        setTimeout(() => countdown(seconds - 1, callback), 1000);
    } else {
        countdownElement.innerText = '';
        callback();
    }
}

// Flash effect
function flash() {
    document.body.style.backgroundColor = 'white'; // Flash white
    setTimeout(() => {
        document.body.style.backgroundColor = 'black'; // Return to black
    }, 100);
}

// Take three photos with a delay between them
takePhotoButton.addEventListener('click', () => {
    let photoIndex = 0;

    function takeNextPhoto() {
        if (photoIndex < 3) {
            countdown(3, () => {
                flash(); // Flash before taking a photo
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

// Create the collage of three photos in predefined spaces
function createCollage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    
    // Define positions and dimensions for each photo in the collage
    const positions = [
        { x: 10, y: 10, width: canvas.width / 3 - 20, height: canvas.height / 2 - 20 },
        { x: canvas.width / 3 + 10, y: 10, width: canvas.width / 3 - 20, height: canvas.height / 2 - 20 },
        { x: 10, y: canvas.height / 2 + 10, width: canvas.width - 20, height: canvas.height / 2 - 20 },
    ];

    photos.forEach((photo, index) => {
        ctx.drawImage(photo, positions[index].x, positions[index].y, positions[index].width, positions[index].height);
    });

    // Overlay the decorative border
    const borderImage = new Image();
    borderImage.src = 'images/image2.png'; // Path to your decorative border image
    borderImage.onload = () => {
        ctx.drawImage(borderImage, 0, 0, canvas.width, canvas.height); // Draw the overlay
    };

    photoTaken = true;
    savePhotoButton.disabled = false;
    resetPhotoButton.disabled = false;
    takePhotoButton.disabled = true;
}

// Save photo and upload to Google Drive
savePhotoButton.addEventListener('click', () => {
    if (photoTaken) {
        const imageData = canvas.toDataURL('image/png'); // Ensure the correct format
        uploadToDrive(imageData);
        
        // Optionally, save the image to the user's device
        const link = document.createElement('a');
        link.href = imageData;
        link.download = 'spooky-collage.png'; // File name for download
        link.click(); // Trigger download
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
    countdownElement.style.display = 'none'; // Hide countdown
});

// Google Drive API upload (same as before)
function uploadToDrive(imageData) {
    gapi.load('client:auth2', initClient);

    function initClient() {
        gapi.client.init({
            apiKey: 'YOUR_API_KEY', // Your API key
            clientId: 'YOUR_CLIENT_ID', // Your client ID
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            scope: 'https://www.googleapis.com/auth/drive.file'
        }).then(() => {
            return gapi.auth2.getAuthInstance().signIn();
        }).then(() => {
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";
            const metadata = {
                'name': 'spooky-collage.png',
                'mimeType': 'image/png',
                'parents': ['YOUR_FOLDER_ID'] // Set folder to upload the image
            };
            const multipartRequestBody =
                delimiter + 'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter + 'Content-Type: image/png\r\n\r\n' +
                imageData.split(',')[1] +
                close_delim;

            gapi.client.request({
                'path': '/upload/drive/v3/files?uploadType=multipart',
                'method': 'POST',
                'headers': {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            }).then((response) => {
                console.log('Image uploaded:', response);
                alert('Photo uploaded successfully!');
            }, (error) => {
                console.error('Error uploading image:', error);
                alert('Upload failed. Please try again.');
            });
        });
    }
}
