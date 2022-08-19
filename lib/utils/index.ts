export function setImagePreviewFromInput(sourceInput: HTMLInputElement, targetImage: HTMLImageElement) {
    if (!sourceInput.files || !sourceInput.files[0]) return;
    const file = sourceInput.files[0];

    setImagePreviewFromFile(file, targetImage);
}

export function setImagePreviewFromFile(file: File, targetImage: HTMLImageElement) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const image = e.target?.result as string;
        targetImage.src = image;
    };

    reader.readAsDataURL(file);
}

export async function getSrcFromFile(file: File) {
    const src = await readFileAsDataURL(file) as string;
    return src;
}

export async function readFileAsDataURL(file: File) {
    let result_base64 = await new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.onload = (e) => resolve(fileReader.result);
        fileReader.readAsDataURL(file);
    });
    return result_base64;
}