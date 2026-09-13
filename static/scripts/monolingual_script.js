SIDEBAR_BUTTON_HTML = '<button class="sidebar-close-button" onclick="showSidebar(false)">×</button>';

function escapeRegExp (str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


if (getURLParameter('focus') === 'true') {
    document.getElementById('monolingual-paragraph').focus();
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


function getLanguage () {
    for (const side of ['left', 'right']) {
        if (sessionStorage[side + 'FileFound'] === 'true') {
            const element = document.getElementById('languages-dropdown-list-' + side);
            return element ? element.value : null;
        }
    }
}


function updateLanguageAlphabet (lang = null) {
    $.ajax({
        url: 'get_language_alphabet',
        type: 'POST',
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            lang: lang === null ? getLanguage() : lang
        }),
        success: function(response) {
            const lang = getLanguage();
            const alphabet = [...response['alphabet']].sort((a, b) => a.localeCompare(b, lang)).join('');
            document.getElementById('alphabet-textarea').value = alphabet;
            
            const text = document.getElementById('monolingual-paragraph').value.toUpperCase();
            
            const textCharacters = [...new Set(text)]
                .sort((a, b) => a.localeCompare(b, lang))
                .filter(char => char !== '\n')
                .join('');
            document.getElementById('unique-characters-textarea').value = textCharacters;
            
            const textSubtractedByAlphabet = [...new Set(textCharacters)]
                .filter(char => !alphabet.includes(char))
                .join('');
            document.getElementById('characters-without-alphabet-textarea').value = textSubtractedByAlphabet;
            
            const unusedAlphabet = [...new Set(alphabet)]
                .filter(char => !textCharacters.includes(char))
                .join('');
            document.getElementById('unused-characters-textarea').value = unusedAlphabet;
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
    });
}


function updateStatisticsFields () {
    updateLanguageAlphabet();
}


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
    const paragraph = document.getElementById('monolingual-paragraph');
    const paragraphsCount = countSubstrings(paragraph.value, '\n', false) + 1;
    document.querySelector('.total-count').innerText = paragraphsCount;
}


function applyToSelection (foo, ...args) {
    const paragraph = document.getElementById('monolingual-paragraph');

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

    const paragraph = document.getElementById('monolingual-paragraph');
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


function removeHTMLEntities () {
    showSidebar(false);
    const confirmation = confirm('Remove HTML entities?');

    if (!confirmation) {
        return;
    }

    const paragraph = document.getElementById('monolingual-paragraph');
    paragraph.innerHTML = paragraph.value;

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

    const paragraph = document.getElementById('monolingual-paragraph');
    const safeChars = characters.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`([^${safeChars}])\\r?\\n`, 'g');
    paragraph.value = paragraph.value.replace(regex, '$1 ');

    updateParagraphsCount();
    enableMonolingualChangeStatus();

    toCurrentPosition(currentPosition);
}


function updateHeadingExample () {
    const numbering = document.getElementById('numbering-select').value;
    
    const numberingExample = {
        'arabic': '5',
        'roman': 'V',
        'chinese': '五',
        'eastern-arabic': '۵',
        'abjad': 'ه',
        'devanagari': '५',
        'bengali': '৫',
        'odia': '୫',
        'tamil': '௫',
        'telugu': '౫',
        'kannada': '೫',
        'malayalam': '൫',
        'thai': '๕',
        'amharic': '፭',
        'lao': '໕',
        'tibetan': '༥',
        'text': 'Five',
        'burmese': '၅',
        'khmer': '၅',
        'mongolian': '᠕',
        'limbu': '᥋'
    }[numbering];

    const chapterWord = document.getElementById('chapter-word-textarea').value;
    const numberingDelimiter = document.getElementById('numbering-delimiter-textarea').value;
    const title = document.getElementById('with-title-checkbox').checked ? ' <TITLE>' : '';
    const numberingFirst = document.getElementById('numbering-first-checkbox').checked;

    let headingExample;

    if (numberingFirst) {
        headingExample = numberingExample + numberingDelimiter + chapterWord + title;
    } else {
        headingExample = chapterWord + numberingDelimiter + numberingExample + title;
    }

    document.getElementById('heading-example').innerText = headingExample;
}


function updateHeadingsCountMessage () {
    const headingsInput = document.getElementById('headings-textarea');
    const headingsCountMessage = document.getElementById('headings-count-message');
    
    if (headingsInput.value.trim() === '') {
        headingsCountMessage.innerText = 'Headings not found!';
        return;
    }
    
    const headingsCount = headingsInput.value.split('\n').length
    headingsCountMessage.innerText = headingsCount + ' headings found.';
}


