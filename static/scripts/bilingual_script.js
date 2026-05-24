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
    setURLParameter('page', page);
    setURLParameter('focus', 'true');
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


function getCurrentParagraphNumber () {
    const paragraph = document.activeElement;
    if (!paragraph.classList.contains('paragraph')) {
        return;
    }

    const paragraphPanel = paragraph.parentElement.parentElement.querySelector('.paragraph-panel');
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


function updateAndReloadTexts () {
    updateTextsInSessionStorage('both');
    equalizeParagraphCountsInTexts();
    rerenderAllByTexts();
}


function concatenateParagraphs (separator = '') {
    const paragraph = document.activeElement;

    if (!paragraph.classList.contains('paragraph')) {
        return;
    }

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

    sessionStorage.text1 = sessionStorage.text1.trimRight();
    sessionStorage.text2 = sessionStorage.text2.trimRight();

    sessionStorage[side + 'FileChanged'] = 'true';
    
    equalizeParagraphCountsInTexts();
    rerenderAllByTexts();
    enableSaveButtons(side);
}


function swapParagraphsByButton (button, side = 'both') {
    const paragraphNumber = getParagraphNumberByParagraphButton(button);

    const leftParagraph = document.querySelector(`.paragraph-left[data-paragraph="${paragraphNumber}"]`)
    const rightParagraph = document.querySelector(`.paragraph-right[data-paragraph="${paragraphNumber}"]`)

    const leftParagraphText = leftParagraph.value;
    const rightParagraphText = rightParagraph.value;

    if (['both', 'left'].includes(side)) {
        rightParagraph.value = leftParagraphText;
        sessionStorage['rightFileChanged'] = 'true';
    }
    
    if (['both', 'right'].includes(side)) {
        leftParagraph.value = rightParagraphText;
        sessionStorage['leftFileChanged'] = 'true';
    }

    const changedSide = {'both': 'both', 'left': 'right', 'right': 'left'}[side];
    updateTextsInSessionStorage(changedSide);
    enableSaveButtons(changedSide);
}

function getParagraphIndexes () {
    let paragraphIndexes = [
        document.querySelector('#paragraph-index-left').value,
        document.querySelector('#paragraph-index-right').value,
    ];

    const isNumericIndexes = paragraphIndexes.every((paragraphIndex) => {
        return paragraphIndex === parseInt(paragraphIndex).toString();
    });

    const paragraphsCount = parseInt(document.querySelector('.total-count').innerText.trim())

    const isInsideParagraphsRange = paragraphIndexes.every((paragraphIndex) => {
        return parseInt(paragraphIndex) > 0 && paragraphIndex <= paragraphsCount;
    });

    if (!isNumericIndexes || !isInsideParagraphsRange) {
        return;
    }

    paragraphIndexes = paragraphIndexes.map(Number);

    return paragraphIndexes;
}


function removeParagraphsFromTwoTexts () {
    const paragraphIndexes = getParagraphIndexes();

    if (!paragraphIndexes) {
        return;
    }

    const startParagraphIndex = Math.min(...paragraphIndexes);
    const endParagraphIndex = Math.max(...paragraphIndexes);

    ['1', '2'].forEach((textNumber) => {        
        sessionStorage['text' + textNumber] = removeParagraphsFromText(
            sessionStorage['text' + textNumber],
            startParagraphIndex,
            endParagraphIndex
        ).trimRight();
    });

    sessionStorage['leftFileChanged'] = 'true';
    sessionStorage['rightFileChanged'] = 'true';
    
    equalizeParagraphCountsInTexts();
    rerenderAllByTexts();
    enableSaveButtons('both');
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


function focusInBilingualMode () {
    let focusedElement;
    if (sessionStorage.leftParagraphIndex) {
        const paragraphID = '#paragraph' + sessionStorage.leftParagraphIndex;
        focusedElement = document.querySelector(paragraphID);
    }

    if (focusedElement) {
        focusedElement.focus();
    } else {
        document.querySelector('.paragraph').focus();
    }
}

if (getURLParameter('focus') === 'true') {
    focusInBilingualMode();
    unsetURLParameter('focus');
}


function shiftParagraphs () {
    const paragraphIndexes = getParagraphIndexes();
    if (!paragraphIndexes) {
        return;
    }

    const allEqual = paragraphIndexes.every(index => index === paragraphIndexes[0]);
    if (allEqual) {
        return;
    }

    const textNumber = paragraphIndexes[0] < paragraphIndexes[1] ? '1' : '2';

    let text = '\n' + sessionStorage['text' + textNumber];

    const smallerIndex = Math.min(...paragraphIndexes);
    const biggerIndex = Math.max(...paragraphIndexes);
    const lineBreakIndex = indexOfNthSubstring(text, '\n', smallerIndex);
    console.log('lineBreakIndex', lineBreakIndex);

    const paragraphsDifference = biggerIndex - smallerIndex;

    console.log('paragraphsDifference', paragraphsDifference);

    text = text.slice(0, lineBreakIndex) + '\n'.repeat(paragraphsDifference) + text.slice(lineBreakIndex);

    sessionStorage['text' + textNumber] = text.replace(/^\n/, '');

    sessionStorage['text2'] = sessionStorage['text2'].trimRight();

    const side = textNumber === '1' ? 'left' : 'right';
    
    sessionStorage[side + 'FileChanged'] = 'true';
    equalizeParagraphCountsInTexts();
    rerenderAllByTexts();
    enableSaveButtons(side);
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


function demojify (withMessage = false) {
    $.ajax({
        url: '/demojify',
        type: 'POST',
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            text1: sessionStorage.text1,
            text2: sessionStorage.text2,
        }),
        success: function (response) {
            console.log(response);
            sessionStorage.text1 = response['text1'];
            sessionStorage.text2 = response['text2'];
            updateTextOnScreen();

            if (withMessage) {
                showMessage('Successfully demojified!');
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
    });
}


function updateTextOnScreen () {
    equalizeParagraphCountsInTexts();

    splittedTexts = {
        'left': sessionStorage.text1.split('\n'),
        'right': sessionStorage.text2.split('\n')
    };

    const startParagraph = parseInt(document.querySelector('.paragraph-number').innerText);

    ['left', 'right'].forEach((side) => {
        let paragraphs = document.querySelectorAll('.paragraph-' + side);

        let i = startParagraph - 1;

        paragraphs.forEach((paragraph) => {
            paragraph.value = splittedTexts[side][i];
            i++;
        });
    });
}


function downloadFile (filePath, fileName) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName || filePath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function saveTxt () {
    const fileName = prompt('Please enter file name:', 'bilingual_book.txt');

    if (!fileName) {
        return;
    }

    $.ajax({
        url: '/save_txt',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            text1: getTextBySide('left'),
            text2: getTextBySide('right'),
            file_name: fileName
        }),
        success: function (response) {
            const bookAddress = '/static/downloads/' + fileName;
            downloadFile(bookAddress);
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
    });
}


function saveFb2 () {
    const fileName = prompt('Please enter file name:', 'bilingual_book.fb2');

    if (!fileName) {
        return;
    }

    $.ajax({
        url: '/save_fb2',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            text1: getTextBySide('left'),
            text2: getTextBySide('right'),
            text1_path: document.querySelector('#book-address-left').value,
            text2_path: document.querySelector('#book-address-right').value,
            lang1: document.querySelector('#languages-dropdown-list-left').value,
            lang2: document.querySelector('#languages-dropdown-list-right').value,
            file_name: fileName
        }),
        success: function (response) {
            const bookAddress = '/static/downloads/' + fileName;
            downloadFile(bookAddress);
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
    });
}


function saveEpub () {
    const fileName = prompt('Please enter file name:', 'bilingual_book.epub');

    if (!fileName) {
        return;
    }

    $.ajax({
        url: '/save_epub',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            text1: getTextBySide('left'),
            text2: getTextBySide('right'),
            text1_path: document.querySelector('#book-address-left').value,
            text2_path: document.querySelector('#book-address-right').value,
            lang1: document.querySelector('#languages-dropdown-list-left').value,
            lang2: document.querySelector('#languages-dropdown-list-right').value,
            file_name: fileName
        }),
        success: function (response) {
            const bookAddress = '/static/downloads/' + fileName;
            downloadFile(bookAddress);
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
    });
}


