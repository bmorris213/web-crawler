import { test, expect, describe } from "@jest/globals";
import { normalizeURL, getURLsFromHTML } from "./crawl.js";

describe('testing normalizeURL function edge cases', () => {

    let resultUrl = 'google.com';
    let testUrl = 'https://google.com/';

    test('test default value', () => {
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('remove trailing slash for google.com', () => {
        testUrl = 'https://google.com';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('change protocol for google.com', () => {
        testUrl = 'http://google.com/';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('ensure case insensitivity in domain name', () => {
        testUrl = 'https://Google.com/';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
        testUrl = 'https://GOOGLE.com/';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('test default subdomain of www', () => {
        testUrl = 'https://www.google.com/';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('test default landing file name', () => {
        testUrl = 'https://www.google.com/index.html';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('test default port values for different protocols', () => {
        testUrl = 'https://google.com:443/';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
        testUrl = 'http://google.com:80/';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('verify non-default port values are kept', () => {
        resultUrl = 'google.com:443';
        testUrl = 'http://google.com:443/';
        expect(normalizeURL(testUrl)).toBe(resultUrl);

        resultUrl = 'google.com:80';
        testUrl = 'https://google.com:80/';
        expect(normalizeURL(testUrl)).toBe(resultUrl);

        resultUrl = 'google.com:400';
        testUrl = 'https://google.com:400/';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('changing order of query parameters', () => {
        resultUrl = 'google.com/search?client=firefox&q=cats';
        testUrl = 'https://google.com/search?q=cats&client=firefox';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('test encoding spaces', () => {
        resultUrl = 'google.com/test%20space';
        testUrl = 'https://google.com/test space';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('test encoding invalid characters', () => {
        resultUrl = 'google.com/test%40atsign';
        testUrl = 'https://google.com/test@atsign';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('test double encoding issues', () => {
        resultUrl = 'google.com/foo%20bar';
        testUrl = 'https://google.com/foo%2520bar';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('test already encoded strings', () => {
        resultUrl = 'google.com/foo%20bar';
        testUrl = 'https://google.com/foo%20bar';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });

    test('test fragment identifiers are stripped', () => {
        resultUrl = 'google.com/page';
        testUrl = 'https://google.com/page#section';
        expect(normalizeURL(testUrl)).toBe(resultUrl);
    });
});

describe('testing getURLsFromHTML function edge cases', () => {
    const testBase = 'https://example.com';
    let testHTML = '<html>\n\t<body>\n\t\t';
    testHTML += '<h1>TITLE of the HTML test doc</h1>\n\t\t';
    testHTML += '<p>This is an example text paragraph...</p>\n\t\t';
    testHTML += '<ol>\n\t\t\t<li><a href=\"https://example.com/path\"><span>Go to Home</span></a></li>\n\t\t\t';
    testHTML += '<li><a href=\"/shop\"><span>Go to Shop</span></a></li>\n\t\t\t';
    testHTML += '<li><a href=\"/path/blank\"><span>Go to Blank</span></a></li>\n\t\t\t';
    testHTML += '<li><a href=\"/shop?source=blank\"><span>Go to Shop from Blank</span></a></li>\n\t\t\t';
    testHTML += '<li><a href=\"https://google.com/\"><span>Go to Google</span></a></li>';
    testHTML += '\n\t\t</ol>\n\t</body>\n</html>';

    const urlList = [
        'https://example.com/path',
        'https://example.com/shop',
        'https://example.com/path/blank',
        'https://example.com/shop?source=blank',
        'https://google.com/'
    ];

    test('asserting extraction works', () => {
        expect(getURLsFromHTML(testHTML, testBase)).toStrictEqual(urlList);
    });
});