function searchHeadingsByParameters (
    text,
    chapterWord = '',
    numbering = 'arabic',
    numberingDelimiter = '',
    withTitle = false,
    numberingFirst = false
) {
    let regex = numberingFirst ? '' : chapterWord + numberingDelimiter;

    if (numbering === 'arabic') {
        regex += '[0-9１２３４５６７８９①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛⓪⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴⓵⓶⓷⓸⓹⓺⓻⓼⓽⓾⓿0⃣1⃣2⃣3⃣4⃣5⃣6⃣7⃣8⃣9⃣🔟]+';
    } else if (numbering === 'roman') {
        regex += '[IVXLCDMivxlcdmⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅬⅭⅮⅯⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅺⅻⅼⅽⅾⅿ]+';
    } else if (numbering === 'text') {
        regex += '\\D+';
    } else if (numbering === 'chinese') {
        regex += '[〇一七万三丗两九二五亿仟伍佰億兆兩八六十千卄卅卌叁四廾廿念拾捌柒玖百皕肆萬貳贰陆陸零]+';
    } else if (numbering === 'eastern-arabic') {
        regex += '[۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩]+';
    } else if (numbering === 'abjad') {
        regex += '[أبجدﻩوﺯﺡﻁﻱﻙﻝﻡﻥﺱﻉﻑصﻕﺭﺵﺕﺙﺥﺫﺽﻅﻍ]+';
    } else if (numbering === 'devanagari') {
        regex += '[०१२३४५६७८९]+';
    } else if (numbering === 'bengali') {
        regex += '[০১২৩৪৫৬৭৮৯]+';
    } else if (numbering === 'odia') {
        regex += '[୦୧୨୩୪୫୬୭୮୯]+';
    } else if (numbering === 'tamil') {
        regex += '[௦௧௨௩௪௫௬௭௮௯]+';
    } else if (numbering === 'telugu') {
        regex += '[౦౧౨౩౪౫౬౭౮౯]+';
    } else if (numbering === 'kannada') {
        regex += '[೦೧೨೩೪೫೬೭೮೯]+';
    } else if (numbering === 'malayalam') {
        regex += '[൦൧൨൩൪൫൬൭൮൯൰൱൲]+';
    } else if (numbering === 'thai') {
        regex += '[๐๑๒๓๔๕๖๗๘๙]+';
    } else if (numbering === 'amharic') {
        regex += '[፩፪፫፬፭፮፯፰፱፲፳፴፵፶፷፸፹፺፻፼]+';
    } else if (numbering === 'lao') {
        regex += '[໐໑໒໓໔໕໖໗໘໙]+';
    } else if (numbering === 'tibetan') {
        regex += '[༠༡༢༣༤༥༦༧༨༩]+';
    } else if (numbering === 'burmese') {
        regex += '[၀၁၂၃၄၅၆၇၈၉]+';
    } else if (numbering === 'khmer') {
        regex += '[០១២៣៤៥៦៧៨៩]+';
    } else if (numbering === 'mongolian') {
        regex += '[᠐᠑᠒᠓᠔᠕᠖᠗᠘᠙]+';
    } else if (numbering === 'limbu') {
        regex += '[᥆᥇᥈᥉᥊᥋᥌᥍᥎᥏]+';
    }

    if (numberingFirst) {
        regex += numberingDelimiter + chapterWord;
    }

    if (withTitle) {
        regex += '.+';
    }

    const re = new RegExp(`^${regex}$`);
    const paragraphs = text.split('\n');
    const detected = [];

    for (const paragraph of paragraphs) {
        if (re.test(paragraph.trim())) {
            detected.push(paragraph);
        }
    }

    if (detected.length === 0) {
        return [];
    }

    return detected;
}


function detectHeadingsByParameters () {
    const text = document.getElementById('monolingual-paragraph').value;
    const chapterWord = document.getElementById('chapter-word-textarea').value;
    const numbering = document.getElementById('numbering-select').value;
    const numberingDelimiter = document.getElementById('numbering-delimiter-textarea').value;
    const withTitle = document.getElementById('with-title-checkbox').checked;
    const numberingFirst = document.getElementById('numbering-first-checkbox').checked;
    
    const headingsTextarea = document.getElementById('headings-textarea');
    const headings = searchHeadingsByParameters (
        text,
        chapterWord,
        numbering,
        numberingDelimiter,
        withTitle,
        numberingFirst
    )
    
    headingsTextarea.value = headings.join('\n');
    updateHeadingsCountMessage();
}


function tagHeadings () {
    const textInput = document.getElementById('monolingual-paragraph');
    const headingsInput = document.getElementById('headings-textarea');

    if (!textInput || !headingsInput) return;

    const text = textInput.value;
    
    const headingsList = headingsInput.value
        .split('\n')
        .map(h => h.trim())
        .filter(Boolean);

    const headingSet = new Set(headingsList);

    const processedText = text
        .split('\n')
        .map(line => {
            if (headingSet.has(line.trim())) {
                return `<h1>${line}</h1>`;
            }
            return line;
        })
        .join('\n');

    textInput.value = processedText;

    enableMonolingualChangeStatus();
    detectHeadingsByParameters();
}


function getUniqueUpperCaseLines (text) {
    if (typeof text !== 'string') {
        return [];
    }

    const hasUpperCaseRegex = /\p{Lu}/u;
    const hasNoLowerCaseRegex = /^[^\p{Ll}]*$/u;

    const matchedLines = text.split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && hasUpperCaseRegex.test(line) && hasNoLowerCaseRegex.test(line));

    return Array.from(new Set(matchedLines));
}


function searchUpperCaseHeadings () {
    const text = document.getElementById('monolingual-paragraph').value;
    const upperCaseHeadings = getUniqueUpperCaseLines(text);

    const headingsTextarea = document.getElementById('headings-textarea');
    headingsTextarea.value = upperCaseHeadings.join('\n');
    updateHeadingsCountMessage();
}


function updateSearchCount () {
    const text = document.getElementById('monolingual-paragraph').value;

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
        updateSidebarTextareasCounts('ellipsis-textarea');
        updateSidebarTextareasCounts('dash-textarea');
    }
}


