const axios = require('axios');
const cheerio = require('cheerio-without-node-native');

/**
 * Extracts lyrics from a Genius URL.
 * @param {string} url - Genius URL
 * @returns {Promise<string|null>} The lyrics as a string or null if not found.
 */
module.exports = async function(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let lyrics = $('div[class="lyrics"]').text().trim();
        if (!lyrics) {
            lyrics = '';
            $('div[class^="Lyrics__Container"]').each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.length > 0) {
                    let snippet = $(elem).html()
                        .replace(/<br\s*\/?>/gi, '\n')
                        .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');
                    lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
                }
            });
        }
        if (!lyrics.trim()) return null;

        return lyrics.trim();
    } catch (error) {
        console.error('Error extracting lyrics:', error);
        throw error;
    }
};
