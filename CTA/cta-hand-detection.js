let hoverStart = null;
let selectionMade = false;
let isLanguageSelected = true; // Skip language selection
let showLanguageSelection = false; // Don't show language selection

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const languageOverlay = document.getElementById('languageOverlay');
const ctx = canvas.getContext('2d');

async function setupCamera() {
  try {
    console.log('Requesting camera access...');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' }
    });
    video.srcObject = stream;
    console.log('Camera stream obtained successfully');
    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        resolve();
      };
    });
  } catch (error) {
    console.error('Camera setup failed:', error);
    alert('Camera access is required for hand detection. Please allow camera access and refresh the page.');
    // Hide video elements if camera fails
    if (video) video.style.display = 'none';
    if (canvas) canvas.style.display = 'none';
  }
}

async function start() {
  try {
    console.log('Starting hand detection system...');
    
    await setupCamera();
    if (!video.srcObject) {
      console.error('Camera setup failed, cannot continue');
      return;
    }
    
    video.play();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    console.log(`Canvas size set to: ${canvas.width}x${canvas.height}`);

    // Load BodyPix for person segmentation
    console.log('Loading BodyPix model...');
    const bodyPixNet = await bodyPix.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2
    });
    console.log('BodyPix model loaded successfully');

    // Setup MediaPipe Hands
    console.log('Setting up MediaPipe Hands...');
    const hands = new Hands({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });
    console.log('MediaPipe Hands configured');

  hands.onResults(results => {
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        const palm = landmarks[9]; // Palm center landmark
        const x = palm.x * canvas.width;
        const y = palm.y * canvas.height;

        // Start hand detection timer
        if (!hoverStart) {
          hoverStart = Date.now();
          console.log('Hand detected! Starting timer...');
        }

        const hoverTime = Date.now() - hoverStart;
        const progress = Math.min(hoverTime / 3000, 1); // 3 seconds to redirect

        // Draw main hand indicator circle
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 127, 74, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#FF7F4A';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw progress circle around hand
        if (progress > 0) {
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + 2 * Math.PI * progress;

          ctx.beginPath();
          ctx.arc(x, y, 60, startAngle, endAngle, false);
          ctx.strokeStyle = '#FF7F4A';
          ctx.lineWidth = 8;
          ctx.stroke();

          // Add glow effect
          ctx.shadowColor = '#FF7F4A';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(x, y, 60, startAngle, endAngle, false);
          ctx.strokeStyle = '#FFCB94';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Show progress text
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Tenorite, Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.round(progress * 100)}%`, x, y + 5);
        }

        // Redirect when progress is complete
        if (progress >= 1 && !selectionMade) {
          selectionMade = true;
          console.log('Hand detection complete! Redirecting to index.html...');
          redirectToMainPage();
        }
      }
    } else {
      // Reset timer if no hands detected
      if (hoverStart) {
        hoverStart = null;
        console.log('Hand lost, resetting timer');
      }
    }
  });

  function getOverlappingButton(screenX, screenY, radius = 50) {
    const buttons = document.querySelectorAll('.hoverButton');
    for (const button of buttons) {
      const rect = button.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(screenX - buttonCenterX, 2) + Math.pow(screenY - buttonCenterY, 2)
      );
      
      if (distance <= radius + Math.max(rect.width, rect.height) / 2) {
        return button;
      }
    }
    return null;
  }

  async function render() {
    try {
      // Create person segmentation
      const segmentation = await bodyPixNet.segmentPerson(video, {
        internalResolution: 'medium',
        segmentationThreshold: 0.7
      });

      // Create silhouette mask
      const mask = bodyPix.toMask(
        segmentation,
        { r: 255, g: 255, b: 255, a: 120 }, // White silhouette with transparency
        { r: 0, g: 0, b: 0, a: 0 } // Transparent background
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply the silhouette mask
      ctx.putImageData(mask, 0, 0);
      
      // Send frame to hand detection
      await hands.send({ image: video });
    } catch (error) {
      console.error('Render error:', error);
    }

    requestAnimationFrame(render);
  }

  render();
  } catch (error) {
    console.error('Error starting hand detection:', error);
    alert('Failed to initialize hand detection. Please check console for details.');
  }
}

function redirectToMainPage() {
  console.log('Redirecting to main page...');
  
  // Show redirect message
  showRedirectMessage();
  
  // Redirect after showing message
  setTimeout(() => {
    window.location.href = '../index.html';
  }, 2000);
}

function showRedirectMessage() {
  // Create redirect message
  const redirectMessage = document.createElement('div');
  redirectMessage.className = 'redirect-message';
  redirectMessage.innerHTML = `
    <div class="redirect-content">
      <div class="success-icon">⚽</div>
      <h3>Geweldig!</h3>
      <p>Je wordt doorgestuurd naar de aanmeldingspagina...</p>
      <div class="loading-spinner"></div>
    </div>
  `;
  
  document.body.appendChild(redirectMessage);
}

// Removed unused functions to simplify the script

// Initialize when page loads - start with language selection
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  // Hide language selection overlay
  if (languageOverlay) {
    languageOverlay.style.display = 'none';
    languageOverlay.style.opacity = '0';
  }
  
  // Start camera and hand detection
  start();
} 