function updateSearchFromSelection () {
    if (document.activeElement.id === 'monolingual-paragraph') {
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

    const paragraph = document.getElementById('monolingual-paragraph');

    let matchIndex = -1;
    let matchLength = 0;

    if (isRegex) {
        try {
            const regex = new RegExp(searchString, 'ugm');
            
            regex.lastIndex = paragraph.selectionEnd;
            let match = regex.exec(paragraph.value);

            if (!match) {
                regex.lastIndex = 0;
                match = regex.exec(paragraph.value);
            }

            if (match) {
                matchIndex = match.index;
                matchLength = match[0].length;
            }
        } catch (e) {
            console.error('Incorrect regular expression!', e);
            return;
        }
    } else {
        matchIndex = paragraph.value.indexOf(searchString, paragraph.selectionEnd);

        if (matchIndex === -1) {
            matchIndex = paragraph.value.indexOf(searchString, 0);
        }
        
        matchLength = searchString.length;
    }

    if (matchIndex !== -1) {
        paragraph.blur();

        setSelectionRange(paragraph, matchIndex, matchIndex + matchLength);
        paragraph.focus();
    }
}


function replace (searchString, replacementString, isRegex, afterSearch = true, matchCase = false) {
    const force = !document.getElementById('sidebar').hidden;

    if (searchString === undefined) {
        searchString = document.getElementById('search-input').value;

        if (!searchString) {
            return;
        }
    }

    if (isRegex === undefined) {
        isRegex = document.getElementById('regex-checkbox').checked;
    }
    
    const paragraph = document.getElementById('monolingual-paragraph');
    const text = paragraph.value;
    const selectionStart = paragraph.selectionStart;
    const selectionEnd = paragraph.selectionEnd;

    if (selectionStart == selectionEnd) {
        if (afterSearch) search();
        return;
    }
    
    const selectionString = text.slice(selectionStart, selectionEnd);
    
    if (isRegex) {
        try {
            const testRegex = new RegExp(searchString, 'um');
        
            if (!testRegex.test(text)) {
                console.log('!testRegex.test(text)');
                return;
            }

            let cleanedSearch = searchString;
            if (cleanedSearch.startsWith('^')) cleanedSearch = cleanedSearch.slice(1);
            if (cleanedSearch.endsWith('$')) cleanedSearch = cleanedSearch.slice(0, -1);

            const regex = new RegExp(`^${cleanedSearch}$`, 'u');

            if (!regex.test(selectionString) && !force) {
                if (afterSearch) search(isRegex = true);
                return;
            }
        } catch (e) {
            console.log('Wrong regular expression!');
            return;
        }
    } else {
        if ((selectionString !== searchString) && !force) {
            if (afterSearch) search();
            return;
        }
    }
    
    const replaceInput = document.getElementById('replace-input');

    if (replacementString === undefined) {
        replacementString = replaceInput.value;
    }

    if (replaceInput.dataset.mode === 'yoditor') {
        matchCase = true;
    }

    if (matchCase && replacementString && selectionString) {
        const isUpperCase = selectionString === selectionString.toUpperCase() && 
                            selectionString !== selectionString.toLowerCase();

        if (isUpperCase) {
            replacementString = replacementString.toUpperCase();
        } else {
            replacementString = replacementString.toLowerCase();
        }
    }

    const part1 = text.slice(0, selectionStart);
    const part3 = text.slice(selectionEnd);

    paragraph.value = part1 + replacementString + part3;

    const newSelection = selectionStart + replacementString.length;
    paragraph.setSelectionRange(newSelection, newSelection);
    
    if (afterSearch) search();

    updateSearchCount();
    updateParagraphsCount();
    enableMonolingualChangeStatus();
}


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
    
    const paragraph = document.getElementById('monolingual-paragraph');
    const text = paragraph.value;

    if (!text.match(searchString)) {
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


function replaceAllDashes () {
    const dashSearch = document.getElementById('dash-search-textarea').value;
    const dashReplacement = document.getElementById('dash-replace-textarea').value;
    
    replaceAll(dashSearch, dashReplacement, isRegex = false, withConfirmation = true);
    updateSidebarTextareasCounts('dash-textarea');
}


function replaceAllEllipses () {
    const ellipsisSearch = document.getElementById('ellipses-search-textarea').value;
    const ellipsisReplacement = document.getElementById('ellipses-replace-textarea').value;
    
    replaceAll(ellipsisSearch, ellipsisReplacement, isRegex = false, withConfirmation = true);
    updateSidebarTextareasCounts('ellipsis-textarea');
}


function toManualReplacement (searchString, replaceString, isRegex) {
    document.getElementById('search-input').value = searchString;
    document.getElementById('replace-input').value = replaceString;
    document.getElementById('regex-checkbox').checked = isRegex;
    search(searchString, isRegex = isRegex);
    updateSearchCount();
}


function toDashesManualReplacement (regex = null, dashReplacement = null) {
    const isRegex = !!regex;
    const dashInSearchTextarea = document.getElementById('dash-search-textarea').value;
    const dashSearch = isRegex ? regex.replace('<>', dashInSearchTextarea) : dashInSearchTextarea;

    dashReplacement = !!dashReplacement ? dashReplacement : document.getElementById('dash-replace-textarea').value;

    toManualReplacement(dashSearch, dashReplacement, isRegex);
    updateSidebarTextareasCounts('dash-textarea');
}


function updateEllipsesTextatea (ellipsis, textareaVariant) {
    document.getElementById(`ellipses-${textareaVariant}-textarea`).value = ellipsis;
}

function updateDashesTextatea (dash, textareaVariant) {
    document.getElementById(`dash-${textareaVariant}-textarea`).value = dash;
}


function toEllipsisManualReplacement () {
    const ellipsisSearch = document.getElementById('ellipses-search-textarea').value;
    const ellipsisReplacement = document.getElementById('ellipses-replace-textarea').value;

    toManualReplacement(ellipsisSearch, ellipsisReplacement, false);
    updateSidebarTextareasCounts('ellipsis-textarea');
}


function getPreviousElementByClass(currentElement, className) {
    let prev = currentElement.previousElementSibling;
    
    while (prev) {
    if (prev.classList.contains(className)) {
        return prev;
    }
        prev = prev.previousElementSibling;
    }
    return null;
}


function updateSidebarTextareasCounts (textareaClass) {
    const text = document.getElementById('monolingual-paragraph').value;

    const textAreas = document.querySelectorAll('.' + textareaClass);
    
    if (textAreas.length === 0) {
        return;
    }

    textAreas.forEach((textarea) => {
        const countElement = getPreviousElementByClass(textarea, 'sidebar-count');

        if (textarea.value) {
            countElement.innerText = countSubstrings(text, textarea.value, false) + ' ×';
        } else {
            countElement.innerText = '';
        }
    });
}


function showSidebar (show) {
    const sidebar = document.getElementById('sidebar');
    sidebar.hidden = !show;
    
    
    if (!show) {
        if (sessionStorage.sidebarTemplate === 'yoditor') {
            unescapeUnambiguousYes('Removing unambiguous Е’s tags…');
        }

        sidebar.innerHTML = SIDEBAR_BUTTON_HTML;
        sessionStorage.removeItem('sidebarTemplate');
    }
}


function showSidebarTemplate (templateName) {
    const sidebar = document.getElementById('sidebar');
    
    if (sidebar.hidden) {
        return;
    }
    
    sessionStorage.sidebarTemplate = templateName;

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
    const text = document.getElementById('monolingual-paragraph').value;
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

    const paragraph = document.getElementById('monolingual-paragraph');
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
    const text = document.getElementById('monolingual-paragraph').value;
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

    const paragraph = document.getElementById('monolingual-paragraph');

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
    const textLines = document.getElementById('monolingual-paragraph').value.split('\n');
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
    
    let text = document.getElementById('monolingual-paragraph').value;
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

    document.getElementById('monolingual-paragraph').value = text;
    enableMonolingualChangeStatus();
    updateParagraphsCount();
    updateSearchCount();
    mergeStrophesByDelimiter(test = true);

    toCurrentPosition(currentPosition);
}


function removeEmptyLines () {
    const paragraph = document.getElementById('monolingual-paragraph');
    paragraph.value = paragraph.value.replace(/^\s*[\r\n]/gm, '');

    const currentPosition = getCurretPosition();

    enableMonolingualChangeStatus();
    updateParagraphsCount();
    updateSearchCount();

    toCurrentPosition(currentPosition);
}


function mergeLinesWithoutOpeningTags () {
    let text = document.getElementById('monolingual-paragraph').value;
    const paragraphsCountBefore = countSubstrings(text, '\n', false) + 1;
    const delimiter = document.getElementById('delimiter-textarea').value;
    
    if (delimiter === '') {
        return;
    }

    const currentPosition = getCurretPosition();

    const paragraph = document.getElementById('monolingual-paragraph');
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
    const text = document.getElementById('monolingual-paragraph').value;

    document.getElementById('typewriter-apostrophes-count').innerText = countSubstrings(text, "'", false) + ' ×';
    document.getElementById('punctuation-apostrophes-count').innerText = countSubstrings(text, "’", false) + ' ×';
}


function getTextQuotationMarks () {
    const quotationMarks = new Set('«»"\'<>‹›„“‚‘’⹂”「」『』﹃﹄﹁﹂《》〈〉⟪⟫⟨⟩❝❞❛❜〝〞〟❮❯');
    const text = document.getElementById('monolingual-paragraph').value;
    const textQuotationMarks = [...new Set(text)].filter(char => quotationMarks.has(char));
    return textQuotationMarks.join('');
}


function updateTextQuotationMarks() {
    const textQuotationMarksDiv = document.getElementById('text-quotation-marks');
    textQuotationMarksDiv.innerHTML = '';
    
    const chars = [...getTextQuotationMarks()];

    if (!chars.length) {
        textQuotationMarksDiv.innerHTML = '<p class="sidebar-message">No quotation marks found!</p>';
        return;
    }
    
    const chunkSize = 7;
    
    const textareaClasses = 'sidebar-textarea sidebar-oneline-textarea sidebar-mini-textarea sidebar-textarea-readonly sidebar-margin-left-textarea';
    const textareaOnclick = `updateSearchQuotationMarks(this.value, 'opening');`;
    const textareaOncontextmenu = `event.preventDefault();updateSearchQuotationMarks(this.value, 'closing');`;

    for (let i = 0; i < chars.length; i += chunkSize) {
        const chunk = chars.slice(i, i + chunkSize);

        const textareasHTML = chunk
            .map(char => `<textarea class="${textareaClasses}" onclick="${textareaOnclick}" oncontextmenu="${textareaOncontextmenu}" readonly>${char}</textarea>`)
            .join('');

        const containerHTML = `<div class="sidebar-horizontal-container sidebar-inner-horizontal-container">${textareasHTML}</div>`;
        textQuotationMarksDiv.insertAdjacentHTML('beforeend', containerHTML);
    }
}


function getLanguageQuotationMarks (lang) {
    const quotesMap = {
        af: [['“', '”'], ['„', '”'], ['‘', '’'], ['‚', '’']],
        nl: [['“', '”'], ['„', '”'], ['‘', '’'], ['‚', '’']],
        ar: [['«', '»'], ['”', '“']],
        hy: [['«', '»']],
        el: [['«', '»'], ['“', '”']],
        fa: [['«', '»']],
        io: [['«', '»'], ['‘', '’']],
        kk: [['«', '»'], ['“', '”']],
        km: [['«', '»'], ['“', '”']],
        ps: [['«', '»']],
        rm: [['«', '»'], ['‹', '›']],
        ug: [['«', '»'], ['‹', '›']],
        am: [['«', '»'], ['“', '”'], ['‹', '›'], ['‘', '’']],
        ti: [['«', '»'], ['“', '”'], ['‹', '›'], ['‘', '’']],
        ca: [['«', '»'], ['“', '”'], ['‘', '’']],
        es: [['«', '»'], ['“', '”'], ['‘', '’']],
        eu: [['«', '»'], ['“', '”'], ['‘', '’']],
        gl: [['«', '»'], ['“', '”'], ['‘', '’']],
        it: [['«', '»'], ['“', '”'], ['‘', '’'], ['‹ ', ' ›']],
        oc: [['«', '»'], ['“', '”']],
        qu: [['«', '»'], ['“', '”']],
        ru: [['«', '»'], ['“', '”'], ['„', '“'], ['‘', '’']],
        az: [['«', '»'], ['„', '“']],
        be: [['«', '»'], ['„', '“']],
        no: [['«', '»'], ['„', '“'], ['‘', '’'], [',', '‘']],
        uz: [['«', '»'], ['„', '“'], ['‚', '‘']],
        bg: [['„', '“'], ['«', '»'], ['’', '’'], ['‘', '’']],
        et: [['„', '“'], ['«', '»']],
        bs: [['”', '”'], ['„', '”'], ['„', '“'], ['’', '’'], ['»', '«']],
        cs: [['„', '“'], ['»', '«'], ['‚', '‘'], ['›', '‹']],
        sk: [['„', '“'], ['»', '«'], ['‚', '‘'], ['›', '‹']],
        sl: [['„', '“'], ['»', '«'], ['‚', '‘'], ['›', '‹']],
        da: [['»', '«'], ['“', '”'], ['”', '”'], ['„', '“'], ['›', '‹'], ['‘', '’'], ['’', '’']],
        de: [['„', '“'], ['»', '«'], ['«', '»'], ['‚', '‘'], ['›', '‹'], ['“', '”']],
        cim: [['„', '“'], ['»', '«'], ['«', '»'], ['‚', '‘'], ['›', '‹'], ['“', '”']],
        en: [['“', '”'], ['‘', '’']],
        eo: [['“', '”'], ['«', '»'], ['„', '“'], ['‘', '’'], ['‹', '›'], ['‚', '‘']],
        fi: [['”', '”'], ['»', '»'], ['’', '’']],
        fil: [['“', '”'], ['‘', '’']],
        ga: [['“', '”'], ['‘', '’']],
        hi: [['“', '”'], ['‘', '’']],
        ia: [['“', '”'], ['‘', '’']],
        lo: [['“', '”']],
        mt: [['“', '”'], ['‘', '’']],
        ta: [['“', '”'], ['‘', '’']],
        th: [['“', '”'], ['‘', '’']],
        ur: [['“', '”'], ['‘', '’']],
        vi: [['“', '”'], ['«', '»']],
        fr: [['« ', ' »'], ['“', '”'], ['«', '»'], ['‹ ', ' ›'], ['‘', '’']],
        cy: [['‘', '’'], ['“', '”']],
        gd: [['‘', '’'], ['“', '”']],
        he: [['"', '"'], ['”', '„'], ['\'', '\''], ['’', ',']],
        hr: [['„', '”'], ['»', '«'], ['‘', '’']],
        hu: [['„', '”'], ['»', '«']],
        ro: [['„', '”'], ['«', '»']],
        id: [['“', '”'], ['”', '”'], ['‘', '’'], ['’', '’']],
        is: [['„', '“'], ['‚', '‘']],
        ka: [['„', '“']],
        lt: [['„', '“'], ['‚', '‘']],
        mk: [['„', '“'], ['’', '‘']],
        sq: [['„', '“'], ['‘', '’']],
        wen: [['„', '“'], ['‚', '‘']],
        ja: [['「', '」'], ['﹁', '﹂'], ['『', '』'], ['﹃', '﹄']],
        jbo: [['lu ', ' li’u'], ['lu “', '” li’u']],
        kl: [['"', '"'], ['»', '«']],
        ko: [['“', '”'], ['﹃', '﹄'], ['《', '》'], ['‘', '’'], ['﹁', '﹂'], ['〈', '〉']],
        bo: [['《', '》'], ['〈', '〉']],
        khb: [['《', '》'], ['〈', '〉']],
        tdd: [['《', '》'], ['〈', '〉']],
        lv: [['“', '”'], ['„', '“']],
        mn: [['«', '»'], ['„', '“'], ['⟪', '⟫'], ['⟨', '⟩']],
        pl: [['„', '”'], ['«', '»'], ['»', '«'], ['‘', '’']],
        pt: [['“', '”'], ['«', '»'], ['‘', '’']],
        tr: [['“', '”'], ['«', '»'], ['‘', '’'], ['‹', '›']],
        sr: [['„', '”'], ['„', '“'], ['»', '«'], ['’', '’']],
        sv: [['”', '”'], ['»', '»'], ['«', '«'], ['’', '’']],
        uk: [['«', '»'], ['„', '“'], ['„', '”'], ['‘', '’']],
        zh: [['「', '」'], ['﹁', '﹂'], ['“', '”'], ['﹃', '﹄'], ['『', '』'], ['‘', '’']]
    };

    return quotesMap[lang] || [];
}


function updateLanguageQuotationMarks () {
    const languageQuotationMarksDiv = document.getElementById('language-quotation-marks');
    languageQuotationMarksDiv.innerHTML = '';

    const lang = getLanguage();
    const languageQuotationMarks = getLanguageQuotationMarks(lang);

    if (!languageQuotationMarks.length) {
        return;
    }

    const textareaClasses = 'sidebar-textarea sidebar-oneline-textarea sidebar-mini-textarea sidebar-textarea-readonly sidebar-margin-left-textarea';

    for (let quotes of languageQuotationMarks) {
        let regex = `(${escapeRegExp(quotes[0])})|(${escapeRegExp(quotes[1])})`;
        
        const textareaOnclick = `updateReplaceQuotationMarks('${quotes[0]}', '${quotes[1]}');`;
        const textareaHTML = `<textarea class="${textareaClasses}" onclick="${textareaOnclick}" readonly>${quotes.join('')}</textarea>`
        languageQuotationMarksDiv.insertAdjacentHTML('beforeend', textareaHTML);
    
    }

    updateReplaceQuotationMarks(languageQuotationMarks[0][0], languageQuotationMarks[0][1]);
}


function updateSearchQuotationMarks (quote, field) {
    const quoteSearchTextarea = document.getElementById(`${field}-quote-search-textarea`);
    quoteSearchTextarea.value = quote;
    updateSidebarTextareasCounts('quote-textarea');
}


function updateReplaceQuotationMarks (openingQuote, closingQuote) {
    const openingQuoteReplaceTextarea = document.getElementById('opening-quote-replace-textarea');
    const closingQuoteReplaceTextarea = document.getElementById('closing-quote-replace-textarea');
    
    openingQuoteReplaceTextarea.value = openingQuote;
    closingQuoteReplaceTextarea.value = closingQuote;

    updateSidebarTextareasCounts('quote-textarea');
}


function replaceQuotationMarksAutomatically () {
    const confirmation = confirm(`Replace quotation marks automatically?`);
    
    if (!confirmation) {
        return;
    }

    const openingQuoteSearch = escapeRegExp(document.getElementById('opening-quote-search-textarea').value);
    const closingQuoteSearch = escapeRegExp(document.getElementById('closing-quote-search-textarea').value);

    const openingQuoteReplace = escapeRegExp(document.getElementById('opening-quote-replace-textarea').value);
    const closingQuoteReplace = escapeRegExp(document.getElementById('closing-quote-replace-textarea').value);

    replaceAll(`(?<=^|\\s)${openingQuoteSearch}(?=\\S)`, openingQuoteReplace, isRegex = true, withConfirmation = false);
    replaceAll(`(?<=\\S)${closingQuoteSearch}(?=\\s|[.,!?;:]|$)`, closingQuoteReplace, isRegex = true, withConfirmation = false);

    updateTextQuotationMarks();
    updateSidebarTextareasCounts('quote-textarea');
}


function getQuotesRegex () {
    const openingQuoteSearch = escapeRegExp(document.getElementById('opening-quote-search-textarea').value);
    const closingQuoteSearch = escapeRegExp(document.getElementById('closing-quote-search-textarea').value);
    return `(${openingQuoteSearch})|(${closingQuoteSearch})`;
}


function searchQuote () {
    search(getQuotesRegex(), isRegex = true);
}


function replaceQuote (quoteVariant) {
    const quote = document.getElementById(`${quoteVariant}-quote-replace-textarea`).value;
    replace(searchString = getQuotesRegex(), replacementString = quote, afterSearch = false, isRegex = true);
    updateTextQuotationMarks();
    updateSidebarTextareasCounts('quote-textarea');
    searchQuote();
}


function findQuoteAlternationMismatch () {
    const sidebarMesage = document.querySelector('.sidebar-message');
    sidebarMesage.innerText = '';

    const paragraph = document.getElementById('monolingual-paragraph');
    if (!paragraph) return;

    const quote1 = document.getElementById('opening-quote-replace-textarea').value;
    const quote2 = document.getElementById('closing-quote-replace-textarea').value;

    if (quote1 === quote2) return;

    const text = paragraph.value;
    console.log(text.length)
    if (!text || !quote1 || !quote2) return;

    const startPos = paragraph.selectionEnd || 0;
    const stopPos = paragraph.selectionStart || 0;

    let expected = null;
    let mismatchIndex = -1;


    function scanRange(from, to) {
        for (let i = from; i < to; i++) {
            const char = text[i];
            
            if (char === quote1 || char === quote2) {
                if (expected === null) {
                    expected = char === quote1 ? quote2 : quote1;
                    continue;
                }

                if (char === expected) {
                    expected = char === quote1 ? quote2 : quote1;
                } else {
                    mismatchIndex = i;
                    return true; // Alternation broken
                }
            }
        }
        return false;
    }

    let found = scanRange(startPos, text.length);

    if (!found && startPos > 0) {
        const limit = (startPos >= stopPos && stopPos > 0) ? stopPos : startPos;
        scanRange(0, limit);
    }

    if (mismatchIndex !== -1) {
        paragraph.focus();
        setSelectionRange(paragraph, mismatchIndex, mismatchIndex + 1);
    } else {
        sidebarMesage.innerText = 'No alternation mismatch found!';
    }
}


function clearSearchResults () {
    const searchArea = document.querySelector('.sidebar-search-area');

    if (searchArea) {
        searchArea.innerHTML = '';
    }
}


function searchCharactersInThePlay () {
    let characters = document.getElementById('characters-textarea').value
        .trim()
        .split('\n')
        .filter(Boolean);
    characters = [...new Set(characters)];

    const charactersDelimiter = document.getElementById('characters-delimiter-textarea').value;
    const lineEnd = charactersDelimiter === '' ? '$' : '';

    regexes = characters
        .map(character => '^' + (character + charactersDelimiter).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + lineEnd);

    const text = document.getElementById('monolingual-paragraph').value;
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

    const paragraph = document.getElementById('monolingual-paragraph');
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


function processText (url, message = null) {
    if (message !== null) {
        showLoading(enable = true, message = message);
    }

    const paragraph = document.getElementById('monolingual-paragraph');

    let xhr = $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            text: paragraph.value
        }),
        success: function(response) {
            paragraph.value = response['text'];
            enableMonolingualChangeStatus();
            updateSearchCount();
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
        complete: function() {
            if (message !== null) {
                showLoading(false);
            }
        },
    });

    document.querySelector('.screen-block-abort-button').addEventListener('click', () => {
        xhr.abort();
    });
}


