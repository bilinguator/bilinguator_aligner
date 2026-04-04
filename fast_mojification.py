import os
import re
from tqdm import tqdm
from pathlib import Path
from lingtrain_aligner import splitter, aligner, resolver, reader, vis_helper


def rename_lang(lang: str) -> str:
    """
    Get the language code compatible with Lingtrain Aligner.

    str `lang` - ISO 639 language code.
    
    return str - language code compatible with Lingtrain Aligner or "xx" if the input language is not supported.
    """
    
    rename_dict = {'be': 'bu', 'cs': 'cz', 'sv': 'sw'}
    lang = rename_dict.get(lang, lang)

    if lang not in splitter.get_supported_languages():
        print(f'"{lang}" is not supported! Renamed to "xx".')
        lang = 'xx'

    return lang


def standard_split(text: str, period_marks: list[str] | None=None, surrogate_delimiter: str='<del>') -> list:
    """
    Split texts into sentences by input period marks.

    str `text` - text to be splitted;
    list of str `period_marks` - strings considered as sentence ending while splitting. Default: None;
    str `surrogate_delimiter` - intermediate delimiter used in the process of splitting. Default: "<del>";
        Use the serrogate delimiter absent in the initial text.
    
    return list of str - sentences of the text.
    """
    
    if period_marks == None:
        period_marks = ['</h1>', '</b>', '</i>', '?', '!', '.', '፡', '።', '፣', '፤', '፥', '।', '。']

    text_splitted = text
    
    for mark in period_marks:
        text_splitted = text_splitted.split(mark)
        last_sentence = text_splitted.pop()
        text_splitted = [s.strip()+mark+surrogate_delimiter for s in text_splitted]
        text_splitted = ''.join(text_splitted)+last_sentence
    
    return text_splitted.split(surrogate_delimiter)


def split_text(text: str, lang: str, method: str='splitter', **kwargs) -> list:
    """
    Split text using one of two methods: splitter or standard_split.

    str `text` - text to be splitted;
    str `lang` - ISO 639 language code of the text; only used in the splitter method;
    str `method` - method of slitting the text:
        "splitter" (default) based on `lingtrain_aligner.splitter.split_by_sentences_wrapper` function,
        "standard_split" based on `mojification.standard_split` function;
    **kwargs - key arguments for the `mojification.standard_split` function.

    return list of str - sentences of the text.
    """

    text = text.replace('<delimiter>', ' ')
    text = re.sub(r'</?(h1|i|b|)>', '', text)

    if method == 'splitter':
        return splitter.split_by_sentences_wrapper(text.split('\n'), lang)

    if method == 'standard_split':
        return standard_split(text, **kwargs)


def get_splitted_texts(text1: str, text2: str, lang1: str, lang2: str,
                       text1_split_method: str='splitter',
                       text2_split_method: str='splitter',
                       text1_period_marks: list | None=None,
                       text2_period_marks: list | None=None) -> dict:
    """
    Get the `splitted` dictionary with two texts splitted into sentences.

    str `text1` - text 1 to be splitted;
    str `text2` - text 2 to be splitted;
    str `lang1` - ISO 639 code of text 1 language;
    str `lang2` - ISO 639 code of text 2 language;
    str `text1_split_method` - method of slitting the text 1, default: "splitter";
    str `text2_split_method` - method of slitting the text 2, default: "splitter";
        The last two arguments correspond to the `method` argument of the `mojification.split_text` function.
        Possible values: "splitter" and "standard_split".
    list of str `text1_period_marks` - strings considered as sentence ending while text 1 splitting. Default: None;
    list of str `text2_period_marks` - strings considered as sentence ending while text 2 splitting. Default: None;
        The last two arguments correspond to the `period_marks` argument of the `mojification.standard_split` function,
        and are actual only if the split method for the corresponding text is assigned as "standard_split".

    return dict:
        key "from": list of str - text 1 sentences,
        key "to": list of str - text 2 sentences,
        key "translation" (optional): list of str - text 2 sentences translated to the language 1.
    """

    splitted = {
        'from': split_text(text1, lang1, text1_split_method, period_marks=text1_period_marks),
        'to':   split_text(text2, lang2, text2_split_method, period_marks=text2_period_marks)
    }

    print(f'Text 1 is splitted into {len(splitted["from"])} sentences.')
    print(f'Text 2 is splitted into {len(splitted["to"])} sentences.')

    return splitted


