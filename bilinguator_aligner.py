import os
from pathlib import Path
import json
from time import sleep
import webbrowser
from urllib.parse import unquote
from markupsafe import Markup
from flask import Flask, jsonify, request, render_template, url_for

from storage import storage
from mojification import fast_mojification


SCRIPT_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PARAGRAPHS_PER_PAGE = 100

LANGUAGES_JSON_PATH = os.path.normpath(f'{SCRIPT_DIRECTORY}/static/json/languages.json')
with open(LANGUAGES_JSON_PATH) as file:
    languages = json.load(file)
    languages = sorted(languages.items(), key=lambda item: item[1])
    LANGUAGES = dict(languages)

BUTTONS_TITLES_PATH = os.path.normpath(f'{SCRIPT_DIRECTORY}/static/json/button_titles.json')
with open(BUTTONS_TITLES_PATH) as file:
    BUTTONS_TITLES = json.load(file)


app = Flask(__name__)


def render_partial_template(*args, **kwargs):
    """
    """

    return Markup(render_template(*args, **kwargs))

def get_mode(text1, text2):
    """
    """

    return str(sum([text1 is not None, text2 is not None]))


def get_buttons_list(panel, mode):
    """
    """

    panel_json_path = os.path.normpath(f'{SCRIPT_DIRECTORY}/static/json/{panel}_buttons.json')
    
    with open(panel_json_path) as file:
        return json.load(file)[mode]


def render_panel(panel_class, mode, additional_panel_class='', **kwargs):
    """
    """
    file_name = panel_class.replace('-', '_')
    buttons_list = get_buttons_list(file_name, mode)
    
    if not buttons_list:
        return ''
    
    buttons_titles = [
        [BUTTONS_TITLES[button_name] if button_name in BUTTONS_TITLES else ''
          for button_name in buttons_names]
        for buttons_names in buttons_list
    ]

    
    return render_partial_template(
        'blocks/panel.html',
        panel_class=panel_class,
        buttons_list=buttons_list,
        buttons_titles=buttons_titles,
        additional_panel_class=additional_panel_class,
        **kwargs,
    )


def render_paragraph_number_inputs(mode, paragraph1='', paragraph2=''):
    """
    """

    return render_partial_template(
        'blocks/paragraph_number_inputs.html',
        mode=mode,
        paragraph1=paragraph1,
        paragraph2=paragraph2,
    )


def get_page_by_paragraph(paragraph):
    page = paragraph // PARAGRAPHS_PER_PAGE
    page += bool(paragraph % PARAGRAPHS_PER_PAGE)
    return page


def get_pages_count(text1, text2):
    """
    """

    if None in [text1, text2]:
        return None
    
    max_paragraphs_count = max(
        text1.count('\n')+1,
        text2.count('\n')+1
    )

    pages_count = get_page_by_paragraph(max_paragraphs_count)

    return pages_count


def get_existing_page(text1, text2, page):
    """
    """

    if None in [text1, text2]:
        return page

    if not str(page).isnumeric():
        return 1

    page = int(page)

    if page < 1:
        return 1
    
    max_page = get_pages_count(text1, text2)

    if page > max_page:
        return max_page
    
    return page


def get_first_last_paragraphs(text1, text2, page):
    """
    """

    max_page = get_existing_page(text1, text2, page)

    if page > max_page:
        return get_first_last_paragraphs(text1, text2, max_page)

    first_paragraph = page * PARAGRAPHS_PER_PAGE - PARAGRAPHS_PER_PAGE

    max_number_of_paragraphs = max(
        len(text1.split('\n')[first_paragraph:page*PARAGRAPHS_PER_PAGE]),
        len(text2.split('\n')[first_paragraph:page*PARAGRAPHS_PER_PAGE])
    )

    last_paragraph = first_paragraph + max_number_of_paragraphs

    return first_paragraph, last_paragraph


