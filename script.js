const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const countdownDisplay = document.getElementById('countdown');
let imagesTaken = [];
const totalImages = 3; // Number of images to take
let imageIndex = 0; // Keep track of the number of images taken

// Set up the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
        video.play();
    })
    .catch((err) => {
        console.error("Error accessing camera: ", err);
    });

// Countdown function
function startCountdown() {
    countdownDisplay.style.display = 'block'; // Show countdown
    let count = totalImages;
    
    const countdownInterval = setInterval(() => {
        if (count > 0) {
            countdownDisplay.innerText = count; // Update countdown
            count--;
        } else {
            countdownDisplay.innerText = "Say Cheese!";
            clearInterval(countdownInterval);
            setTimeout(takePhoto, 1000); // Delay before taking the photo
        }
    }, 1000);
}

// Take photo function
function takePhoto() {
    if (imageIndex < totalImages) {
        canvas.width = 640; // Set desired width for better quality
        canvas.height = 480; // Set desired height for better quality
        context.drawImage(video, 0, 0, canvas.width, canvas.height); // Draw the video frame to canvas

        // Add to imagesTaken array
        imagesTaken.push(canvas.toDataURL('image/png')); // Save image as PNG

        // Flash effect
        flashEffect();

        imageIndex++;

        if (imageIndex < totalImages) {
            startCountdown(); // Start the countdown again for the next photo
        } else {
            setTimeout(() => {
                createCollage(); // Create collage after the last photo
            }, 1000);
        }
    }
}

// Flash effect function
function flashEffect() {
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.top = 0;
    flash.style.left = 0;
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'white';
    flash.style.opacity = '0.7';
    flash.style.transition = 'opacity 0.5s';
    document.body.appendChild(flash);
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 500);
    }, 100);
}

// Create collage function
function createCollage() {
    const collageImage = new Image();
    collageImage.src = 'images/image1.jpg'; // Base image
    collageImage.onload = () => {
        // Draw the collage base
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(collageImage, 0, 0, canvas.width, canvas.height);

        // Draw captured images on specific spots in the collage
        imagesTaken.forEach((imgSrc, index) => {
            const img = new Image();
            img.src = imgSrc;
            img.onload = () => {
                const x = (index % 2) * (canvas.width / 2); // Example positions
                const y = Math.floor(index / 2) * (canvas.height / 2);
                context.drawImage(img, x + 20, y + 20, 100, 100); // Position and size
            };
        });

        // Overlay the decorative border
        const borderImage = new Image();
        borderImage.src = 'images/image2.jpg'; // Decorative border image
        borderImage.onload = () => {
            context.drawImage(borderImage, 0, 0, canvas.width, canvas.height);
        };

        // Save and upload functionality
        // ... (Your upload code here)
    };
}

// Start the countdown when the button is clicked
document.getElementById('take-photo').addEventListener('click', startCountdown);
