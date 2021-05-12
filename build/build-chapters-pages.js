const fs = require('fs');
const utils = require('./utils');
const components = require('./components');
const config = require('../config');
const Database = require('../database/database');
const VersesTable = require('../database/verses');

(async function() { 
    console.log('Building chapters...');
    const start = new Date().getTime();

    const chapters = require('../output/read/chapters.json');
    const db = new Database(config.databaseLocation);
    const versesTable = new VersesTable(db);
        

    for(chapter of chapters){      

        let html = '<!DOCTYPE HTML>';
        html += '<html lang="en" class="no-js">';
        html += '<head>';
        html +=     '<meta charset="UTF-8">';
        html +=     `<title>${chapter.name} ${chapter.number}</title>`;
        html +=     '<meta name="viewport" content="width=device-width">';
        html +=     `<meta name="description" content="${chapter.name} Chapter ${chapter.number}">`;
        html +=     '<link rel="stylesheet" href="../../assets/css/styles.css">';
        html +=     '<link rel="stylesheet" href="../../assets/css/print.css" media="print">';
        html +=     '<meta name="theme-color" content="#FFFFFF"></meta>';        
        html += '</head>';
        html += '<body>';
        html +=     '<div id="navigation">';
        html +=         '<div>';
        html +=             '<div class="search">';
        html +=                 '<div class="input">';
        html +=                     '<div class="icon">';
        html +=                         components.SearchIcon;
        html +=                     '</div>';
        html +=                  '<autocomplete></autocomplete>';
        html +=                 '</div>';
        html +=             '</div>';
        html +=             `<chapter-slideout book="${chapter.name}"></chapter-slideout>`;
        html +=         '</div>';
        html +=     '</div>';
        html +=     '<div id="content">';
        html +=         `<h2>${chapter.name} ${chapter.number}</h2>`
        html +=         '<p>';
        
        const verses = await versesTable.getAll(chapter.name, chapter.number);

        for(verse of verses){
            html +=     `<span id="${verse.slug}-${verse.chapter}-${verse.verse}">${verse.text}&nbsp;</span>`;
        }

        html +=         '</p>';

        if(chapter.previous){
            html +=     `<a class="prev" href="../${utils.addPlusSignToNormalLink(chapter.previous)}/">${components.LeftArrow}</a>`;
        }
        if(chapter.next){
            html +=     `<a class="next" href="../${utils.addPlusSignToNormalLink(chapter.next)}/">${components.RightArrow}</a>` 
        }
        html +=     '</div>'

        html += components.AutoComplete;    
        html += components.AutoCompleteResults;
        html += components.ChapterDrawer;

        html += '<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.12/vue.js"></script>';
        html += '<script src="https://cdnjs.cloudflare.com/ajax/libs/vuex/2.0.0/vuex.js"></script>';
        html += '<script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>';
        html += '<script src="../../assets/js/scripts.js"></script>'
        html += '</body>'
        html += '</html>';
        
        const folder = `./output/read/${chapter.link}`;
        const file = `${folder}/index.html`;

        fs.mkdirSync(folder, {recursive: true});
        fs.writeFileSync(file, html);
            
    }

    const end = new Date().getTime();
    const time = end - start;

    console.log(`Build took ${time}ms`);
})();
