// commandline.js
function closeTerminal() {
    // Hide the terminal
    var terminal = document.querySelector('.terminal');
    var allInfo = document.querySelector('.all-info');
    if (terminal) {
      terminal.classList.add('fade-out');

      // Wait for the fade-out effect to finish before hiding the terminal
      terminal.addEventListener('transitionend', function() {
        terminal.style.display = 'none'; 
        terminal.classList.remove('fade-out'); 
      }, { once: true }); 

      setTimeout(() => {
            allInfo.classList.add('popup'); // Add the pop-up class to start the animation
        }, 250);
    }
  
    // Show all information sections
    // var sections = document.querySelectorAll('.right-content > div');
    // sections.forEach(function(section) {
    //   section.style.display = 'block';
    // });
}


document.addEventListener('DOMContentLoaded', function() {
  var terminalInput = document.getElementById('terminal-input');
  var terminalOutput = document.getElementById('terminal-output');
  
  terminalInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      handleCommand(this.value);
      this.value = ''; // Clear input after enter
    }
  });

  var closeButton = document.getElementById('terminal-close');
  closeButton.addEventListener('click', closeTerminal);
  
  function handleCommand(command) {
    switch (command.toLowerCase()) {
      case 'education':
        if (aboutMeData && aboutMeData.education) {
          // Create an array of string representations of each education entry
          const educationStrings = aboutMeData.education.map(edu => {
            return `${edu.degree} <br> ${edu.institution} (${edu.year})`;
          });
          // Join them with line breaks to create the final output string
          terminalOutput.innerHTML = educationStrings.join('<br>');
        } else {
          terminalOutput.textContent = 'No education data available.';
        }
        break;
      case 'skills':
        // Use data from aboutMeData here
        terminalOutput.textContent = aboutMeData.skills.join(', ') || 'No skills information available.';
        break;
      case 'hobbies':
        // Use data from aboutMeData here
        terminalOutput.textContent = aboutMeData.hobbies.join(', ') || 'No hobbies information available.';
        break;
      case 'help':
        terminalOutput.textContent = 'Try typing: education, skills, hobbies';
        break;
      default:
        terminalOutput.textContent = 'Command not recognized. Type "help" for a list of commands.';
    }
  }
});

  

  