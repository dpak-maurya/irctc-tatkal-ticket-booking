import Logger from './logger';

export default async function extractTextFromImage(imageSrc) {
    Logger.info("Extracting text from captcha image...");

    let base64Image;

    if (imageSrc.startsWith("data:image")) {
        // Already a Base64 image, ensure format is correct
        base64Image = imageSrc;
    } else {
        // Fetch image and convert to Base64
        base64Image = await fetchBase64FromUrl(imageSrc);
    }

    // Extract file extension (defaults to PNG if unknown)
    const fileTypeMatch = base64Image.match(/^data:image\/(png|jpeg|jpg|bmp|gif);base64,/);
    const fileType = fileTypeMatch ? fileTypeMatch[1] : "png"; // Default to PNG

    let formData = new FormData();
    formData.append("apikey", "helloworld"); // Free API Key (replace with your own)
    formData.append("language", "eng");
    formData.append("isOverlayRequired", false);
    formData.append("base64Image", base64Image); // Send full Base64 string
    formData.append("filetype", fileType); // Explicitly set file type

    try {
        let response = await fetch("https://api.ocr.space/parse/image", {
            method: "POST",
            body: formData
        });

        let result = await response.json();
        Logger.info("OCR API Response:", result);

        if (result.ParsedResults && result.ParsedResults.length > 0) {
            return result.ParsedResults[0].ParsedText.trim();
        }
    } catch (error) {
        Logger.error("OCR API Error:", error.message);
    }
    return ""; // Return empty string if OCR fails
}

// Helper function: Convert image URL to Base64
async function fetchBase64FromUrl(imageUrl) {
    let response = await fetch(imageUrl);
    let blob = await response.blob();

    return new Promise((resolve) => {
        let reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Keep full Base64 format
        reader.readAsDataURL(blob);
    });
}
