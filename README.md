http://jameshill.io/diabetic-analytics/

Except as noted in LICENSE, this app is Copyright 2015 James Hill

In future, I'll probably update this to something more permissive. If you want
me to do that sooner rather than later, please let me know either in the issues
at https://github.com/Oblongmana/diabetic-analytics, or email me at me@jameshill.io

Note that this app uses a Bootply template - see LICENSE for information on obtaining a copy of the original if you're after it. Can be previewed at http://www.bootply.com/render/85850

# Notes
 - Relies on FileReader - so may be limited in support in some places (http://caniuse.com/#feat=filereader)
 - For File API fallbacks, may be able to use https://github.com/moxiecode/moxie - but not going to look at this for first pass
 - Need to do a thorough pass for browser compat, and add fallbacks/nice errors for unsupported environments
 - font-awesome doesn't support IE7, has bugs with IE8
