if (getURLParameter('focus') === 'true') {
    document.querySelector('.monolingual-paragraph').focus();
    unsetURLParameter('focus');
}


function applyToSelection (foo, ...args) {
    const paragraph = document.querySelector('.monolingual-paragraph')

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