def render_progress(mode, text1, text2, page=1, bookmark='∅'):
    """
    """
    if mode == '0':
        return ''
    
    paragraphs_count = max(
        len(str(text1).split('\n')),
        len(str(text2).split('\n')),
    )
    
    if mode == '1':
        min_percent = 0
        max_percent = 100
    elif mode == '2': 

        first_paragraph, last_paragraph = get_first_last_paragraphs(text1, text2, page)
        
        total_texts_length = len(str(text1)) + len(str(text2))
        total_texts_length = total_texts_length if total_texts_length else 1

        min_percent = len('\n'.join(str(text1).split('\n')[0:first_paragraph]))
        min_percent += len('\n'.join(str(text2).split('\n')[0:first_paragraph]))
        min_percent = round(min_percent / total_texts_length * 100)

        max_percent = len('\n'.join(str(text1).split('\n')[0:last_paragraph]))
        max_percent += len('\n'.join(str(text2).split('\n')[0:last_paragraph]))
        max_percent = round(max_percent / total_texts_length * 100)

    bookmark = bookmark if bookmark else '∅'

    return render_partial_template(
        'blocks/progress.html',
        mode=mode,
        paragraphs_count=paragraphs_count,
        min_percent=min_percent,
        max_percent=max_percent,
        bookmark=bookmark,
    )


def render_pagination(mode, current_page=None, pages_count=None):
    """
    """

    if mode != '2':
        return ''
    
    return render_partial_template(
        'blocks/pagination.html',
        current_page=current_page,
        pages_count=pages_count,
    )


def render_bilingual_paragraphs(text1, text2, page, lang1, lang2, bookmark=''):
    """
    """

    first_paragraph, last_paragraph = get_first_last_paragraphs(text1, text2, page)

    paragraphs1 = text1.split('\n')
    paragraphs2 = text2.split('\n')

    length_difference = len(paragraphs1) - len(paragraphs2)
    
    if length_difference < 0:
        paragraphs1 += [''] * -length_difference
    elif length_difference > 0:
        paragraphs2 += [''] * length_difference

    return render_partial_template(
        'blocks/bilingual_paragraphs.html',
        paragraphs1=paragraphs1,
        paragraphs2=paragraphs2,
        lang1=lang1,
        lang2=lang2,
        first_paragraph=first_paragraph,
        last_paragraph=last_paragraph,
        bookmark=bookmark,
    )


def render_storage_items(mode, storage_items, value_key, heading):
    """
    storage_items:
        * path1
        * path2
        * value: date for dump; page for bookmark
    """

    if (mode != '0') or (not storage_items):
        return ''
    
    return render_partial_template(
        'blocks/storage_items.html',
        storage_items=storage_items,
        value_key=value_key,
        heading=heading,
        languages=LANGUAGES,
    )


def render_home_screen(mode):
    if mode != '0':
        return ''
    
    bookmarks_list = render_storage_items(
        mode=mode,
        storage_items=storage.projects_with_attribute('bookmark'),
        value_key='bookmark',
        heading='🔖 Bookmarks',
    )

    return render_partial_template(
        'blocks/home_screen.html',
        storage_items_panel=bookmarks_list,
    )


def render_monongual_paragraph(text, lang):
    """
    """

    return render_partial_template(
        'blocks/monolingual_paragraph.html',
        text=text,
        lang=lang,
    )


def get_all_absolute_parts(path_str):
    """
    """
    
    p = Path(path_str).resolve()
    return [str(parent) for parent in [p, *p.parents]][::-1]


def escape_paths(paths):
    """
    """

    return [path.encode('unicode_escape').decode('ascii') for path in paths]


