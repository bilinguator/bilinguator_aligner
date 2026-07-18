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


// function getLang () {
//     const side = sessionStorage['leftFileFound'] === 'true' ? 'left' : 'right';
//     return document.getElementById(`languages-dropdown-list-${side}`).value;
// }


function replaceByRegex (text, regexStr, oldStr, newStr) {
    const regex = new RegExp(regexStr, 'ug');
    const matches = text.match(regex);
    
    if (!matches) return text;

    // Получаем уникальные совпадения (аналог set() в Python)
    const uniqueHits = Array.from(new Set(matches));

    for (const hit of uniqueHits) {
        const hitReplace = hit.replaceAll(oldStr, newStr);
        text = text.replaceAll(hit, hitReplace);
    }
    
    return text;
}


function recoverApostrophesByLang (text, lang) {
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    console.log(lang);
    if (lang === 'en') {
        let queries = ["I'm", "o'clock", "ma'am", "Qur'an", "ne'er-do-well", "'twere"];
        for (const query of queries) {
            for (const q of [query, query.toUpperCase(), capitalize(query)]) {
                text = replaceByRegex(text, `\\b${q}\\b`, "'", "’");
            }
        }
        
        queries = ['s', 'll', 'd', 've', 're'];
        for (const query of queries) {
            for (const q of [query, query.toUpperCase()]) {
                text = replaceByRegex(text, `\\w'${q}\\b`, "'", "’");
            }
        }
        
        const queryStr = "n't"; 
        for (const q of [queryStr, queryStr.toUpperCase()]) {
            text = replaceByRegex(text, `\\w${q}\\b`, "'", "’");
        }
        
    } else if (lang === 'fr') {
        const queries = ["aujourd'hui"];
        for (const query of queries) {
            for (const q of [query, query.toUpperCase(), capitalize(query)]) {
                const regex = `\\b${q}\\b`;
                text = replaceByRegex(text, regex, "'", "’");
            }
        }
        
        const frPrefixes = ['c', 'd', 'j', 'l', 'n', 'qu', 't', 'm', 's', 'quelqu', 'quoiqu', 'lorsqu', 'puisqu', 'jusqu'];
        for (const query of frPrefixes) {
            for (const q of [query, query.toUpperCase(), capitalize(query)]) {
                const regex = `\\b${q}'\\p{L}`;
                text = replaceByRegex(text, regex, "'", "’");
            }
        }  
    } else if (!lang) {
        const regex = "\\p{L}+'\\p{L}";
        text = replaceByRegex(text, regex, "'", "’");
    }
    
    return text;
}


function updateParagraphsCount () {
    const paragraph = document.querySelector('.monolingual-paragraph');
    const paragraphsCount = countSubstrings(paragraph.value, '\n', false) + 1;
    document.querySelector('.total-count').innerText = paragraphsCount;
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
    updateParagraphsCount();
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
    updateSearchCount();
}


function mergeOrphans () {
    showSidebar(false);

    const currentPosition = getCurretPosition();
    
    const defaultCharacters = '.!?…:;<>-–—‒؟؛।。！？：；一፡።፣፤፥፦፧፨፠';
    const characters = prompt('Enter characters specifying sentence ending.', defaultCharacters);

    if (!characters) {
        return;
    }

    const paragraph = document.querySelector('.monolingual-paragraph');
    const safeChars = characters.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`([^${safeChars}])\\r?\\n`, 'g');
    paragraph.value = paragraph.value.replace(regex, '$1 ');

    updateParagraphsCount();
    enableMonolingualChangeStatus();

    toCurrentPosition(currentPosition);
}


function updateSearchCount () {
    const text = document.querySelector('.monolingual-paragraph').value;

    const searchString = document.getElementById('search-input').value;
    const searchCount = document.getElementById('search-count');

    const isRegex = document.getElementById('regex-checkbox').checked;

    if (!searchString) {
        searchCount.innerText = '';
    } else {
        searchCount.innerText = countSubstrings(text, searchString, isRegex) + ' ×';
    }

    const replaceString = document.getElementById('replace-input').value;
    const replaceCount = document.getElementById('replace-count');

    if (!replaceString) {
        replaceCount.innerText = '';
        return;
    } else {
        replaceCount.innerText = countSubstrings(text, replaceString, false) + ' ×';
    }
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
    if (scrollTop > textareaHeight) {
        scrollTop -= textareaHeight / 2;
    } else {
        scrollTop = 0;
    }
    textarea.scrollTop = scrollTop;

    textarea.setSelectionRange(selectionStart, selectionEnd);
}


