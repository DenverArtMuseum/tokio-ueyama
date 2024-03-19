const yaml = require('js-yaml');
const fs = require('node:fs');

const yaml_filename = 'content/_data/objects.yaml';

// fs.readFile(yaml_filename, 'utf8', (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log(data);
// });

try {
    yaml.loadAll( fs.readFileSync(yaml_filename, 'utf8'), function (doc) {   
    
        //doc.object_list.sort(compareByEntryNumber);
        //doc.object_list.sort(compareByArtistAndTitle);
        // console.log(doc.object_list);
        // return;
        

        var order = 101
        doc.object_list.forEach(async (object) => {
            // console.log(object.id+': '+object.title);
            // return

            var md_file = 'content/works/'+object.id+'.md';

            if (fs.existsSync(md_file)) {
                markdown_lines = fs.readFileSync(md_file, 'utf8').split('\n')
                var yaml_content = ''
                var other_content = ''
                let capture_yaml = false
                markdown_lines.forEach(async (line) => {
                    if( line == '---' ) {
                        if( !capture_yaml ) {
                            capture_yaml = true
                        } else {
                            capture_yaml = false
                        }
                        return
                    }

                    if( capture_yaml ) {
                        yaml_content += line+"\n"
                    } else {
                        other_content += line+"\n"
                    }
                });
                //console.log(yaml_content)
                //console.log(other_content)

                yaml.loadAll(yaml_content, function( md_doc ) {
                    if( md_doc !== null && md_doc.order ) {
                        md_doc.order = order

                        if( !md_doc.title ) md_doc.title = object.title
                        md_doc.object = [ { "id" : object.id } ]
                        
                        //md_doc.short_title = " "
                        // delete md_doc.artist
                        // delete md_doc.short_title


                        var content = '---\n';
                        content += yaml.dump(md_doc, {
                            // 'styles': {
                            //   '!!null': 'canonical' // dump null as ~
                            // },
                            'sortKeys': sortOrder
                        })
                        content += '---\n';
                        content += other_content;
                        //console.log(content)

                        try {
                            fs.writeFileSync(md_file, content);
                        } catch (err) {
                            console.error(err);
                        }
                        console.log( md_doc.order+' '+md_doc.title )
                    }
                });
            } else {     
                
                var md_doc = {}
                md_doc.title = object.title
                md_doc.layout = 'entry'
                md_doc.presentation = 'side-by-side'
                md_doc.object = [ { "id" : object.id } ]
                md_doc.menu = false
                md_doc.order = order

                var content = '---\n';
                content += yaml.dump(md_doc, {
                    // 'styles': {
                    //   '!!null': 'canonical' // dump null as ~
                    // },
                    'sortKeys': sortOrder
                })
                content += '---\n';

                try {
                    fs.writeFileSync(md_file, content);
                } catch (err) {
                    console.error(err);
                }
                console.log( md_doc.order+' '+md_doc.title )

            }

            order++

        });

    });

} catch (e) {
    console.log(e);
}   

/** ************************* FUNCTIONS **************************************/

/**
 * A compare function that compares by artist and then by title 
 */
function compareByArtistAndTitle(a, b) {
    if( a.artist === null ) return 1;
    if( b.artist === null ) return -1;

    let a_last = get_alphabetical_artist_name( a.artist );
    let b_last = get_alphabetical_artist_name( b.artist );

    let artistDiff = a_last.localeCompare(b_last);
    //console.log(artistDiff)

    // If the artists are equal, compare by title
    if (artistDiff === 0) {
        if( a.title === null ) return 1;
        if( b.title === null ) return -1;

        return a.title.localeCompare(b.title)
    }
    
    return artistDiff;
}

/**
 * Compare by object title
 * 
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
function compareByTitle(a, b) {
    return a.title.localeCompare(b.title)
}

/**
 * Compare by object entry_number
 * 
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
function compareByEntryNumber(a, b) {
    return a.entry_number.localeCompare(b.entry_number)
}

/**
 * Get the alphabetical portion of the name for sorting
 */
function get_alphabetical_artist_name( artist ) {
    let artist_sorting = {
        'Aranda&#92;Lasch and Terrol Dew Johnson': 'Aranda',
        'Andreea Avram Rusu': 'Avram',
        'Fredrikson Stallard': 'Fredrikson',
        'Iris van Herpen': 'van Herpen',
        'J. Mayer H.': 'J. Mayer H.',
        'MAD Architects': 'MAD Architects', 
        'Front Design': 'Front Design', 
        'Studio Gang': 'Studio Gang', 
        'gt2P (great things to People)': 'gt2P (great things to People)', 
        'Nervous System': 'Nervous System',
    };

    if( Object.keys(artist_sorting).includes(artist) ) {
        var artist_last = artist_sorting[artist];
    } else {
        var artist_last = artist.split(/[, ]+/).pop();
    }

    return artist_last;
}

/**
 * Sort according to fixed order
 */
function sortOrder( a, b ) {
    fixed_order = [ 'title', 'short_title', 'layout', 'presentation', 'object', 'order', 'menu' ]
    return fixed_order.indexOf(a) - fixed_order.indexOf(b);
}