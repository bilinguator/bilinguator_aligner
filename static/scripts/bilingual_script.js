function fixTextAreas () {
    let paragraphs = document.querySelectorAll('.paragraph');
    
    function fixTextareaSize(textarea) {
        textarea.style.height = '0px';
        textarea.style.height = textarea.scrollHeight + 2 + 'px';
    }
    
    ~function () {
        for (let i = 0; i < paragraphs.length; i++) {
            paragraphs[i].addEventListener('input', function (e) {
                fixTextareaSize(e.target)
            });
            fixTextareaSize(paragraphs[i]);
        }
    }()

    let leftParagraphs = document.querySelectorAll('.paragraph-left');
    let rightParagraphs = document.querySelectorAll('.paragraph-right');
    let paragraphCouples = document.querySelectorAll('.paragraph-couple');

    for (let i = 0; i < leftParagraphs.length; i++) {
        let leftParagraphHeight = leftParagraphs[i].offsetHeight;
        let rightParagraphHeight = rightParagraphs[i].offsetHeight;
        let paragraphCoupleHeight = paragraphCouples[i].offsetHeight;

        let maximalHeight = Math.max(leftParagraphHeight, rightParagraphHeight, paragraphCoupleHeight);
        
        leftParagraphs[i].style.height = maximalHeight + 'px';
        rightParagraphs[i].style.height = maximalHeight + 'px';
    }
}

fixTextAreas();


function goToPage (page) {
    queryParameters = {
        text1: sessionStorage['text1'],
        text2: sessionStorage['text2'],
        text1_path: document.querySelector('#book-address-left').value,
        text2_path: document.querySelector('#book-address-right').value,
        lang1: document.querySelector('#languages-dropdown-list-left').value,
        lang2: document.querySelector('#languages-dropdown-list-right').value,
        page: page,
    }

    rerenderAllByTexts(queryParameters);
    setUrlParam('page', page);
}


function makePaginationArrowsFunctional () {
    let paginationArrows = document.querySelectorAll('.panel-button-pagination-arrow');
    
    paginationArrows.forEach((paginationArrow) => {
        paginationArrow.addEventListener('click', () => {
            page = paginationArrow.getAttribute('page')
    
            if (!isNaN(page)) {
                goToPage(page);
            }
        });
    });
}

makePaginationArrowsFunctional();


function getCurrentTextFromBilingualMode (side) {
    return Array.from(document.querySelectorAll('.paragraph-' + side))
        .map(element => element.value)
        .join('\n');
}


function indexOfNthSubstring(text, substring, n) {
    let index = -1;
    let fromIndex = 0;

    for (let i = 0; i < n; i++) {
        index = text.indexOf(substring, fromIndex);
        
        if (index === -1) {
            return -1;
        }

        fromIndex = index + substring.length;
    }

    return index;
}


function getFullTextFromBilingualMode (side) {
    let text = side == 'left' ? sessionStorage.text1 : sessionStorage.text2;

    const paragraphNumberDivs = document.querySelectorAll('.paragraph-number-' + side);
    const paragraphStartIndex = parseInt(paragraphNumberDivs[0].innerHTML) - 1;
    const paragraphEndIndex = parseInt(paragraphNumberDivs[paragraphNumberDivs.length - 1].innerHTML);

    const startIndex = indexOfNthSubstring(text, '\n', paragraphStartIndex);
    const endIndex = indexOfNthSubstring(text, '\n', paragraphEndIndex);
    
    const firstPart = text.slice(0, startIndex+1);
    const secondPart = getCurrentTextFromBilingualMode(side);
    const thirdPart = endIndex === -1 ? '' : text.slice(endIndex);
    
    return firstPart + secondPart + thirdPart;
}

document.querySelector('.page-number').addEventListener('keydown', (event) => {
    if (event.code === 'Enter') {
        goToPage(parseInt(event.target.value));
    }
});


// function updateTextsOnChangeInParagraphs () {
//     ['input', 'change'].forEach((eventType) => {
//         document.querySelectorAll('.paragraph').forEach((paragraph) => {
//             paragraph.addEventListener(eventType, () => {
//                 const textNumber = paragraph.classList.contains('paragraph-left') ? '1' : '2';    
//                 const side = paragraph.classList.contains('paragraph-left') ? 'left' : 'right';    
//                 sessionStorage['text' + textNumber] = getFullTextFromBilingualMode(side);
//                 enableSaveButtons(side);
//             });
//         });
//     });
// }

