import os
from pathlib import Path

SCRIPT_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
SCRIPT_DIRECTORY = Path(SCRIPT_DIRECTORY).as_posix()

def get_alphabet (lang='en', all_scripts=False):
    """Get all the symbols used in a particular language alphabet.

    str `lang` - ISO language code, default: "en";
    bool `all_scripts` - if True, terurn symbols of all the scripts of
        the specified language, default: False;
    return set - set of symbols used in a particular language alphabet.
    """
    
    for l in ['ja', 'zh']:
        if lang == l:
            file = open(f'{SCRIPT_DIRECTORY}/alphabets/{l}.txt', 'r', encoding='UTF-8')
            content = file.read()
            file.close()
            return set(content)
    alphabets = {
        # Afar
        'aa': 'ABTSECXKXDIQCRFGOLMNUWHY',
        # Afar Geʽez script
        'aa.ge\'ez': 'ሁሂሃሄህሆሉሊላሌልሎሑሒሓሔሕሖሙሚማሜምሞሩሪራሬርሮሱሲሳሴስሶሹሺሻሼሽሾቡቢባቤብቦቱቲታቴትቶኑኒናኔንኖኡኢኣኤእኦኩኪካኬክኮዉዊዋዌውዎዩዪያዬይዮዱዲዳዴድዶጁጂጃጄጅጆጉጊጋጌግጎፉፊፋፌፍፎዑዒዓዔዕዖ',
        # Abkhazian
        'ab': 'АБВГӶДЕЖЗӠИКҚҞЛМНОПԤРСТҬУФХҲЦҴЧҶҼШЫҨЏьә',
        # Abkhazian Cyrillic script by P. K. Uslar
        'ab.uslar': 'АБВГҔДꚀЕЖӁꚄꚄ̆ЏҼЗӠꚂІКӃԚЛМНОПҦРСТꚊꚌУФХЦꚎҴЧꚒҺꚔШШ̆ꚖҨѴ',
        # Abkhazian Latin script by M. Butba
        'ab.butba': 'AEIIOUᴇBPTCÇHXX̂DZRJӠSŜGĜFKQQ̂LMNVY',
        # Abkhazian Geargian script by D. I. Gulia et al.
        'ab.gulia': 'აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰჶჷჳჲჾჿ',
        # Afrikaans
        'af': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÊÔÛÎ',
        # Amharic
        'am': 'ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖመሙሚማሜምሞሠሡሢሣሤሥሦረሩሪራሬርሮሰሱሲሳሴስሶሸሹሺሻሼሽሾቀቁቂቃቄቅቆበቡቢባቤብቦተቱቲታቴትቶቸቹቺቻቼችቾኀኁኂኃኄኅኆነኑኒናኔንኖኘኙኚኛኜኝኞአኡኢኣኤእኦከኩኪካኬክኮኸኹኺኻኼኽኾወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዠዡዢዣዤዥዦየዩዪያዬይዮደዱዲዳዴድዶጀጁጂጃጄጅጆገጉጊጋጌግጎጠጡጢጣጤጥጦጨጩጪጫጬጭጮጰጱጲጳጴጵጶጸጹጺጻጼጽጾፀፁፂፃፄፅፆፈፉፊፋፌፍፎፐፑፒፓፔፕፖ',
        # Aragonese
        'an': 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚ',
        # Arabic
        'ar': '\u0600\u0601\u0602\u0603\u0604\u0605؆؇؈؉؊؋،؍؎؏◌ؐ◌ؑ◌ؒ◌ؓ◌ؔ◌ؕ◌ؖ◌ؗ◌ؘ◌ؙ◌ؚ؛\u061c\u061d؟ؠءآأؤإئابةتثجحخدذرزسشصضطظعغػؼؽؾؿـفقكلمنهوىي◌ً◌ٌ◌ٍ◌َ◌ُ◌ِ◌ّ◌ْ◌ٓ◌ٔ◌ٕ◌ٖ◌ٗ◌٘◌ٙ◌ٚ◌ٛ◌ٜ◌ٝ◌ٞ◌ٟ٠١٢٣٤٥٦٧٨٩٪٫٬٭ٮٯ◌ٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙښڛڜڝڞڟڠڡڢڣڤڥڦڧڨکڪګڬڭڮگڰڱڲڳڴڵڶڷڸڹںڻڼڽھڿۀہۂۃۄۅۆۇۈۉۊۋیۍێۏېۑےۓ۔ە◌ۖ◌ۗ◌ۘ◌ۙ◌ۚ◌ۛ◌ۜ\u06dd۞◌۟◌۠◌ۡ◌ۢ◌ۣ◌ۤۥۦ◌ۧ◌ۨ۩◌۪◌۫◌۬◌ۭۮۯ۰۱۲۳۴۵۶۷۸۹ۺۻۼ۽۾ۿ',
        # Avaric
        'av': 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯӀъь',
        # Azerbaijani
        'az': 'ABCÇDEƏFGĞHXIİJKQLMNOÖPRSŞTUÜVYZ',
        # Azerbaijani Arabic Script
        'az.arabic': '\u0600\u0601\u0602\u0603\u0604\u0605؆؇؈؉؊؋،؍؎؏◌ؐ◌ؑ◌ؒ◌ؓ◌ؔ◌ؕ◌ؖ◌ؗ◌ؘ◌ؙ◌ؚ؛\u061c\u061d؟ؠءآأؤإئابةتثجحخدذرزسشصضطظعغػؼؽؾؿـفقكلمنهوىي◌ً◌ٌ◌ٍ◌َ◌ُ◌ِ◌ّ◌ْ◌ٓ◌ٔ◌ٕ◌ٖ◌ٗ◌٘◌ٙ◌ٚ◌ٛ◌ٜ◌ٝ◌ٞ◌ٟ٠١٢٣٤٥٦٧٨٩٪٫٬٭ٮٯ◌ٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙښڛڜڝڞڟڠڡڢڣڤڥڦڧڨکڪګڬڭڮگڰڱڲڳڴڵڶڷڸڹںڻڼڽھڿۀہۂۃۄۅۆۇۈۉۊۋیۍێۏېۑےۓ۔ە◌ۖ◌ۗ◌ۘ◌ۙ◌ۚ◌ۛ◌ۜ\u06dd۞◌۟◌۠◌ۡ◌ۢ◌ۣ◌ۤۥۦ◌ۧ◌ۨ۩◌۪◌۫◌۬◌ۭۮۯ۰۱۲۳۴۵۶۷۸۹ۺۻۼ۽۾ۿ',
        # Azerbaijani Latin Script by A. Ёfёndi Zadë 1919
        'az.latin1919': 'AÄBCÇDEËFGHIJKLMNN̈OÖPQƢRSTUVWXYZƵ',
        # Azerbaijani Latin Script 1922
        'az.latin1922': 'ABCÇDEƏFGƢHIЬJKLMNŊOƟPQRSTUVXYZƵЗ',
        # Azerbaijani Latin script 1938
        'az.latin1938': 'ABCÇDEƏFGƢHIЬJKQLMNOƟPRSŞTUVXYZƵ',
        # Azerbaijani Cyrillic Script 1939
        'az.cyrillic1939': 'АБВГҒДЕӘЖЗИЙКҜЛМНОӨПРСТУҮФХҺЦЧҸШЫЭЮЯ',
        # Azerbaijani Cyrillic Script
        'az.cyrillic': 'АБВГҒДЕӘЖЗИЈКҜЛМНОӨПРСТУҮФХҺЧҸШЫ',
        # Bashkir
        'ba': 'АБВГҒДҘЕЁЖЗИЙКҠЛМНҢОӨПРСҪТУҮФХҺЦЧШЩЪЫЬЭӘЮЯ',
        # Belarusian
        'be': 'АБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШЫЬЭЮЯ',
        # Bulgarian
        'bg': 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ',
        # Bislama
        'bi': 'ABDEFGHIJKLMNOPRSTUVWY',
        # Bislama Before 1995
        'bi.before1995': 'ABDEFGHIJKLMNOPRSTUVWYÉÏÜM̄P̄',
        # Bambara Latin Script
        'bm': 'ABCDEƐFGHIJKLMNƝŊOƆPRSTUWYZ',
        # Bambara N'ko Script
        'bm.n\'ko': 'ߊߋߌߍߎߏߐߓߔߕߖߗߘߚߙߛߜߝߞߟߡߢߒߣߥߦߤ߲߫߬߯߰',
        # Bengali
        'bn': 'অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহয়ড়ঢ়ৎঁংঃ্০১২৩৪৫৬৭৮৯',
        # Tibetan
        'bo': 'ༀ༁༂༃༄༅༆༇༈༉༊་༌།༎༏༐༑༒༓༔༕༖༗༘༙༚༛༜༝༞༟༠༡༢༣༤༥༦༧༨༩༪༫༬༭༮༯༰༱༲༳༴༵༶༷༸༹༺༻༼༽༾༿ཀཁགགྷངཅཆཇཉཊཋཌཌྷཎཏཐདདྷནཔཕབབྷམཙཚཛཛྷཝཞཟའཡརལཤཥསཧཨཀྵཪཫཬཱཱཱིིུུྲྀཷླྀཹེཻོཽཾཿ྄ཱྀྀྂྃ྅྆྇ྈྉྊྋྌྍྏྐྑྒྒྷྔྕྖྗྙྚྛྜྜྷྞྟྠྡྡྷྣྤྥྦྦྷྨྩྪྫྫྷྭྮྯྰྱྲླྴྵྶྷྸྐྵྺྻྼ྾྿࿀࿁࿂࿃࿄࿅࿆࿇࿈࿉࿊࿋࿌࿎࿏࿐࿑࿒࿓࿔࿕࿖࿗࿘࿙࿚',
        # Bosnian Cyrillic Script
        'bs': 'АБВГДЂЕЖЗИЈКЛЉМCНЊОПРСТЋУФХЦЧЏШ',
        # Bosnian Latin Script
        'bs.latin': 'ABVGDĐEŽZIJKLMNOPRSTĆUFHCČŠ',
        # Breton
        'br': 'ABCCʼDEFGHIJKLMNOPRSTUVWYZÂÊÎÔÛÙÜÑ',
        # Catalan
        'ca': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÉÈÍÏÓÒÚÜÇ',
        # Chechen
        'ce': 'АБВГӀДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
        # Chechen Arabic Script 1910
        'ce.arabic1910': 'ڥڤڭڮژچيهونملكقفغعظطضصشسرذدخحجثتبا',
        # Chechen Arabic Script 1922
        'ce.arabic1910': 'آبﮃچدهفگﻫعاىىکڤلمناو̃يۇفرسشتاوۇوووخحذجڥࢰغݗڗطق',
        # Chechen Latin Script 1925-1938
        'ce.latin1925': 'AÄBCČDEFGHIJKLMNŊOÖPQRSŠTUÜVXX̌YZŽ',
        # Chechen Latin Script 1991
        'ce.latin1991': 'AÄBCĊÇÇ̇DEFGĠHXẊIƵKQQ̇LMNOÖPRSŞTUÜVYZJƏŊ',
        # Chamorro
        'ch': 'AÅBCDEFGHIKLMNÑOPRSTUY',
        # Cimbrian
        'cim': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÄÈÉÌÒÓÖÙÜ',
        # Corsican
        'co': 'AÀBCDEÈFGHIÌÏJLMNOÒPQRSTUÙÜVZ',
        # Cree Latin Script
        'cr': 'mnñńptchčksšryýwliīîuūûōôoeēêaāâ',
        # Cree Eastern Syllabary
        'cr.eastern': 'ᐁᐃᐅᐊᐄᐆᐋᐯᐱᐳᐸᐲᐴᐹᑉᑌᑎᑐᑕᑏᑑᑖᑦᑫᑭᑯᑲᑮᑰᑳᒃᒉᒋᒍᒐᒌᒎᒑᒡᒣᒥᒧᒪᒦᒨᒫᒻᓀᓂᓄᓇᓃᓅᓈᓐᓭᓯᓱᓴᓰᓲᓵᔅᔐᔑᔓᔕᔒᔔᔖᔥᔦᔨᔪᔭᔩᔫᔮᔾᐤᓓᓕᓗᓚᓖᓘᓛᓪᕃᕆᕈᕋᕇᕉᕌᕐᕓᕕᕗᕙᕖᕘᕚᕝᕞᕠᕤᕦᕢᕥᕧᕪᐌᐎᐒᐗᐐᐔᐙᐤᐦ',
        # Cree Western Syllabary
        'cr.western': 'ᐁᐃᐅᐊᐄᐆᐋᐯᐱᐳᐸᐲᐴᐹᑊᑌᑎᑐᑕᑏᑑᑖᐟᑫᑭᑯᑲᑮᑰᑳᐠᒉᒋᒍᒐᒌᒎᒑᐨᒣᒥᒧᒪᒦᒨᒫᒼᓀᓂᓄᓇᓃᓅᓈᐣᓭᓯᓱᓴᓰᓲᓵᐢᔦᔨᔪᔭᔩᔫᔮᐩᐝᖧᖨᖪᖬᖩᖫᖭ‡ᐍᐏᐓᐘᐑᐕᐚᐤᐦᕽᓬᕒ',
        # Czech
        'cs': 'AÁBCČDĎEÉĚFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽ',
        # Old Church Slavonic Cyrillic Script
        'cu': 'АБВГДЄЖЅꙀИІꙈКЛМНОПРСТѸФХѠѾЦЧҀШЩЪꙐЬѢЮꙖѤѦѪѨѬѮѰѲѴ',
        # Old Church Slavonic Glagolitic Script
        'cu.glagolitic': 'ⰀⰁⰂⰃⰄⰅⰆⰇⰈⰉⰊⰋⰌⰍⰎⰏⰐⰑⰒⰓⰔⰕⰖⰗⰘⰙⰜⰝⰞⰛⰟⰟⰉⰠⰡⰣⰤⰨⰧⰩⰪⰫ',
        # Chuvash Cyrillyc Script
        'cv': 'АӐБВГДЕЁӖЖЗИЙКЛМНОПРСҪТУӲФХЦЧШЩЪЫЬЭЮЯ',
        # Chuvash Latin Script
        'cv': 'AĂBCÇDЕĔFGHIJKLMNOPRSŞŠTUÜWZŽӘ',
        # Welsh
        'cy': 'ABCDEFGHIJLMNOPRSTUWYÂÊÎÔÛŴŶ',
        # Danish
        'da': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ',
        # German
        'de': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß',
        # Divehi, Dhivehi, Maldivian
        'dv': 'ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥަާިީުޫެޭޮޯްޱး',
        # Dzongkha
        'dz': 'ༀ༁༂༃༄༅༆༇༈༉༊་༌།༎༏༐༑༒༓༔༕༖༗༘༙༚༛༜༝༞༟༠༡༢༣༤༥༦༧༨༩༪༫༬༭༮༯༰༱༲༳༴༵༶༷༸༹༺༻༼༽༾༿ཀཁགགྷངཅཆཇཉཊཋཌཌྷཎཏཐདདྷནཔཕབབྷམཙཚཛཛྷཝཞཟའཡརལཤཥསཧཨཀྵཪཫཬཱཱཱིིུུྲྀཷླྀཹེཻོཽཾཿ྄ཱྀྀྂྃ྅྆྇ྈྉྊྋྌྍྎྏྐྑྒྒྷྔྕྖྗྙྚྛྜྜྷྞྟྠྡྡྷྣྤྥྦྦྷྨྩྪྫྫྷྭྮྯྰྱྲླྴྵྶྷྸྐྵྺྻྼ྾྿࿀࿁࿂࿃࿄࿅࿆࿇࿈࿉࿊࿋࿌࿎࿏࿐࿑࿒࿓࿔࿙࿚',
        # Ewe
        'ee': 'ABDƉDEƐFƑGƔHIKLMNŊOƆPRSTUVƲWXYZ',
        # Greek
        'el': 'ΊἚἜῊ῟ἏῺ῝ῙΉ̓Ἀ῾ῨἙἍ͂ἺῈΠΥὍἻΨΦἎ῞ΏἘ῏ὩῚὯὮ῍ἌΞΙᾺἛΜΘ῁Ἴ`Ζ῭ῸἿ῎ἹἫὝΟΝΕἸΡὭΏὟ᾿ΎΉἽὌὋ΅ἬὪὛἯὙ´ἊὊ̀ᾹἋῪἨΛΈἾἪΗἭΔὈᾸἉΆΓΚὫἮ῀ἩῬΧὉὬἝΆΌ́ὨΤ᾽̈ΩΒΣῘῩΑ',
        # English
        'en': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        # Esperanto
        'eo': 'ABCĈDEFGĜHĤIJĴKLMNOPRSŜTUŬVZ',
        # Spanish, Castilian
        'es': 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÝÜ',
        # Estonian
        'et': 'ABDEFGHIJKLMNOPRSŠZŽTUVÕÄÖÜCQWXY',
        # Basque
        'eu': 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
        # Persian
        'fa': '\u0600\u0601\u0602\u0603\u0604\u0605؆؇؈؉؊؋،؍؎؏◌ؐ◌ؑ◌ؒ◌ؓ◌ؔ◌ؕ◌ؖ◌ؗ◌ؘ◌ؙ◌ؚ؛\u061c\u061d؟ؠءآأؤإئابةتثجحخدذرزسشصضطظعغػؼؽؾؿـفقكلمنهوىي◌ً◌ٌ◌ٍ◌َ◌ُ◌ِ◌ّ◌ْ◌ٓ◌ٔ◌ٕ◌ٖ◌ٗ◌٘◌ٙ◌ٚ◌ٛ◌ٜ◌ٝ◌ٞ◌ٟ٠١٢٣٤٥٦٧٨٩٪٫٬٭ٮٯ◌ٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙښڛڜڝڞڟڠڡڢڣڤڥڦڧڨکڪګڬڭڮگڰڱڲڳڴڵڶڷڸڹںڻڼڽھڿۀہۂۃۄۅۆۇۈۉۊۋیۍێۏېۑےۓ۔ە◌ۖ◌ۗ◌ۘ◌ۙ◌ۚ◌ۛ◌ۜ\u06dd۞◌۟◌۠◌ۡ◌ۢ◌ۣ◌ۤۥۦ◌ۧ◌ۨ۩◌۪◌۫◌۬◌ۭۮۯ۰۱۲۳۴۵۶۷۸۹ۺۻۼ۽۾ۿ',
        # Finnish
        'fi': 'ABCDEFGHIJKLMNOPQRSŠTUVWXYZŽÅÄÖ',
        # Fulah Latin Script
        'ff': 'ABƁCDƊEFGHIJKLMNŊƝOPRSTUWYƳʼQVXZ',
        # Fulah Arabic Script
        'ff.arabic': '\u0600\u0601\u0602\u0603\u0604\u0605؆؇؈؉؊؋،؍؎؏◌ؐ◌ؑ◌ؒ◌ؓ◌ؔ◌ؕ◌ؖ◌ؗ◌ؘ◌ؙ◌ؚ؛\u061c\u061d؟ؠءآأؤإئابةتثجحخدذرزسشصضطظعغػؼؽؾؿـفقكلمنهوىي◌ً◌ٌ◌ٍ◌َ◌ُ◌ِ◌ّ◌ْ◌ٓ◌ٔ◌ٕ◌ٖ◌ٗ◌٘◌ٙ◌ٚ◌ٛ◌ٜ◌ٝ◌ٞ◌ٟ٠١٢٣٤٥٦٧٨٩٪٫٬٭ٮٯ◌ٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙښڛڜڝڞڟڠڡڢڣڤڥڦڧڨکڪګڬڭڮگڰڱڲڳڴڵڶڷڸڹںڻڼڽھڿۀہۂۃۄۅۆۇۈۉۊۋیۍێۏېۑےۓ۔ە◌ۖ◌ۗ◌ۘ◌ۙ◌ۚ◌ۛ◌ۜ\u06dd۞◌۟◌۠◌ۡ◌ۢ◌ۣ◌ۤۥۦ◌ۧ◌ۨ۩◌۪◌۫◌۬◌ۭۮۯ۰۱۲۳۴۵۶۷۸۹ۺۻۼ۽۾ۿ',
        # Fulah Adlam Script
        'ff.adlam': '𞤀𞤁𞤂𞤃𞤄𞤅𞤆𞤇𞤈𞤉𞤊𞤋𞤌𞤍𞤎𞤏𞤐𞤑𞤒𞤓𞤔𞤕𞤖𞤗𞤘𞤙𞤚𞤛𞤜𞤝𞤞𞤟𞤠𞤡',
        # Fijian
        'fj': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        # Faroese
        'fo': 'AÁBDÐEFGHIÍJKLMNOÓPRSTUÚVYÝÆØ',
        # French
        'fr': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÉÂÊÎÔÛÀÈÙËÏÜŸÇ',
        # Western Frisian
        'fy': 'AÂBCDEÊÉFGHIYJKLMNOÔPQRSTUÛÚVWXZŒ',
        # Irish, Gaelic
        'ga': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚ',
        # Scottish Gaelic
        'gd': 'ABCDEFGHILMNOOPRSTUJKQVWXYZÀÈÌÒÙ',
        # Galician
        'gl': 'ABCDEFGHILMNÑOPQRSTUVXZÁÉÍÓÚÜ',
        # Ancient Greek
        'grc': 'ΑΆᾺἈἉἊἋἌἍἎἏἈΙἉΙἊΙἋΙἌΙἍΙἎΙἏΙΒΓΔΕΈῈἘἙἚἛἜἝΖΗΉῊἨἩἪἫἬἭἮἯἨΙἩΙἪΙἫΙἬΙἭΙἮΙἯΙΘΙΊΪῚἸἹἺἻἼἽἾἿΚΛΜΝΞΟΌῸὈὉὊὋὌὍΠΡΣΤΥΎΫῪὙὛὝὟΦΧΨΩΏῺὨὩὪὫὬὭὮὯὨΙὩΙὪΙὫΙὬΙὭΙὮΙὯΙ',
        # Guarani
        'gn': 'AÃCHEẼGG̃HIĨJKLMMBNNDNGNTÑOÕPRRRSTUŨVYỸʼ',
        # Gujarati
        'gu': 'કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલળવશષસહકક્કક્ખક્ગક્ઘક્ઙક્ચક્છક્જક્ઝક્ઞક્ટક્ઠક્ડક્ઢક્ણક્તક્થક્દક્ધક્નક્પક્ફક્બક્ભક્મક્યક્રક્લક્ળક્વક્શક્ષક્સક્હખખ્કખ્ખખ્ગખ્ઘખ્ઙખ્ચખ્છખ્જખ્ઝખ્ઞખ્ટખ્ઠખ્ડખ્ઢખ્ણખ્તખ્થખ્દખ્ધખ્નખ્પખ્ફખ્બખ્ભખ્મખ્યખ્રખ્લખ્ળખ્વખ્શખ્ષખ્સખ્હગગ્કગ્ખગ્ગગ્ઘગ્ઙગ્ચગ્છગ્જગ્ઝગ્ઞગ્ટગ્ઠગ્ડગ્ઢગ્ણગ્તગ્થગ્દગ્ધગ્નગ્પગ્ફગ્બગ્ભગ્મગ્યગ્રગ્લગ્ળગ્વગ્શગ્ષગ્સગ્હઘઘ્કઘ્ખઘ્ગઘ્ઘઘ્ઙઘ્ચઘ્છઘ્જઘ્ઝઘ્ઞઘ્ટઘ્ઠઘ્ડઘ્ઢઘ્ણઘ્તઘ્થઘ્દઘ્ધઘ્નઘ્પઘ્ફઘ્બઘ્ભઘ્મઘ્યઘ્રઘ્લઘ્ળઘ્વઘ્શઘ્ષઘ્સઘ્હઙઙ્કઙ્ખઙ્ગઙ્ઘઙ્ઙઙ્ચઙ્છઙ્જઙ્ઝઙ્ઞઙ્ટઙ્ઠઙ્ડઙ્ઢઙ્ણઙ્તઙ્થઙ્દઙ્ધઙ્નઙ્પઙ્ફઙ્બઙ્ભઙ્મઙ્યઙ્રઙ્લઙ્ળઙ્વઙ્શઙ્ષઙ્સઙ્હચચ્કચ્ખચ્ગચ્ઘચ્ઙચ્ચચ્છચ્જચ્ઝચ્ઞચ્ટચ્ઠચ્ડચ્ઢચ્ણચ્તચ્થચ્દચ્ધચ્નચ્પચ્ફચ્બચ્ભચ્મચ્યચ્રચ્લચ્ળચ્વચ્શચ્ષચ્સચ્હછછ્કછ્ખછ્ગછ્ઘછ્ઙછ્ચછ્છછ્જછ્ઝછ્ઞછ્ટછ્ઠછ્ડછ્ઢછ્ણછ્તછ્થછ્દછ્ધછ્નછ્પછ્ફછ્બછ્ભછ્મછ્યછ્રછ્લછ્ળછ્વછ્શછ્ષછ્સછ્હજજ્કજ્ખજ્ગજ્ઘજ્ઙજ્ચજ્છજ્જજ્ઝજ્ઞજ્ટજ્ઠજ્ડજ્ઢજ્ણજ્તજ્થજ્દજ્ધજ્નજ્પજ્ફજ્બજ્ભજ્મજ્યજ્રજ્લજ્ળજ્વજ્શજ્ષજ્સજ્હઝઝ્કઝ્ખઝ્ગઝ્ઘઝ્ઙઝ્ચઝ્છઝ્જઝ્ઝઝ્ઞઝ્ટઝ્ઠઝ્ડઝ્ઢઝ્ણઝ્તઝ્થઝ્દઝ્ધઝ્નઝ્પઝ્ફઝ્બઝ્ભઝ્મઝ્યઝ્રઝ્લઝ્ળઝ્વઝ્શઝ્ષઝ્સઝ્હઞઞ્કઞ્ખઞ્ગઞ્ઘઞ્ઙઞ્ચઞ્છઞ્જઞ્ઝઞ્ઞઞ્ટઞ્ઠઞ્ડઞ્ઢઞ્ણઞ્તઞ્થઞ્દઞ્ધઞ્નઞ્પઞ્ફઞ્બઞ્ભઞ્મઞ્યઞ્રઞ્લઞ્ળઞ્વઞ્શઞ્ષઞ્સઞ્હટટ્કટ્ખટ્ગટ્ઘટ્ઙટ્ચટ્છટ્જટ્ઝટ્ઞટ્ટટ્ઠટ્ડટ્ઢટ્ણટ્તટ્થટ્દટ્ધટ્નટ્પટ્ફટ્બટ્ભટ્મટ્યટ્રટ્લટ્ળટ્વટ્શટ્ષટ્સટ્હઠઠ્કઠ્ખઠ્ગઠ્ઘઠ્ઙઠ્ચઠ્છઠ્જઠ્ઝઠ્ઞઠ્ટઠ્ઠઠ્ડઠ્ઢઠ્ણઠ્તઠ્થઠ્દઠ્ધઠ્નઠ્પઠ્ફઠ્બઠ્ભઠ્મઠ્યઠ્રઠ્લઠ્ળઠ્વઠ્શઠ્ષઠ્સઠ્હડડ્કડ્ખડ્ગડ્ઘડ્ઙડ્ચડ્છડ્જડ્ઝડ્ઞડ્ટડ્ઠડ્ડડ્ઢડ્ણડ્તડ્થડ્દડ્ધડ્નડ્પડ્ફડ્બડ્ભડ્મડ્યડ્રડ્લડ્ળડ્વડ્શડ્ષડ્સડ્હઢઢ્કઢ્ખઢ્ગઢ્ઘઢ્ઙઢ્ચઢ્છઢ્જઢ્ઝઢ્ઞઢ્ટઢ્ઠઢ્ડઢ્ઢઢ્ણઢ્તઢ્થઢ્દઢ્ધઢ્નઢ્પઢ્ફઢ્બઢ્ભઢ્મઢ્યઢ્રઢ્લઢ્ળઢ્વઢ્શઢ્ષઢ્સઢ્હણણ્કણ્ખણ્ગણ્ઘણ્ઙણ્ચણ્છણ્જણ્ઝણ્ઞણ્ટણ્ઠણ્ડણ્ઢણ્ણણ્તણ્થણ્દણ્ધણ્નણ્પણ્ફણ્બણ્ભણ્મણ્યણ્રણ્લણ્ળણ્વણ્શણ્ષણ્સણ્હતત્કત્ખત્ગત્ઘત્ઙત્ચત્છત્જત્ઝત્ઞત્ટત્ઠત્ડત્ઢત્ણત્તત્થત્દત્ધત્નત્પત્ફત્બત્ભત્મત્યત્રત્લત્ળત્વત્શત્ષત્સત્હથથ્કથ્ખથ્ગથ્ઘથ્ઙથ્ચથ્છથ્જથ્ઝથ્ઞથ્ટથ્ઠથ્ડથ્ઢથ્ણથ્તથ્થથ્દથ્ધથ્નથ્પથ્ફથ્બથ્ભથ્મથ્યથ્રથ્લથ્ળથ્વથ્શથ્ષથ્સથ્હદદ્કદ્ખદ્ગદ્ઘદ્ઙદ્ચદ્છદ્જદ્ઝદ્ઞદ્ટદ્ઠદ્ડદ્ઢદ્ણદ્તદ્થદ્દદ્ધદ્નદ્પદ્ફદ્બદ્ભદ્મદ્યદ્રદ્લદ્ળદ્વદ્શદ્ષદ્સદ્હધધ્કધ્ખધ્ગધ્ઘધ્ઙધ્ચધ્છધ્જધ્ઝધ્ઞધ્ટધ્ઠધ્ડધ્ઢધ્ણધ્તધ્થધ્દધ્ધધ્નધ્પધ્ફધ્બધ્ભધ્મધ્યધ્રધ્લધ્ળધ્વધ્શધ્ષધ્સધ્હનન્કન્ખન્ગન્ઘન્ઙન્ચન્છન્જન્ઝન્ઞન્ટન્ઠન્ડન્ઢન્ણન્તન્થન્દન્ધન્નન્પન્ફન્બન્ભન્મન્યન્રન્લન્ળન્વન્શન્ષન્સન્હપપ્કપ્ખપ્ગપ્ઘપ્ઙપ્ચપ્છપ્જપ્ઝપ્ઞપ્ટપ્ઠપ્ડપ્ઢપ્ણપ્તપ્થપ્દપ્ધપ્નપ્પપ્ફપ્બપ્ભપ્મપ્યપ્રપ્લપ્ળપ્વપ્શપ્ષપ્સપ્હફફ્કફ્ખફ્ગફ્ઘફ્ઙફ્ચફ્છફ્જફ્ઝફ્ઞફ્ટફ્ઠફ્ડફ્ઢફ્ણફ્તફ્થફ્દફ્ધફ્નફ્પફ્ફફ્બફ્ભફ્મફ્યફ્રફ્લફ્ળફ્વફ્શફ્ષફ્સફ્હબબ્કબ્ખબ્ગબ્ઘબ્ઙબ્ચબ્છબ્જબ્ઝબ્ઞબ્ટબ્ઠબ્ડબ્ઢબ્ણબ્તબ્થબ્દબ્ધબ્નબ્પબ્ફબ્બબ્ભબ્મબ્યબ્રબ્લબ્ળબ્વબ્શબ્ષબ્સબ્હભભ્કભ્ખભ્ગભ્ઘભ્ઙભ્ચભ્છભ્જભ્ઝભ્ઞભ્ટભ્ઠભ્ડભ્ઢભ્ણભ્તભ્થભ્દભ્ધભ્નભ્પભ્ફભ્બભ્ભભ્મભ્યભ્રભ્લભ્ળભ્વભ્શભ્ષભ્સભ્હમમ્કમ્ખમ્ગમ્ઘમ્ઙમ્ચમ્છમ્જમ્ઝમ્ઞમ્ટમ્ઠમ્ડમ્ઢમ્ણમ્તમ્થમ્દમ્ધમ્નમ્પમ્ફમ્બમ્ભમ્મમ્યમ્રમ્લમ્ળમ્વમ્શમ્ષમ્સમ્હયય્કય્ખય્ગય્ઘય્ઙય્ચય્છય્જય્ઝય્ઞય્ટય્ઠય્ડય્ઢય્ણય્તય્થય્દય્ધય્નય્પય્ફય્બય્ભય્મય્યય્રય્લય્ળય્વય્શય્ષય્સય્હરર્કર્ખર્ગર્ઘર્ઙર્ચર્છર્જર્ઝર્ઞર્ટર્ઠર્ડર્ઢર્ણર્તર્થર્દર્ધર્નર્પર્ફર્બર્ભર્મર્યર્રર્લર્ળર્વર્શર્ષર્સર્હલલ્કલ્ખલ્ગલ્ઘલ્ઙલ્ચલ્છલ્જલ્ઝલ્ઞલ્ટલ્ઠલ્ડલ્ઢલ્ણલ્તલ્થલ્દલ્ધલ્નલ્પલ્ફલ્બલ્ભલ્મલ્યલ્રલ્લલ્ળલ્વલ્શલ્ષલ્સલ્હળળ્કળ્ખળ્ગળ્ઘળ્ઙળ્ચળ્છળ્જળ્ઝળ્ઞળ્ટળ્ઠળ્ડળ્ઢળ્ણળ્તળ્થળ્દળ્ધળ્નળ્પળ્ફળ્બળ્ભળ્મળ્યળ્રળ્લળ્ળળ્વળ્શળ્ષળ્સળ્હવવ્કવ્ખવ્ગવ્ઘવ્ઙવ્ચવ્છવ્જવ્ઝવ્ઞવ્ટવ્ઠવ્ડવ્ઢવ્ણવ્તવ્થવ્દવ્ધવ્નવ્પવ્ફવ્બવ્ભવ્મવ્યવ્રવ્લવ્ળવ્વવ્શવ્ષવ્સવ્હશશ્કશ્ખશ્ગશ્ઘશ્ઙશ્ચશ્છશ્જશ્ઝશ્ઞશ્ટશ્ઠશ્ડશ્ઢશ્ણશ્તશ્થશ્દશ્ધશ્નશ્પશ્ફશ્બશ્ભશ્મશ્યશ્રશ્લશ્ળશ્વશ્શશ્ષશ્સશ્હષષ્કષ્ખષ્ગષ્ઘષ્ઙષ્ચષ્છષ્જષ્ઝષ્ઞષ્ટષ્ઠષ્ડષ્ઢષ્ણષ્તષ્થષ્દષ્ધષ્નષ્પષ્ફષ્બષ્ભષ્મષ્યષ્રષ્લષ્ળષ્વષ્શષ્ષષ્સષ્હસસ્કસ્ખસ્ગસ્ઘસ્ઙસ્ચસ્છસ્જસ્ઝસ્ઞસ્ટસ્ઠસ્ડસ્ઢસ્ણસ્તસ્થસ્દસ્ધસ્નસ્પસ્ફસ્બસ્ભસ્મસ્યસ્રસ્લસ્ળસ્વસ્શસ્ષસ્સસ્હહહ્કહ્ખહ્ગહ્ઘહ્ઙહ્ચહ્છહ્જહ્ઝહ્ઞહ્ટહ્ઠહ્ડહ્ઢહ્ણહ્તહ્થહ્દહ્ધહ્નહ્પહ્ફહ્બહ્ભહ્મહ્યહ્રહ્લહ્ળહ્વહ્શહ્ષહ્સહ્હ',
        # Manx
        'gv': 'ABCDEFGHIJKLMNOPQRSTUVWY',
        # Hausa
        'ha': 'ABƁCDƊEFGHIJKƘLMNORR̃STUWYƳZʼ',
        # Hebrew
        'he': 'ְֱֲֳִֵֶַָֹֺֻּֽ֑֖֛֢֣֤֥֦֧֪֚֭֮֒֔֕֗֘֙֜֝֞֟֠֡֨֩֫֬֯־ֿ׀ׁׂ׃ׅׄ׆ׇאבגדהוזחטיךכלםמןנסעףפץצקרשתׯװױײ׳״יִﬞײַﬠﬡﬢﬣﬤﬥﬦﬧﬨ﬩שׁשׂשּׁשּׂאַאָאּבּגּדּהּוּזּטּיּךּכּלּמּנּסּףּפּצּקּרּשּתּוֹבֿכֿפֿﭏיִﬞײַﬠﬡﬢﬣﬤﬥﬦﬧﬨ﬩שׁשׂשּׁשּׂאַאָאּבּגּדּהּוּזּטּיּךּכּלּמּנּסּףּפּצּקּרּשּתּוֹבֿכֿפֿﭏ',
        # Hindi
        'hi': 'ॿॠऔॹओऴञॊॡॗ७थ४बःॼॾतोऽौ॔घढअॸ॑ूषॷ्ँसॶॏझढ़ऄॺॖुऻऱ१णऀॣचयआशलहऊऒीॕॲॵजाटेऺरऋॴवऑऎॉ५ग़ख़।॒२ॎपनभङछ़ॻॽ॥मकखड̪ॄै॓ज़९ळॢ०ईॅधि८उय़ऌॱठॳइफ़एृक़३॰ॆ६ऩॐगंऐफड़दऍ',
        # Hiri Motu
        'ho': 'ABDEGHIKLMNOPRSTUVW',
        # Croatian
        'hr': 'ABCČĆDĐEFGHIJKLMNOPRISŠTUVZŽ',
        # Haitian, Haitian Creole
        'ht': 'AEÈIOÒUBCDFGHJKLMNPRSTVWYZ',
        # Hungarian
        'hu': 'AÁBCDEÉFGHIÍJKLMNNOÓÖŐPRSTUÚÜŰVZQWXY',
        # Armenian
        'hy': 'ԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՌՍՎՏՐՑՒՓՔԵՕՖֆ',
        # Herero
        'hz': 'ABDḒEFGHIJKLMMMNNNNNṊOPRSTTṰUVWYZ',
        # Interlingua
        'ia': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        # Interlingue
        'ie': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚ',
        # Indonesian
        'id': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        # Igbo
        'ig': 'ABCDEFGHIỊJKLMNṄOỌPRSTUỤVWYZ',
        # Iñupiaq (North Slope and Northwest Arctic)
        'ik': 'ACGĠHIKLḶŁŁ̣MNÑŊPQRSTUVYʔ',
        # Iñupiaq (Seward Peninsula)
        'ik.seward': 'ABGĠHIKLŁMNŊPQRSTUVWYZʼ',
        # Iñupiaq (Canadian, Uummarmiutun)
        'ik.canadian': 'ACFGHDIJKLŁMNÑPQRR̂TUVY',
        # Ido
        'io': 'ABCDEFGHIJKLMNOPQROSTUVWXYZ',
        # Icelandic
        'is': 'AÁBDÐEÉFGHIÍJKLMNOÓPRSTUÚVXYÝÞÆÖ',
        # Italian
        'it': 'ABCDEFGHILMNOPQRSTUVZÀÈÉÌÍÎÒÓÙÚ',
        # Javanese Javanese Script
        'jv': 'ꦟꦕꦠꦞꦹꦯꦊꦝꦘꦒꦎꦢꦓꦍꦧꦰꦈꦷꦦꦗꦀꦬꦋꦣꦿꦙꦂꦫꦁꦻꦛ꧀ꦨꦪꦾꦏꦔꦖꦡꦜꦇꦮꦐꦚꦤꦉꦸꦲꦥꦺꦩꦭꦌꦑꦄꦆꦴꦶꦱꦽꦼ',
        # Javanese English Script
        'jv': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÉÈ',
        # Georgian
        'ka': 'აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ',
        # Georgian Asomtavruli Script
        'ka.asomtavruli': 'ႠႡႢႣႤႥႦჁႧႨႩႪႫႬჂႭႮႯႰႱႲჃႭჃႳႴႵႶႷႸႹႺႻႼႽႾჄႿჀჅ',
        # Georgian Nuskhuri Script
        'ka.nuskhuri': 'ⴀⴁⴂⴃⴄⴅⴆⴡⴇⴈⴉⴊⴋⴌⴢⴍⴎⴏⴐⴑⴒⴣⴍⴣⴓⴔⴕⴖⴗⴘⴙⴚⴛⴜⴝⴞⴤⴟⴠⴥ',
        # Kikuyu
        'ki': 'ABCDEGHIĨJKMNORTUŨWY',
        # Kazakh Cyrillic Script
        'kk': 'АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯ',
        # Kazakh Latin Script 2021
        'kk.latin2021': 'AÄBDEFGĞHIİJKLMNÑOÖPQRSŞTUŪÜVYZ',
        # Kazakh Latin Script 2018
        'kk.latin2018': 'AÁBDEFGǴHIJKLMNŃOÓPQRSTUÚVYÝZC',
        # Kazakh Latin Pinyin Script 1964—1984
        'kk.latin_pinyin': 'ABDEÊƏFGƢHⱧIJKⱩLMNOƟPQRSTUÜVWXYZ',
        # Kazakh Latin Script 1938
        'kk.latin1938': 'ABVGDEÇZIJKLMNOPRSTUFXƢQCƏHꞐƟŪYЬ',
        # Kazakh Latin Script 1929
        'kk.latin1929': 'ABCÇDEƏGƢHIJKLMNꞐOƟPQRSTUVYZЬ',
        # Greenlandic
        'kl': 'AEFGIJKLMNOPQRSTUVBCDHWXYZÆØÅÂÎÛ́ÁÍÚ̃̀ÃÀĨÌŨÙÊÔ',
        # Khmer
        'km': '៤៩់ឩลបːឰេ០̆សឡឮ̌៨វឍនោើឌល៣ឋឧឬញ៍ងែដមឞឳឃា១ឆះតខហឦឭៈជចឯ៊យិนួៃថ៏២ណផ៎៦ឱធมឿឲ័งៅ៧៌៉อวុ៑ឥឺឪៀ៥ឈឹូទឝ្หពកัអ"ឨភឫគីំរ',
        # Kannada
        'kn': 'ಉೆಝ೨ːಯಮಂಡಈೕಜಓಇಐಅೞಞಕಫ̄ೱೣ್ಧಭಆ೮ಽಬನ೩ಹೃಸ\u0cf3೧಼ಚೡೋೈ\u0cdd೭ಛಁಖಥ಄ೌಷಊಙಏಣಃ—ಾಋ೫ರೢೇತದಌಀಶಔೊಒಘಢ೦ೄಱ̥ಗವ–Ṃೀಳ೪೬ಲಟಠೠಿೲುಪ೯ಎ',
        # Korean
        'ko': 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㄲㄸㅃㅆㅉㄳㄵㄶㄺㄻㄼㄽㄾㄿㅀㅄ가각갂갃간갇갈갉갊감갑값갓갔강갖갗같갚갛개객갠갤갭갯갰갱갸갹갼걀걋걍걔걘걜거걱건걷걸걺검겁것겉게겐겔겜겝겟겨격겪견결겸겹경곁계곈곌곕곗고곡곤곧골곰곱곳공곶과곽관괄괆괌괍괏광괘괜괠괩괬괭괴괵괸괼굉교구국군굳굴굵굶굿궁궂궈궉권궐궜궝궤귀규균귤그극근글긁금급긋긍기긱긴긷길김깃깅깊까깍깎깐깔깖깜깝깟깠깡깥깨깩깬깰깸깹깻깼깽꺄꺅꺌꺼꺽꺾껀껄껌껍껏껐껑께껙껜껨껫껭껴껸껼꼇꼈꼍꼬꼭꼰꼲꼴꼼꼽꼿꽁꽂꽃꽉꽈꽉꽐꽜꽝꽤꽥꽹꾀꾄꾈꾐꾑꾕꾜꾸꾹꾼꿀꿇꿈꿉꿋꿍뀌뀐뀔뀜뀝뀨끄끅끈끊끌끓끔끕끝끼끽낀낄낌낍낏낑나낙낚난낟날낡낢남납낫내낭낮낯낱낳내너넉넋넌널넒넓넘넙넛넜넝넣네넥넨넷녀녁년념녕노녹논놀놂놈놉놋농높놓놔놘놜놨뇌뇨누눅눈눋눌눔눕눗눙뉘뉜뉠뉴늄느늑는늘늙능늦늪늬니닉니다닌닐님다닥닦단닫달닭닮담답닷당대댁댄댐댓더덕던덜덞덤덥덧덩덫덮데덱덴델뎀뎁뎃도독돈돌돕돗동돼됐되된될됨됩됫됴두둑둔둘둠둡둣둥뒤듀듄득든듣들듬듭듯등디딩딨따딱딴딸땀땅때땜땝땡떠떡떤떳떻떼뗄뗌뗍뗏또똑똔똘똥뚜뚝뚫뚬뛰뛴뛸뜀뜁뜅뜨뜩뜬뜻든드디드라드래랑래랍랑랗래랭랴략량러럭런럴럼럽럿레렇레렉렌렏렐렘렙렛렝려력련렬렴렵렷렸로록론롤롬롭롯롱롸뢰뢴뢸루룩룬룰룻류르른름릉릎리릭린림립릿링마막만많맏말맑맘맙맛망맞맡맣매맥맨맵맷맹멀멈멋멍메멕멘멜멤멥멧멩면멸명몀몃몇모목몫몬몰몸몹못몽묘무묵묶문물물음미므믄믈믐믓믜민믿밀밋밍바박밖밗반받발밝밞밟밤밥방밭배백번벌범법벗벙벚베벡벤벨벼벽변별볍볏병볕볘볜보복본볼봄봅봇봉봐봔봤부북분불붉붐붓붙붜붸브븍븐블비빈빌빔빕빗빙빚빛빠빡빤빨빵빼뺌뺑뺘뺴뻐뻔뻗뻣뻬뼈뼉뼘뼛뼤뽀뽁뽄뽈뽐뽑뽕뾰뿌뿍뿐쁘쁜삐삔삖삘삚삣삥사삭삯산삳살삵삶삼상샅새색샌생샤서석섞선섣설섦섧섬섭성세섯섰성세속손솔솜솝솟송솥쇄쇈쇌쇔쇗쇠쇤쇼수숙순숟술숨숫숭숯숲쉬쉰쉴쉼쉽슈슉슐슘슛슬슴습슷승시식신싣실싫심십싯싱싶싸싹싻싼쌀쌈쌉쌌쌍쌓쌔쌕쌘쌜쌤쌥썅써썩썰썲썸썹쎄쎈쎄응쎄지쎄티쎄하쎄한쎌쏘쏙쏜쏟쏠쏢쏨쏩쏭쏴쐈쐐쐤쐬쐰쐴쑈쑤쑥쑨쑬쑵쑹쒀쒄쒔쒜쒸쓰쓱쓴쓸쓺쓿씀씁씌씐씔씜씨씩씬씰씸아악안앉않알앍앎앓암압앗앙앞애액앤앨앰앱앳앵야약얀얄얇얌얍얏양얕얗얘얜얠얩어억언얹얻얼엄업없엇었엉엊엌엎에엑엔엘엣엥여역연열염엽엿였영옅옆예옛오옥온올옮옳옴옵옷옹와왁완왈왐왑왓왔왕왜왝왠외왼욕욜욤용우욱운울움웃웅워원월웕위유으은을음응의이익인일임입잇있잊자작잔잖잗잘잚잠잡장잦재잭잰잴잼잽잿쟁쟈쟉쟤저적전절젊점접젓정젖제젠젤젬젭젯젱져조졌졍족존졸졺좀좁종좆좋좌좍좔좝좡좨좼죄죈죌죔주죽준줄줌줍줏중줘줬줴쥐쥑쥔쥘쥠즈즉즌즐즘즙즛증지직진짇질짊짐집짓징짙짚짜짝짧째째짱째째째째째째째째찌찍찐찔찜찝찡찢찧차착찬찮찰참찹찻찼창찾채책챈처척천철첨첫청체첵첸첼쳄쳅쳇체초촉촌촐촘촛총촤촬최추축춘출춤춥춧충춰취치칙친칠침칫칭카칸칼캄캅캉캐캑캔캘캠캡캣캤캥캬컁커컨컬컴컵컷컸컹케켄켓켜켠켤켭켯켰켱켸콕콘콜콤콥콧콩콰쾅쿄쿠쿡쿤쿨쿰쿱쿳쿵쿼퀀퀘퀭퀴퀵퀸퀼큐크큰클큼큽킁키타탁탄탈탐탑탓탕태택탠탤탬탭탯탱탸털턺턾텀텁텃텅테텍텔템텝텟텡텨텬텼튀튁튄튈튐튑튕튜트특튼튿틀틈틉틋틔티틱틴틸팀팁팃팅파팍팎판팔팝팟팡팥패팩팬팰팸팹팻팼팽퍄퍅퍼퍽펀펄펌펍펏펑페펙펜펠펫펭펴폄평폐포폭폰폴표푀푸푹푼푿풀풂품풉풋풍퓌퓐퓔퓜퓟퓨퓬퓰퓸퓻퓽프픈플픔픕픗피픽핀필핌핍핏핑하학한할핥함합핫항해핵핸핼햄햇했행향허헉헌헐헒험헙헛헝헤혀혁현혈혐협혓혔형혜호혹혼홀홅홈홉홋홍화확환활홧황회획횐횔횝효후훅훈훌훑훔훙훤훼죄죡죤죵죽줏줄줍중쥐쥑쥔쥘쥠즈즉즌즐즘즙즛증직진짇질짊짐집징짙짚짜짝짧째째짱째째째째째째찌찍찐찔찜찝찡찢찧차착찬찮찰참찹찻찼창찾채책챈처척천철첨첫청체첵첸첼쳄쳅쳇체초촉촌촐촘촛총촤촬최추축춘출춤춥춧충춰취치칙친칠침칫칭카칸칼캄캅캉캐캑캔캘캠캡캣캤캥캬컁커컨컬컴컵컷컸컹케켄켓켜켠켤켭켯켰켱켸콕콘콜콤콥콧콩콰쾅쿄쿠쿡쿤쿨쿰쿱쿳쿵쿼퀀퀘퀭퀴퀵퀸퀼큐크큰클큼큽킁키타탁탄탈탐탑탓탕태택탠탤탬탭탯탱탸털턺턾텀텁텃텅테텍텔템텝텟텡텨텬텼튀튁튄튈튐튑튕튜트특튼튿틀틈틉틋틔티틱틴틸팀팁팃팅파팍팎판팔팝팟팡팥패팩팬팰팸팹팻팼팽퍄퍅퍼퍽펀펄펌펍펏펑페펙펜펠펫펭펴폄평폐포폭폰폴표푀푸푹푼푿풀풂품풉풋겊겋겠겼굽귄끗났낸낼냈냐냥넸녔늉댔덟뎅뎌뎠돋둬딘땐떨떴뚱뜰락란람랐랜랫랬렀렁령례료뤄륙륜를릅릇릴맬맴맺머먹먼며묻뭇뭐뭔뭘밑밧뱀뱃뱅버붕뻘뻥뿔쁨샘셈셋셔셨소솎쇳숴스슨씹았요웠웬윈윙육율윽읽잃잉잎잤죠짖짢쩌쩔쪽쫓쬐쭈쭐쯤챘챙쳐쳤측코쾌킨킬터턱텐토톱통퇴투툭툴펐편펼폈홑훗훨휘휩휴흐흑흔흘흠흥흩희흰히힌힘',
        # Kashmiri Arabic Script
        'ks': 'ʲڈفːل͡Ɽِصیٗعذٔکےڑٕ̄ثقپٚضتٹحآكۄھگغژـٲہٟƔأ̃واظزںردنَب–سشمچؠطجٳۆێُإخ',
        # Kashmiri Devanagari Script
        'ks.devanagari': 'वऑॶऔऎउओथठबपनछॳ़इतएमकखडअचयआॷलगशसहऊऒँॵॲजटऐफरईॴद',
        # Kurdish Hawar Script
        'ku': 'ABCÇDEÊFGHIÎJKLMNOPQRSŞTUÛVWXYZ',
        # Kurdish Arabic Script
        'ku.arabic': '\u0600\u0601\u0602\u0603\u0604\u0605؆؇؈؉؊؋،؍؎؏◌ؐ◌ؑ◌ؒ◌ؓ◌ؔ◌ؕ◌ؖ◌ؗ◌ؘ◌ؙ◌ؚ؛\u061c\u061d؟ؠءآأؤإئابةتثجحخدذرزسشصضطظعغػؼؽؾؿـفقكلمنهوىي◌ً◌ٌ◌ٍ◌َ◌ُ◌ِ◌ّ◌ْ◌ٓ◌ٔ◌ٕ◌ٖ◌ٗ◌٘◌ٙ◌ٚ◌ٛ◌ٜ◌ٝ◌ٞ◌ٟ٠١٢٣٤٥٦٧٨٩٪٫٬٭ٮٯ◌ٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙښڛڜڝڞڟڠڡڢڣڤڥڦڧڨکڪګڬڭڮگڰڱڲڳڴڵڶڷڸڹںڻڼڽھڿۀہۂۃۄۅۆۇۈۉۊۋیۍێۏېۑےۓ۔ە◌ۖ◌ۗ◌ۘ◌ۙ◌ۚ◌ۛ◌ۜ\u06dd۞◌۟◌۠◌ۡ◌ۢ◌ۣ◌ۤۥۦ◌ۧ◌ۨ۩◌۪◌۫◌۬◌ۭۮۯ۰۱۲۳۴۵۶۷۸۹ۺۻۼ۽۾ۿ',
        # Kurdish Cyrillic Script 1946
        'ku.cyrillic': 'АБВГГʼДЕӘЖЗИЙКЛМНОӦПРСТУФХҺЧШЩЬЭԚԜ',
        # Kurdish Armenian Script 1921-1929
        'ku.armenian': 'ԱՊՃՋՉՏՙԷԵՖԿՀԸԻԺԳՔԼՄՆՕՈԲՓՐՌՍՇԴԹՒՎԽՂՅԶ',
        # Kurdish Soviet Latin Script 1929
        'ku.soviet_latin': 'ABCꞒÇDEƏƏ́FGƢHĦIJKĶLMNOÖPṔQRSŞTŢUÛVWXYZƵЬ',
        # Komi
        'kv': 'АБВГДЕЁЖЗИIЙКЛМНОӦПРСТУФХЦЧШЩЪЫЬЭЮЯ',
        # Komi Molodtsov
        'kv.molodtsov': 'АБВГԀԂЕЖҖЗԄԆІЈКЛԈМНԊОӦПРСԌТԎУФХЦЧШЩЫ',
        # Cornish
        'kw': 'ABCDEFGHIJKLMNOPRSTUVWXYZ',
        # Kyrgyz
        'ky': 'АБВГДЕЁЖЗИЙКЛМНҢОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ',
        # Latin
        'la': 'ABCDEFGHIKLMNOPQRSTVXYZÁÉꟾÓV́ĀĒĪŌŪ',
        # Latin Old Italic Script
        'la.old_italic': '𐌖𐌅𐌇𐌆𐌈𐌙𐌊𐌁𐌂𐌉𐌋𐌍𐌒𐌏𐌑𐌚𐌌𐌀𐌐𐌔𐌓𐌃𐌄𐌗𐌘𐌎𐌕',
        # Luxembourgish, Letzeburgesch
        'lb': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄËÉ',
        # Limburgan, Limburger, Limburgish
        'li': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        # Ganda, Luganda
        'lg': 'ABCDEFGIJKLMNŊYOPRSTUVWYZ',
        # Lingala
        'ln': 'AÁÂǍBCDEÉÊĚƐFGHIÍÎǏKLMNOÓÔǑƆƆ́Ɔ̂Ɔ̌PRSTUÚVWYZ',
        # Lao
        'lo': 'ໜຽຜມສຢຸາຄັບົຖງອໃຝຫນປກໂພຕແເຶວໝູຈຊໄທ◌ຮຍຣລໍຂະືຟດີິ',
        # Lithuanian
        'lt': 'AĄBCČDEĘĖFGHIĮYJKLMNOPRSŠTUŲŪVZŽ',
        # Luba-Katanga
        'lu': 'AEIOUBDFGHJKLMNPSTVWYZ',
        # Latvian
        'lv': 'AĀBCČDEĒFGĢHIĪJKĶLĻMNŅOPRSŠTUŪVZŽ',
        # Māori
        'mi': 'AEHIKMNOPRTUWNGĀĒĪŌŪ',
        # Macedonian
        'mk': 'АБВГДЃЕЖЗЅИЈКЛЉМНЊОПРСТЌУФХЦЧЏШ',
        # Malayalam
        'ml': 'ഐൊജഠളലാുഖൢഞഫൡബ൮൩ൣ൦ഹെ॥ോഽിഗശകട൯ഔൄദരധൃഓൈീൂഛപയ൪൬ഒചഭങഏഝ।ഇഡൠവ൹ഘഺഅഉതണ൭ഩഌമറഥ൫ആഎൌനഢസഈ൧ഴേഷ൨ഋ',
        # Malagasy
        'mg': 'ABDEFGHIJKLMNN̈ÑOÔPRSTVYZÀÈÒỲ',
        # Marshallese
        'mh': 'AĀBDEIJKL\u200çMM̧NNN̄OO̧ŌPRTUŪW',
        # Mongolian
        'mo': 'АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ',
        # Moldavian, Moldovan, Romanian Cyrillic Script
        'mol': 'АБВГДЕЖӁЗИЙКЛМНОПРСТУФХЦЧШЫЬЭЮЯ',
        # Marathi Devanagari Script
        'mr': 'वऑॶऔऎउओथठबपनछॳ़इतएमकखडअचयआॷलगशसहऊऒँॵॲजटऐफरईॴद',
        # Malay
        'ms': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        # Maltese
        'mt': 'ABĊDEFĠGHĦIIJKLMNOPQRSTUVWXŻZ',
        # Burmese
        'my': 'ကဝဈရဥဒညျံငပိဂဋဩအမဍာလနဣသဗဆဇဌေဪခီဖဘုဲှဧထးွဉဤဎဓဃဟဠစူဦ်ါ့ယြတဏ',
        # Norwegian Bokmål
        'nb': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ',
        # Nepali Devanagari Script
        'ne': 'वऑॶऔऎउओथठबपनछॳ़इतएमकखडअचयआॷलगशसहऊऒँॵॲजटऐफरईॴद',
        # Dutch
        'nl': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÄÈÉÊËÌÍÎÏÑÒÓÔÖÙÚÛÜÝ',
        # Norwegian Nynorsk
        'nn': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ',
        # Norwegian
        'no': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ',
        # Navajo, Navaho
        'nv': 'ABCDEGHIJKLMNOSTWXYZÁÉÍÓĄĘĮŁǪʼ́',
        # Chichewa, Chewa, Nyanja
        'ny': 'ABCDEFGHIJKLMN\'OPRSTUVWÉYZ',
        # Occitan
        'oc': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÈÒÁÉÍÓÚÏÜÇ·',
        # Odia, Oriya
        'or': '଼ୀଢଫଖଣମଳଓଲକୈଆଥୋଯଟୂ୍ଃବଅଛଶୱଇଈଜଗଋେଷୡାପଘୟଞିତୢୄଐଧଉଚଠ&ୃସୌନଭ̄ଙଡଝଔହୁଊଏଦଌରୣୠ',
        # Ossetian Cyrillic Script
        'os': 'АӔБВГДДЖЕЗИЙКЛМНОПРСТУФХЦЧЫЪ',
        # Ossetian Latin Script 1923-1938
        'os.latin': 'AÆBCČDEFGHIJKLMNOPQRSTUVXYZŽ',
        # Punjabi
        'pa': '਼ਢਨਯਝਜਗੂੰਬਈ͡ਿ੍ੲਠਔਡਅ̀́ਘਚਮੀਓਛੜਥਸਊ̃ਪਫਙੁਇਂਵਆਧੋਭਖੇਲਐੳਏਟਹ̪ਞਦਉੌੈਣਕਤਰଷਾ',
        # Pali
        'pi': 'ABCDEGHIJKLMNOPRSTUVYÑĀĪŪḌḶṂṄṆṬ',
        # Polish
        'pl': 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŹŻ',
        # Portugese
        'pt': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÉÍÓÚÂÊÔÃÕÇ',
        # Quechua
        'qu': 'ABCDEFGHIKLMNOPQRSTUVWYZÑĈČŠŽʼ',
        # Romansh
        'rm': 'ABCDEFGHIJLMNOPQRSTUVXZÉÈÊÏÖÜ',
        # Romanian Latin Script
        'ro': 'AĂÂBCDEFGHIÎJKLMNOPQRSȘTȚUVWXYZ',
        # Russian
        'ru': 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
        # Pre-Reform Russian Orthography
        'ru.prereform': 'АБВГДЕЖЗИІКЛМНОПРСТУФХЦЧШЩЪЫЬѢЭЮЯѲѴ',
        # Kinyarwanda, Rwandan, Rwanda, Ikinyarwanda
        'rw': 'ABCDEFGHIJKMNOPRSTUVWYZ',
        # Sanskrit Devanagari Script
        'sa': 'वऑॶऔऎउओथठबपनछॳ़इतएमकखडअचयआॷलगशसहऊऒँॵॲजटऐफरईॴद',
        # Sardinian
        'sc': 'ABCDEFGHIJKLMNOPRSTTUVXZÀÇÈÌÒÙ',
        # Northern Sámi
        'se': 'AÁBCČDĐEFGHIJKLMNŊOPRSŠTŦUVZŽ',
        # Sango
        'sg': 'ABDEFGHIKLMNOPRSTUVWYZÂÄÊËÎÏ',
        # Sinhala
        'si': 'කගටඩතදපබසහචජමනලරවයණළඟඬඳඹඅඇඉඋඑඔආඈඊඌඒඕ◌ැිුෙොාෑීූේෝ්ං',
        # Slovak
        'sk': 'AÁÄBCČDĎDEÉFGHIÍJKLĹĽMNŇOÓÔPQRŔSŠTŤUÚVWXYÝZŽ',
        # Slovene
        'sl': 'ABCČDEFGHIJKLMNOPRSŠTUVZŽ',
        # Samoan
        'sm': 'AĀEĒIĪOŌUŪFGLMNPSTVHKR‘',
        # Shona
        'sn': 'ABCDEFGHIJKMNOPRSTUVWYZ',
        # Somali
        'so': 'ABCDDEFGHIJKKLMNOQRSTUWXYʼ',
        # Albanian
        'sq': 'ABCÇDDEËFGHIJKLMNOPQRSTUVXYZ',
        # Serbian Cyrillic Script
        'sr': 'АБВГДЂЕЖЗИЈКЛЉМCНЊОПРСТЋУФХЦЧЏШ',
        # Serbian Latin Script
        'sr.latin': 'ABCČĆDĐEFGHIJKLMNOPRSŠTUVZŽ',
        # Swazi, siSwati
        'ss': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        # Sotho, Sesotho, Southern Sotho
        'st': 'ABDEFGHIJKLMNOPQRSTUWY',
        # Swedish
        'sv': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ',
        # Swahili Latin Script
        'sw': 'ABCDEFGHIJKLMNOPRSTUVWXYZ',
        # Swahili Arabic Script
        'sw.arabic': '\u0600\u0601\u0602\u0603\u0604\u0605؆؇؈؉؊؋،؍؎؏◌ؐ◌ؑ◌ؒ◌ؓ◌ؔ◌ؕ◌ؖ◌ؗ◌ؘ◌ؙ◌ؚ؛\u061c\u061d؟ؠءآأؤإئابةتثجحخدذرزسشصضطظعغػؼؽؾؿـفقكلمنهوىي◌ً◌ٌ◌ٍ◌َ◌ُ◌ِ◌ّ◌ْ◌ٓ◌ٔ◌ٕ◌ٖ◌ٗ◌٘◌ٙ◌ٚ◌ٛ◌ٜ◌ٝ◌ٞ◌ٟ٠١٢٣٤٥٦٧٨٩٪٫٬٭ٮٯ◌ٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙښڛڜڝڞڟڠڡڢڣڤڥڦڧڨکڪګڬڭڮگڰڱڲڳڴڵڶڷڸڹںڻڼڽھڿۀہۂۃۄۅۆۇۈۉۊۋیۍێۏېۑےۓ۔ە◌ۖ◌ۗ◌ۘ◌ۙ◌ۚ◌ۛ◌ۜ\u06dd۞◌۟◌۠◌ۡ◌ۢ◌ۣ◌ۤۥۦ◌ۧ◌ۨ۩◌۪◌۫◌۬◌ۭۮۯ۰۱۲۳۴۵۶۷۸۹ۺۻۼ۽۾ۿ',
        # Tamil
        'ta': 'ப௲௦ஐ்௬ஙஆஏஊலஂஒ௧உாஶறஷ௪ஸைணரடத௮ஓௐஃியஈ௭௺ௌஅன௯௵ே௩ூுோ௸எமௗ௰வகஔீள௨௹௱௳ஹெொ௫௶௷ஞஜசநஇழ௴',
        # Telugu
        'te': 'ఒరఉళపఅఋఢణఐధఫటఈథబనచఞఆలː్ాఇమఌఁూయశుతిఃెఔృ̥షగొౠేసఊౡఙఠఏౌకౢఓఛౣైజహభఘవఱీౄ∅డోఝదంఖఎ',
        # Tajik Cyrillic Script
        'tg': 'АБВГҒДЕЁЖЗИӢЙКҚЛМНОПРСТУӮФХҲЧҶШЪЭЮЯ',
        # Tajik Latin Script
        'tg.latin': 'ABCÇDEFGƢHIЪJKLMNOPQRSŞTUŪVXZƵ',
        # Tajik Persian Script
        'tg.persian': 'ذدخحچجثتپباغعظطضصشسژزریهونملگکفق',
        # Thai
        'th': 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮฯะๆ๏๐๑๒๓๔๕๖๗๘๙๚๛◌',
        # Tigrinya
        'ti': 'ሀሁሂሃሄህሆለሉሊላሌልሎሐሑሒሓሔሕሖመሙሚማሜምሞረሩሪራሬርሮሰሱሲሳሴስሶሸሹሺሻሼሽሾቀቁቂቃቄቅቆቈቊቋቌቍቐቑቒቓቔቕቖቘቚቛቜቝበቡቢባቤብቦቨቩቪቫቬቭቮተቱቲታቴትቶቸቹቺቻቼችቾነኑኒናኔንኖኘኙኚኛኜኝኞአኡኢኣኤእኦከኩኪካኬክኮኰኲኳኴኵኸኹኺኻኼኽኾዀዂዃዄዅወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዠዡዢዣዤዥዦየዩዪያዬይዮደዱዲዳዴድዶጀጁጂጃጄጅጆገጉጊጋጌግጎጐጒጓጔጕጠጡጢጣጤጥጦጨጩጪጫጬጭጮጰጱጲጳጴጵጶጸጹጺጻጼጽጾፀፁፂፃፄፅፆፈፉፊፋፌፍፎፐፑፒፓፔፕፖ',
        # Turkmen Latin Script
        'tk': 'ANBŇÇODÖEPÄRFSGŞHTIUJÜŽWKYLÝMZ',
        # Turkmen Cyrillic Script
        'tk.cyrillic': 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЧШЫҖҢҮӘӨ',
        # Tagalog
        'tl': 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
        # Tongan
        'to': 'AEFHIKLMNGOPSTUVʻ',
        # Turkish
        'tr': 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZQWX',
        # Tatar Cyrillic Script
        'tt': 'АӘБВГДЕЁЖҖЗИЙКЛМНҢОӨПРСТУҮФХҺЦЧШЩЪЫЬЭЮЯ',
        # Tatar Latin Script, Zamanälif, 2012
        'tt.latin2012': 'AÄBCÇDEFGĞHIİJKLMNÑOÖPQRSŞTUÜVWXYZ',
        # Tatar Latin Script 1928-1940
        'tt.latin1928': 'ABCÇDĐEƏFGƢHIJKLMNꞐOƟPQRSŞTѢUVXYZƵЬʼ',
        # Tatar Cyrillic Script by Nikolay Ilminsky, 1861
        'tt.cyrillic1861': 'АӒБВГДЕЁЖЗИІЙКЛМНҤОӦПРСТУӰФХЦЧШЩЪЫЬѢЭЮЯѲ',
        # Tatar Arabic Script
        'tt.arabic': '\u0600\u0601\u0602\u0603\u0604\u0605؆؇؈؉؊؋،؍؎؏◌ؐ◌ؑ◌ؒ◌ؓ◌ؔ◌ؕ◌ؖ◌ؗ◌ؘ◌ؙ◌ؚ؛\u061c\u061d؟ؠءآأؤإئابةتثجحخدذرزسشصضطظعغػؼؽؾؿـفقكلمنهوىي◌ً◌ٌ◌ٍ◌َ◌ُ◌ِ◌ّ◌ْ◌ٓ◌ٔ◌ٕ◌ٖ◌ٗ◌٘◌ٙ◌ٚ◌ٛ◌ٜ◌ٝ◌ٞ◌ٟ٠١٢٣٤٥٦٧٨٩٪٫٬٭ٮٯ◌ٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙښڛڜڝڞڟڠڡڢڣڤڥڦڧڨکڪګڬڭڮگڰڱڲڳڴڵڶڷڸڹںڻڼڽھڿۀہۂۃۄۅۆۇۈۉۊۋیۍێۏېۑےۓ۔ە◌ۖ◌ۗ◌ۘ◌ۙ◌ۚ◌ۛ◌ۜ\u06dd۞◌۟◌۠◌ۡ◌ۢ◌ۣ◌ۤۥۦ◌ۧ◌ۨ۩◌۪◌۫◌۬◌ۭۮۯ۰۱۲۳۴۵۶۷۸۹ۺۻۼ۽۾ۿ',
        # Twi
        'tw': 'ABCDEƐFGHIJKLMNOƆPRSTUVWXYZ',
        # Tahitian
        'ty': 'AEIOUFHMNPRTVĀĒĪŌŪ',
        # Uyghur Arabic Script
        'ug': '\u0600\u0601\u0602\u0603\u0604\u0605؆؇؈؉؊؋،؍؎؏◌ؐ◌ؑ◌ؒ◌ؓ◌ؔ◌ؕ◌ؖ◌ؗ◌ؘ◌ؙ◌ؚ؛\u061c\u061d؟ؠءآأؤإئابةتثجحخدذرزسشصضطظعغػؼؽؾؿـفقكلمنهوىي◌ً◌ٌ◌ٍ◌َ◌ُ◌ِ◌ّ◌ْ◌ٓ◌ٔ◌ٕ◌ٖ◌ٗ◌٘◌ٙ◌ٚ◌ٛ◌ٜ◌ٝ◌ٞ◌ٟ٠١٢٣٤٥٦٧٨٩٪٫٬٭ٮٯ◌ٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙښڛڜڝڞڟڠڡڢڣڤڥڦڧڨکڪګڬڭڮگڰڱڲڳڴڵڶڷڸڹںڻڼڽھڿۀہۂۃۄۅۆۇۈۉۊۋیۍێۏېۑےۓ۔ە◌ۖ◌ۗ◌ۘ◌ۙ◌ۚ◌ۛ◌ۜ\u06dd۞◌۟◌۠◌ۡ◌ۢ◌ۣ◌ۤۥۦ◌ۧ◌ۨ۩◌۪◌۫◌۬◌ۭۮۯ۰۱۲۳۴۵۶۷۸۹ۺۻۼ۽۾ۿ',
        # Uyghur Cyrillic Script
        'ug.cyrillic': 'АӘБВГҒДЕЖҖЗИЙКҚЛМНҢОӨПРСТУҮФХҺЧШЮЯ',
        # Uyghur Latin Script
        'ug.latin': 'ABCDEFGHIJKLMNOPQRSTUWXYZËÖÜ',
        # Uyghur New Latin Script, Uyghur Yëngi Yëziqi, Uyƣur Yengi Yeziⱪi
        'ug.new_latin': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÜƏƟƢⱧⱩⱫ',
        # Ukrainian
        'uk': 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ',
        # Urdu
        'ur': '\u0600\u0601\u0602\u0603\u0604\u0605؆؇؈؉؊؋،؍؎؏◌ؐ◌ؑ◌ؒ◌ؓ◌ؔ◌ؕ◌ؖ◌ؗ◌ؘ◌ؙ◌ؚ؛\u061c\u061d؟ؠءآأؤإئابةتثجحخدذرزسشصضطظعغػؼؽؾؿـفقكلمنهوىي◌ً◌ٌ◌ٍ◌َ◌ُ◌ِ◌ّ◌ْ◌ٓ◌ٔ◌ٕ◌ٖ◌ٗ◌٘◌ٙ◌ٚ◌ٛ◌ٜ◌ٝ◌ٞ◌ٟ٠١٢٣٤٥٦٧٨٩٪٫٬٭ٮٯ◌ٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙښڛڜڝڞڟڠڡڢڣڤڥڦڧڨکڪګڬڭڮگڰڱڲڳڴڵڶڷڸڹںڻڼڽھڿۀہۂۃۄۅۆۇۈۉۊۋیۍێۏېۑےۓ۔ە◌ۖ◌ۗ◌ۘ◌ۙ◌ۚ◌ۛ◌ۜ\u06dd۞◌۟◌۠◌ۡ◌ۢ◌ۣ◌ۤۥۦ◌ۧ◌ۨ۩◌۪◌۫◌۬◌ۭۮۯ۰۱۲۳۴۵۶۷۸۹ۺۻۼ۽۾ۿ',
        # Uzbek Latin Script
        'uz': 'ABCDEFGHIJKLMNOPQRSTUVXYZʻ',
        # Uzbek Cyrillic Script 1940
        'uz.cyrillic': 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЪЬЭЮЯЎҚҒҲ',
        # Uzbek Latin Script 1928-1940
        'uz.latin1928': 'ABCÇDEƏFGƢHIJKLMNꞐOӨPQRSŞTUVXYZƵЬ',
        # Uzbek Arabic Script
        'uz.arabic': '\u0600\u0601\u0602\u0603\u0604\u0605؆؇؈؉؊؋،؍؎؏◌ؐ◌ؑ◌ؒ◌ؓ◌ؔ◌ؕ◌ؖ◌ؗ◌ؘ◌ؙ◌ؚ؛\u061c\u061d؟ؠءآأؤإئابةتثجحخدذرزسشصضطظعغػؼؽؾؿـفقكلمنهوىي◌ً◌ٌ◌ٍ◌َ◌ُ◌ِ◌ّ◌ْ◌ٓ◌ٔ◌ٕ◌ٖ◌ٗ◌٘◌ٙ◌ٚ◌ٛ◌ٜ◌ٝ◌ٞ◌ٟ٠١٢٣٤٥٦٧٨٩٪٫٬٭ٮٯ◌ٰٱٲٳٴٵٶٷٸٹٺٻټٽپٿڀځڂڃڄڅچڇڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙښڛڜڝڞڟڠڡڢڣڤڥڦڧڨکڪګڬڭڮگڰڱڲڳڴڵڶڷڸڹںڻڼڽھڿۀہۂۃۄۅۆۇۈۉۊۋیۍێۏېۑےۓ۔ە◌ۖ◌ۗ◌ۘ◌ۙ◌ۚ◌ۛ◌ۜ\u06dd۞◌۟◌۠◌ۡ◌ۢ◌ۣ◌ۤۥۦ◌ۧ◌ۨ۩◌۪◌۫◌۬◌ۭۮۯ۰۱۲۳۴۵۶۷۸۹ۺۻۼ۽۾ۿ',
        # Venda
        've': 'ABCDḒEFGHIJKLḼMNṊṄOPQRSTṰUVWXYZ',
        # Vietnamese
        'vi': 'AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXYFJWZAÁẠÀẢÃĂẮẶẰẲẴÂẤẬẦẨẪEÉẸÈẺẼÊẾỆỀỂỄIÍỊÌỈĨOÓỌÒỎÕÔỐỘỒỔỖƠỚỢỜỞỠUÚỤÙỦŨƯỨỰỪỬỮYÝỴỲỶỸĐ',
        # Volapük
        'vo': 'AÄꞚBCDEFGHIJKLMNOÖꞜPRSTUÜꞞVXYZ',
        # Walloon
        'wa': 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÂÅÇÈÉÊËÌÎÔÖÙÛ̊',
        # Wolof
        'wo': 'ABCDEFGIJKLMNOPQRSTUWXYÀÃÉËÑÓŊ',
        # Yiddish
        'yi': 'ְֱֲֳִֵֶַָֹֺֻּֽ֑֖֛֢֣֤֥֦֧֪֚֭֮֒֔֕֗֘֙֜֝֞֟֠֡֨֩֫֬֯־ֿ׀ׁׂ׃ׅׄ׆ׇאבגדהוזחטיךכלםמןנסעףפץצקרשתׯװױײ׳״יִﬞײַﬠﬡﬢﬣﬤﬥﬦﬧﬨ﬩שׁשׂשּׁשּׂאַאָאּבּגּדּהּוּזּטּיּךּכּלּמּנּסּףּפּצּקּרּשּתּוֹבֿכֿפֿﭏיִﬞײַﬠﬡﬢﬣﬤﬥﬦﬧﬨ﬩שׁשׂשּׁשּׂאַאָאּבּגּדּהּוּזּטּיּךּכּלּמּנּסּףּפּצּקּרּשּתּוֹבֿכֿפֿﭏ',
        # Yoruba, Nigeria and Benin Scripts
        'yo': 'ABDEFGHIJKLMNOPRSTUWYÀÁÈÉÌÍÒÓÙÚĀĒĪŃŌŪƆƐǸ̀́̄ḾṢẸỌ',
        # Zulu
        'zu': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }

    if all_scripts:
        result = dict()
        for key, value in alphabets.items():
            if key == lang or key.startswith(f'{lang}.'):
                result[key] = set(value)
        return result
    else:
        return set(alphabets[lang])

def get_text_alphabet (text=None, file=None):
    """Get all the symbols of the text.

    str `text` - text from which to obtain symbols;
    str `file` - if `text` is not specified the function tries to get
        text from the `file` path;
    return set - set of all the symbols of the text.
    """
    space_characters = set(' \n')
    if text != None:
        return set(text.upper()) - space_characters
    if file != None:
        file = open(file, 'r', encoding='utf-8')
        text = file.read().upper()
        file.close()
        return set(text) - space_characters
    return False