@app.route('/open_explorer', methods=['POST'])
def render_explorer():
    """
    """

    side = request.json.get('side')
    path = request.json.get('path')
    is_folder = request.json.get('is_folder')
    path = path if is_folder else os.path.dirname(os.path.realpath(__file__))

    response = {
        'status': 'Folder_found',
        'template': '',
    }

    if os.path.isfile(path):
        response['status'] = 'File_found'
    elif not os.path.isdir(path):
        response['status'] = 'Invalid_path'
    else:
        upstream_absolute_paths = get_all_absolute_parts(path)
        path = Path(path)
        upstream_folders = path.parts
        downstream_elements = sorted(os.listdir(path))

        downstream_folders = []
        downstream_files = []

        downstream_folders_absolute_paths = []
        downstream_files_absolute_paths = []

        for element in downstream_elements:
            absolute_path = str(path / element)
            if os.path.isdir(absolute_path):
                downstream_folders_absolute_paths.append(absolute_path)
                downstream_folders.append(element)
            else:
                downstream_files_absolute_paths.append(absolute_path)
                downstream_files.append(element)

        response['template'] = render_partial_template(
            'blocks/explorer.html',
            side=side,
            path=path,
            original_path=request.json.get('original_path').encode('unicode_escape').decode('ascii'),
            upstream_folders=upstream_folders,
            upstream_absolute_paths=escape_paths(upstream_absolute_paths),
            downstream_folders=downstream_folders,
            downstream_folders_absolute_paths=escape_paths(downstream_folders_absolute_paths),
            downstream_files=downstream_files,
            downstream_files_absolute_paths=escape_paths(downstream_files_absolute_paths),
        )

    return jsonify(response)


@app.route('/set_bookmark', methods=['POST'])
def set_bookmark():
    text1_path = request.json.get('text1_path')
    text2_path = request.json.get('text2_path')
    bookmark = request.json.get('bookmark')
    lang1 = request.json.get('lang1')
    lang2 = request.json.get('lang2')
    storage.set_attribute(text1_path, text2_path, 'bookmark', bookmark, set_date=True)
    storage.set_attribute(text1_path, text2_path, 'lang1', lang1, set_date=False)
    storage.set_attribute(text1_path, text2_path, 'lang2', lang2, set_date=False)
    return jsonify({'status': 'success'})


@app.route('/unset_bookmark', methods=['POST'])
def unset_bookmark():
    text1_path = request.json.get('text1_path')
    text2_path = request.json.get('text2_path')
    storage.unset_attribute(text1_path, text2_path, 'bookmark', unset_langs=True, unset_date=True)
    return jsonify({'status': 'success'})


@app.route('/', methods=['POST', 'GET'])
def index():

    if request.method == 'GET':
        text1 = None
        text2 = None
        text1_path = request.values.get('text1_path', SCRIPT_DIRECTORY)
        text2_path = request.values.get('text2_path', SCRIPT_DIRECTORY)
        lang1 = request.values.get('lang1', 'en')
        lang2 = request.values.get('lang2', 'en')
        page = request.values.get('page', -1)
    else:
        text1 = request.json.get('text1', None)
        text2 = request.json.get('text2', None)
        text1_path = request.json.get('text1_path', SCRIPT_DIRECTORY)
        text2_path = request.json.get('text2_path', SCRIPT_DIRECTORY)
        lang1 = request.json.get('lang1', 'en')
        lang2 = request.json.get('lang2', 'en')
        page = request.json.get('page', -1)
    
    if type(text1) != str and not text1 and os.path.isfile(text1_path):
        with open(text1_path, 'r', encoding='utf-8') as file:
            text1 = file.read()
    
    if type(text2) != str and not text2 and os.path.isfile(text2_path):
        with open(text2_path, 'r', encoding='utf-8') as file:
            text2 = file.read()

    mode = get_mode(text1, text2)
    
    bookmark = storage.get_attribute_value(text1_path, text2_path, 'bookmark') if mode == '2' else ''
    with_bookmark = bookmark and bookmark.isnumeric()
    bookmark = int(bookmark) if with_bookmark else ''

    if text1_path and text2_path and with_bookmark and (page == -1):
        page = get_page_by_paragraph(bookmark)
    else:
        page = get_existing_page(text1, text2, page)

    pages_count = get_pages_count(text1, text2)

    page_config = {}
    page_config['paragraph_number_inputs'] = render_paragraph_number_inputs(mode, paragraph1=bookmark)
    page_config['progress'] = render_progress(mode, text1, text2, page, bookmark)
    page_config['pagination'] = render_pagination(mode, page, pages_count)

    if mode == '2':
        paragraphs = render_bilingual_paragraphs(text1, text2, page, lang1, lang2, bookmark)
    elif mode == '1':
        if text1:
            paragraphs = render_monongual_paragraph(text1, lang1)
        else:
            paragraphs = render_monongual_paragraph(text2, lang2)

    else:
        paragraphs = ''

    return render_template(
        'index.html',
        text1=text1,
        text2=text2,
        lang1=lang1,
        lang2=lang2,
        text1_path=text1_path,
        text2_path=text2_path,
        page=page,
        mode=mode,
        languages=LANGUAGES,
        root_folder=SCRIPT_DIRECTORY,
        central_panel=render_panel(
            panel_class='central-panel',
            mode=mode,
        ),
        upper_panel=render_panel(
            panel_class='upper-panel',
            mode=mode,
            additional_panel_class='horizontal-panel',
        ),
        paragraphs=paragraphs,
        footer=render_panel(
            panel_class='footer',
            mode=mode,
            page_config=page_config,
        ),
        paragraphs_per_page=PARAGRAPHS_PER_PAGE,
        home_screen=render_home_screen(mode),
    )


