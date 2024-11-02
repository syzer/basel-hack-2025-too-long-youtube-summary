#!/usr/bin/env node

import { getSubtitles } from 'youtube-captions-scraper';
import {join, tap, pipe as _, pluck, take, prop, replace} from 'ramda';
import {execa} from "execa";
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

let argv = null
yargs(hideBin(process.argv))
      .command('shorten <url...>', 'shorten youtube video urls', (yargs) =>
    yargs.positional('url', {
      describe: 'a url of youtube video'
    }), (urls) => {
      // console.info(urls)
      argv = urls
    })
    .strictCommands()
    .demandCommand(1)
    .parse()
// const url = `https://www.youtube.com/watch?v=q6m1T0aZDn4` // This text appears to be a rant from a developer who is frustrated with the state of development tools, particularly GitHub.
// const url = `https://www.youtube.com/watch?v=rzXwUp2_Kt8` // This is not a tutorial or an instructional video, but rather a conversation between two individuals discussing their career experiences and advice for others.
// const url = `https://www.youtube.com/watch?v=rwNYzKwBc2o` // the russian one

// const url = `https://www.youtube.com/watch?v=NvDew6Eg7Zg` // index funds: Dude, I don't know about investing in Europe, but I do know that both index funds and ETFs are like, super similar. You can refactor the code to use a more efficient data structure, like an array or object, instead of a bunch of nested functions. Like, if you're using an index fund, you could just use a simple loop to iterate over the investments, instead of having a whole function for it.
// const url = `https://www.youtube.com/watch?v=0TypP8H-75A` // totenham vs spurrs
// const url = `https://www.youtube.com/watch?v=Y9svAEH_y0k` // lenovo tablet
// const url = `https://www.youtube.com/watch?v=ZRJo3R3ANsw` // totalwar review
// const url = `https://www.youtube.com/watch?v=HFfXvfFe9F8` // End To End Youtube Video Transcribe Summarizer LLM App With Google Gemini Pro

let url = argv.url[0]
const urlToId = url => url.split('v=')[1].substring(0, 11);

const getCaptions = async (url, lang = 'en') => {
  const videoID = urlToId(url);
  return getSubtitles({ videoID, lang });
}

getCaptions(url)
    .then(_(pluck('text'), join(' ')))
    // .then(tap(console.log))
    .then(replace(/"|'|`|\n/g, ''))
    .then(e => execa({shell: true})(`curl -q -XPOST http://localhost:11434/api/generate -d '{"model": "hacker", "prompt": "shorten to max three sentences: ${e}", "stream": false }'`))
    .then(_(prop('stdout'), JSON.parse, prop('response')))
    .then(tap(console.log))
    .then(e => console.log('============'))
    .catch(console.error);
