/*
 *  Python recipe for Chili syntax highlighter for jQuery
 *
 *  Copyright Ben Godfrey <ben at ben2.com>, 2009.
 */
{
	  _name: 'python'
	, _case: true
	, _main: {
		  sl_comment: { 
			  _match: /#.*/
			, _style: 'color: green;'
		}
		, string: { 
			  _match: /(?:\'[^\'\\\n]*(?:\\.[^\'\\\n]*)*\')|(?:\"[^\"\\\n]*(?:\\.[^\"\\\n]*)*\")/
			, _style: 'color: teal;'
		}
		, num: { 
			  _match: /\b[+-]?(?:\d*\.?\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?\b/
			, _style: 'color: red;'
		}
		, statement: { 
			  _match: /\b(and|as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|not|or|pass|print|raise|return|try|while|with|yield)\b/
			, _style: 'color: navy; font-weight: bold;'
		}
		, property: { 
			  _match: /\b(None|True|False)\b/
			, _style: 'color: Purple; font-weight: bold;'
		}
	}
}