// function search (searchString, isRegex = false) {
//     if (!searchString) {
//         searchString = document.querySelector('#search-input').value;

//         if (!searchString) {
//             return;
//         }
//     }

//     const paragraph = document.querySelector('.monolingual-paragraph');

//     if (!searchString) {
//         return;
//     }

//     let matchIndex = paragraph.value.indexOf(searchString, paragraph.selectionEnd);

//     if (matchIndex === -1) {
//         matchIndex = paragraph.value.indexOf(searchString, 0);
//     }

//     if (matchIndex !== -1) {
//         paragraph.blur();
//         setSelectionRange(paragraph, matchIndex, matchIndex + searchString.length);
//         paragraph.focus();
//     } else {
//         return;
//     }
// }

function search (searchString, isRegex) {
    if (!searchString) {
        searchString = document.querySelector('#search-input').value;

        if (!searchString) {
            return;
        }
    }

    if (isRegex === undefined) {
        isRegex = document.getElementById('regex-checkbox').checked;
    }

    const paragraph = document.querySelector('.monolingual-paragraph');

    // Переменные для хранения позиции совпадения и длины найденной строки
    let matchIndex = -1;
    let matchLength = 0;

    if (isRegex) {
        try {
            // Создаем регулярное выражение с флагами g (глобальный) и, например, u (юникод)
            // Если нужно игнорировать регистр, можно добавить флаг 'gi'
            const regex = new RegExp(searchString, 'gm');
            
            // Начинаем поиск с конца текущего выделения
            regex.lastIndex = paragraph.selectionEnd;
            let match = regex.exec(paragraph.value);

            // Если с текущей позиции ничего не нашли, ищем сначала текста (зацикливание)
            if (!match) {
                regex.lastIndex = 0;
                match = regex.exec(paragraph.value);
            }

            if (match) {
                matchIndex = match.index;
                matchLength = match[0].length;
            }
        } catch (e) {
            console.error("Некорректное регулярное выражение", e);
            return; // Завершаем, если регулярка написана с синтаксической ошибкой
        }
    } else {
        // Стандартный поиск обычной подстроки
        matchIndex = paragraph.value.indexOf(searchString, paragraph.selectionEnd);

        if (matchIndex === -1) {
            matchIndex = paragraph.value.indexOf(searchString, 0);
        }
        
        matchLength = searchString.length;
    }

    // Если совпадение найдено, выделяем его
    if (matchIndex !== -1) {
        paragraph.blur();
        // Используем matchLength, так как длина совпадения в RegExp может отличаться от длины самого паттерна
        setSelectionRange(paragraph, matchIndex, matchIndex + matchLength);
        paragraph.focus();
    }
}


// function replace () {
//     const searchString = document.querySelector('#search-input').value;
    
//     if (!searchString) {
//         return;
//     }
    
//     const paragraph = document.querySelector('.monolingual-paragraph');
//     const text = paragraph.value;
//     const selectionString = text.slice(paragraph.selectionStart, paragraph.selectionEnd);
    
//     if (selectionString !== searchString) {
//         search();
//         return;
//     }
    
//     const replacementString = document.querySelector('#replace-input').value;

//     const selectionStart = paragraph.selectionStart;
//     const selectionEnd = paragraph.selectionEnd;

//     const part1 = text.slice(0, selectionStart);
//     const part3 = text.slice(selectionEnd);

//     paragraph.value = part1 + replacementString + part3;

//     const newSelection = selectionStart + replacementString.length;
//     paragraph.setSelectionRange(newSelection, newSelection);

//     console.log(selectionStart);
//     console.log(selectionEnd);
//     console.log(newSelection);
//     search();

//     updateSearchCount();
//     updateParagraphsCount();
//     enableMonolingualChangeStatus();
// }


