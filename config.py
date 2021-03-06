import os
import logging

APP_ROOT_DIR = os.path.abspath(os.path.dirname(__file__))

# If we're debugging, turn the cache off, etc.
# Set to true if we want to have our webapp print stack traces, etc
DEBUG = os.environ['SERVER_SOFTWARE'].startswith('Dev')
logging.info("Starting application in DEBUG mode: %s", DEBUG)
#DEBUG = False

# Don't change default_blog or default_page to prevent conflicts when merging #  Bloog source code updates.
# Do change blog or page dictionaries at the bottom of this config module.

BLOG = {
  "title": "Adequately Good",
  "author": "Ben Cherry",
  # This must be the email address of a registered administrator for the
  # application due to mail api restrictions.
  "email": "bcherry@gmail.com",
  "description": "decent programming advice",
  "root_url": "http://www.adequatelygood.com",
  "master_atom_url": "/feeds/atom.xml",
  "feedburner_url": "http://feeds.feedburner.com/adequatelygood",
  # By default, visitors can comment on article for this many days.
  # This can be overridden by setting article.allow_comments
  "days_can_comment": 60,
  # You can override this default for each page through a handler's call to
  #  view.ViewPage(cache_time=...)
  "cache_time": 0 if DEBUG else 3600,
  "debug": DEBUG,
  "js_debug": "true" if DEBUG else "false",
  "min": "" if DEBUG else "min.",

  # Use the default YUI-based theme.
  # If another string is used besides 'default', calls to static files and
  #  use of template files in /views will go to directory by that name.
  "theme": ["default"],

  # Display gravatars alongside user comments?
  "use_gravatars": True,

  # Do you want to be emailed when new comments are posted?
  "send_comment_notification": True,

  # If you want to use legacy ID mapping for your former blog platform,
  # define it here and insert the necessary mapping code in the
  # legacy_id_mapping() function in ArticleHandler (blog.py).
  # Currently only "Drupal" is supported.
  "legacy_blog_software": None,
  #"legacy_blog_software": "Drupal",
  #"legacy_blog_software": "Serendipity",

  # If you want imported legacy entries _not_ mapped in the file above to
  # redirect to their new permanent URL rather than responding on their
  # old URL, set this flag to True.
  "legacy_entry_redirect": False,
}

PAGE = {
  "title": BLOG["title"],
  "articles_per_page": 5,
  "featuredMyPages": {
    "title": "The Author",
    "description": "Ben is a 24 year-old front-end engineer at Twitter.  He lives in San Francisco and splits his time between work, coding, climbing, drinking, and the interwebs.",
    "entries": [{
      "title": "Twitter",
      "url": "http://twitter.com/bcherry",
      "description": "@bcherry"
    }, {
      "title": "GitHub",
      "url": "http://github.com/bcherry",
      "description": "My Code"
    }, {
      "title": "LinkedIn",
      "url": "http://www.linkedin.com/in/bcherryprogrammer",
      "description": "Professional Profile"
    }, {
      "title": "Facebook",
      "url": "http://www.facebook.com/bcherry",
      "description": "That Other Social Network"
    }, {
      "title": "Presentations",
      "url": "http://www.bcherry.net/talks/",
      "description": "Slides From My Talks"
    }]
  },
  "readingList": [
    {
      "title"   : "Cryptonomicon",
      "author"  : "Neal Stephenson",
      "url"   : "http://www.amazon.com/Cryptonomicon-Neal-Stephenson/dp/0380788624",
    },
    {
      "title"   : "Even Faster Web Sites",
      "author"  : "Steve Souders",
      "url"   : "http://www.amazon.com/Even-Faster-Web-Sites-Performance/dp/0596522304",
    },
    {
      "title"   : "JavaScript: The Good Parts",
      "author"  : "Douglas Crockford",
      "url"   : "http://www.amazon.com/JavaScript-Good-Parts-Douglas-Crockford/dp/0596517742/",
    },
    {
      "title"   : "Coders at Work",
      "author"  : "Peter Seibel",
      "url"   : "http://www.amazon.com/Coders-at-Work-Peter-Seibel/dp/1430219483/",
    },
  ],
}
