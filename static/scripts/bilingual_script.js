function fixTextAreas(targetParagraph) {
    function fixTextareaSize(textarea) {
        textarea.style.height = '0px';
        textarea.style.height = textarea.scrollHeight + 2 + 'px';
    }

    const leftParagraphs = document.querySelectorAll('.paragraph-left');
    const rightParagraphs = document.querySelectorAll('.paragraph-right');
    const paragraphCouples = document.querySelectorAll('.paragraph-couple');

    function syncCouple(i) {
        const left = leftParagraphs[i];
        const right = rightParagraphs[i];
        const couple = paragraphCouples[i];

        if (!left || !right) return;

        left.style.height = 'auto';
        right.style.height = 'auto';

        fixTextareaSize(left);
        fixTextareaSize(right);

        const leftTextarea = left.tagName === 'TEXTAREA' ? left : left.querySelector('textarea');
        const rightTextarea = right.tagName === 'TEXTAREA' ? right : right.querySelector('textarea');
        if (leftTextarea) fixTextareaSize(leftTextarea);
        if (rightTextarea) fixTextareaSize(rightTextarea);

        const leftH = left.offsetHeight;
        const rightH = right.offsetHeight;
        const coupleH = couple ? couple.offsetHeight : 0;

        const maxH = Math.max(leftH, rightH, coupleH);

        left.style.height = maxH + 'px';
        right.style.height = maxH + 'px';
    }

    if (targetParagraph) {
        let index = Array.from(leftParagraphs).indexOf(targetParagraph);
        if (index === -1) {
            index = Array.from(rightParagraphs).indexOf(targetParagraph);
        }

        if (index === -1 && targetParagraph.closest) {
            const parentLeft = targetParagraph.closest('.paragraph-left');
            const parentRight = targetParagraph.closest('.paragraph-right');
            if (parentLeft) index = Array.from(leftParagraphs).indexOf(parentLeft);
            if (parentRight) index = Array.from(rightParagraphs).indexOf(parentRight);
        }

        if (index !== -1) {
            syncCouple(index);
        } else {
            console.warn('Specified paragraph does not belong to either `.paragraph-left` or `.paragraph-right`.');
        }
    } else {
        for (let i = 0; i < leftParagraphs.length; i++) {
            syncCouple(i);
        }
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


function countExtraLineBreaks (side) {
    const paragraphs = document.querySelectorAll('.paragraph-' + side);

    let extraLineBreaksCount = 0;
    paragraphs.forEach((paragraph) => {
        extraLineBreaksCount += countSubstrings(paragraph.value, '\n');
    });

    return extraLineBreaksCount;
}


function getFullTextFromBilingualMode (side) {
    let text = side == 'left' ? sessionStorage.text1 : sessionStorage.text2;

    const paragraphNumberDivs = document.querySelectorAll('.paragraph-number-' + side);
    const paragraphStartIndex = parseInt(paragraphNumberDivs[0].innerHTML) - 1;
    const paragraphEndIndex = parseInt(paragraphNumberDivs[paragraphNumberDivs.length - 1].innerHTML);

    const startIndex = indexOfNthSubstring(text, '\n', paragraphStartIndex);
    const endIndex = indexOfNthSubstring(text, '\n', paragraphEndIndex);
    
    const firstPart = text.slice(0, startIndex + 1);
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
    sessionStorage.text1 = sessionStorage.text1.replace(/\s+$/, '');
    sessionStorage.text2 = sessionStorage.text2.replace(/\s+$/, '');

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

    const side = getCurrentParagraphSide();
    const textNumber = side === 'left' ? '1' : '2';
    let text = sessionStorage['text' + textNumber].split('\n');

    const currentParagraphNumber = getCurrentParagraphNumber() - 1;
    
    text[currentParagraphNumber] += separator + text[currentParagraphNumber + 1];
    text.splice(currentParagraphNumber + 1, 1);

    sessionStorage['text' + textNumber] = text.join('\n');

    equalizeParagraphCountsInTexts();
    rerenderAllByTexts();
    enableSaveButtons(side);
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

    const paragraphsDifference = biggerIndex - smallerIndex;

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
        success: function(response) {
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
            sessionStorage['leftFileChanged'] = 'true';
            sessionStorage['rightFileChanged'] = 'true';
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
            sessionStorage.text1 = response['text1'];
            sessionStorage.text2 = response['text2'];
            updateTextOnScreen();
            enableSaveButtons('both');

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


function saveAssets (side) {
    const fileName = prompt('Please enter the name for your ZIP archive where to save all your assets:', 'bilingual_archive.zip');

    if (!fileName) {
        return;
    }

    $.ajax({
        url: '/save_assets',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            text1_path: document.querySelector('#book-address-left').value,
            text2_path: document.querySelector('#book-address-right').value,
            lang1: document.querySelector('#languages-dropdown-list-left').value,
            lang2: document.querySelector('#languages-dropdown-list-right').value,
            file_name: fileName
        }),
        success: function (response) {
            const archiveAddress = '/static/downloads/' + fileName;
            downloadFile(archiveAddress);
        },
        error: function(xhr, status, error) {
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
    });
}


function saveTxt () {
    const fileName = prompt('Please enter the name for your bilingual TXT file:', 'bilingual_book.txt');

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
    const fileName = prompt('Please enter the name for your bilingual FB2 file:', 'bilingual_book.fb2');

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
    const fileName = prompt('Please enter the name for your bilingual EPUB file:', 'bilingual_book.epub');

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


function uploadIllustrations () {
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
        },
    });
}


function openIllustrationsRenamingPanel (bookAddressLeft = null, bookAddressRight = null) {
    closeExplorer('both');
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
            closePanel('illustrations-renaming-panel');

            if (!response['template']) {
                return;
            }

            const mainArea = document.querySelector('.main-area');
            mainArea.insertAdjacentHTML('afterbegin', response['template']);

            const illustrationNames = document.querySelectorAll('.illustration-name');
            illustrationNames.forEach((illustrationName) => {
                illustrationName.addEventListener('blur', () => {
                    illustrationName.value = illustrationName.value.trim();
                    sortIllustrations();
                });
            });
            sortIllustrations();
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


function removeIllustration (illustrationPath) {
    $.ajax({
        url: '/remove_illustration',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({
            illustration_path: illustrationPath,
        }),
        success: function (response) {
            console.log(`Illustration removed: ${illustrationPath}`);
        },
        error: function(xhr, status, error) {
            showMessage(`Error status: ${status}. ${error}.`);
            console.error('AJAX request failed:', status, error);
            console.error('XHR object:', xhr);
        },
    });
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


function reloadIllustration(imgElement, errorAction = 'placeholder') {
    imgElement.onerror = function() {
        if (errorAction === 'placeholder') {
            this.src = this.src;
            this.onerror = null;
        } else if (errorAction === 'remove') {
            this.remove();
        }
    };

    const currentSrc = imgElement.src.split('?')[0];
    imgElement.src = currentSrc + '?t=' + new Date().getTime();
}


function reloadCoverAndIllustrations () {
    updateCover();
    
    document.querySelectorAll('.illustration-preview').forEach((illustration) =>{
        reloadIllustration(illustration, errorAction = 'placeholder');
    });
}


function updateCover () {
    const coverPreview = document.querySelector('.cover-preview');

    if (coverPreview) {
        reloadIllustration(coverPreview, errorAction = 'remove');
    }
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
window.onresize = () => fixTextAreas();