function normalizeURL(urlString) {
    try {
        //step 1: break up url string into component objects
        const parsedURL = new URL(urlString);

        //step 2: remove empty pathnames
        if (parsedURL.pathname === '/') {
            parsedURL.pathname = '';
        }

        //step 2.5: remove trailing / from domain
        if (parsedURL.hostname.slice(-1) === '/') {
            parsedURL.hostname = parsedURL.hostname.slice(0, -1);
        }

        //step 3: remove default ports
        if (parsedURL.protocol === 'http:') {
            if (parsedURL.port === '80') {
                parsedURL.port = '';
            }
        }
        else if (parsedURL.protocol === 'https:') {
            if (parsedURL.port === '443') {
                parsedURL.port = '';
            }
        }

        //step 4: remove default path file object
        if (parsedURL.pathname === '/index.html') {
            parsedURL.pathname = '';
        }

        //step 5: remove default 'www' subdomain
        if (parsedURL.hostname.substring(0, 4) === 'www.') {
            parsedURL.hostname = parsedURL.hostname.substring(4);
        }

        //step 6: sort query parameters alphabetically
        const searchParams = new URLSearchParams(parsedURL.search);

        // Convert the search parameters to an array and sort them
        const sortedParams = [...searchParams.entries()].sort(([key1], [key2]) => {
            return key1.localeCompare(key2);
        });

        //Create new search parameter object
        const newSearchParams = new URLSearchParams();
        sortedParams.forEach(([key, value]) => {
            newSearchParams.append(key, value);
        });

        // Set the sorted search params back to the URL object
        parsedURL.search = newSearchParams.toString();

        //step 7: decode each component to remove existing encodings
        parsedURL.pathname = decodeURIComponent(parsedURL.pathname);
        parsedURL.search = decodeURIComponent(parsedURL.search);

        //step 8: re-encode almost everything in pathname and search
        parsedURL.pathname = encodeURIComponent(parsedURL.pathname);
        parsedURL.search = encodeURIComponent(parsedURL.search);

        //step 9: return decoding of needed search parameters
        parsedURL.search = parsedURL.search.replace(/%25/g, '%').replace(/%3F/g, '?').replace(/%3D/g, '=').replace(/%26/g, '&').replace(/%2F/g, '');
        
        parsedURL.pathname = parsedURL.pathname.replace(/%25/g, '%').replace(/%2F/g, '');

        //step 10: fix parsing of empty strings
        let parsedPort = ''
        if (parsedURL.port !== '') {
            parsedPort = `:${parsedURL.port}`;
        }

        let parsedPath = ''
        if (parsedURL.pathname !== '/') {
            parsedPath = parsedURL.pathname;
        }

        //step 10.5: fix duplicate ? results
        let parsedSearch = ''
        if (parsedURL.search !== '') {
            parsedSearch = `?${parsedURL.search.replace(/\?/g, '')}`
        }

        //step 11: reencode url string
        const normalizedURL = `${parsedURL.hostname}${parsedPort}${parsedPath}${parsedSearch}`;

        return normalizedURL;
    } catch (err) {
        throw new Error('Invalid URL');
    }
}

function getURLsFromHTML(htmlBody, baseURL) {
    //retrieve every link-pattern using href
    const links = [];
    const regex = /href="([^"]*)"/g;
    let match;

    //retrieve each match from the first result of capture body
    while ((match = regex.exec(htmlBody)) !== null) {
        //resolve relative links
        const matchLink = match[1];
        if (matchLink[0] === '/') {
            let newMatchLink = '';
            if (matchLink.length !== 1) {
                newMatchLink = matchLink.slice(1);
            }
            links.push(`${baseURL}${newMatchLink}`);
        } else {
            links.push(matchLink);
        }
    }

    return links
}

async function crawl(baseURL) {
    //assume default protocol of https
    const protocol = 'https://'
    if (!baseURL.includes('://')) {
        baseURL = `${protocol}${baseURL}`
    }

    //assume default route of .com
    const route = '.com'
    if (!baseURL.includes('.')) {
        baseURL = `${baseURL}${route}`
    }

    //validate argument is a url
    try {
        const urlObj = new URL(baseURL);
    } catch (err) {
        console.log(`${baseURL} is not a valid url`);
        return 1;
    }

    //inform user crawl is beginning
    console.log(`Beginning crawl of page ${normalizeURL(baseURL)}...`);
    
    //run recursive crawl function, returnning results
    return await crawlPage(baseURL);
}

async function crawlPage(baseURL, currentURL = baseURL, pages = {}) {
    //check to see if we've left the domain
    if (!currentURL.startsWith(baseURL)) {
        return pages; //we don't need to crawl
    }

    //add to count, or create new count
    const currentName = normalizeURL(currentURL);
    if (currentName in pages) {
        pages[currentName]++;
        return pages; //we've been here before
    }
    
    pages[currentName] = 1;

    //ensure successful recursion through current page
    try {
        //extract an html body from currentURL
        const document = await getHTMLDocument(currentURL);
        
        //if url contains no html body, return pages
        if (document === 1) {
            return pages;
        }

        //get array of new links
        const links = getURLsFromHTML(document, baseURL);

        //recurse through all links
        for (const link of links) {
            await crawlPage(baseURL, link, pages);
        }

        //return result
        return pages;
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function getHTMLDocument(url) {
    try{
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP status not okay. Staus: ${response.status}`);
        }

        // Check if the response is in HTML format
        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('text/html')) {
            throw new Error(`Expected HTML content, but received: ${contentType}`);
        }
        
        //return html body
        return response.text();
    } catch (err) {
        return 1;
    }
}

export { normalizeURL, getURLsFromHTML, crawl };