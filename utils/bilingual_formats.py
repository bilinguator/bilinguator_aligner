import os

SCRIPT_DIRECTORY = os.path.dirname(os.path.abspath(__file__))


def save_bilingual_txt(text1, text2, book_address):
    max_linebreaks_count = max(text1.count('\n'), text2.count('\n'))

    while (text1.count('\n') < max_linebreaks_count):
        text1 = text1 + '\n'
    
    while (text2.count('\n') < max_linebreaks_count):
        text2 = text2 + '\n'
    
    text1 = text1.split('\n')
    text2 = text2.split('\n')

    bilingual_text = [
        (text1[i] + '\n\n' + text2[i]).replace('<delimiter>', '\n')
        for i in range(len(text1))
    ]

    bilingual_text = '\n\n'.join(bilingual_text)

    with open(book_address, 'w', encoding='utf-8') as file:
        file.write(bilingual_text)


def save_bilingual_fb2(text1, text2):
    pass


def save_bilingual_epub(text1, text2):
    pass


