SIDEBAR_BUTTON_HTML = '<button class="sidebar-close-button" onclick="showSidebar(false)">×</button>';


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


function trimParagraphs (characters) {
    if (!characters) {
        showSidebar(false);
        characters = prompt('Enter characters to be trimmed from both sides of each line (default: space).', ' ');
    }

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
    showSidebar(false);
    
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
    const sidebar = document.getElementById('sidebar');
    sidebar.hidden = !show;

    if (!show) {
        sidebar.innerHTML = SIDEBAR_BUTTON_HTML;
    }
}


function showSidebarTemplate (templateName) {
    const sidebar = document.getElementById('sidebar');
    
    if (sidebar.hidden) {
        return;
    }

    sidebar.innerHTML = sidebar.innerHTML = SIDEBAR_BUTTON_HTML;
    
    const template = document.getElementById(templateName);
    const templateContent = template.content.cloneNode(true);
    
    const title = document.getElementById('panel-button-' + templateName).title;
    templateContent.querySelector('.sidebar-heading').textContent = title;
    
    sidebar.appendChild(templateContent);
}


function numberSorting (a, b) {
        return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
    }


function detectNotes () {
    const text = document.querySelector('.monolingual-paragraph').value;
    const regex = /\{\d+\}|\[\d+\]|\(\d+\)/g;
    const hits = [...new Set(text.match(regex))];
    
    const message = hits.length === 0 ? 'Notes not found!' : `${hits.length} notes found!`;
    const sidebarMesage = document.querySelector('.sidebar-message');
    sidebarMesage.innerText = message;

    const noteNumberingsTextarea = document.getElementById('note-numberings-textarea');
    noteNumberingsTextarea.value = hits.sort(numberSorting).join('\n');
}


function removeNotes () {
    const noteNumberingsTextarea = document.getElementById('note-numberings-textarea');
    let hits = noteNumberingsTextarea.value.trim();

    if (hits === '') {
        return;
    }

    const pattern = hits
        .split('\n')
        .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');

    const regex1 = new RegExp(`(^(?:${pattern}) *)|( *(?:${pattern})$)`, 'g');
    const regex2 = new RegExp(`\\n+(?:${pattern})\\n+`, 'g');
    const regex3 = new RegExp(`( *(?:${pattern})\\n+)|(\\n+(?:${pattern}) *)`, 'g');
    const regex4 = new RegExp(` *(?:${pattern}) *`, 'g');

    const paragraph = document.querySelector('.monolingual-paragraph');
    paragraph.value = paragraph.value
        .replace(regex1, '')
        .replace(regex2, '\n')
        .replace(regex3, '\n')
        .replace(regex4, ' ');

    detectNotes();
    enableMonolingualChangeStatus();
}


function detectPageNumbers () {
    const text = document.querySelector('.monolingual-paragraph').value;
    const regex = /^\d+$/gm;
    const hits = [...new Set(text.match(regex))];

    const message = hits.length === 0 ? 'Page numbers not found!' : `${hits.length} page numbers found!`;
    const sidebarMesage = document.querySelector('.sidebar-message');
    sidebarMesage.innerText = message;

    const pageNumbersTextarea = document.getElementById('page-numbers-textarea');
    pageNumbersTextarea.value = hits.sort(numberSorting).join('\n');
}


function removePageNumbers () {
    const pageNumbersTextarea = document.getElementById('page-numbers-textarea');
    let hits = pageNumbersTextarea.value.trim();

    if (hits === '') {
        return;
    }

    const pattern = hits
        .split('\n')
        .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');

    const regex1 = new RegExp(`\\n+(?:${pattern})\\n+`, 'g');
    const regex2 = new RegExp(`^(?:${pattern})\\n+`, 'g');
    const regex3 = new RegExp(`\\n+(?:${pattern})$`, 'g');

    const paragraph = document.querySelector('.monolingual-paragraph');
    
    paragraph.value = paragraph.value
        .replace(regex1, '\n')
        .replace(regex2, '')
        .replace(regex3, '')

    detectPageNumbers();
    enableMonolingualChangeStatus();
}


function searchLineFromTextarea (fullLineMatch = false) {
    const textarea = document.activeElement;

    if (!(textarea instanceof HTMLTextAreaElement)) {
        return;
    }

    const selectionEnd = textarea.selectionEnd;

    if (selectionEnd !== textarea.selectionStart) {
        return;
    }

    const text = textarea.value;

    const lineStart = text.lastIndexOf('\n', selectionEnd - 1) + 1;
    const lineEnd = text.indexOf('\n', selectionEnd);

    let currentLineText = text.slice(
        lineStart,
        lineEnd === -1 ? text.length : lineEnd
    );

    currentLineText = fullLineMatch ? '\n'+currentLineText+'\n' : currentLineText;

    search(currentLineText);
    document.activeElement.focus();
}


function makeMonolingualPanelButtonsFunctional () {

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', updateSearchCount);
    }

    const searchButton = document.getElementById('panel-button-search');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            search();
        });
    }

    const replaceButton = document.getElementById('panel-button-replace');
    if (replaceButton) {
        replaceButton.addEventListener('click', () => {
            replace();
        });
        
        replaceButton.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            replaceAll();
        });
    }

    const removeLineBreaksButton = document.getElementById('panel-button-remove_linebreaks');
    if (removeLineBreaksButton) {
        removeLineBreaksButton.addEventListener('click', () => {
            mergeOrphans();
        });
    }

    const trimButton = document.getElementById('panel-button-trim_tailing_characters');
    if (trimButton) {
        trimButton.addEventListener('click', () => {
            trimParagraphs();
        });
    }

    const removePageNumbersButton = document.getElementById('panel-button-remove_page_numbers');
    if (removePageNumbersButton) {
        removePageNumbersButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('remove_page_numbers')
            detectPageNumbers();
        });
    }

    const removeNotesButton = document.getElementById('panel-button-remove_notes');
    if (removeNotesButton) {
        removeNotesButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('remove_notes');
            detectNotes();
        });
    }

    const removeRepetitionsButton = document.getElementById('panel-button-remove_repetitions');
    if (removeRepetitionsButton) {
        removeRepetitionsButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('remove_repetitions')
        });
    }

    const quotationMarksButton = document.getElementById('panel-button-quotation_marks');
    if (quotationMarksButton) {
        quotationMarksButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('quotation_marks')
        });
    }

    const apostrophButton = document.getElementById('panel-button-apostroph');
    if (apostrophButton) {
        apostrophButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('apostroph')
        });
    }

    const dashesButton = document.getElementById('panel-button-dashes');
    if (dashesButton) {
        dashesButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('dashes')
        });
    }

    const ellipsisButton = document.getElementById('panel-button-ellipsis');
    if (ellipsisButton) {
        ellipsisButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('ellipsis')
        });
    }

    const tagHeadingsButton = document.getElementById('panel-button-tag_headings');
    if (tagHeadingsButton) {
        tagHeadingsButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('tag_headings')
        });
    }

    const mergeStrophesButton = document.getElementById('panel-button-merge_strophes_by_delimiter');
    if (mergeStrophesButton) {
        mergeStrophesButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('merge_strophes_by_delimiter')
        });
    }

    const tagCharactersButton = document.getElementById('panel-button-tag_characters_in_the_play');
    if (tagCharactersButton) {
        tagCharactersButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('tag_characters_in_the_play')
        });
    }

    const yoditorButton = document.getElementById('panel-button-yoditor');
    if (yoditorButton) {
        yoditorButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('yoditor')
        });
    }
}

makeMonolingualPanelButtonsFunctional();