function dotUnambiguousYos () {
    // dotAmbiguousYos(switchMode = false, quiet = true);
    processText('/dot_unambiguous_yos', 'Dotting unambiguous Ё’s in progress…')
}


function escapeUnambiguousYes () {
    processText('/escape_unambiguous_yes', 'Marking unambiguous Е’s in progress…')
}


function unescapeUnambiguousYes (message) {
    if (message !== null) {
        showLoading(enable = true, message = message);
    }

    const paragraph = document.getElementById('monolingual-paragraph');
    paragraph.value = paragraph.value.replaceAll('<е>', 'е');

    if (message !== null) {
        showLoading(false);
    }

    enableMonolingualChangeStatus();
    updateSearchCount();
}


function generateYoRegex (yoWords) {
  const prefixToSuffixes = new Map();
  const letterBoundary = '[а-яА-ЯёЁ]';

  // Делает подстроку регистронезависимой без использования флага 'i'
  // Пример: "бер" -> "[бБ][еЕ][рР]"
  const makeCaseInsensitive = (str) => {
    return str
      .split('')
      .map((char) => {
        const lower = char.toLowerCase();
        const upper = char.toUpperCase();
        if (lower !== upper) {
          return `[${lower}${upper}]`;
        }
        return escapeRegExp(char);
      })
      .join('');
  };

  // 1. Разбираем слова (ищем и 'ё', и 'Ё')
  for (const word of yoWords) {
    const trimmed = word.trim();
    // Ищем индекс первой 'ё' или 'Ё'
    const yoIndex = trimmed.search(/[ёЁ]/);
    if (yoIndex === -1) continue;

    const prefix = trimmed.slice(0, yoIndex);
    const suffix = trimmed.slice(yoIndex + 1);

    if (!prefixToSuffixes.has(prefix)) {
      prefixToSuffixes.set(prefix, new Set());
    }
    prefixToSuffixes.get(prefix).add(suffix);
  }

  const branches = [];

  // 2. Собираем ветки
  for (const [prefix, suffixesSet] of prefixToSuffixes.entries()) {
    const suffixes = Array.from(suffixesSet).sort();
    
    // Делаем префикс регистронезависимым
    const ciPrefix = makeCaseInsensitive(prefix);

    // Проверка начала слова
    const lookbehind = prefix
      ? `(?<=(?<!${letterBoundary})${ciPrefix})`
      : `(?<!${letterBoundary})`;

    // Анализ суффиксов
    const hasEmpty = suffixes.includes('');
    const nonEmpty = suffixes
      .filter((s) => s !== '')
      .map(makeCaseInsensitive); // Делаем суффиксы регистронезависимыми

    let sufPattern = '';
    if (nonEmpty.length === 1) {
      sufPattern = hasEmpty ? `${nonEmpty[0]}?` : nonEmpty[0];
    } else if (nonEmpty.length > 1) {
      sufPattern = `(?:${nonEmpty.join('|')})`;
      if (hasEmpty) sufPattern += '?';
    }

    // Проверка конца слова
    const lookahead = `(?=${sufPattern}(?!${letterBoundary}))`;

    // Ищем и 'е', и 'Е'
    branches.push(`${lookbehind}[еЕ]${lookahead}`);
  }

  return `(?:${branches.join('|')})`;
}


