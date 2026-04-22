document.addEventListener('DOMContentLoaded', function () {
  var terminalInput   = document.getElementById('terminal-input');
  var terminalOutput  = document.getElementById('terminal-output');
  var terminalWrapper = document.getElementById('terminal-wrapper');
  var toggleBtn       = document.getElementById('terminal-toggle');
  var closeBtn        = document.getElementById('terminal-close');

  function openTerminal() {
    terminalWrapper.style.display = 'block';
    terminalInput.focus();
    toggleBtn.textContent = '$ close terminal';
  }

  function closeTerminal() {
    terminalWrapper.style.display = 'none';
    toggleBtn.textContent = '$ terminal';
  }

  toggleBtn.addEventListener('click', function () {
    terminalWrapper.style.display === 'block' ? closeTerminal() : openTerminal();
  });

  closeBtn.addEventListener('click', closeTerminal);

  terminalInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      handleCommand(this.value.trim());
      this.value = '';
    }
  });

  function appendOutput(html, color) {
    var el = document.createElement('div');
    el.style.marginBottom = '6px';
    if (color) el.style.color = color;
    el.innerHTML = html;
    terminalOutput.appendChild(el);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function handleCommand(command) {
    if (!command) return;

    appendOutput('<span style="color:#666">$ ' + command + '</span>');

    var cmd = command.split(' ')[0].toLowerCase();

    switch (cmd) {
      case 'help':
        appendOutput('available commands: <b>experience</b>, <b>education</b>, <b>skills</b>, <b>hobbies</b>, <b>clear</b>');
        break;

      case 'experience':
        if (aboutMeData && aboutMeData.experience) {
          var lines = aboutMeData.experience.map(function (e) {
            return '<b>' + e.role + '</b> @ ' + e.company +
                   '<br><span style="color:#888">' + e.period + ' · ' + e.location + '</span>';
          });
          appendOutput(lines.join('<br><br>'));
        }
        break;

      case 'education':
        if (aboutMeData && aboutMeData.education) {
          var lines = aboutMeData.education.map(function (e) {
            return '<b>' + e.degree + '</b><br>' + e.institution + ' (' + e.year + ')';
          });
          appendOutput(lines.join('<br><br>'));
        }
        break;

      case 'skills':
        if (aboutMeData && aboutMeData.skills) {
          appendOutput(aboutMeData.skills.join(' &nbsp;·&nbsp; '));
        }
        break;

      case 'hobbies':
        if (aboutMeData && aboutMeData.hobbies) {
          appendOutput(aboutMeData.hobbies.join(', '));
        }
        break;

      case 'clear':
        terminalOutput.innerHTML = '';
        return;

      default:
        appendOutput('command not found: <b>' + command + '</b>. type <b>help</b> for available commands.', '#f88');
    }
  }
});
