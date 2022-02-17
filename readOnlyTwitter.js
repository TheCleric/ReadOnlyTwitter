const makeReadOnly = (options) => {
    showHideNodesQuery(options.disableTweets, '[data-testid="SideNav_NewTweet_Button"', true);
    showHideNodesQuery(options.disableComments, '[aria-label*="Compose a reply"]', true);
    showHideNodesQuery(options.disableDirectMessages, '[data-testid="AppTabBar_DirectMessage_Link"');
    showHideNodesQuery(options.disableDirectMessages, '[data-testid="DMDrawer"]');
    showHideNodesQuery(options.disableRetweetsWithComments, '[href="/compose/tweet"][role="menuitem"]', false);

    const tweetButtonInline = document.querySelectorAll('[data-testid="tweetButtonInline"');
    if (tweetButtonInline && tweetButtonInline.length > 0) {
        const rootParent = tweetButtonInline[0].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        showHideNodes(options.disableTweets, [rootParent]);
    }

    const shareViaDM = document.evaluate('//span[text()="Send via Direct Message"]', document).iterateNext();
    if (shareViaDM) {
        showHideNodes(options.disableDirectMessages, [shareViaDM.parentNode.parentNode.parentNode]);
    }

    enableDisableTwitterButton(options.disableComments, '[data-testid="reply"]');
    enableDisableTwitterButton(options.disableRetweets, '[data-testid="retweet"]');
    enableDisableTwitterButton(options.disableLikes, '[data-testid="like"]');

    enableDisableTwitterButton(options.disableOnTweetDeck, 'li.tweet-action-item, li.tweet-detail-action-item');
};

const enableDisableTwitterButton = (disable, domQuery) => {
    if (disable) {
        disableTwitterButton(domQuery);
    } else {
        enableTwitterButton(domQuery);
    }
}

const disableTwitterButton = (domQuery) => {
    const buttons = document.querySelectorAll(domQuery);
    buttons && Array.from(buttons).forEach(button => {
        if (!button.classList.contains('cloned') && !button.classList.contains('clone')) {
            const cloned = button.cloneNode(true);
            cloned.removeAttribute('href');
            cloned.setAttribute('ignore', 'true');
            if (cloned.childElementCount > 0) {
                deepStyle(cloned.children[0], 'color', '#555555');
                deepStyle(cloned.children[0], 'pointer-events', 'none');
            }
            cloned.classList.add(['clone']);
            button.classList.add(['cloned']);
            button.setAttribute('ignore', 'true');
            showHideNodes(true, [button]);
            button.parentNode.appendChild(cloned);
        }
    });
};

const enableTwitterButton = (domQuery) => {
    const buttons = document.querySelectorAll(domQuery);
    buttons && Array.from(buttons).forEach(button => {
        if (button.classList.contains('clone')) {
            button.remove();
        } else if (button.style.display === "none") {
            button.classList.remove('cloned');
            showHideNodes(false, [button]);
        }
    });
}

const deepStyle = (node, property, value) => {
    node.style.setProperty(property, value);
    if (node.childElementCount > 0) {
        Array.from(node.children).forEach(child => {
            deepStyle(child, property, value);
        });
    }
}

const showHideNodesQuery = (hide, domQuery, atParentLevel) => {
    const nodes = Array.from(document.querySelectorAll(domQuery)).map(node => atParentLevel ? node.parentNode : node);
    showHideNodes(hide, nodes);
};

const showHideNodes = (hide, nodes) => {
    if (hide) {
        nodes.forEach(node => { node.style.display = 'none'; });
    } else {
        nodes.forEach(node => { node.style.removeProperty('display'); });
    }
}

const main = (options) => {
    if (window.readOnlyTwitter && window.readOnlyTwitter.observer) {
        window.readOnlyTwitter.observer.disconnect();
    }

    makeReadOnly(options);

    const bodyNode = document.getElementsByTagName("body")[0];

    const mutationCallback = function (mutationsList, observer) {
        mutationsList.forEach(mutation => {
            const toIgnore = (mutation.type === 'attributes')
                || (mutation.type === 'childList' && mutation.removedNodes && mutation.removedNodes.length > 0)
                || (mutation.type === 'childList' && mutation.addedNodes && Array.from(mutation.addedNodes).filter(x => x.getAttribute('ignore') === 'true').length > 0);
            if (!toIgnore) {
                makeReadOnly(options);
            }
        });
    };

    window.readOnlyTwitter = window.readOnlyTwitter || {};

    window.readOnlyTwitter.observer = new MutationObserver(mutationCallback);

    window.readOnlyTwitter.observer.observe(bodyNode, { attributes: true, childList: true, subtree: true });
}


chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
        if (key === "options") {
            main(changes[key].newValue);
        }
    }
});


chrome.storage.local.get(['options'], (result) => {
    let options = {
        disableComments: true,
        disableLikes: true,
        disableRetweets: true,
        disableRetweetsWithComments: true,
        disableTweets: true,
        disableDirectMessages: false,

        disableOnTweetDeck: false,
    };

    if (result.options) {
        options = result.options;
    }

    main(options);
});