function getAmbiguousYos () {
    let xhr = $.ajax({
        url: '/get_ambiguous_yos',
        type: 'POST',
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            text: document.getElementById('monolingual-paragraph').value
        }),
        success: function(response) {
            const regex = generateYoRegex(response['ambiguous_yos']);
            document.getElementById('search-input').value = regex;
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
    });
}


function dotAmbiguousYos (switchMode, quiet = false) {
    const replaceInput = document.getElementById('search-input');
    const dotUnambiguousYosButton = document.getElementById('dot-unambiguous-yos-button');
    const sidebarMessage = document.querySelector('.sidebar-message');

    if (switchMode === true) {
        getAmbiguousYos();
        escapeUnambiguousYes();
        document.getElementById('regex-checkbox').checked = true;
        replaceInput.dataset.mode = 'yoditor'
        sidebarMessage.innerText = 'Unambiguous Е / е letters are tagged as <Е> / <е>. ☝️';
        document.getElementById('replace-input').value = 'ё';
        
        dotUnambiguousYosButton.innerText = 'Stop dotting ambiguous Ё’s';
        dotUnambiguousYosButton.setAttribute('onclick', 'dotAmbiguousYos(false)')
    }
    
    if (switchMode === false) {
        const message = quiet ? null : 'Removing unambiguous Е’s tags…';
        unescapeUnambiguousYes(quiet);
        replaceInput.removeAttribute('data-mode');
        dotUnambiguousYosButton.innerText = 'Dot ambiguous Ё’s';
        sidebarMessage.innerText = '';
        dotUnambiguousYosButton.setAttribute('onclick', 'dotAmbiguousYos(true)')
    }
}


