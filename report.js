function printReport(countDictionary) {
    //find total of internal links
    let total = 0;
    for (const link in countDictionary) {
        total += countDictionary[link];
    }
    console.log(`Found total of ${total} internal links.`);
    console.log('===================');

    //sort link counts into group of groups
    const printGroup = sortCountDict(countDictionary);
    
    for (const group of printGroup) {
        const plural = group.count === 1 ? '' : 's';

        console.log(`All links with ${group.count} inbound reference${plural}:`);
        for (const link of group.links) {
            console.log(link);
        }
        console.log('------------------------');
    }
}

function sortCountDict(countDictionary) {
    // Initialize an empty array to hold the groups
    const printGroup = [];

    // Iterate through each entry in the countDictionary
    for (const link in countDictionary) {
        if (countDictionary.hasOwnProperty(link)) {
            const count = countDictionary[link];

            // Find the group with the current count
            let group = printGroup.find(g => g.count === count);

            // If the group does not exist, create it
            if (!group) {
                group = { count: count, links: [] };
                printGroup.push(group);
            }

            // Add the current link to the group's links array
            group.links.push(link);
        }
    }

    // Sort every group's array
    for (const group of printGroup) {
        group.links = sortArray(group.links);
    }

    printGroup.sort((a, b) => b.count - a.count);

    return printGroup;
}

function sortArray(linkArray) {
    // determine link's base
    function getBase(link) {
        const URLParts = link.split('/');
        return URLParts[0];
    }

    // Group links by their base URL
    const groupedLinks = linkArray.reduce((groups, link) => {
        const baseUrl = getBase(link);
        if (!groups[baseUrl]) {
            groups[baseUrl] = [];
        }
        groups[baseUrl].push(link);
        return groups;
    }, {});

    // Sort each group by link length
    for (const baseUrl in groupedLinks) {
        groupedLinks[baseUrl].sort((a, b) => a.length - b.length);
    }
    
    // Create an array of groups, sorted by base URL
    const sortedGroups = Object.keys(groupedLinks).sort().map(baseUrl => groupedLinks[baseUrl]);

    // return the sorted groups as a single array
    return sortedGroups.flat();
}

export { printReport };