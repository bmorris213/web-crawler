import { argv } from 'process';

import { crawl } from './crawl.js';
import { printReport } from './report.js';

function main() {
    const userCommands = []

    argv.forEach((val, index) => {
        if (index > 1) {
            userCommands.push(val);
        }
    });

    if (userCommands.length != 1) {
        if (userCommands.length > 1) {
            console.log('Too many commands used...');
        }
        else {
            console.log('Not enough arguments given...');
        }

        console.log('Usage is \"npm start [baseURL]\".');
        return 1;
    }

    const baseURL = userCommands[0];
    
    //invoke and await crawl's completion
    (async () => {
        //gather report
        const pageCountResult = await crawl(baseURL);
        
        //print report
        printReport(pageCountResult);
    })();
}

main();