function mojify () {
    demojify(withMessage = false);

    showLoading(enable = true, message = 'Mojification in progress…');
    enableSaveButtons('both');

    let xhr = $.ajax({
        url: '/mojify',
        type: 'POST',
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            text1: getCurrentTextFromBilingualMode('left'),
            text2: getCurrentTextFromBilingualMode('right'),
            text1_path: document.querySelector('#book-address-left').value,
            text2_path: document.querySelector('#book-address-right').value,
            lang1: document.querySelector('#languages-dropdown-list-left').value,
            lang2: document.querySelector('#languages-dropdown-list-right').value
        }),
        success: function (response) {
            text1 = response['text1'].split('\n');
            text2 = response['text2'].split('\n');

            const leftParagraphs = document.querySelectorAll('.paragraph-left');
            const rightParagraphs = document.querySelectorAll('.paragraph-right');

            for (let i = 0; i < text1.length; i++) {
                leftParagraphs[i].value = text1[i];
                rightParagraphs[i].value = text2[i];
            }

            updateTextsInSessionStorage('both');
            enableSaveButtons('both');
            fixTextAreas();
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
        complete: function() {
            showLoading(false);
        },
    });

    document.querySelector('.screen-block-abort-button').addEventListener('click', () => {
        xhr.abort();
    });
}