function replace(isRegex) {
    const searchString = document.querySelector('#search-input').value;
    
    if (!searchString) {
        return;
    }

    if (isRegex === undefined) {
        isRegex = document.getElementById('regex-checkbox').checked;
    }
    
    const paragraph = document.querySelector('.monolingual-paragraph');
    const text = paragraph.value;
    const selectionStart = paragraph.selectionStart;
    const selectionEnd = paragraph.selectionEnd;
    
    // Берем то, что сейчас выделено в тексте
    const selectionString = text.slice(selectionStart, selectionEnd);
    
    // Проверка на совпадение выделения с поисковым запросом
    if (isRegex) {
        try {
            // Создаем регулярное выражение. 
            // Используем только флаг 'u' (unicode), так как глобальный 'g' или регистронезависимый 'i' 
            // должны управляться отдельно, если это нужно для вашей функции search().
            const regex = new RegExp(`^${searchString}$`, 'u');
            
            // Проверяем, что выделенный текст ПОЛНОСТЬЮ соответствует регулярному выражению
            if (!regex.test(selectionString)) {
                search(isRegex = true);
                return;
            }
        } catch (e) {
            console.error("Некорректное регулярное выражение", e);
            return;
        }
    } else {
        // Обычный поиск по строке, как и был
        if (selectionString !== searchString) {
            search();
            return;
        }
    }
    
    const replacementString = document.querySelector('#replace-input').value;

    const part1 = text.slice(0, selectionStart);
    const part3 = text.slice(selectionEnd);

    // Заменяем выделенный кусок текста
    paragraph.value = part1 + replacementString + part3;

    // Сдвигаем курсор в конец вставленной строки
    const newSelection = selectionStart + replacementString.length;
    paragraph.setSelectionRange(newSelection, newSelection);

    console.log(selectionStart);
    console.log(selectionEnd);
    console.log(newSelection);
    
    // Вызываем поиск для перехода к следующему совпадению
    search();

    updateSearchCount();
    updateParagraphsCount();
    enableMonolingualChangeStatus();
}

// const regex = new RegExp(searchString, 'gm');
            
//             // Начинаем поиск с конца текущего выделения
//             regex.lastIndex = paragraph.selectionEnd;
//             let match = regex.exec(paragraph.value);

//             // Если с текущей позиции ничего не нашли, ищем сначала текста (зацикливание)
//             if (!match) {
//                 regex.lastIndex = 0;
//                 match = regex.exec(paragraph.value);
//             }

function replaceAll (searchString, replacementString, isRegex, withConfirmation = true) {
    if (searchString === undefined) {
        searchString = document.querySelector('#search-input').value;

        if (!searchString) {
            return;
        }
    }
    
    if (replacementString === undefined) {
        replacementString = document.querySelector('#replace-input').value;
    }
    
    const currentPosition = getCurretPosition();

    if (isRegex === undefined) {
        isRegex = document.getElementById('regex-checkbox').checked;
    }

    searchString = isRegex ? new RegExp(searchString, 'gm') : searchString;
    
    const paragraph = document.querySelector('.monolingual-paragraph');
    const text = paragraph.value;
    
    if (text.match(searchString).length === 0) {
        return;
    }
    
    if (withConfirmation) {
        const confirmation = confirm(`Replace all «${searchString}» with «${replacementString}»?`);
        
        if (!confirmation) {
            return;
        }
    }

    paragraph.value = text.replaceAll(searchString, replacementString);

    updateSearchCount();
    updateParagraphsCount();
    enableMonolingualChangeStatus();

    toCurrentPosition(currentPosition);
}


function toManualReplacement (searchString, replaceString) {
    showSidebar(false);
    document.getElementById('search-input').value = searchString;
    document.getElementById('replace-input').value = replaceString;
    search(searchString, isRegex = false);
    updateSearchCount();
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

    const sidebarMesage = document.querySelector('.sidebar-message');
    if (hits.length === 0) {
        sidebarMesage.innerText = 'Notes not found!';
    } else if (hits.length === 1) {
        sidebarMesage.innerText = 'One note found!';
    } else {
        sidebarMesage.innerText = `${hits.length} notes found!`;
    }

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
    updateSearchCount();
}


function detectPageNumbers () {
    const text = document.querySelector('.monolingual-paragraph').value;
    const regex = /^\d+$/gm;
    const hits = [...new Set(text.match(regex))];

    const sidebarMesage = document.querySelector('.sidebar-message');
    if (hits.length === 0) {
        sidebarMesage.innerText = 'Page numbers not found!';
    } else if (hits.length === 1) {
        sidebarMesage.innerText = 'One page number found!';
    } else {
        sidebarMesage.innerText = `${hits.length} page numbers found!`;
    }

    const pageNumbersTextarea = document.getElementById('page-numbers-textarea');
    pageNumbersTextarea.value = hits.sort(numberSorting).join('\n');
}


