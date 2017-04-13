# Tweetkov

1. Sign up with [IFTT](https://ifttt.com).
1. Set up an applet that calls a Webhook when you like a tweet.
1. The webhook should call `GET` on
    
    https://wt-bf0faa5c35f7ec96bbadf541eaf93f26-0.run.webtask.io/tweetlike?tweet={{Text}}

1. Then 'like' some tweets. Wait for IFTTT to process your likes. Once there's
   data in there, you can get a dada-esque interpretation of those tweets by
   pointing your browser at the [Markov
   Generator](https://wt-bf0faa5c35f7ec96bbadf541eaf93f26-0.run.webtask.io/markov?count=35). 
