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
    //relative paths start with '/'
    const links = []
    for (const line of htmlBody.split('\n')) {
        if (line.includes('<a')) {
            let regLine = line.match(/href=\"(.*)\">/g).pop()
            regLine = regLine.replace(/href=\"/g, '').replace(/\">/g, '')
            links.push(regLine)
        }
    }

    //make all relative links into absolute links
    const cleanLinks = []
    for (let link of links) {
        if (link[0] === '/') {
            cleanLinks.push(`${baseURL}${link}`);
        }
        else {
            cleanLinks.push(link)
        }
    }

    return cleanLinks
}

export { normalizeURL, getURLsFromHTML };