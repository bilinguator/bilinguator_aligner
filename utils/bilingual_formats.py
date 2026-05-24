import os
import re
import base64
from datetime import datetime
import shutil
import zipfile


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



def save_bilingual_fb2(text1, text2, output_file_address, 
                       cover_address='', pics_folder='', 
                       src_lang='', lang='', book_id=''):

    output_directory = os.path.dirname(output_file_address)
    if output_directory and not os.path.isdir(output_directory):
        raise Exception(f'Directory {output_directory} not found!')

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
            pic_path = os.path.join(pics_folder, f'{i}.png')
            if os.path.exists(pic_path):
                with open(pic_path, 'rb') as f:
                    encoded_pic = base64.b64encode(f.read()).decode('utf-8')
                    pictures_xml += f'<binary id="{i}" content-type="image/png">{encoded_pic}</binary>\n'

    fb_content += f'<binary id="cover" content-type="image/png">{cover_base64}</binary>\n'
    fb_content += f'{pictures_xml}</FictionBook>'

    # Wright in file
    with open(output_file_address, 'w', encoding='utf-8') as f:
        f.write(fb_content)



def save_bilingual_epub(text1, text2, output_file_address, 
                         cover_address='', pics_folder='', 
                         lang1='', lang2='', book_id=''):
    """
    Saves bilingual EPUB file with alternating paragraphs from two input TXT files.
    """
        
    output_directory = os.path.dirname(output_file_address)
    if output_directory and not os.path.isdir(output_directory):
        raise Exception(f'Directory {output_directory} not found!')

    text_array1 = re.split(r'[\r]*[\n]+', text1)
    text_array2 = re.split(r'[\r]*[\n]+', text2)

    author1 = text_array1[0]
    author2 = text_array2[0]

    title1 = text_array1[1].split('<delimiter>')[0].replace('<h1>', '').replace('</h1>', '')
    title2 = text_array2[1].split('<delimiter>')[0].replace('<h1>', '').replace('</h1>', '')
    title_couple = f'{title1} / {title2}'
    
    parts1 = text_array1[1].split('<delimiter>', 1)
    title_rest1 = parts1[1] if len(parts1) > 1 else ''
    parts2 = text_array2[1].split('<delimiter>', 1)
    title_rest2 = parts2[1] if len(parts2) > 1 else ''

    authors_couple = ''
    author_title = ''

    if author1 != '<delimiter>' and author2 != '<delimiter>':
        authors_couple = f'{author1} / {author2}'
        author_title = f'<p>{authors_couple}</p>'
    elif author1 != '<delimiter>' and author2 == '<delimiter>':
        authors_couple = author1
        author_title = f'<p>{authors_couple}</p>'
    elif author1 == '<delimiter>' and author2 != '<delimiter>':
        authors_couple = author2
        author_title = f'<p>{authors_couple}</p>'

    h1_array = []
    min_len = min(count_text1 := len(text_array1), len(text_array2))
    
    for i in range(2, min_len):
        if '<h1>' in text_array1[i] and '<h1>' in text_array2[i]:
            h1_array.append(i)
    h1_array.append(count_text1)
    
    chapters_array1 = []
    chapters_array2 = []
    first_chapter_index = 0

    if len(h1_array) > 1:
        for i in range(len(h1_array) - 1):
            chapters_array1.append(text_array1[h1_array[i]:h1_array[i+1]])
            chapters_array2.append(text_array2[h1_array[i]:h1_array[i+1]])

        if h1_array[0] != 2:
            first_chapter_index = 1
            chapters_array1.insert(0, text_array1[2:h1_array[0]])
            chapters_array2.insert(0, text_array2[2:h1_array[0]])
            h1_array.insert(0, 2)

    if len(h1_array) == 1:
        chapters_array1.append(text_array1[2:])
        chapters_array2.append(text_array2[2:])
        first_chapter_index = 1


    # cover.html

    coverhtml = f"""<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>{title_couple}</title>
    <link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
    <h1>{title_couple}</h1>
    <img src="cover.png">
</body>
</html>"""
    
    chaptershtml = {}
    img_count = 0

    # If the first part have no heading...
    if first_chapter_index == 1:
        html_content = f"""<html xmlns="http://www.w3.org/1999/xhtml" lang="{lang1}">
<head>
    <title></title>
    <link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
"""

        for i in range(len(chapters_array1[0]) - 1):
            ch1_item = chapters_array1[0][i]
            ch2_item = chapters_array2[0][i]
            
            if '<img' in ch1_item and ch1_item == ch2_item:
                img_index = ch1_item.split('<img')[1].split('>')[0]
                html_content += f'    <img src="{img_index}.png">\n    <br />\n'
                img_count += 1
            else:
                if '<img' in ch1_item:
                    img_index = ch1_item.split('<img')[1].split('>')[0]
                    html_content += f'    <img src="{img_index}.png">\n    <br />\n'
                    img_count += 1
                else:
                    html_content += f'    <p lang="{lang1}">{ch1_item}</p>\n    <br />\n'

                if '<img' in ch2_item:
                    img_index = ch2_item.split('<img')[1].split('>')[0]
                    html_content += f'    <img src="{img_index}.png">\n    <br />\n'
                    img_count += 1
                else:
                    html_content += f'    <p lang="{lang2}">{ch2_item}</p>\n    <br />\n'
                    
        html_content += '</body>\n</html>'
        chaptershtml[0] = html_content

    # Processing chapters with headings
    for i in range(first_chapter_index, len(chapters_array1)):
        title = chapters_array1[i][0].replace('<h1>', '').replace('</h1>', '')
        title += ' / ' + chapters_array2[i][0].replace('<h1>', '').replace('</h1>', '')
        
        html_content = f"""<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>{title}</title>
    <link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
    <h1>{title}</h1>
    <br />
"""
        for j in range(1, len(chapters_array1[i])):
            ch1_item = chapters_array1[i][j]
            ch2_item = chapters_array2[i][j]
            
            if '<img' in ch1_item and ch1_item == ch2_item:
                img_index = ch1_item.split('<img')[1].split('>')[0]
                html_content += f'    <img src="{img_index}.png">\n    <br />\n'
                img_count += 1
            else:
                if '<img' in ch1_item:
                    img_index = ch1_item.split('<img')[1].split('>')[0]
                    html_content += f'    <img src="{img_index}.png">\n    <br />\n'
                    img_count += 1
                else:
                    html_content += f'    <p lang="{lang1}">{ch1_item}</p>\n    <br />\n'
                
                if '<img' in ch2_item:
                    img_index = ch2_item.split('<img')[1].split('>')[0]
                    html_content += f'    <img src="{img_index}.png">\n    <br />\n'
                    img_count += 1
                else:
                    html_content += f'    <p lang="{lang2}">{ch2_item}</p>\n    <br />\n'
                    
        html_content += '</body>\n</html>'
        chaptershtml[i] = html_content

    # Remove <delimiter> and clean empty paragraphs
    for i in range(len(chaptershtml)):
        chaptershtml[i] = chaptershtml[i].replace('\n    <p><delimiter></p> \n', '\n')
        chaptershtml[i] = chaptershtml[i].replace('<delimiter>', '<br />')

    last_chapter = len(chaptershtml) - 1

    chaptershtml[last_chapter] += '\n</body>\n</html>'

    replace_str = f'<body>\n    <p>{title_rest1}</p>\n    <br />\n    <p>{title_rest2}</p>\n    <br />\n'
    chaptershtml[0] = chaptershtml[0].replace("<body>\n", replace_str)

    for i in range(len(chaptershtml)):
        empty_p_block = '    <p></p>\n    <br />\n'
        chaptershtml[i] = chaptershtml[i].replace(empty_p_block, '')


    # toc.ncx

    date_str = datetime.now().strftime('%Y-%m-%d')

    tocncx = f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="{book_id}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>{title_couple}</text>
    </docTitle>
    <navMap>
        <navPoint id="point-1" playOrder="1">
            <navLabel>
                <text>{title_couple}</text>
            </navLabel>
            <content src="cover.html"/>
        </navPoint>
