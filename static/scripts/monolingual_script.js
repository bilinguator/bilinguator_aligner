if (getURLParameter('focus') === 'true') {
    document.querySelector('.monolingual-paragraph').focus();
    unsetURLParameter('focus');
}


function enableMonolingualChangeStatus () {
    ['left', 'right'].forEach((side) => {
        if (sessionStorage[side + 'FileFound'] === 'true') {
            sessionStorage[side + 'FileChanged'] = 'true';
            enableSaveButtons(side);
        }
    });
}


function applyToSelection (foo, ...args) {
    const paragraph = document.querySelector('.monolingual-paragraph');

    let text = paragraph.value;
    
    const start = paragraph.selectionStart;
    const end = paragraph.selectionEnd;

    if (start === end) {
        return;
    }

    const part1 = text.slice(0, start);
    const part2 = foo(text.slice(start, end), ...args);
    const part3 = text.slice(end);

    paragraph.value = part1 + part2 + part3;
    paragraph.setSelectionRange(start, start + part2.length)
}


function divideByDelimiter (text) {
    return text.replaceAll('<delimiter>', '\n');
}


function concatenateSelection (text, delimiter) {
    return text.replaceAll('\n', delimiter);
}


function trimParagraphs () {
    const characters = prompt('Enter characters to be trimmed from both sides of each line (default: space).', ' ');

    if (!characters) {
        return;
    }

    const paragraph = document.querySelector('.monolingual-paragraph');
    let text = paragraph.value;

    const escapedChars = characters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a regex to match leading and trailing target characters
    // ^[...] matches at the start, [...]$ matches at the end
    const regex = new RegExp(`^[${escapedChars}]+|[${escapedChars}]+$`, 'g');
    
    // Split into paragraphs, map over them to apply the regex, and rejoin
    paragraph.value = text.split('\n')
                          .map(paragraph => paragraph.replace(regex, ''))
                          .join('\n');

    enableMonolingualChangeStatus();
}


function makeMonolingualPanelButtonsFunctional () {

    const trimButton = document.querySelector('#panel-button-trim_tailing_characters');
    if (trimButton) {
        trimButton.addEventListener('click', () => {
            trimParagraphs();
        });
    }
}

makeMonolingualPanelButtonsFunctional();