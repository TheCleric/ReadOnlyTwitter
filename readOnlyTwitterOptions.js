const defaultOptions = {
    disableComments: true,
    disableLikes: true,
    disableRetweets: true,
    disableRetweetsWithComments: true,
    disableTweets: true,
    disableDirectMessages: true,

    disableOnTweetDeck: true
};

const addSwitchOption = (id, value, label, callback) => {
    var template = document.getElementById('switch-options-template').innerHTML;
    var rendered = Mustache.render(template, { id, value, label, checked: value ? 'checked' : '' });

    const soNode = document.createElement("div");
    soNode.innerHTML = rendered;
    document.getElementById("options").appendChild(soNode);

    document.getElementById(id).addEventListener('change', callback);
}

const updateOption = (option, value) => {
    chrome.storage.local.get(['options'], (result) => {
        let options = defaultOptions;

        if (result.options) {
            options = result.options;
        }

        options[option] = value;
        chrome.storage.local.set({ options }, (result) => { });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(['options'], (result) => {
        let options = defaultOptions;

        if (result.options) {
            options = result.options;
        }

        addSwitchOption("disable-comments", options.disableComments, "Disable Comments", (evt) => { updateOption('disableComments', evt.target.checked); });
        addSwitchOption("disable-likes", options.disableLikes, "Disable Likes", (evt) => { updateOption('disableLikes', evt.target.checked); });
        addSwitchOption("disable-retweets", options.disableRetweets, "Disable Retweets", (evt) => { updateOption('disableRetweets', evt.target.checked); });
        addSwitchOption("disable-retweets-with-comments", options.disableRetweetsWithComments, "Disable Retweets With Comments", (evt) => { updateOption('disableRetweetsWithComments', evt.target.checked); });
        addSwitchOption("disable-tweets", options.disableTweets, "Disable Tweets", (evt) => { updateOption('disableTweets', evt.target.checked); });
        addSwitchOption("disable-dms", options.disableDirectMessages, "Disable Direct Messages", (evt) => { updateOption('disableDirectMessages', evt.target.checked); });

        addSwitchOption("disable-on-tweetdeck", options.disableOnTweetDeck, "Disable on Tweetdeck", (evt) => { updateOption('disableOnTweetDeck', evt.target.checked); });

        Array.from(document.querySelector('.mdc-switch') || []).forEach(sw => {
            new mdc.switchControl.MDCSwitch(sw);
        });
    });
});