function uploadIllustrations() {
    const illustrationsPicker = document.querySelector('#illustrations-picker');
    const files = illustrationsPicker.files;

    if (files.length === 0) {
        return;
    }

    const formData = new FormData();

    $.each(files, function(i, file) {
        formData.append('illustrations', file);
    });


    const bookAddressLeft = document.querySelector('#book-address-left').value;
    const bookAddressRight = document.querySelector('#book-address-right').value;

    formData.append('text1_path', bookAddressLeft);
    formData.append('text2_path', bookAddressRight);

    $.ajax({
        url: '/upload_illustrations',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            showMessage('Successfuly uploaded: ' + response.count + ' illustration(s)!');
            openIllustrationsRenamingPanel();
        },
        error: function(xhr, status, error) {
            console.error('Ошибка:', error);
            showMessage('An error occured!');
        }
    });
}


function openIllustrationsRenamingPanel (bookAddressLeft = null, bookAddressRight = null) {
    bookAddressLeft = bookAddressLeft ? bookAddressLeft : document.querySelector('#book-address-left').value;
    bookAddressRight = bookAddressRight ? bookAddressRight : document.querySelector('#book-address-right').value;


    $.ajax({
        url: '/open_illustrations_renaming_panel',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            text1_path: bookAddressLeft,
            text2_path: bookAddressRight,
        }),
        success: function (response) {
            const mainArea = document.querySelector('.main-area');
            mainArea.insertAdjacentHTML('afterbegin', response['template']);

            const illustrationNames = document.querySelectorAll('.illustration-name');
            illustrationNames.forEach((illustrationName) => {
                illustrationName.addEventListener('blur', () => {
                    illustrationName.value = illustrationName.value.trim();
                    sortIllustrations();
                });
            });
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
    });
}


