const video = document.getElementById('camera'); 
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const takePhotoButton = document.getElementById('take-photo');
const savePhotoButton = document.getElementById('save-photo');
const resetPhotoButton = document.getElementById('reset-photo');
const countdownDisplay = document.getElementById('countdown');
let imagesTaken = [];

// Set canvas dimensions based on IMG_2043 background template size
function setCanvasDimensions() {
    canvas.width = 1080;  // Set to the width of IMG_2043.PNG
    canvas.height = 1920; // Set to the height of IMG_2043.PNG
}

// Initialize camera
function initializeCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => alert('Error accessing webcam: ' + err));
}

// Updated createCollage function to handle layering, cropping, and alignment
function createCollage() {
    setCanvasDimensions(); // Adjust canvas size

    // Load background image (IMG_2043.PNG)
    const background = new Image();
    background.src = 'IMG_2043.PNG';

    background.onload = () => {
        // Draw the background on the canvas
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Define positions and sizes for images to match white spaces in IMG_2043.PNG
        const positions = [
            { x: 120, y: 200, width: 840, height: 500 },  // Position for the first image
            { x: 120, y: 750, width: 840, height: 500 },  // Position for the second image
            { x: 120, y: 1300, width: 840, height: 500 }  // Position for the third image
        ];

        // Draw each captured image with cropping to maintain aspect ratio
        imagesTaken.forEach((image, index) => {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                const { x, y, width, height } = positions[index];
                const scale = Math.max(width / img.width, height / img.height); // Maintain aspect ratio
                const sw = width / scale;
                const sh = height / scale;
                const sx = (img.width - sw) / 2;
                const sy = (img.height - sh) / 2;
                context.drawImage(img, sx, sy, sw, sh, x, y, width, height);
            };
        });

        // Load and overlay the decorative border (IMG_2042.PNG)
        const overlay = new Image();
        overlay.src = 'IMG_2042.PNG';
        overlay.onload = () => {
            context.drawImage(overlay, 0, 0, canvas.width, canvas.height);
        };
    };
}

// Initialize camera and set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeCamera();

    takePhotoButton.addEventListener('click', async () => {
        countdownDisplay.style.display = 'block';
        
        // Visual countdown
        for (let i = 3; i > 0; i--) {
            countdownDisplay.textContent = i;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        countdownDisplay.style.display = 'none';

        // Capture images and store them in imagesTaken array
        imagesTaken = []; // Reset imagesTaken array
        for (let i = 0; i < 3; i++) {
            // Brief pause for effect
            countdownDisplay.style.display = 'block';
            countdownDisplay.textContent = 'Taking photo in... 3';
            await new Promise(resolve => setTimeout(resolve, 1000));
            countdownDisplay.textContent = 'Taking photo in... 2';
            await new Promise(resolve => setTimeout(resolve, 1000));
            countdownDisplay.textContent = 'Taking photo in... 1';
            await new Promise(resolve => setTimeout(resolve, 1000));
            countdownDisplay.style.display = 'none';

            // Capture the image
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = canvas.toDataURL('image/png');
            imagesTaken.push(imgData);
            alert(`Captured image ${i + 1}`);
        }

        createCollage();
        savePhotoButton.disabled = false;
        resetPhotoButton.disabled = false;
    });

    savePhotoButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'collage.png';
        link.click();
        alert('Hold down on the image and choose "Add to Photos" to save directly.');
    });

    resetPhotoButton.addEventListener('click', () => {
        imagesTaken = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        savePhotoButton.disabled = true;
        resetPhotoButton.disabled = true;
    });
});