// updateTextsOnChangeInParagraphs();


function getCurrentParagraphNumber () {
    const paragraph = document.activeElement;
    if (!paragraph.classList.contains('paragraph')) {
        return;
    }

    const paragraphPanel = paragraph.parentElement.querySelector('.paragraph-panel');
    const paragraphNumber = paragraphPanel.querySelector('.paragraph-number');
    return parseInt(paragraphNumber.innerHTML);
}


function getCurrentParagraphSide () {
    const paragraph = document.activeElement;
    if (!paragraph.classList.contains('paragraph')) {
        return;
    }

    return paragraph.classList.contains('paragraph-left') ? 'left' : 'right';
}


function getPositionInText () {
    const paragraph = document.activeElement;

    if (!paragraph.classList.contains('paragraph')) {
        return;
    }

    const paragraphNumber = getCurrentParagraphNumber();
    const localPosition = document.activeElement.selectionStart;
    
    const side = getCurrentParagraphSide();
    let text = getTextBySide(side);

    return indexOfNthSubstring(text, '\n', paragraphNumber-1) + localPosition + 1;
}


// function insertNewlineAndTrim(text, pos) {
//     // Find whitespace boundaries (excluding \n) on both sides
    
//     // Left side: move back while there are spaces/tabs
//     let start = pos;
//     while (start > 0 && /[^\S\n]/.test(text[start - 1])) {
//         start--;
//     }

//     // Right side: move forward while there are spaces/tabs
//     let end = pos;
//     while (end < text.length && /[^\S\n]/.test(text[end])) {
//         end++;
//     }

//     // Insert newline, removing surrounding whitespace except \n
//     return text.slice(0, start) + '\n' + text.slice(end);
// }


function countSubstrings (string, substring) {
  const regex = new RegExp(substring, 'g'); 
  const matches = string.match(regex) || []; 
  return matches.length;
}


function equalizeParagraphCountsInTexts () {
    const lineBreaksInText1 = countSubstrings(sessionStorage.text1, '\n');
    const lineBreaksInText2 = countSubstrings(sessionStorage.text2, '\n');

    if (lineBreaksInText1 === lineBreaksInText2) {
        return;
    }

    const shorterTextNumber = lineBreaksInText1 < lineBreaksInText2 ? '1' : '2';
    const lineBreaksDifference = Math.abs(lineBreaksInText1 - lineBreaksInText2);

    sessionStorage['text' + shorterTextNumber] += '\n'.repeat(lineBreaksDifference);
}


// function splitParagraph () {
//     const paragraph = document.activeElement;

//     if (!paragraph.classList.contains('paragraph')) {
//         return;
//     }

//     if (paragraph.selectionStart !== paragraph.selectionEnd) {
//         return;
//     }

//     const side = getCurrentParagraphSide();
//     const textNumber = side === 'left' ? '1' : '2';
//     const positionInText = getPositionInText();
    
//     let part1 = sessionStorage['text' + textNumber].slice(0, positionInText);
//     let part2 = sessionStorage['text' + textNumber].slice(positionInText);

//     part1 = part1.trim() === '' ? part1 : part1.trimEnd();
//     part2 = part2.trim() === '' ? part2 : part2.trimStart();

//     const leftNewLine = paragraph.selectionStart === 0 && part1 !== '' ? '\n' : '';
//     const rightNewLine = paragraph.selectionStart === paragraph.value.length && part2 !== '' ? '\n' : '';
//     const centralNewLine = leftNewLine === '\n' || rightNewLine === '\n' ? '' : '\n';

//     // sessionStorage['text' + textNumber] = part1 + leftNewLine + centralNewLine + rightNewLine + part2;
//     sessionStorage['text' + textNumber] = insertNewlineAndTrim(sessionStorage['text' + textNumber], positionInText);
    
//     sessionStorage[side + 'FileChanged'] = 'true'

//     rerenderAllByTexts();
//     enableSaveButtons(side);
// }


function splitParagraph () {
    const paragraph = document.activeElement;

    if (!paragraph.classList.contains('paragraph')) {
        return;
    }

    if (paragraph.selectionStart !== paragraph.selectionEnd) {
        return;
    }

    const paragraphText = paragraph.value;
    const part1 = paragraphText.slice(0, paragraph.selectionStart).trim();
    const part2 = paragraphText.slice(paragraph.selectionStart).trim();

    paragraph.value = part1 + '\n' + part2;

    const side = getCurrentParagraphSide();
    updateTextsInSessionStorage(side);
    sessionStorage[side + 'FileChanged'] = 'true';
    equalizeParagraphCountsInTexts();

    rerenderAllByTexts();
    enableSaveButtons(side);
}