function replaceApostrophesAutomatically (lang = null) {
    const paragraph = document.getElementById('monolingual-paragraph');

    paragraph.value = recoverApostrophesByLang(
        paragraph.value,
        lang = lang
    );

    countApostrophes();
    enableMonolingualChangeStatus();
    updateSearchCount();
}


function replaceAllApostrophes () {
    const paragraph = document.getElementById('monolingual-paragraph');

    paragraph.value = paragraph.value.replaceAll("'", '’');

    countApostrophes();
    enableMonolingualChangeStatus();
    updateSearchCount();
}


function updateLanguageNamesInSidebar () {
    const side = sessionStorage.leftFileFound ? 'left' : 'right';
    const languageName = document.getElementById('languages-dropdown-list-' + side).selectedOptions[0].text;

    document.querySelectorAll('.language-name').forEach((element) => {
        element.innerText = languageName;
    });
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
        removeLineBreaksButton.addEventListener('click', mergeOrphans);
    }

    const removeHTMLEntitiesButton = document.getElementById('panel-button-remove_html_entities');
    if (removeHTMLEntitiesButton) {
        removeHTMLEntitiesButton.addEventListener('click', removeHTMLEntities);
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
            updateLanguageNamesInSidebar();
            updateSidebarTextareasCounts('quote-textarea');
            updateTextQuotationMarks();
            updateLanguageQuotationMarks();
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
            updateSidebarTextareasCounts('dash-textarea');
        });
    }

    const ellipsisButton = document.getElementById('panel-button-ellipsis');
    if (ellipsisButton) {
        ellipsisButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('ellipsis');
            updateSidebarTextareasCounts('ellipsis-textarea');
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

    const statisticsButton = document.getElementById('panel-button-statistics');
    if (statisticsButton) {
        statisticsButton.addEventListener('click', () => {
            showSidebar(true);
            showSidebarTemplate('statistics');
            updateLanguageNamesInSidebar();
            updateStatisticsFields();
        });
    }

}

