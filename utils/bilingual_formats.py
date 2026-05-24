import os

import re
import base64
from datetime import datetime



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




def save_bilingual_fb2(text1, text2, 
                        output_file_address='./bilingual.fb2', 
                        cover_address='', pics_folder='', 
                        src_lang='', lang='', book_id=''):

    output_directory = os.path.dirname(output_file_address)
    if output_directory and not os.path.isdir(output_directory):
        raise Exception(f"Directory {output_directory} not found!")

    text_array1 = re.split(r'[\r]*[\n]+', text1)
    text_array2 = re.split(r'[\r]*[\n]+', text2)

    # text extraction from <h1> tags
    author1 = text_array1[0].replace('<h1>', '').replace('</h1>', '').strip()
    author2 = text_array2[0].replace('<h1>', '').replace('</h1>', '').strip() if len(text_array2) > 0 else ''

    title1 = text_array1[1].replace('<h1>', '').replace('</h1>', '').strip() if len(text_array1) > 1 else ''
    title2 = text_array2[1].replace('<h1>', '').replace('</h1>', '').strip() if len(text_array2) > 1 else ''

    title1 = title1.split('<delimiter>')[0]
    title2 = title2.split('<delimiter>')[0]

    title_rest1 = text_array1[1].split('<delimiter>')[1] if '<delimiter>' in text_array1[1] else ''
    title_rest2 = text_array2[1].split('<delimiter>')[1] if '<delimiter>' in text_array2[1] else ''

    title_rest1 = f'<p xml:lang="{lang}">{title_rest1}</p>' if title_rest1 else ''
    title_rest2 = f'<p xml:lang="{src_lang}">{title_rest2}</p>' if title_rest2 else ''

    titles_couple = f'{title1} / {title2}' if title1 and title2 else (title1 or title2)
    authors_couple = f'{author1} / {author2}' if author1 and author2 else (author1 or author2)

    now = datetime.now()
    date_str = now.strftime('%m.%d.%Y')
    year_str = now.strftime('%Y')

    # Генерируем валидный заголовок БЕЗ последующих replace по нему
    fb_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
<description>
    <title-info>
        <author><nickname>{authors_couple}</nickname></author>
        <book-title>{titles_couple}</book-title>
        <coverpage><image l:href="#cover"/></coverpage>
        <lang>{lang}</lang>
        <src-lang>{src_lang}</src-lang>
    </title-info>
    <document-info>
        <author><nickname>{authors_couple}</nickname></author>
        <program-used>Bilinguator Aligner</program-used>
        <date>{date_str}</date>
        <id>{book_id}</id>
        <version>1.0</version>
    </document-info>
    <publish-info>
        <book-name>{titles_couple}</book-name>
        <publisher>Bilinguator</publisher>
        <year>{year_str}</year>
    </publish-info>
</description>
<body>
<title>
    <p>{authors_couple}</p>
    <p>{titles_couple}</p>
</title>
"""
    
    if titles_couple:
        fb_content += f"""<section>
    {title_rest1}
    {title_rest2}
</section>
"""

    img_count = 0
    section_opened = False
    
    max_len = max(len(text_array1), len(text_array2))
    for i in range(2, max_len):
        # Read lines and clean from delimiters
        line1 = text_array1[i].replace('<delimiter>', '\n').strip() if i < len(text_array1) else ''
        line2 = text_array2[i].replace('<delimiter>', '\n').strip() if i < len(text_array2) else ''

        if not line1 and not line2:
            continue

        # Check if it is heading
        is_h1 = '<h1>' in line1 or '<h1>' in line2
        
        if is_h1:
            clean_l1 = line1.replace('<h1>', '').replace('</h1>', '').strip()
            clean_l2 = line2.replace('<h1>', '').replace('</h1>', '').strip()
            
            if section_opened:
                fb_content += '</section>\n'
            
            # Add tags <title><p> ... </p></title>
            fb_content += f'<section>\n<title><p>{clean_l1} / {clean_l2}</p></title>\n<empty-line/>\n'
            section_opened = True
            continue

        if not section_opened:
            fb_content += '<section>\n'
            section_opened = True

        # Images processing
        if '<img' in line1 or '<img' in line2:
            target_line = line1 if '<img' in line1 else line2
            match = re.search(r'<img(\d+)>', target_line)
            if match:
                img_index = match.group(1)
                fb_content += f'<p><image l:href="#{img_index}"/></p>\n<empty-line/>\n'
                img_count += 1
            continue

        # Regular paragraphs
        if line1:
            fb_content += f'<p xml:lang="{lang}">{line1}</p>\n'
        if line2:
            fb_content += f'<p xml:lang="{src_lang}">{line2}</p>\n'

        fb_content += '<empty-line/>\n'

    # Close section/body tags
    if section_opened:
        fb_content += '</section>\n'
    fb_content += '</body>\n'

    # Style-related replacements
    fb_content = fb_content.replace('<i>', '<emphasis>').replace('</i>', '</emphasis>')
    fb_content = fb_content.replace('<b>', '<strong>').replace('</b>', '</strong>')
    fb_content = fb_content.replace("<p></p>\n", "")

    # Binaries of images
    cover_base64 = ''
    if os.path.exists(cover_address):
        with open(cover_address, 'rb') as f:
            cover_base64 = base64.b64encode(f.read()).decode('utf-8')

    pictures_xml = ""
    if img_count > 0:
        for i in range(1, img_count + 1):
            pic_path = os.path.join(pics_folder, f"{i}.png")
            if os.path.exists(pic_path):
                with open(pic_path, 'rb') as f:
                    encoded_pic = base64.b64encode(f.read()).decode('utf-8')
                    pictures_xml += f'<binary id="{i}" content-type="image/png">{encoded_pic}</binary>\n'

    fb_content += f'<binary id="cover" content-type="image/png">{cover_base64}</binary>\n'
    fb_content += f"{pictures_xml}</FictionBook>"

    # Корректная запись в файл
    with open(output_file_address, 'w', encoding='utf-8') as f:
        f.write(fb_content)



def save_bilingual_epub(text1, text2):
    pass