function removeLinesByHitsInTextarea (textareaID) {
    const currentPosition = getCurretPosition();

    const textarea = document.getElementById(textareaID);
    let hits = textarea.value.split('\n');

    if (hits === '') {
        return;
    }

    const paragraph = document.querySelector('.monolingual-paragraph');

    paragraph.value = paragraph.value
        .split('\n')
        .filter(line => !hits.includes(line))
        .join('\n');

    updateParagraphsCount();
    updateSearchCount();

    toCurrentPosition(currentPosition);
}

function removePageNumbers () {
    const currentPosition = getCurretPosition();

    removeLinesByHitsInTextarea('page-numbers-textarea');
    detectPageNumbers();
    enableMonolingualChangeStatus();

    toCurrentPosition(currentPosition);
}


function detectRepeatedLines () {
    const textLines = document.querySelector('.monolingual-paragraph').value.split('\n');
    let repeatedLines = [];

    textLines.forEach((line) => {
        const count = textLines.filter(thisLine => thisLine === line).length;

        if (count > 1) {
            repeatedLines.push(line);
        }
    });

    repeatedLines = [...new Set(repeatedLines)].sort(numberSorting);

    const sidebarMesage = document.querySelector('.sidebar-message');
    if (repeatedLines.length === 0) {
        sidebarMesage.innerText = 'Repeated lines not found!';
    } else if (repeatedLines.length === 1) {
        sidebarMesage.innerText = 'One repeated line found!';
    } else {
        sidebarMesage.innerText = `${repeatedLines.length} repeated lines found!`;
    }

    const textarea = document.getElementById('repeated-lines-textarea');
    textarea.value = repeatedLines.join('\n');
}


function removeRepeatedLines () {
    const currentPosition = getCurretPosition();

    removeLinesByHitsInTextarea('repeated-lines-textarea');
    detectRepeatedLines();
    enableMonolingualChangeStatus();

    toCurrentPosition(currentPosition);
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

    search(currentLineText, isRegex = false);
    document.activeElement.focus();
}


function checkMergeStrophesArguments () {
    const delimiter = document.getElementById('delimiter-textarea').value;

    if (delimiter === '') {
        return false;
    }

    const minimumLinebreaks = document.getElementById('minimum-line-breaks-textarea').value;
    const isNumericMinimumLinebreaks = minimumLinebreaks.match(/^\d+$/);
    
    if (!isNumericMinimumLinebreaks) {
        return false;
    }

    const startLineNumber = document.getElementById('start-line-textarea').value;
    const isNumericStartLineNumber = startLineNumber.match(/^\d+$/);

    if (!isNumericStartLineNumber) {
        return false;
    }

    return true;
}


function mergeStrophesByDelimiter (test = false) {
    
    let text = document.querySelector('.monolingual-paragraph').value;
    const paragraphsCountBefore = countSubstrings(text, '\n', false) + 1;

    if (!checkMergeStrophesArguments()) {
        setParagraphNumbersInMergingStrophes(paragraphsCountBefore, '∅');
        return;
    }

    const delimiter = document.getElementById('delimiter-textarea').value;
    const minimumLinebreaks = parseInt(document.getElementById('minimum-line-breaks-textarea').value);
    const startLineNumber = parseInt(document.getElementById('start-line-textarea').value) - 1;


    const LineBreakPosition = startLineNumber === 0 ? 0 : indexOfNthSubstring(text, '\n', startLineNumber);
    
    const untouchedPart = text.slice(0, LineBreakPosition);
    let processedPart = text.slice(LineBreakPosition + 1);

    const maxNewlinesToReplace = minimumLinebreaks - 1;

    const regex = new RegExp(`(?<!\\n)\\n{1,${maxNewlinesToReplace}}(?!\\n)`, 'g');
    processedPart = processedPart.replace(regex, delimiter)
                                 .replace(/<delimiter><(h1|i|b|img\d+)>/g, '\n<$1>')
                                 .replace(/<\/(h1|i|b)><delimiter>/g, '</$1>\n');

    text = untouchedPart + '\n' + processedPart;

    if (test) {
        const paragraphsCountAfter = countSubstrings(text, '\n', false) + 1;
        setParagraphNumbersInMergingStrophes(paragraphsCountBefore, paragraphsCountAfter);
        return;
    }
    
    const currentPosition = getCurretPosition();

    document.querySelector('.monolingual-paragraph').value = text;
    enableMonolingualChangeStatus();
    updateParagraphsCount();
    updateSearchCount();
    mergeStrophesByDelimiter(test = true);

    toCurrentPosition(currentPosition);
}


