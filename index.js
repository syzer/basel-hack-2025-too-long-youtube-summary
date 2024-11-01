import { getSubtitles } from 'youtube-captions-scraper';
import {join, tap, pipe as _, pluck, take, prop, replace} from 'ramda';

import {$} from 'execa';
import {execa} from "execa";
// const {stdout: name} = await $`cat package.json`.pipe`grep name`;
// console.log(name);



// const url = `https://www.youtube.com/watch?v=q6m1T0aZDn4`
// const url = `https://www.youtube.com/watch?v=rzXwUp2_Kt8`
// const url = `https://www.youtube.com/watch?v=rwNYzKwBc2o` // the russian one

// const url = `https://www.youtube.com/watch?v=NvDew6Eg7Zg` // index funds
// const url = `https://www.youtube.com/watch?v=0TypP8H-75A` // totenham vs spurrs
const url = `https://www.youtube.com/watch?v=Y9svAEH_y0k` // lenovo tablet
// const url = `https://www.youtube.com/watch?v=HFfXvfFe9F8`
const urlToId = url => url.split('v=')[1].substring(0, 11);

// getSubtitles({
//   videoID: 'q6m1T0aZDn4', // youtube video id
//   lang: 'fr' // default: `en`
// }).then(captions => {
//   console.log(captions);
// });
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

// const subprocess = execa("sleep", ["5s"]);

// .stdout.pipe(process.stdout);
// const subprocess = execa("/usr/local/bin/ollama", "run hacker shorten this to max two sentences: hello world".split(' '));
// const subprocess = execa("/usr/local/bin/ollama", "run hacker \"Summarize this file: $(cat package.json)\"".split(' ')).stdout.pipe(process.stdout);
// setTimeout(() => {
//   subprocess.cancel();
// }, 3000);