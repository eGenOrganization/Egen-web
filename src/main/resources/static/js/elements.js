function updateSliderValue(hiddenPr, labelPr, slider) {
    const hiddenInput = document.getElementById(hiddenPr);
    const scoreLabel = document.getElementById(labelPr);
    const floatValue = parseFloat(slider.value);
    const roundedValue = Math.round(floatValue);
    scoreLabel.textContent = roundedValue;
    hiddenInput.value = roundedValue;
}

export function getValue(id) {
    const el = document.getElementById(id);
    return (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') ? el.value : el.textContent;
}

export function setValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if ('value' in el) el.value = value;
    else el.textContent = value;
}

window.getValue = getValue; 
window.setValue = setValue; 