function removeEmptyLines () {
    const paragraph = document.querySelector('.monolingual-paragraph');
    paragraph.value = paragraph.value.replace(/^\s*[\r\n]/gm, '');

    const currentPosition = getCurretPosition();

    enableMonolingualChangeStatus();
    updateParagraphsCount();
    updateSearchCount();

    toCurrentPosition(currentPosition);
}


function mergeLinesWithoutOpeningTags () {
    let text = document.querySelector('.monolingual-paragraph').value;
    const paragraphsCountBefore = countSubstrings(text, '\n', false) + 1;
    const delimiter = document.getElementById('delimiter-textarea').value;
    
    if (delimiter === '') {
        return;
    }

    const currentPosition = getCurretPosition();

    const paragraph = document.querySelector('.monolingual-paragraph');
    paragraph.value = paragraph.value.replace(/\n(?!<b>|<h1>|<i>)/g, delimiter);

    enableMonolingualChangeStatus();
    updateParagraphsCount();
    updateSearchCount();
    mergeStrophesByDelimiter(test = true);

    toCurrentPosition(currentPosition);
}


function setParagraphNumbersInMergingStrophes (before, after) {
    document.getElementById('paragraphs-number-before').innerText = before;
    document.getElementById('paragraphs-number-after').innerText = after;
}


function countApostrophes () {
    const text = document.querySelector('.monolingual-paragraph').value;

    document.getElementById('typewriter-apostrophes-count').innerText = countSubstrings(text, "'", false) + ' ×';
    document.getElementById('punctuation-apostrophes-count').innerText = countSubstrings(text, "’", false) + ' ×';
}


function clearSearchResults () {
    const searchArea = document.querySelector('.sidebar-search-area');

    if (searchArea) {
        searchArea.innerHTML = '';
    }
}


function searchCharactersInThePlay () {
    // regexes = getRegexesForCharacters();

    // if (regexes.length === 0) {
    //     return {};
    // }

    let characters = document.getElementById('characters-textarea').value
        .trim()
        .split('\n')
        .filter(Boolean);
    characters = [...new Set(characters)];

    const charactersDelimiter = document.getElementById('characters-delimiter-textarea').value;
    const lineEnd = charactersDelimiter === '' ? '$' : '';

    regexes = characters
        .map(character => '^' + (character + charactersDelimiter).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + lineEnd);

    const text = document.querySelector('.monolingual-paragraph').value;
    const characterCounts = {};

    for (let i = 0; i < characters.length; i++) {
        const characterCount = (text.match(new RegExp(regexes[i], 'ugm')) || []).length;

        if (!characterCount) {
            continue;
        }

        characterCounts[characters[i]] = characterCount;
    }

    return [characterCounts, regexes];
}