"""

    num = 1
    for i in range(first_chapter_index, len(chapters_array1)):
        num += 1
        next_idx = i + 1
        
        implode1 = ''.join(re.split(r'</?h1>', chapters_array1[i][0]))
        implode2 = ''.join(re.split(r'</?h1>', chapters_array2[i][0]))

        tocncx += f"""    <navPoint id="point-{num}" playOrder="{num}">
        <navLabel>
            <text>{implode1} / {implode2}</text>
        </navLabel>
        <content src="chapter{next_idx}.html"/>
    </navPoint>
"""

    tocncx += """    </navMap>
</ncx>"""


    # content.opf

    contentopf = f"""<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:title>{title_couple}</dc:title>
        <dc:creator>{authors_couple}</dc:creator>
        <dc:identifier id="BookId">{book_id}</dc:identifier>
        <dc:date>{date_str}</dc:date>
        <dc:publisher>Bilinguator</dc:publisher>
        <dc:language>{lang1}</dc:language>
        <dc:language>{lang2}</dc:language>
        <meta name="cover" content="cover-image"/>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
        <item id="cover-image" href="cover.png" media-type="image/png" />
        <item id="cover" href="cover.html" media-type="application/xhtml+xml" />
        <item id="style" href="style.css" media-type="text/css" />