makeMonolingualPanelButtonsFunctional();


if (!window.isKeydownHandlerAttached) {
    document.addEventListener('keydown', (e) => {
        const target = e.target;
        
        if ((target.id !== 'monolingual-paragraph') || (target.tagName !== 'TEXTAREA')) {
            return;
        }
    
        const { selectionStart, selectionEnd, value } = target;
        const isCtrlX = (e.ctrlKey || e.metaKey) && e.code === 'KeyX';
        const isAltUp = e.altKey && !e.shiftKey && e.code === 'ArrowUp';
        const isAltDown = e.altKey && !e.shiftKey && e.code === 'ArrowDown';
        const isShiftAltUp = e.altKey && e.shiftKey && e.code === 'ArrowUp';
        const isShiftAltDown = e.altKey && e.shiftKey && e.code === 'ArrowDown';
    
        if (!isCtrlX && !isAltUp && !isAltDown && !isShiftAltUp && !isShiftAltDown) {
            return;
        }
    
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        let lineEnd = value.indexOf('\n', selectionStart);
        if (lineEnd === -1) lineEnd = value.length;
    
        const currentLine = value.substring(lineStart, lineEnd);
        const cursorOffsetInLine = selectionStart - lineStart;
    
        if (isCtrlX && selectionStart === selectionEnd) {
            e.preventDefault();
            
            let removeStart = lineStart;
            let removeEnd = lineEnd;
            
            if (lineEnd < value.length) {
            removeEnd += 1;
            } else if (lineStart > 0) {
            removeStart -= 1;
            }
    
            const textToCopy = currentLine + (lineEnd < value.length ? '\n' : '');
            navigator.clipboard.writeText(textToCopy);
    
            target.value = value.substring(0, removeStart) + value.substring(removeEnd);
            target.setSelectionRange(removeStart, removeStart);
            target.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
    
        if (isAltUp) {
            if (lineStart === 0) return; // Уже первая строка
            e.preventDefault();
    
            const prevLineStart = value.lastIndexOf('\n', lineStart - 2) + 1;
            const prevLineEnd = lineStart - 1;
            const prevLine = value.substring(prevLineStart, prevLineEnd);
    
            const newValue = value.substring(0, prevLineStart) + 
                            currentLine + '\n' + prevLine + 
                            value.substring(lineEnd);
    
            target.value = newValue;
            const newCursorPos = prevLineStart + cursorOffsetInLine;
            target.setSelectionRange(newCursorPos, newCursorPos);
            target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    
        if (isAltDown) {
            if (lineEnd === value.length) return;
            e.preventDefault();
    
            const nextLineEnd = value.indexOf('\n', lineEnd + 1) === -1 ? value.length : value.indexOf('\n', lineEnd + 1);
            const nextLine = value.substring(lineEnd + 1, nextLineEnd);
    
            const newValue = value.substring(0, lineStart) + 
                            nextLine + '\n' + currentLine + 
                            value.substring(nextLineEnd);
    
            target.value = newValue;
            const newCursorPos = lineStart + nextLine.length + 1 + cursorOffsetInLine;
            target.setSelectionRange(newCursorPos, newCursorPos);
            target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    
        if (isShiftAltUp) {
            e.preventDefault();
            const newValue = value.substring(0, lineStart) + 
                            currentLine + '\n' + 
                            value.substring(lineStart);
    
            target.value = newValue;
            const newCursorPos = selectionStart;
            target.setSelectionRange(newCursorPos, newCursorPos);
            target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    
        if (isShiftAltDown) {
            e.preventDefault();
            const newValue = value.substring(0, lineEnd) + 
                            '\n' + currentLine + 
                            value.substring(lineEnd);
    
            target.value = newValue;
            const newCursorPos = selectionStart + currentLine.length + 1;
            target.setSelectionRange(newCursorPos, newCursorPos);
            target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    window.isKeydownHandlerAttached = true;
}

