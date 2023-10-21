function typeText(element, phrases, delayBetweenPhrases, delayBetweenLoops, deleteDelay) {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function writeChar() {
        if (!isDeleting) {
            // Typing forward
            if (charIndex < phrases[phraseIndex].length) {
                element.textContent += phrases[phraseIndex][charIndex];
                charIndex++;
                setTimeout(writeChar, 70);  // delay between characters
            } else {
                setTimeout(() => {
                    isDeleting = true;
                    writeChar();
                }, delayBetweenPhrases);
            }
        } else {
            // Deleting characters
            if (charIndex > 0) {
                element.textContent = element.textContent.slice(0, -1);
                charIndex--;
                setTimeout(writeChar, deleteDelay);  // delay between deleting characters
            } else {
                isDeleting = false;
                phraseIndex++;
                if (phraseIndex >= phrases.length) {
                    phraseIndex = 0;  // loop back to the start
                    setTimeout(writeChar, delayBetweenLoops);
                } else {
                    setTimeout(writeChar, delayBetweenPhrases);
                }
            }
        }
    }
    
    writeChar();
}

document.addEventListener("DOMContentLoaded", function() {
    const outputElement = document.getElementById('typed-output');
    const phrasesToType = [
        "Software Developer 💻",
        "Aspiring Video Game Developer 👾",
        "Philosopher",
        "Gamer",
        "Artist",
        "Researcher",
        "Elixir of code and coffee ☕️",
        "Making computers do cool things since 2018",
        "C++: Where performance meets elegance 🌪️🎩",
        "Master of memory, seeker of pointers 🔍",
        "Chasing bugs like a pro... sometimes they're fast! 🐛",
        "What did Plato say about this?",
        "Everthing is original",
        "Metaphysics is...metaphysics",
        "Hobbbes wrote a book called Leviathan",
        "Gödel, Escher, Bach"
    ];
    typeText(outputElement, phrasesToType, 1000, 2500, 50);  
    // 2s delay between phrases, 4s before restarting, 80ms for each character deletion
});
