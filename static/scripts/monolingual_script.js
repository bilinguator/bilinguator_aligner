if (getURLParameter('focus') === 'true') {
    document.querySelector('.monolingual-paragraph').focus();
    unsetURLParameter('focus');
}