function showCharactersCounts () {
    clearSearchResults();

    const [characterCounts, regexes] = searchCharactersInThePlay();
    const searchResultsArea = document.getElementById('characters-search-results');

    console.log(characterCounts);

    if (Object.keys(characterCounts).length === 0) {
        console.log('Characters not found!');
        const messageHTML = '<p class="sidebar-message sidebar-margin-top">Characters not found!</p>'
        searchResultsArea.insertAdjacentHTML('afterbegin', messageHTML);
        return;
    }

    const charactersDelimiter = document.getElementById('characters-delimiter-textarea').value;
    const lineEnd = charactersDelimiter === '' ? '$' : '';
    const characterValues = Object.keys(characterCounts);
    const textareaClasses = 'sidebar-textarea sidebar-oneline-textarea sidebar-textarea-readonly sidebar-hit-textarea sidebar-margin-top';
    
    for (let i = 0; i < characterValues.length; i++) {
        const characterCount = characterCounts[characterValues[i]] + ' ×';
        const escapedPart = (characterValues[i] + charactersDelimiter).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regexAttribute = '^' + escapedPart + lineEnd;
        const regex = regexes[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const itemHTML = `<div class="sidebar-horizontal-container sidebar-margin-top">
            <p class="sidebar-p sidebar-count">${characterCount}</p>
            <textarea class="${textareaClasses}" rows="1" data-regex="${regexAttribute}" onclick="search('${regex}', isRegex=true)" readonly>${characterValues[i] + charactersDelimiter}</textarea>
        </div>`;

        searchResultsArea.insertAdjacentHTML('beforeend', itemHTML);
    }
       
    const tagButtonHTML = `<div class="sidebar-vertical-container sidebar-margin-top">
        <button class="sidebar-button book-panel-button sidebar-margin-top" onclick="tagCharacters()">Tag characters</button>
    </div>`;

    searchResultsArea.insertAdjacentHTML('beforeend', tagButtonHTML);
}


function tagCharacters () {
    const hitTextareas = document.querySelectorAll('.sidebar-hit-textarea');
    const regexes = Array.from(hitTextareas).map(hitTextarea => hitTextarea.dataset.regex);

    const paragraph = document.querySelector('.monolingual-paragraph');
    let text = paragraph.value;

    regexes.forEach(regex => {
        console.log(regex);
        regex = new RegExp(regex.replace(/\\\\/g, '\\'), 'gm');
        text = text.replace(regex, '<b>$&</b>');
    });

    paragraph.value = text;

    enableMonolingualChangeStatus();
    showCharactersCounts();
    updateSearchCount();
}


function replaceApostrophesAutomatically (lang = null) {
    const paragraph = document.querySelector('.monolingual-paragraph');

    paragraph.value = recoverApostrophesByLang(
        paragraph.value,
        lang = lang
    );

    countApostrophes();
    enableMonolingualChangeStatus();
    updateSearchCount();
}


function replaceAllApostrophes () {
    const paragraph = document.querySelector('.monolingual-paragraph');

    paragraph.value = paragraph.value.replaceAll("'", '’');

    countApostrophes();
    enableMonolingualChangeStatus();
    updateSearchCount();
}


function makeMonolingualPanelButtonsFunctional () {
    const regexCheckbox = document.getElementById('regex-checkbox');
    if (regexCheckbox) {
        regexCheckbox.addEventListener('change', updateSearchCount);
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', updateSearchCount);
    }

    const replaceInput = document.getElementById('replace-input');
    if (replaceInput) {
        replaceInput.addEventListener('input', updateSearchCount);
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
            showSidebarTemplate('remove_page_numbers');
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

    const removeRepeatedLinesButton = document.getElementById('panel-button-remove_repeated_lines');
    if (removeRepeatedLinesButton) {
        removeRepeatedLinesButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('remove_repeated_lines');
            detectRepeatedLines();
        });
    }

    const quotationMarksButton = document.getElementById('panel-button-quotation_marks');
    if (quotationMarksButton) {
        quotationMarksButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('quotation_marks');
        });
    }

    const apostrophButton = document.getElementById('panel-button-apostroph');
    if (apostrophButton) {
        apostrophButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('apostroph');
            countApostrophes();
        });
    }

    const dashesButton = document.getElementById('panel-button-dashes');
    if (dashesButton) {
        dashesButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('dashes');
        });
    }

    const ellipsisButton = document.getElementById('panel-button-ellipsis');
    if (ellipsisButton) {
        ellipsisButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('ellipsis');
        });
    }

    const tagHeadingsButton = document.getElementById('panel-button-tag_headings');
    if (tagHeadingsButton) {
        tagHeadingsButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('tag_headings');
        });
    }

    const mergeStrophesButton = document.getElementById('panel-button-merge_strophes_by_delimiter');
    if (mergeStrophesButton) {
        mergeStrophesButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('merge_strophes_by_delimiter');
            mergeStrophesByDelimiter(test = true);
        });
    }

    const tagCharactersButton = document.getElementById('panel-button-tag_characters_in_the_play');
    if (tagCharactersButton) {
        tagCharactersButton.addEventListener('mousedown', () => {
            showSidebar(true);
            showSidebarTemplate('tag_characters_in_the_play');
            document.getElementById('characters-textarea').value = getSelectedText();
        });
    }

    const yoditorButton = document.getElementById('panel-button-yoditor');
    if (yoditorButton) {
        yoditorButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('yoditor');
        });
    }
}

makeMonolingualPanelButtonsFunctional();