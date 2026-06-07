function updateSliderValue(hiddenPr, labelPr, slider) {
    const hiddenInput = document.getElementById(hiddenPr);
    const scoreLabel = document.getElementById(labelPr);
    const floatValue = parseFloat(slider.value);
    const roundedValue = Math.round(floatValue);
    scoreLabel.textContent = roundedValue;
    hiddenInput.value = roundedValue;
}

export async function getValue(id, isToString = true) {
    const el = document.getElementById(id);
    if (!el) return null;

    if (el.tagName === 'INPUT' && el.type === 'file') {
        const files = Array.from(el.files);
        if (files.length === 0) return null;

        if (isToString) {
            const contents = await Promise.all(
                files.map(file => file.text())
            );
            return contents.join('\n');
        }
        return el.multiple ? files : files[0];
    } 
    
    return (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') 
        ? el.value 
        : el.textContent;
}


export function setValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if ('value' in el) el.value = value;
    else el.textContent = value;
}

window.getValue = getValue; 
window.setValue = setValue; 
