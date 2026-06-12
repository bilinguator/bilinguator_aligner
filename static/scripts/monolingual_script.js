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

    updateSearchCount();
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


function mergeOrphans () {
    const defaultCharacters = '.!?…:;<>-–—‒؟؛।。！？：；一፡።፣፤፥፦፧፨፠';
    const characters = prompt('Enter characters specifying sentence ending.', defaultCharacters);

    if (!characters) {
        return;
    }

    const paragraph = document.querySelector('.monolingual-paragraph');
    const safeChars = characters.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`([^${safeChars}])\\r?\\n`, 'g');
    paragraph.value = paragraph.value.replace(regex, '$1 ');

    enableMonolingualChangeStatus();
}


function updateSearchCount () {
    const searchInput = document.querySelector('#search-input');
    const searchString = searchInput.value;
    const searchCount = document.querySelector('#search-count');

    if (!searchString) {
        searchCount.innerText = '';
        return;
    }

    const text = document.querySelector('.monolingual-paragraph').value;
    searchCount.innerText = countSubstrings(text, searchString) + ' ×';
}


function updateSearchFromSelection () {
    if (document.activeElement.classList.contains('monolingual-paragraph')) {
        const paragraph = document.activeElement;
        const selectedText = paragraph.value.slice(paragraph.selectionStart, paragraph.selectionEnd);
        document.querySelector('#search-input').value = selectedText;
        updateSearchCount();
    }
}


function setSelectionRange(textarea, selectionStart, selectionEnd) {
    const fullText = textarea.value;
    textarea.value = fullText.substring(0, selectionEnd);

    const scrollHeight = textarea.scrollHeight
    textarea.value = fullText;
    let scrollTop = scrollHeight;
    const textareaHeight = textarea.clientHeight;
    if (scrollTop > textareaHeight){

        scrollTop -= textareaHeight / 2;
    } else{
        scrollTop = 0;
    }
    textarea.scrollTop = scrollTop;

    textarea.setSelectionRange(selectionStart, selectionEnd);
}


function search (searchString) {
    if (!searchString) {
        searchString = document.querySelector('#search-input').value;

        if (!searchString) {
            return;
        }
    }

    const paragraph = document.querySelector('.monolingual-paragraph');

    if (!searchString) {
        return;
    }

    let matchIndex = paragraph.value.indexOf(searchString, paragraph.selectionEnd);

    if (matchIndex === -1) {
        matchIndex = paragraph.value.indexOf(searchString, 0);
    }

    if (matchIndex !== -1) {
        paragraph.blur();
        setSelectionRange(paragraph, matchIndex, matchIndex + searchString.length);
        paragraph.focus();
    } else {
        return;
    }
}


function replace () {
    const searchString = document.querySelector('#search-input').value;
    
    if (!searchString) {
        return;
    }
    
    const paragraph = document.querySelector('.monolingual-paragraph');
    const text = paragraph.value;
    const selectionString = text.slice(paragraph.selectionStart, paragraph.selectionEnd);
    
    if (selectionString !== searchString) {
        search();
        return;
    }
    
    const replacementString = document.querySelector('#replace-input').value;

    const selectionStart = paragraph.selectionStart;
    const selectionEnd = paragraph.selectionEnd;

    const part1 = text.slice(0, selectionStart);
    const part3 = text.slice(selectionEnd);

    paragraph.value = part1 + replacementString + part3;

    const newSelection = selectionStart + replacementString.length;
    paragraph.setSelectionRange(newSelection, newSelection);

    console.log(selectionStart);
    console.log(selectionEnd);
    console.log(newSelection);
    search();

    updateSearchCount();
    enableMonolingualChangeStatus();
}


function replaceAll () {
    
    const searchString = document.querySelector('#search-input').value;
    
    if (!searchString) {
        return;
    }
    
    const paragraph = document.querySelector('.monolingual-paragraph');
    const text = paragraph.value;
    
    if (text.indexOf(searchString) === -1) {
        return;
    }
    
    const replacementString = document.querySelector('#replace-input').value;
    const confirmation = confirm(`Replace all «${searchString}» with «${replacementString}»?`);
    
    if (!confirmation) {
        return;
    }

    paragraph.value = text.replaceAll(searchString, replacementString);

    updateSearchCount();
    enableMonolingualChangeStatus();
}


function showSidebar (show) {
    document.querySelector('#sidebar').hidden = !show;
}


function makeMonolingualPanelButtonsFunctional () {


    const searchInput = document.querySelector('#search-input');
    if (searchInput) {
        searchInput.addEventListener('input', updateSearchCount);
    }

    const searchButton = document.querySelector('#panel-button-search');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            search();
        });
    }

    const replaceButton = document.querySelector('#panel-button-replace');
    if (replaceButton) {
        replaceButton.addEventListener('click', () => {
            replace();
        });
        
        replaceButton.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            replaceAll();
        });
    }

    const removeLineBreaksButton = document.querySelector('#panel-button-remove_linebreaks');
    if (removeLineBreaksButton) {
        removeLineBreaksButton.addEventListener('click', () => {
            mergeOrphans();
        });
    }

    const trimButton = document.querySelector('#panel-button-trim_tailing_characters');
    if (trimButton) {
        trimButton.addEventListener('click', () => {
            trimParagraphs();
        });
    }
}

makeMonolingualPanelButtonsFunctional();