def get_database_path(book_id: str, lang1: str, lang2: str) -> str:
    """
    Get path to the Lingtrain database.

    str `book_id` - book ID;
    str `lang1` - ISO 639 code of the language 1;
    str `lang2` - ISO 639 code of the language 2.

    return str - path to the Lingtrain database.
    """
    
    return f'db/{book_id}_{lang1}_{lang2}.db'


def prepare_database(splitted: dict, db_path: str, lang1: str, lang2: str) -> None:
    """
    Launche `lingtrain_aligner.aligner.fill_db`. Returns nothing.

    dict `splitted` - dictionary returned by `mojification.get_splitted_texts` function;
    str `db_path` - DB path;
    str `lang1` - ISO 639 code of the language 1;
    str `lang2` - ISO 639 code of the language 2.
    """
    
    db_folder = Path(db_path).parent
    
    if not os.path.isdir(db_folder):
        os.mkdir(db_folder)
    
    if os.path.isfile(db_path):
        os.unlink(db_path)

    route = 'translation' if 'translation' in splitted.keys() else 'to'
    
    aligner.fill_db(
        db_path,
        rename_lang(lang1),
        rename_lang(lang2),
        splitted['from'],
        splitted[route]
    )


def align(
    splitted: dict,
    lang1: str,
    lang2: str,
    db_path: str,
    model_name: str='sentence_transformer_multilingual',
    batch_size: int=100,
    batch_count=None,
    image_path=None,
    resolve_conflicts=False
) -> None:
    """
    Align two texts with Lingtrain and resolve conflicts. Returns nothing.

    dict `splitted` - dictionary returned by `mojification.get_splitted_texts` function;
    str `book_id` - book ID;
    str `lang1` - ISO 639 code of the language 1;
    str `lang2` - ISO 639 code of the language 2;
    str `model_name` - model, used in the alignment:
        "sentence_transformer_multilingual" is faster, supports 50+ languages;
        "sentence_transformer_multilingual_labse" (default) supports 100+;
    int `batch_size` - batch size;
    int `extra_batch_count` - count added to the automatically defined batch count to cover the whole texts.
    """
    
    prepare_database(splitted, db_path, lang1, lang2)

    batch_count = batch_count if batch_count else len(splitted['from']) // batch_size

    batch_ids = list(range(batch_count))
    print(f'Batch count: {batch_count}.')

    aligner.align_db(
        db_path,
        model_name,
        batch_size=batch_size,
        window=40,
        batch_ids=batch_ids,
        save_pic=False,
        embed_batch_size=10,
        normalize_embeddings=True,
        show_progress_bar=True
     )

    if not os.path.isdir('img'):
        os.mkdir('img')

    lang_name_from = rename_lang(lang1)
    lang_name_to = rename_lang(lang1)
    
    # Resolve conflicts
    
    # Determine all conflicts and print statistics
    conflicts_to_solve, rest = resolver.get_all_conflicts(
        db_path,
        min_chain_length=2,
        max_conflicts_len=6,
        batch_id=-1
    )
    
    resolver.get_statistics(conflicts_to_solve)
    resolver.get_statistics(rest)
    
    if resolve_conflicts:
        steps = 3
        batch_id = -1 # align all available batches
        
        for i in range(steps):
            conflicts, rest = resolver.get_all_conflicts(db_path, min_chain_length=2+i,
                                                        max_conflicts_len=6*(i+1), batch_id=batch_id,
                                                        handle_start=True, handle_finish=True)
            resolver.resolve_all_conflicts(db_path, conflicts, model_name, show_logs=False)
            if len(rest) == 0: break

    if image_path:
        vis_helper.visualize_alignment_by_db(
            db_path,
            output_path=image_path,
            lang_name_from=lang_name_from,
            lang_name_to=lang_name_to,
            batch_size=400,
            size=(600, 600),
            plt_show=False
        )


def get_aligned_sentences(db_path: str, splitted: dict) -> dict:
    """
    Get dictionary with aligned sentences.

    str db_path - DB path;
    dict `splitted` - dictionary returned by `mojification.get_splitted_texts` function;
    
    return dict with aligned sentences:
        key "from": list of str - text 1 sentences,
        key "to": list of str - text 2 sentences.
    """

    paragraphs, delimeters, metas, sent_counter = reader.get_paragraphs(
        db_path, direction='to'
    )
    
    # Fill the lists of aligned sentences
    sentences = {'from': [], 'to': [], 'translation': []}
    
    for direction in ('from', 'to'):
        for paragraph in paragraphs[direction]:
            for sentence in paragraph:
                sentences[direction].append(sentence)
        print(f'{len(sentences[direction])} "{direction}" sentences totally.')

    return sentences