function concatenateParagraphs (separator = '') {
    const paragraph = document.activeElement;

    if (!paragraph.classList.contains('paragraph')) {
        return;
    }

    // const paragraphNumber = getCurrentParagraphNumber();
    let positionInText = getPositionInText();
    const side = getCurrentParagraphSide();
    const textNumber = side === 'left' ? '1' : '2';
    let text = sessionStorage['text' + textNumber];
    
    for (const char of text.slice(positionInText)) {
        if (char == '\n') {
            text = text.slice(0, positionInText) + separator + text.slice(positionInText + 1);
            sessionStorage['text' + textNumber] = text.trimRight();

            const oppositeTextNumber = textNumber == '1' ? '2' : '1';
            sessionStorage['text' + oppositeTextNumber] = sessionStorage['text' + oppositeTextNumber].trimRight();
            sessionStorage[side + 'FileChanged'] = 'true';

            equalizeParagraphCountsInTexts();
            rerenderAllByTexts();
            enableSaveButtons(side);

            break
        };
        
        positionInText++;
    }
}


function findChildByClass (element, childClass) {
    let elementChildren = element.childNodes;
    let result;

    elementChildren.forEach((item) => {
        if (item.classList) {
            if (item.classList.contains(childClass)) {
                result = item;
            }
        }
    });

    return result;
}


function getParagraphNumberByParagraphButton (paragraphButton) {
    if (!paragraphButton.classList.contains('paragraph-button')) {
        return;
    }

    const paragraphButtonPanel = paragraphButton.parentElement.parentElement;
    let paragraphNumber = findChildByClass(paragraphButtonPanel, 'paragraph-number').innerText;
    paragraphNumber = parseInt(paragraphNumber);
    
    return paragraphNumber;
}


function getSideByParagraphButton (paragraphButton) {
    if (!paragraphButton.classList.contains('paragraph-button')) {
        return;
    }

    const paragraphContainer = paragraphButton.parentElement.parentElement.parentElement;
    const side = paragraphContainer.classList.contains('left') ? 'left' : 'right';

    return side;
}


function removeParagraphsFromText (text, startParagraphNumber, endParagraphNumber) {
    text = '\n' + text + '\n';
    const startLineBreakIndex = indexOfNthSubstring(text, '\n', startParagraphNumber);
    const endLineBreakIndex = indexOfNthSubstring(text, '\n', endParagraphNumber+1);

    text = text.slice(0, startLineBreakIndex + 1) + text.slice(endLineBreakIndex + 1);
    text = text.replace(/^\n/, '').replace(/\n$/, '');

    return text;
}


function removeParagraphByButton (button) {
    const paragraphNumber = getParagraphNumberByParagraphButton(button);
    const side = getSideByParagraphButton(button);
    const textNumber = side === 'left' ? '1' : '2'; 

    sessionStorage['text' + textNumber] = removeParagraphsFromText(
        sessionStorage['text' + textNumber],
        paragraphNumber,
        paragraphNumber
    );

    sessionStorage[side + 'FileChanged'] = 'true';
    
    equalizeParagraphCountsInTexts();
    rerenderAllByTexts();
    enableSaveButtons(side);
}


function addParagraphToText (text, paragraphNumber) {
    text = '\n' + text;
    const lineBreakIndex = indexOfNthSubstring(text, '\n', paragraphNumber);

    if (lineBreakIndex === -1) {
        return text.replace(/^\n/, '');
    }

    text = text.slice(0, lineBreakIndex) + '\n' + text.slice(lineBreakIndex);
    text = text.replace(/^\n/, '');
    
    return text;
}


function addParagraphByButton (button) {
    const paragraphNumber = getParagraphNumberByParagraphButton(button);
    const side = getSideByParagraphButton(button);
    const textNumber = side === 'left' ? '1' : '2'; 

    sessionStorage['text' + textNumber] = addParagraphToText(
        sessionStorage['text' + textNumber],
        paragraphNumber
    );

    sessionStorage[side + 'FileChanged'] = 'true';
    
    equalizeParagraphCountsInTexts();
    rerenderAllByTexts();
    enableSaveButtons(side);
}


window.onresize = fixTextAreas;