"""

    for i in range(len(chapters_array1)):
        next_idx = i + 1
        contentopf += f'        <item id="chapter{next_idx}" href="chapter{next_idx}.html" media-type="application/xhtml+xml" />\n'

    for i in range(1, img_count + 1):
        contentopf += f'        <item id="picture{i}" href="{i}.png" media-type="image/png" />\n'

    contentopf += """        <item id="logo" href="logo.png" media-type="image/png" />
    </manifest>
    <spine toc="ncx">
        <itemref idref="cover" linear="no" />
"""

    for i in range(len(chapters_array1)):
        next_idx = i + 1
        contentopf += f'        <itemref idref="chapter{next_idx}" />\n'

    contentopf += """    </spine>
    <guide>
        <reference href="cover.html" title="Cover" type="cover"/>
    </guide>
</package>"""


    # style.css

    stylecss = """* {
    text-decoration: none;
    font-family: "Helvetica Neue", "Open Sans", Calibri, Helvetica, Arial, sans-serif;
}
h1, title {
    color: #00A864;
    text-align: center;
}
b {
    color: #00A864;
}"""


    # container.xml

    containerxml = """<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OPS/content.opf" media-type="application/oebps-package+xml" />
    </rootfiles>
</container>"""

    tmp_dir = f'{output_file_address}.tmp'
    meta_dir = os.path.join(tmp_dir, 'META-INF')
    ops_dir = os.path.join(tmp_dir, 'OPS')
    
    os.makedirs(meta_dir, exist_ok=True)
    os.makedirs(ops_dir, exist_ok=True)
    
    with open(os.path.join(tmp_dir, 'mimetype'), 'w', encoding='utf-8') as f:
        f.write('application/epub+zip')
        
    with open(os.path.join(meta_dir, 'container.xml'), 'w', encoding='utf-8') as f:
        f.write(containerxml)
        
    with open(os.path.join(ops_dir, 'style.css'), 'w', encoding='utf-8') as f:
        f.write(stylecss)
        
    with open(os.path.join(ops_dir, 'content.opf'), 'w', encoding='utf-8') as f:
        f.write(contentopf)
        
    with open(os.path.join(ops_dir, 'toc.ncx'), 'w', encoding='utf-8') as f:
        f.write(tocncx)
        
    with open(os.path.join(ops_dir, 'cover.html'), 'w', encoding='utf-8') as f:
        f.write(coverhtml)
    
    if cover_address and os.path.exists(cover_address):
        shutil.copy(cover_address, os.path.join(ops_dir, 'cover.png'))
        
    for i in range(1, img_count + 1):
        img_address = os.path.join(pics_folder, f'{i}.png')
        if os.path.exists(img_address):
            shutil.copy(img_address, os.path.join(ops_dir, f'{i}.png'))
            
    # Right chapters
    for i in range(len(chaptershtml)):
        next_idx = i + 1
        with open(os.path.join(ops_dir, f'chapter{next_idx}.html'), 'w', encoding='utf-8') as f:
            f.write(chaptershtml[i])

    with zipfile.ZipFile(output_file_address, 'w') as epub_file:
        epub_file.write(os.path.join(tmp_dir, 'mimetype'), 'mimetype', compress_type=zipfile.ZIP_STORED)
        
        # Add files from OPS
        for file in os.listdir(ops_dir):
            epub_file.write(os.path.join(ops_dir, file), f'OPS/{file}')
            
        # Add files from META-INF folder
        for file in os.listdir(meta_dir):
            epub_file.write(os.path.join(meta_dir, file), f'META-INF/{file}')

    shutil.rmtree(tmp_dir)