def get_emojis() -> str:
    """
    Get all emojis as one string. Function gets no parameters and returns str containing emoji symbols.
    """
    
    emojis_path = 'mojification/emojis/emojis.txt'
    
    with open(emojis_path, 'r', encoding='utf-8') as handle:
        return handle.read()
    

def mojify(text1: str, text2: str, sentences: dict, demojify_first: bool=True) -> tuple[str, str]:
    """
    Mojify two texts.
    🤓 to mojify verb /ˈmɒdʒɪfaɪ/ to wrap corresponding sentences of two texts in different languages in emoji

    str `text1` - text 1 to be mojified;
    str `text2` - text 2 to be mojified;
    dict `sentences` - dictionary returned by `mojification.get_aligned_sentences` function;
    bool `demojify_first` - determines if preliminary de-mojification with `mojification.demojify` function
        is needed, default: True.

    return tuple(str, str) - two mojified texts. 
    """
    
    if demojify_first:
        text1 = demojify(text1)
        text2 = demojify(text2)

    emojis = get_emojis()
    
    emoji_index = 0
    emoji_counter = 0
    
    last_emoji = None
    
    # Mojify texts
    for i in range(len(sentences['from'])):
        emoji = emojis[emoji_index]
        
        sentence1 = sentences['from'][i]
        sentence2 = sentences['to'][i]
        
        if sentence1 == '' or sentence2 == '':
            continue
        
        if text1.count(sentence1) == text2.count(sentence2) == 1:
            text1 = text1.replace(sentence1, f'{emoji}{sentence1}{emoji}')
            text2 = text2.replace(sentence2, f'{emoji}{sentence2}{emoji}')
        
            emoji_index = (emoji_index + 1) % len(emojis)
            emoji_counter += 1
            last_emoji = emoji
        
    progress1 = round((text1.rfind(last_emoji) + 1) / len(text1) * 100, 1)
    progress2 = round((text2.rfind(last_emoji) + 1) / len(text2) * 100, 1)
    print(f'{progress1}% of the text 1 mojified.')
    print(f'{progress2}% of the text 2 mojified.')
    print(f'{emoji_counter} emojis used.')

    return text1, text2


def demojify(text: str) -> str:
    """
    De-mojify text.
    🤓 to de-mojify verb /ˌdiːˈmɒdʒɪfaɪ/ to delete emojis from two aligned texts
    
    str `text` - text to be de-mojified;
    
    return str - de-mojified text.
    """
    
    emojis = get_emojis()
    return text.translate({ord(emoji): '' for emoji in emojis})


def fast_mojify(
    text1,
    text2,
    lang1,
    lang2,
    db_path,
    image_path,
    text1_split_method='splitter', # 'splitter' or 'standard_split'
    text2_split_method='splitter', # 'splitter' or 'standard_split'
    text1_period_marks=None, # custom period marks for text 1
    text2_period_marks=None,  # custom period marks for text 2
    model_name='sentence_transformer_multilingual', # sentence_transformer_multilingual_labse
    batch_size=200,
    batch_count=1,
    resolve_conflicts=False,
    demojify_first=True
):
    """
    Align and mojify two texts.

    str `text1` - text 1 to be mojified;
    str `text2` - text 2 to be mojified;
    ...
    """
    
    splitted = get_splitted_texts(
        text1, text2, lang1, lang2,
        text1_split_method=text1_split_method,
        text2_split_method=text2_split_method,
        text1_period_marks=text1_period_marks,
        text2_period_marks=text2_period_marks
    )

    image_folder = Path(image_path).parent

    if not os.path.isdir(image_folder):
        os.mkdir(image_folder)

    align(
        splitted=splitted,
        lang1=lang1,
        lang2=lang2,
        db_path=db_path,
        model_name=model_name,
        batch_size=batch_size,
        batch_count=batch_count,
        image_path=image_path,
        resolve_conflicts=resolve_conflicts
    )

    sentences = get_aligned_sentences(
        db_path=db_path,
        splitted=splitted
    )
    text1, text2 = mojify(text1, text2, sentences, demojify_first=demojify_first)

    return text1, text2