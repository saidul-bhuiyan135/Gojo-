module.exports = {
  config: {
    name: "bing",
    version: "1.0.0",
    permission: 0,
    credits: "saidul",
    description: "",
    prefix: 'awto',
    category: "auto prefix",
    usages: "bing prompt",
    cooldowns: 10,
},

   languages: {
   "vi": {},
       "en": {
           "missing": 'use : /bing cat'
       }
   },

start: async function({ nayan, events, args, lang}) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const request = require("request");
    const prompt = args.join(" ");
    const key = this.config.credits;
    const apis = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN/Nayan/main/api.json')
  const n = apis.data.bing
    if(!prompt) return nayan.reply(lang('missing'), events.threadID, events.messageID)

  const rndm = ['1JNu65j7za2GPjNYQHDHx2NpdfeYxT24_SRCbplFt7wyLtsoh6ZsJ2wWVymYWIdtiaRuneI3uMfFJSjFRw484PiN8lbEyMAnsZmeBl_Tv4efNIsDFORWhA_W6xkElwNNdIvptuQLLLmC_sLcnibXws20RFBjpLD-Q-oJ_otxc-D9k28zcQz9cwOnIxpPLSJ-KttoQxWTN8G__X1P7HcvoRg'] // input your cookie hare

  var cookie = rndm[Math.floor(Math.random() * rndm.length)];


    const res = await axios.get(`${n}/bing-img?key=${key}&cookie=${cookie}&prompt=${encodeURIComponent(prompt)}`);


  console.log(res.data)
    const data = res.data.result;
  const numberSearch = data.length
    var num = 0;
    var imgData = [];
    for (var i = 0; i < parseInt(numberSearch); i++) {
      let path = __dirname + `/cache/${num+=1}.jpg`;
      let getDown = (await axios.get(`${data[i]}`, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(path, Buffer.from(getDown, 'utf-8'));
      imgData.push(fs.createReadStream(__dirname + `/cache/${num}.jpg`));
    }


    nayan.reply({
        attachment: imgData,
        body: "🔍Bing Search Result🔍\n\n📝Prompt: " + prompt + "\n\n#️⃣Number of Images: " + numberSearch
    }, events.threadID, events.messageID)
    for (let ii = 1; ii < parseInt(numberSearch); ii++) {
        fs.unlinkSync(__dirname + `/cache/${ii}.jpg`)
    }
}
}