function sortIllustrations () {
    const container = document.querySelector('.illustration-names-list');
    const items = Array.from(container.querySelectorAll('.illustration-item'));

    items.sort((a, b) => {
        const originalNameA = a.querySelector('.illustration-name').value.trim();
        const originalNameB = b.querySelector('.illustration-name').value.trim();

        const nameA = originalNameA.toLowerCase();
        const nameB = originalNameB.toLowerCase();

        const coverWord = 'cover';

        const hasCoverA = originalNameA === coverWord;
        const hasCoverB = originalNameB === coverWord;

        if (hasCoverA && !hasCoverB) return -1; // A идет первым
        if (!hasCoverA && hasCoverB) return 1;  // B идет первым

        return nameA.localeCompare(nameB, undefined, {numeric: true, sensitivity: 'base'});
    });

    items.forEach(item => container.appendChild(item));
}


function closeIllustrationsRenamingPanel () {
    document.querySelector('.illustrations-renaming-panel').remove();
}


function renameIllustrations () {
    const illustrationNames = document.querySelectorAll('.illustration-name');
    let illustrationRenaming = Array();

    illustrationNames.forEach((illustrationName) => {
        illustrationRenaming[illustrationName.dataset.originalName] = illustrationName.value;
    });

    const newNames = Object.values(illustrationRenaming);

    const hasDuplicates = newNames.some((item, index) => {
        return newNames.indexOf(item) !== index;
    });

    if (hasDuplicates) {
        showMessage('Avoid repeating file names!');
        return false;
    }

    $.ajax({
        url: '/rename_illustrations',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            text1_path: document.querySelector('#book-address-left').value,
            text2_path: document.querySelector('#book-address-right').value,
            renaming: Object.assign({}, illustrationRenaming),
        }),
        success: function (response) {
            showMessage('Illustrations successfully renamed!');
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
    });
}


function removeIllustrationPreview (paragraph) {
    const currentPreviews = paragraph.parentElement.querySelectorAll('.illustration-preview');
    if (currentPreviews) {
        currentPreviews.forEach((currentPreview) => {
            currentPreview.remove();
        });
    }
}


function insertIllustrationPreview (paragraph) {
    removeIllustrationPreview(paragraph);

    const match = paragraph.value.match(/<img(\d+)>/);
    const illustrationNumber = match ? match[1] : null;

    if (!illustrationNumber) {
        return;
    }

    const illustrationPath = `${illustrationsFolder}/${illustrationNumber}.png`;
    const illustrationHTML = `<img class="illustration-preview" src="${illustrationPath}">`;

    paragraph.insertAdjacentHTML('afterend', illustrationHTML);
}


function makeIllustrationPreviewsFunctional () {
    document.querySelectorAll('.paragraph').forEach((paragraph) => {
        insertIllustrationPreview(paragraph);

        paragraph.addEventListener('input', () => {
            insertIllustrationPreview(paragraph);
        });
    });
}

makeIllustrationPreviewsFunctional();


equalizeParagraphCountsInTexts();
window.onresize = fixTextAreas;