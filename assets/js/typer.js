function typeText(element, text) {
    let index = 0;
    function writeChar() {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
            setTimeout(writeChar, 100);  // adjust the delay here
        }
    }
    writeChar();
}

console.log("Type script loaded!");
document.addEventListener("DOMContentLoaded", function() {
    const outputElement = document.getElementById('typed-output');
    // You might need a different way to fetch the text you want to type out
    const textToType = outputElement.textContent;
    outputElement.textContent = ""; // Clear it out so it can be typed into
    typeText(outputElement, textToType);
});