@app.route('/save_book', methods=['GET', 'POST'])
def save_file():
    book_address = request.json.get('bookAddress')
    text = request.json.get('text')

    with open(book_address, 'w', encoding='utf-8') as file:
        file.write(text)
    
    return json.dumps({'success': True}), 200, {'ContentType':'application/json'}


@app.route('/mojify', methods=['GET', 'POST'])
def mojify():
    text1_path = request.json.get('text1_path')
    text2_path = request.json.get('text2_path')
    hash = storage.project_hash(text1_path, text2_path)

    project_folder = f'{SCRIPT_DIRECTORY}/storage/{hash}'

    if not os.path.isdir(project_folder):
        os.mkdir(project_folder)

    # storage.set_attribute(
    #     path1=text1_path,
    #     path2=text2_path,
    #     attribute='alignment',
    #     value=True,
    #     set_date=False
    # )

    db_path = f'{project_folder}/alignment.db'
    image_path = f'{project_folder}/alignment.png'

    text1, text2 = fast_mojification.fast_mojify(
        text1=request.json.get('text1'),
        text2=request.json.get('text2'),
        lang1=request.json.get('lang1'),
        lang2=request.json.get('lang2'),
        db_path=db_path,
        image_path=image_path,
        text1_split_method=request.json.get('text1_split_method', 'splitter'),
        text2_split_method=request.json.get('text2_split_method', 'splitter'),
        text1_period_marks=request.json.get('text1_period_marks', None),
        text2_period_marks=request.json.get('text2_period_marks', None),
        batch_size=request.json.get('batch_size', 200),
        batch_count=request.json.get('batch_count', 1),
        resolve_conflicts=request.json.get('resolve_conflicts') == 'True',
        demojify_first=True
    )

    response = {
        'text1': text1,
        'text2': text2,
        'image_path': image_path,
    }
    
    return json.dumps(response), 200, {'ContentType':'application/json'}


@app.route('/demojify', methods=['GET', 'POST'])
def demojify():
    response = {
        'text1': fast_mojification.demojify(request.json.get('text1')),
        'text2': fast_mojification.demojify(request.json.get('text2')),
    }

    return json.dumps(response), 200, {'ContentType':'application/json'}


@app.route('/go_to_page', methods=['POST'])
def go_to_page():
    data = request.json

    text1 = data.get('text1')
    text2 = data.get('text2')
    page = int(data.get('page'))
    lang1 = data.get('lang1')
    lang2 = data.get('lang2')
    bookmark = data.get('bookmark')
    pages_count = get_pages_count(text1, text2)
    existing_page = get_existing_page(text1, text2, page)
    mode = '2'

    if page != existing_page:
        return jsonify({})
    
    return jsonify({
        'paragraphs': render_bilingual_paragraphs(
            text1,
            text2,
            page,
            lang1,
            lang2,
            bookmark
        ),
        'pagination': render_pagination(
            mode, 
            current_page=existing_page, 
            pages_count=pages_count
        ),
        'progress': render_progress(
            mode, 
            text1,
            text2, 
            existing_page, 
            bookmark
        )
    })


storage.garbage_collection()


if __name__ == '__main__':
    webbrowser.open_new('http://127.0.0.1:2000/')
    app.run(port=2000) # debug=False when developped
